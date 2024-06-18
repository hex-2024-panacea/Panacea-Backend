import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { BookingCourseModel } from '../models/bookingCourse.model';
import { coachCancelZod, userCancelZod } from '../zods/bookingCourse.zod';
import { updateOrderCount } from '../service/orderService';

//教練取消授課
export const coachCancel = handleErrorAsync(async (req, res, next) => {
  const bookingId = req.params.id;
  const userId = req.user?.id;

  const { coachCancelRemark } = req.body;
  coachCancelZod.parse({ coachCancelRemark });

  const booking = await BookingCourseModel.findOneAndUpdate(
    {
      _id: bookingId,
      coach: userId,
      isCanceled: false,
    },
    {
      coachCancelRemark,
      isCanceled: true,
    },
  );

  if (booking) {
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

  const { userCancelRemark } = req.body;
  userCancelZod.parse({ userCancelRemark });

  const booking = await BookingCourseModel.findOneAndUpdate(
    {
      _id: bookingId,
      user: userId,
      isCanceled: false,
    },
    {
      userCancelRemark,
      isCanceled: true,
    },
  );

  if (booking) {
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
    .select('-coach -order')
    .populate({
      path: 'course',
      select: '_id name content coverImage category subCategory',
    })
    .populate({
      path: 'courseSchedule',
      select: '_id startTime endTime',
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
