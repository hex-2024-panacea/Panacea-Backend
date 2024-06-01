import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { UserModel } from '../models/users';
import { adminUpdateCoachInfoZod } from '../zods/admin.zod';

// 後台 - 更新教練資料
export const adminUpdateCoachInfo = handleErrorAsync(async (req, res, next) => {
  const isAdmin = req.user?.isAdmin;
  if (!isAdmin) {
    return appErrorService(403, 'you are not a Admin', next);
  }
  const { id } = req.params;
  try {
    const validationResult = await adminUpdateCoachInfoZod.safeParse(req.body);
    if (validationResult.success) {
      await UserModel.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          updatedAt: Date.now(),
          ...req.body,
        }
      );
      return handleSuccess(res, 200, 'Edited Successfully');
    } else {
      return appErrorService(400, JSON.stringify(validationResult.error.errors), next);
    }
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});
