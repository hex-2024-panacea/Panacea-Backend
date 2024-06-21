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
import { UserModel } from '../models/users';
import { createMpgAesEncrypt, createMpgShaEncrypt, createMpgAesDecrypt, type genDataChainType } from '../util/crypto';
import { database } from 'firebase-admin';

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
  //判斷是否有今天以後的預約課程 bookingSchedule，有的話不可刪除課程
  //如果有學員購買了但尚未上完，也不可刪除
  const course = await CourseModel.findOneAndDelete({
    course: courseId,
    coach: userId,
  });
  if (course) {
    //delete coursePrice,courseSchedule,bookingCourse
  } else {
    return appErrorService(400, '發生錯誤', next);
  }
});
//教練課程列表
const courseIndexSetting = {
  perPage: 15,
  getAuth: true,
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
  console.log('test', data);
  // const findSearch = { merchantId: data.Result.MerchantID, orderId: data.Result.MerchantOrderNo };
  // try {
  //   const orderModelData = await OrderModel.findOne(findSearch);
  //   if (!orderModelData || orderModelData.orderId !== data.Result.MerchantOrderNo) {
  //     console.log('找不到訂單');
  //     return appErrorService(400, '找不到訂單', next);
  //   }
  //   const updateData = {
  //     status: data.Status.toLowerCase(),
  //     updatedAt: Date.now(),
  //     ip: data.Result.IP,
  //     tradeNo: data.Result.TradeNo,
  //     escrowBank: data.Result.EscrowBank,
  //     paymentType: data.Result.PaymentType,
  //     payerAccount5Code: data.Result.PayerAccount5Code,
  //     payBankCode: data.Result.PayBankCode,
  //     payTime: data.Result.PayTime,
  //     message: data.Message,
  //   };
  //   await OrderModel.findOneAndUpdate(
  //     findSearch,
  //     { $set: updateData },
  //     {
  //       new: true,
  //       upsert: true,
  //       runValidators: true,
  //     }
  //   );
  //   return handleSuccess(res, 200, 'get data');
  // } catch (error) {
  //   return appErrorService(400, (error as Error).message, next);
  // }
  return handleSuccess(res, 200, 'get data');
});
