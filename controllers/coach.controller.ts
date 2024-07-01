import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { UserModel } from '../models/users.model';
import { CourseScheduleModel } from '../models/courseSchedule.model';

interface userModelDataType {
  _id: string;
  startTime: Date;
  endTime: Date;
  isBooked?: boolean;
}

type groupedDataType = {
  [key: string]: {
    available: Array<userModelDataType>;
    booked: Array<userModelDataType>;
  };
};
const transformData = (data: Array<userModelDataType>) => {
  const groupedData: groupedDataType = data.reduce((acc: groupedDataType, item: userModelDataType) => {
    const dateKey = new Date(item.startTime).toISOString().split('T')[0];
    const timeSlot: userModelDataType = {
      _id: item._id,
      startTime: item.startTime,
      endTime: item.endTime,
    };

    if (!acc[dateKey]) {
      acc[dateKey] = { available: [], booked: [] };
    }

    if (item.isBooked) {
      acc[dateKey].booked.push(timeSlot);
    } else {
      acc[dateKey].available.push(timeSlot);
    }

    return acc;
  }, {});
  return Object.keys(groupedData).map((date) => ({
    available: groupedData[date].available,
    booked: groupedData[date].booked,
  }));
};
// 更新教練銀行帳戶
export const updateCoachBankAccount = handleErrorAsync(async (req, res, next) => {
  const { bankName, bankCode, bankAccount } = req.body;
  const _id = req.user?.id;
  const isCoach = req.user?.isCoach;
  if (!isCoach) {
    return appErrorService(403, 'you are not a coach', next);
  }
  const updatedAt = new Date();
  try {
    await UserModel.findByIdAndUpdate({ _id }, { $set: bankName, bankCode, bankAccount, updatedAt });
    handleSuccess(res, 200, 'update success');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 取得課程可預約時間
export const getCoachCourseSchedule = handleErrorAsync(async (req, res, next) => {
  const { coachId, courseId } = req.params;
  try {
    const userModelData: Array<userModelDataType> = await CourseScheduleModel.find({ coach: coachId, course: courseId })
      .select('-course -coach -createdAt -updatedAt')
      .lean();

    if (!userModelData) {
      return appErrorService(404, 'user not found', next);
    }
    handleSuccess(res, 200, 'get success', transformData(userModelData));
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});
