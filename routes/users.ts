import express from 'express';
const router = express.Router();
import { register, signIn, verifyEmail, sendVerifyEmail,sendForgetPassword, resetPassword } from '../controllers/users';
import { signedMiddleware } from '../service/signature';
import throttle from '../service/throttle';

//user signin,signup
router.post('/api/auth/register',register);
router.post('/api/auth/sign-in',throttle,signIn);
router.post('/api/auth/verify-email',sendVerifyEmail);
router.get('/api/auth/email-link/:userId',signedMiddleware,verifyEmail);
router.post('/api/auth/forget-password',throttle,sendForgetPassword);
router.post('/api/auth/reset-password/:userId',signedMiddleware,resetPassword);

export default router;
