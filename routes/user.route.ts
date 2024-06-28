import express from 'express';
import {
  register,
  signIn,
  verifyEmail,
  sendVerifyEmail,
  sendForgetPassword,
  resetPassword,
  applyCoach,
  userInfo,
  userUpdate,
  updatePassword,
  logout,
} from '../controllers/user.controller';
import { signedMiddleware } from '../service/signature';
import throttle from '../service/throttle';
import { isAuth } from '../service/auth';
const router = express.Router();

//user signin,signup
router.post('/register', register); // 註冊學員
router.post('/sign-in', throttle, signIn); // 登入
router.post('/verify-email', throttle, sendVerifyEmail); // 寄送Email驗證信
router.get('/email-link/:userId', signedMiddleware, verifyEmail); // 驗證Email
router.post('/forget-password', throttle, sendForgetPassword); // 忘記密碼
router.post('/reset-password/:userId', signedMiddleware, resetPassword); // 重設密碼
router.post('/update-password', isAuth, updatePassword); // 更新密碼
router.get('/user-info', isAuth, userInfo); // 取得使用者資訊
router.patch('/update-user', isAuth, userUpdate); // 更新使用者資訊
router.post('/apply-coach', isAuth, applyCoach); // 註冊教練
router.post('/logout', isAuth, logout); // 登出

export default router;
