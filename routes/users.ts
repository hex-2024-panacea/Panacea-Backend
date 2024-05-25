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
router.post('/api/auth/register', register);
router.post('/api/auth/sign-in', throttle, signIn);
router.post('/api/auth/verify-email', throttle, sendVerifyEmail);
router.get('/api/auth/email-link/:userId', signedMiddleware, verifyEmail);
router.post('/api/auth/forget-password', throttle, sendForgetPassword);
router.post(
  '/api/auth/reset-password/:userId',
  signedMiddleware,
  resetPassword,
);

export default router;
