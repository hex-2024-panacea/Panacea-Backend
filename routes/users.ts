import express from 'express';
const router = express.Router();
import { register, signIn, verifyEmail, sendVerifyEmail,sendForgetPassword, resetPassword } from '../controllers/users';
import { signedMiddleware } from '../service/signature';

//user signin,signup
router.post('/api/auth/register',register);
router.post('/api/auth/sign-in',signIn);
router.post('/api/auth/verify-email',sendVerifyEmail);
router.get('/api/auth/email-link/:userId',signedMiddleware,verifyEmail);
router.post('/api/auth/forget-password',sendForgetPassword);
router.post('/api/auth/reset-password/:userId',signedMiddleware,resetPassword);

export default router;
