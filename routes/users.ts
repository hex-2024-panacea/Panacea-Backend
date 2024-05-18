import express from 'express';
const router = express.Router();
import { register, signIn, verifyEmail } from '../controllers/users';
import { signedMiddleware } from '../service/signature';

//user signin,signup
router.post('/api/auth/register',register);
router.post('/api/auth/sign-in',signIn);
router.get('/api/auth/verify/email/:userId',signedMiddleware,verifyEmail);

export default router;
