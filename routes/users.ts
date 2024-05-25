import express from 'express';
import {
  register,
  signIn,
  verifyEmail,
  sendVerifyEmail,
  sendForgetPassword,
  resetPassword,
} from '../controllers/users';
import { signedMiddleware } from '../service/signature';
import throttle from '../service/throttle';
const router = express.Router();

//user signin,signup
router.post('/api/auth/register', register); // 註冊學員
router.post('/api/auth/sign-in', throttle, signIn); // 登入
router.post('/api/auth/verify-email', throttle, sendVerifyEmail); // 寄送Email驗證信
router.get('/api/auth/email-link/:userId', signedMiddleware, verifyEmail); // 驗證Email
router.post('/api/auth/forget-password', throttle, sendForgetPassword); // 忘記密碼
router.post(
  '/api/auth/reset-password/:userId',signedMiddleware,
resetPassword); // 重設密碼

export default router;
