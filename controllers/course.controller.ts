import { Decimal } from 'decimal.js';
import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import { CourseModel } from '../models/course.model';
import { createZod, editPriceZod, editScheduleZod, getScheduleZod } from '../zods/course.zod';
import handleSuccess from '../service/handleSuccess';
import CoursePrice from '../types/CoursePrice';
import CourseSchedule from '../types/CourseSchedule';
import { CoursePriceModel } from '../models/coursePrice.model';
import { CourseScheduleModel } from '../models/courseSchedule.model';
import { getFilters, pagination, getPage, getSort } from '../service/modelService';
import { OrderModel } from '../models/order.model';
import { UserModel } from '../models/users.model';
import { CourseEvaluationModel } from '../models/courseEvaluation.model';
import { BookingCourseModel } from '../models/bookingCourse.model';
import { createMpgAesEncrypt, createMpgShaEncrypt, createMpgAesDecrypt, type genDataChainType } from '../util/crypto';

// 取得課程列表
export const getCourses = handleErrorAsync(async (req, res, next) => {
  const { category, courseName, page } = req.query;
  if (!page) {
    return appErrorService(400, '請輸入頁碼', next);
  }
  type courseModelFilterType = {
    category?: string;
    name?: { $regex: string; $options: 'i' };
    approvalStatus: 'success';
  };
  const courseModelFilter: courseModelFilterType = {
    approvalStatus: 'success',
  };
  if (category) {
    courseModelFilter.category = category as string;
  }
  if (courseName) {
    courseModelFilter.name = { $regex: courseName as string, $options: 'i' };
  }
  const _page = parseInt(page as string);
  const _pageSize = 10; // 默認每頁 10 筆
  try {
    const results = await CourseModel.find(courseModelFilter)
      .populate({
        path: 'recurrenceSchedules',
        match: { isBooked: false },
        select: '-isBooked',
      })
      .populate({ path: 'commentsNum' })
      .select('-reason -approvalStatus -__v')
      .skip((_page - 1) * _pageSize)
      .limit(_pageSize)
      .lean();

    const total = await CourseModel.countDocuments(courseModelFilter);
    const lastPage = Math.ceil(total / _pageSize);
    return handleSuccess(res, 200, 'get data', results, {
      currentPage: _page, // 當前頁面
      lastPage, // 最後一頁頁數
      perPage: _pageSize, // 每頁多少筆資料
      total, // 總共多少筆
    });
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 取得課程詳情
export const getCoursesDetails = handleErrorAsync(async (req, res, next) => {
  const courseId = req.params.id;
  if (!courseId) {
    return appErrorService(400, '請填寫課程ID', next);
  }
  try {
    const course = await CourseModel.findById(courseId)
      .select('-reason -approvalStatus -__v')
      .populate({ path: 'coursePrice', select: 'count price -course' })
      .populate({ path: 'coach', select: '_id name specialty' })
      .lean();
    if (!course) {
      return appErrorService(400, '找不到課程', next);
    }
    return handleSuccess(res, 200, 'get data', course);
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

//建立課程
export const createCourse = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  const { name, coverImage, description, category, subCategory, startDate, isActive } = req.body;

  createZod.parse({
    name,
    coverImage,
    description,
    category,
    subCategory,
    startDate,
    isActive,
  });

  let course = await CourseModel.create({
    coach: _id,
    name,
    coverImage,
    description,
    category,
    subCategory,
    startDate,
    isActive,
  });

  return handleSuccess(res, 200, '', course);
});
//建立編輯授課時間
export const editSchedule = handleErrorAsync(async (req, res, next) => {
  let { courseId } = req.params;
  const userId = req.user!.id;
  //用 start_time 排序 body 裡帶的 schedule
  let scheduleArr = req.body.schedule;
  editScheduleZod.parse(scheduleArr);
  scheduleArr.sort((a: CourseSchedule, b: CourseSchedule) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  //delete 時間區間內，沒有被預約，且id沒有出現在body的schedule
  const existScheduleArr = scheduleArr.filter((schedule: CourseSchedule) => schedule.id);
  const existIdArr = scheduleArr.map((schedule: CourseSchedule) => schedule.id);
  await CourseScheduleModel.deleteMany({
    _id: { $nin: existIdArr },
    startTime: { $gte: new Date(scheduleArr[0].startTime) },
    endTime: { $lte: new Date(scheduleArr.slice(-1)[0].endTime) },
    course: courseId,
    coach: userId,
    isBooked: false,
  });
  //update 在 body 且有帶 id 的 schedule
  const updateArr = existScheduleArr.map((schedule: CourseSchedule) => {
    return {
      updateOne: {
        filter: {
          _id: schedule.id,
          course: courseId,
        },
        update: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        },
      },
    };
  });
  await CourseScheduleModel.bulkWrite(updateArr);
  //create 在 body 沒有帶 id 的 schedule
  const newScheduleArr = scheduleArr
    .filter((schedule: CourseSchedule) => !schedule.id)
    .map((schedule: CourseSchedule) => {
      return {
        ...schedule,
        course: courseId,
        coach: userId,
      };
    });
  await CourseScheduleModel.create(newScheduleArr);

  const schedules = await CourseScheduleModel.find({
    course: courseId,
    startTime: { $gte: new Date(scheduleArr[0].startTime) },
    endTime: { $lte: new Date(scheduleArr.slice(-1)[0].endTime) },
  });
  handleSuccess(res, 200, 'get data', schedules);
});
//建立編輯授課價格
export const editPrice = handleErrorAsync(async (req, res, next) => {
  let { courseId } = req.params;
  let priceArr = req.body.price;
  editPriceZod.parse(priceArr);

  const existPriceArr = priceArr.filter((price: CoursePrice) => price.id);
  const existIdArr = priceArr.map((price: CoursePrice) => price.id);
  //delete
  await CoursePriceModel.deleteMany({
    _id: { $nin: existIdArr },
    course: courseId,
  });
  //update
  const updateArr = existPriceArr.map((price: CoursePrice) => {
    return {
      updateOne: {
        filter: {
          _id: price.id,
          course: courseId,
        },
        update: {
          ...price,
        },
      },
    };
  });
  await CoursePriceModel.bulkWrite(updateArr);
  //create
  const newPriceArr = priceArr
    .filter((price: CoursePrice) => !price.id)
    .map((price: CoursePrice) => {
      return {
        ...price,
        course: courseId,
      };
    });
  await CoursePriceModel.create(newPriceArr);

  const prices = await CoursePriceModel.find({
    course: courseId,
  });
  handleSuccess(res, 200, 'get data', prices);
});
//教練課程詳情頁
export const coachGetCourse = handleErrorAsync(async (req, res, next) => {
  const courseId = req.params.courseId;
  const userId = req.user?.id;
  const course = await CourseModel.findOne({
    _id: courseId,
    coach: userId,
  })
    .select('-coach')
    .populate({
      path: 'coursePrice',
      select: '_id -course count price',
      options: {
        sort: {
          count: 1,
          price: 1,
        },
      },
    });
  if (course) {
    return handleSuccess(res, 200, 'get data', course);
  } else {
    return appErrorService(400, 'no data', next);
  }
});
//教練刪除課程
export const deleteCourse = handleErrorAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user?.id;
  const course = await CourseModel.findOne({
    course: courseId,
    coach: userId,
  });
  if (course) {
    //判斷是否有今天以後的預約課程 bookingCourse，有的話不可刪除課程
    //如果有學員購買了但尚未上完，也不可刪除=>order remainingCount > 0
    const bookings = await BookingCourseModel.countDocuments({
      startTime: {
        $gte: new Date(),
        isCanceled: false,
        course: courseId,
      },
    }).exec();
    const orders = await OrderModel.countDocuments({
      course: courseId,
      remainingCount: { $ne: '0' },
    }).exec();
    if (bookings > 0 || orders > 0) {
      return appErrorService(400, 'delete failed', next);
    }
    //delete course
    await course.deleteOne();
    //delete coursePrice,courseSchedule
    await CoursePriceModel.deleteMany({
      course: courseId,
    });
    await CourseScheduleModel.deleteMany({
      course: courseId,
    });
  } else {
    return appErrorService(400, 'delete failed', next);
  }
});
//教練課程列表
const courseIndexSetting = {
  perPage: 15,
  getAuth: true,
  getAuthField: 'coach',
  searchFields: ['name'],
  filterFields: ['category', 'subCategory'],
  sortFields: ['createdAt', 'updatedAt'],
  timeFields: ['createdAt', 'updatedAt'],
};
export const coachGetCourses = handleErrorAsync(async (req, res, next) => {
  const { page, perPage } = getPage(req, courseIndexSetting);
  const filters = getFilters(req, courseIndexSetting);
  const sort = getSort(req, courseIndexSetting);

  const results = await CourseModel.find(filters)
    .sort(sort)
    .limit(perPage)
    .skip(perPage * page)
    .select('-coach');

  const meta = await pagination(CourseModel, filters, page, courseIndexSetting);

  return handleSuccess(res, 200, 'get data', results, meta);
});

// 教練-編輯課程
export const editCourse = handleErrorAsync(async (req, res, next) => {
  const userId = req.user?.id;
  const courseId = req.params.courseId;
  const { name, coverImage, description, content, courseCategories, isActive } = req.body;
  const courseModelData = await CourseModel.findOneAndUpdate(
    {
      _id: courseId,
      coach: userId,
    },
    {
      name,
      coverImage,
      description,
      content,
      courseCategories,
      isActive,
    },
    {
      new: true,
    }
  );
  if (!courseModelData) {
    return appErrorService(400, 'update failed', next);
  }
  return handleSuccess(res, 200, 'get data', courseModelData);
});

//教練-取得課程授課時間
export const getSchedule = handleErrorAsync(async (req, res, next) => {
  const courseId = req.params.courseId;

  interface Query {
    startTime?: string;
    endTime?: string;
  }
  let { startTime, endTime } = req.query as Query;
  getScheduleZod.parse({ startTime, endTime });
  if (!startTime) {
    startTime = new Date().toDateString();
  }
  if (!endTime) {
    const futureDate = new Date(startTime);
    futureDate.setDate(futureDate.getDate() + 6);
    endTime = futureDate.toDateString();
  }

  const schedules = await CourseScheduleModel.find({
    course: courseId,
    startTime: { $gte: new Date(startTime as string) },
    endTime: { $lte: new Date(endTime as string) },
  }).select('-coach -course -isBooked');
  const available = schedules.filter((schedule) => !schedule.isBooked);
  const booked = schedules.filter((schedule) => schedule.isBooked);
  const result = {
    available,
    booked,
  };
  return handleSuccess(res, 200, 'get data', result);
});

//購買課程
export const purchaseCourse = handleErrorAsync(async (req, res, next) => {
  const userId = req.user?.id;
  const { courseId, name, price, amount } = req.body;
  const { MERCHANT_ID, VERSION } = process.env;
  const userModelData = await UserModel.findById(userId);
  const timeStamp: number = Math.round(new Date().getTime() / 1000);
  const orderInfo: { [key: number]: genDataChainType } = {
    [timeStamp]: {
      Amt: new Decimal(price).times(new Decimal(amount)).toString(),
      ItemDesc: name,
      TimeStamp: timeStamp.toString(),
      MerchantOrderNo: timeStamp.toString(),
      Email: userModelData?.email,
    },
  };
  const TradeInfo: string = createMpgAesEncrypt(orderInfo[timeStamp]);
  const TradeSha: string = createMpgShaEncrypt(TradeInfo);
  await OrderModel.create({
    userId,
    courseId,
    orderId: orderInfo[timeStamp].MerchantOrderNo,
    merchantId: MERCHANT_ID,
    totalPrice: orderInfo[timeStamp].Amt,
    purchaseCount: amount,
    remainingCount: amount,
    price,
    name,
    tradeInfo: TradeInfo,
    tradeSha: TradeSha,
  });
  return handleSuccess(res, 200, 'GET', {
    merchantId: MERCHANT_ID,
    tradeSha: TradeSha,
    tradeInfo: TradeInfo,
    timeStamp,
    version: VERSION,
  });
});

//接收金流通知
export const spgatewayNotify = handleErrorAsync(async (req, res, next) => {
  const response = Object.assign({}, req.body);
  const thisShaEncrypt = createMpgShaEncrypt(response.TradeInfo);

  // 使用 HASH 再次 SHA 加密字串，確保比對一致（確保不正確的請求觸發交易成功）
  if (thisShaEncrypt !== response.TradeSha) {
    console.log('付款失敗：TradeSha 不一致');
    return appErrorService(400, '付款失敗：TradeSha 不一致', next);
  }

  // 解密交易內容
  const data = createMpgAesDecrypt(response.TradeInfo);
  const findSearch = { merchantId: data.Result.MerchantID, orderId: data.Result.MerchantOrderNo };
  try {
    const orderModelData = await OrderModel.findOne(findSearch);
    if (!orderModelData || orderModelData.orderId !== data.Result.MerchantOrderNo) {
      console.log('找不到訂單');
      return appErrorService(400, '找不到訂單', next);
    }
    const updateData = {
      status: data.Status.toLowerCase(),
      updatedAt: Date.now(),
      ip: data.Result.IP,
      tradeNo: data.Result.TradeNo,
      escrowBank: data.Result.EscrowBank,
      paymentType: data.Result.PaymentType,
      payerAccount5Code: data.Result.PayerAccount5Code,
      payBankCode: data.Result.PayBankCode,
      payTime: data.Result.PayTime,
      message: data.Message,
    };
    await OrderModel.findOneAndUpdate(
      findSearch,
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );
    return handleSuccess(res, 200, 'get data');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

//金流導向
export const spgatewayReturn = handleErrorAsync(async (req, res, next) => {
  const response = Object.assign({}, req.body);
  const thisShaEncrypt = createMpgShaEncrypt(response.TradeInfo);

  // 使用 HASH 再次 SHA 加密字串，確保比對一致（確保不正確的請求觸發交易成功）
  if (thisShaEncrypt !== response.TradeSha) {
    console.log('付款失敗：TradeSha 不一致');
    return appErrorService(400, '付款失敗：TradeSha 不一致', next);
  }

  // 解密交易內容
  const data = createMpgAesDecrypt(response.TradeInfo);
  const findSearch = { merchantId: data.Result.MerchantID, orderId: data.Result.MerchantOrderNo };
  try {
    const orderModelData = await OrderModel.findOne(findSearch);
    if (!orderModelData || orderModelData.orderId !== data.Result.MerchantOrderNo) {
      console.log('找不到訂單');
      return appErrorService(400, '找不到訂單', next);
    }
    const { NEWEBPAY_RETURN_URL } = process.env;
    const params = new URLSearchParams({
      title: orderModelData.status === 'success' ? '交易成功' : '交易失敗',
      message: orderModelData.message,
      status: orderModelData.status,
      orderId: orderModelData.orderId,
      paymentType: orderModelData.paymentType,
      payerAccount5Code: orderModelData.payerAccount5Code,
      payBankCode: orderModelData.payBankCode,
      payTime: orderModelData.payTime,
      totalPrice: orderModelData.totalPrice,
      tradeNo: orderModelData.tradeNo,
    }).toString();
    return res.redirect(`${NEWEBPAY_RETURN_URL}/order/success?${params}`);
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 評價課程
export const coursesEvaluation = handleErrorAsync(async (req, res, next) => {
  const userId = req.user?.id;
  const courseId = req.params.courseId;
  const { star, comment } = req.body;
  const courseModelData = await CourseModel.findById(courseId).lean();
  if (!courseModelData) {
    return appErrorService(400, '找不到課程', next);
  }
  const orderModelData = await OrderModel.findOne({
    userId,
    courseId,
    status: 'success',
    remainingCount: '0',
  }).lean();
  if (!orderModelData) {
    return appErrorService(400, '找不到訂單', next);
  }
  await CourseEvaluationModel.create({
    userId,
    courseId,
    star,
    comment,
  });
  return handleSuccess(res, 200, '評論成功');
});
