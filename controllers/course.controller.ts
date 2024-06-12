import { Decimal } from 'decimal.js';
import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import { CourseModel } from '../models/course.model';
import { createZod, editPriceZod, editScheduleZod } from '../zods/course.zod';
import handleSuccess from '../service/handleSuccess';
import CoursePrice from '../types/CoursePrice';
import CourseSchedule from '../types/CourseSchedule';
import { CoursePriceModel } from '../models/coursePrice.model';
import { CourseScheduleModel } from '../models/courseSchedule.model';
import { OrderModel } from '../models/order.model';
import { UserModel } from '../models/users';
import { createMpgAesEncrypt, createMpgShaEncrypt, type genDataChainType } from '../util/crypto';

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

//購買課程
export const purchaseCourse = handleErrorAsync(async (req, res, next) => {
  console.log('dddd');
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
    amount,
    price,
    name,
    tradeInfo: TradeInfo,
    tradeSha: TradeSha,
  });
  console.log({
    merchantID: MERCHANT_ID,
    tradeSha: TradeSha,
    tradeInfo: TradeInfo,
    version: VERSION,
    ...orderInfo,
  });
  return handleSuccess(res, 200, 'GET', {
    merchantID: MERCHANT_ID,
    tradeSha: TradeSha,
    tradeInfo: TradeInfo,
    timeStamp,
    version: VERSION,
    ...orderInfo,
  });
  // const course = await CourseModel.findOne({ _id: courseId });
  // if (!course) {
  //   return appErrorService(400, 'no data', next);
  // }
  // //check coursePrice
  // const coursePrice = await CoursePriceModel.findOne({
  //   course,
  // });
  // if (!coursePrice) {
  //   return appErrorService(400, 'no data', next);
  // }
  // //check courseSchedule
  // const courseSchedule = await CourseScheduleModel.findOne({
  //   course,
  // });
  // if (!courseSchedule) {
  //   return appErrorService(400, 'no data', next);
  // }
  // //check bookingCourse
  // const bookingCourse = await BookingCourseModel.findOne({
  //   course,
  // });
  // if (bookingCourse) {
  //   return appErrorService(400, 'no data', next);
  // }
  // //create bookingCourse
  // const bookingCourse = await BookingCourseModel.create({
  //   course,
  //   user: userId,
  //   coursePrice: coursePrice,
  //   courseSchedule: courseSchedule,
  // });
  // return handleSuccess(res, 200, 'get data', bookingCourse);
});

export const spgatewayNotify = handleErrorAsync(async (req, res, next) => {
  console.log('req.body notify data', req.body);
  const response = req.body;

  const thisShaEncrypt = createMpgShaEncrypt(response.TradeInfo);
  // 使用 HASH 再次 SHA 加密字串，確保比對一致（確保不正確的請求觸發交易成功）
  if (!thisShaEncrypt === response.TradeSha) {
    console.log('付款失敗：TradeSha 不一致');
    return appErrorService(400, 'no data', next);
  }

  // 解密交易內容
  const data = createMpgAesEncrypt(response.TradeInfo);
  console.log('data:', data);

  // 取得交易內容，並查詢本地端資料庫是否有相符的訂單
  // if (!orders[data?.Result?.MerchantOrderNo]) {
  //   console.log('找不到訂單');
  //   return res.end();
  // }

  // // 交易完成，將成功資訊儲存於資料庫
  // console.log('付款完成，訂單：', orders[data?.Result?.MerchantOrderNo]);
  return handleSuccess(res, 200, 'get data');
});
