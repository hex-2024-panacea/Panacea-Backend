import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { BookingCourseModel } from '../models/bookingCourse.model';
import { coachCancelZod, userCancelZod } from '../zods/bookingCourse.zod';

//教練取消授課
export const coachCancel = handleErrorAsync(async (req, res, next) => {
  const bookingId = req.params.bookingCourseId;
  const userId = req.user?.id;

  const { coachCancelRemark } = req.body;
  coachCancelZod.parse({ coachCancelRemark });

  const booking = await BookingCourseModel.findOneAndUpdate({
    _id: bookingId,
    coach: userId,
    coachCancelRemark,
    isCanceled: true,
  });

  if (booking) {
    return handleSuccess(res, 200, 'cancel success');
  } else {
    return appErrorService(400, 'cancel failed', next);
  }
});
//學員取消預約課程
export const userCancel = handleErrorAsync(async (req, res, next) => {
  const bookingId = req.params.bookingCourseId;
  const userId = req.user?.id;

  const { userCancelRemark } = req.body;
  userCancelZod.parse({ userCancelRemark });

  const booking = await BookingCourseModel.findOneAndUpdate({
    _id: bookingId,
    user: userId,
    userCancelRemark,
    isCanceled: true,
  });

  if (booking) {
    return handleSuccess(res, 200, 'cancel success');
  } else {
    return appErrorService(400, 'cancel failed', next);
  }
});
