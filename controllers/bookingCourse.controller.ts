import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { BookingCourseModel } from '../models/bookingCourse.model';
import { CourseScheduleModel } from '../models/courseSchedule.model';
import { OrderModel } from '../models/order.model';
import { coachCancelZod, userCancelZod } from '../zods/bookingCourse.zod';
import { updateOrderCount } from '../service/orderService';
import { getFilters, pagination, getPage, getSort } from '../service/modelService';

//教練取消授課
export const coachCancel = handleErrorAsync(async (req, res, next) => {
  const bookingId = req.params.id;
  const userId = req.user?.id;

  const { coachCancelReason } = req.body;
  coachCancelZod.parse({ coachCancelReason });

  const booking = await BookingCourseModel.findOneAndUpdate(
    {
      _id: bookingId,
      coach: userId,
      isCanceled: false,
    },
    {
      coachCancelReason,
      isCanceled: true,
    },
  );

  if (booking) {
    await CourseScheduleModel.findOneAndUpdate(
      {
        _id: booking.courseSchedule,
        isBooked: true,
      },
      {
        isBooked: false,
      },
    );
    //update order booking count
    const orderResult = await updateOrderCount(booking.course, next);
    if (orderResult instanceof Error) {
      return next(orderResult);
    }
    return handleSuccess(res, 200, 'cancel success');
  } else {
    return appErrorService(400, 'cancel failed', next);
  }
});
//學員取消預約課程
export const userCancel = handleErrorAsync(async (req, res, next) => {
  const bookingId = req.params.id;
  const userId = req.user?.id;

  const { userCancelReason } = req.body;
  userCancelZod.parse({ userCancelReason });

  const booking = await BookingCourseModel.findOneAndUpdate(
    {
      _id: bookingId,
      user: userId,
      isCanceled: false,
    },
    {
      userCancelReason,
      isCanceled: true,
    },
  );

  if (booking) {
    await CourseScheduleModel.findOneAndUpdate(
      {
        _id: booking.courseSchedule,
        isBooked: true,
      },
      {
        isBooked: false,
      },
    );
    //update order booking count
    const orderResult = await updateOrderCount(booking.course, next);
    if (orderResult instanceof Error) {
      return next(orderResult);
    }
    return handleSuccess(res, 200, 'cancel success');
  } else {
    return appErrorService(400, 'cancel failed', next);
  }
});
//教練-授課詳情
export const coachGetShow = handleErrorAsync(async (req, res, next) => {
  const bookingId = req.params.id;
  const userId = req.user?.id;

  const booking = await BookingCourseModel.findOne({
    _id: bookingId,
    coach: userId,
  })
    .select('-coach -order -courseSchedule')
    .populate({
      path: 'course',
      select: '_id name content coverImage category subCategory',
    })
    .populate({
      path: 'user',
      select: '_id name avatar',
    });

  if (booking) {
    return handleSuccess(res, 200, 'get data', booking);
  } else {
    return appErrorService(400, 'no data', next);
  }
});
//學員-已預約詳情
export const userGetShow = handleErrorAsync(async (req, res, next) => {
  const bookingId = req.params.id;
  const userId = req.user?.id;

  const booking = await BookingCourseModel.findOne({
    _id: bookingId,
    user: userId,
  })
    .select('-user -order -courseSchedule')
    .populate({
      path: 'course',
      select: '_id name content coverImage category subCategory',
    })
    .populate({
      path: 'coach',
      select: '_id name avatar',
    });

  if (booking) {
    return handleSuccess(res, 200, 'get data', booking);
  } else {
    return appErrorService(400, 'no data', next);
  }
});
//教練-取得授課清單
const coachIndexSetting = {
  perPage: 15,
  getAuth: true,
  getAuthField: 'coach',
  filterFields: ['user'],
  sortFields: ['createdAt', 'updatedAt'],
  timeFields: ['createdAt', 'updatedAt'],
};
export const coachGetIndex = handleErrorAsync(async (req, res, next) => {
  const today = new Date();
  const { page, perPage } = getPage(req, coachIndexSetting);
  const filters = getFilters(req, coachIndexSetting);
  const sort = getSort(req, coachIndexSetting);

  const { status } = req.query;
  if (status === 'canceled') {
    filters.isCanceled = true;
  } else if (status === 'completed') {
    filters.endTime = {
      $lte: today,
    };
  } else if (status === 'not-start') {
    filters.startTime = {
      $gte: today,
    };
  }

  let results = await BookingCourseModel.find(filters)
    .sort(sort)
    .limit(perPage)
    .skip(perPage * page)
    .select('-coach -courseSchedule')
    .populate({
      path: 'course',
      select: '_id name content coverImage category subCategory',
    })
    .populate({
      path: 'user',
      select: '_id name avatar',
    });

  const meta = await pagination(BookingCourseModel, filters, page, coachIndexSetting);

  return handleSuccess(res, 200, 'get data', results, meta);
});
//學員-已預約課程
const userIndexSetting = {
  perPage: 15,
  getAuth: true,
  getAuthField: 'user',
  filterFields: ['coach'],
  sortFields: ['createdAt', 'updatedAt'],
  timeFields: ['createdAt', 'updatedAt'],
};
export const userGetIndex = handleErrorAsync(async (req, res, next) => {
  const today = new Date();
  const { page, perPage } = getPage(req, userIndexSetting);
  const filters = getFilters(req, userIndexSetting);
  const sort = getSort(req, userIndexSetting);

  const { status } = req.query;
  if (status === 'canceled') {
    filters.isCanceled = true;
  } else if (status === 'completed') {
    filters.endTime = {
      $lte: today,
    };
  } else if (status === 'not-start') {
    filters.startTime = {
      $gte: today,
    };
  }

  let results = await BookingCourseModel.find(filters)
    .sort(sort)
    .limit(perPage)
    .skip(perPage * page)
    .select('-coach -courseSchedule')
    .populate({
      path: 'course',
      select: '_id name content coverImage category subCategory',
    })
    .populate({
      path: 'user',
      select: '_id name avatar',
    });

  const meta = await pagination(BookingCourseModel, filters, page, coachIndexSetting);

  return handleSuccess(res, 200, 'get data', results, meta);
});
//預約課程
export const userCreate = handleErrorAsync(async (req, res, next) => {
  const userId = req.user?.id;
  const { course: courseId, order: orderId, courseSchedule: scheduleId } = req.body;
  //check order can book
  const existOrder = await OrderModel.findOne({
    _id: orderId,
    userId: userId,
  });
  if (existOrder) {
    const remainCount = parseInt(existOrder.remainingCount);
    const bookingCount = parseInt(existOrder.bookingCount);
    if (!isNaN(remainCount) && remainCount > 0) {
      //check courseSchedule can book
      const existCourseSchedule = await CourseScheduleModel.findOne({
        _id: scheduleId,
        course: courseId,
        isBooked: false,
      });
      if (existCourseSchedule) {
        const { startTime, endTime, coach } = existCourseSchedule;
        //create meeting url QQ
        const meetingUrl = 'meetingUrl';
        const booking = await BookingCourseModel.create({
          user: userId,
          course: courseId,
          coach,
          startTime,
          endTime,
          courseSchedule: scheduleId,
          order: orderId,
          meetingUrl,
        });
        if (booking) {
          await OrderModel.findOneAndUpdate(
            {
              _id: courseId,
            },
            {
              remainingCount: (remainCount - 1).toString(),
              bookingCount: (bookingCount + 1).toString(),
            },
          );
          return handleSuccess(res, 200, 'book success');
        }
      }
    }
  }
  return appErrorService(400, 'book failed', next);
});
