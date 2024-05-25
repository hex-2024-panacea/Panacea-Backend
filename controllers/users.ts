import handleErrorAsync from '../service/handleErrorAsync';
import bcrypt from 'bcryptjs';
import User from '../models/users';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { registerMailSend, forgetPasswordSend } from '../service/mail';
import { generateJwtSend } from '../service/auth';
import { registerZod, signinZod, verifyEmailZod, resetPasswordZod } from '../zods/users';

// 註冊學員
export const register = handleErrorAsync(async (req, res, next) => {
  let { name, email, password, confirmPassword } = req.body;
  registerZod.parse({ name, email, password, confirmPassword });

  //確認 email 是否已被註冊過
  //如果已被註冊，但沒有認證帳號，重新寄一次認證信
  let user = await User.findOne({ email });
  if (user && user.emailVerifiedAt) {
    return appErrorService(400, 'email is exist', next);
  }

  if (!user) {
    password = await bcrypt.hash(req.body.password, 12);
    //建立使用者
    user = await User.create({
      name,
      email,
      password,
    });
  }
  await registerMailSend(email, user.id, res);
});

//登入
export const signIn = handleErrorAsync(async (req, res, next) => {
  let { email, password } = req.body;
  signinZod.parse({ email, password });

  const user = await User.findOne({ email });
  const isMatch = await bcrypt.compare(password, user!.password as string);
  if (user && isMatch) {
    //產生 token
    generateJwtSend(user.id, res);
  } else {
    appErrorService(400, 'email or password is not correct', next);
  }
});

// 寄送Email驗證信
export const sendVerifyEmail = handleErrorAsync(async (req, res, next) => {
  const { email } = req.body;
  verifyEmailZod.parse({ email });

  const user = await User.findOne({ email, emailVerifiedAt: null });
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
  const user = await User.findById(userId);

  if (user) {
    await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        emailVerifiedAt: Date.now(),
      }
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

  const user = await User.findOne({ email });
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

  const user = await User.findByIdAndUpdate(
    {
      _id: userId,
    },
    {
      password: newPassword,
    }
  );
  if (user) {
    handleSuccess(res, 200, 'password reset');
  } else {
    return appErrorService(400, '發生錯誤', next);
  }
});
