import handleErrorAsync from '../service/handleErrorAsync';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/users';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { registerMailSend, forgetPasswordSend } from '../service/mail';
import { generateJwtSend, revokeAllToken, revokeToken } from '../service/auth';
import {
  registerZod,
  signinZod,
  verifyEmailZod,
  resetPasswordZod,
  updatePasswordZod,
  registerCoachZod,
} from '../zods/users';
const USER =
  '-password -subject -specialty -language -workExperience -education -certifiedDocuments -bankName -bankCode -bankAccount -actualAmount -earnings -approvalStatus';
const COACH = '-password';
// 註冊學員
export const register = handleErrorAsync(async (req, res, next) => {
  let { name, email, password, confirmPassword } = req.body;
  registerZod.parse({ name, email, password, confirmPassword });

  //確認 email 是否已被註冊過
  //如果已被註冊，但沒有認證帳號，重新寄一次認證信
  let user = await UserModel.findOne({ email });
  if (user && user.emailVerifiedAt) {
    return appErrorService(400, 'email is exist', next);
  }

  if (!user) {
    password = await bcrypt.hash(req.body.password, 12);
    //建立使用者
    user = await UserModel.create({
      name,
      email,
      password,
    });
  }
  await registerMailSend(email, user.id, res);
});

//登入
export const signIn = handleErrorAsync(async (req, res, next) => {
  const { email, password } = req.body;
  signinZod.parse({ email, password });

  const user = await UserModel.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user!.password as string);
    if (isMatch) {
      //產生 token
      if (!user.emailVerifiedAt) {
        await registerMailSend(email, user.id, res);
      } else {
        generateJwtSend(user.id, res);
      }
    }
  } else {
    appErrorService(400, 'email or password is not correct', next);
  }
});

// 寄送Email驗證信
export const sendVerifyEmail = handleErrorAsync(async (req, res, next) => {
  const { email } = req.body;
  verifyEmailZod.parse({ email });

  const user = await UserModel.findOne({ email, emailVerifiedAt: null });
  if (user) {
    await registerMailSend(email, user.id, res);
  } else {
    //看要哪一種，怕被測出 mail 是否存在
    handleSuccess(res, 200, 'mail is sent');
    // return appErrorService(400,'email sent failed',next);
  }
});

// 驗證Email
export const verifyEmail = handleErrorAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = await UserModel.findById(userId);

  if (user) {
    await UserModel.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        emailVerifiedAt: Date.now(),
      },
    );
    handleSuccess(res, 200, 'mail is verified');
  } else {
    return appErrorService(400, 'verify failed', next);
  }
});

// 忘記密碼 寄送密碼重置信
export const sendForgetPassword = handleErrorAsync(async (req, res, next) => {
  const { email } = req.body;
  verifyEmailZod.parse({ email });

  const user = await UserModel.findOne({ email });
  if (user) {
    await forgetPasswordSend(email, user.id, res);
  } else {
    //看要哪一種，怕被測出 mail 是否存在
    handleSuccess(res, 200, 'mail is sent');
    // return appErrorService(400,'email sent failed',next);
  }
});

//重設密碼
export const resetPassword = handleErrorAsync(async (req, res, next) => {
  //reset password from forget password
  const { password, confirmPassword } = req.body;
  resetPasswordZod.parse({ password, confirmPassword });

  const { userId } = req.params;
  const newPassword = await bcrypt.hash(req.body.password, 12);

  const user = await UserModel.findByIdAndUpdate(
    {
      _id: userId,
    },
    {
      password: newPassword,
    },
  );
  if (user) {
    await revokeAllToken(user.id);
    handleSuccess(res, 200, 'password reset');
  } else {
    return appErrorService(400, '發生錯誤', next);
  }
});

// 更新密碼
export const updatePassword = handleErrorAsync(async (req, res, next) => {
  const { password, newPassword, newPasswordConfirm } = req.body;
  const _id = req.user?.id;
  updatePasswordZod.parse({ password, newPassword, newPasswordConfirm });
  try {
    const currentUser = await UserModel.findById(_id);
    const isMatch = await bcrypt.compare(password, currentUser!.password as string);
    if (isMatch) {
      const updatedAt = Date.now();
      const updatePassword = await bcrypt.hash(newPassword, 12);
      await UserModel.findByIdAndUpdate(_id, {
        password: updatePassword,
        updatedAt,
      });
      await revokeAllToken(_id!);
      handleSuccess(res, 200, 'password update.');
    } else {
      return appErrorService(400, '發生錯誤', next);
    }
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});
// 更新使用者資訊
export const userUpdate = handleErrorAsync(async (req, res, next) => {
  const { name, avatar } = req.body;
  const updatedAt = Date.now();
  const updateFields = { name, avatar, updatedAt };
  const _id = req.user?.id;
  const isCoach = req.user?.isCoach;
  try {
    const currentUser = await UserModel.findOneAndUpdate(
      { _id },
      { $set: updateFields },
      { new: true, select: isCoach ? COACH : USER },
    );
    handleSuccess(res, 200, 'get data', currentUser);
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});
//取得使用者資訊
export const userInfo = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  const isCoach = req.user?.isCoach;
  try {
    const currentUser = await UserModel.findById(_id).select(isCoach ? COACH : USER);
    handleSuccess(res, 200, 'get data', currentUser);
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
  handleSuccess(res, 200, 'get data');
});

//註冊教練
export const applyCoach = handleErrorAsync(async (req, res, next) => {
  const { subject, specialty, language, workExperience, education, certifiedDocuments } = req.body;
  const _id = req.user?.id;
  const isCoach = req.user?.isCoach;
  if (isCoach) {
    return appErrorService(403, 'you are already a coach', next);
  }
  try {
    registerCoachZod.parse(req.body);
    const updatedAt = Date.now();

    await UserModel.findByIdAndUpdate(
      _id,
      {
        $set: {
          isCoach: true,
          subject,
          specialty,
          language,
          workExperience,
          education,
          certifiedDocuments,
          updatedAt,
          approvalStatus: 'pending',
        },
      },
      { runValidators: true, new: true },
    );
    handleSuccess(res, 200, 'submit success');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

//登出
export const logout = handleErrorAsync(async (req, res, next) => {
  const result = await revokeToken(req);

  if (result) {
    handleSuccess(res, 200, 'logout success');
  } else {
    return appErrorService(400, 'logout failed', next);
  }
});
