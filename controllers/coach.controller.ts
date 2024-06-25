import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { UserModel } from '../models/users';

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
