import express from 'express';
const router = express.Router();
import { register,signIn,verifyEmail } from '../controllers/users';
import { signedMiddleware } from '../service/signature';

//user signin,signup
router.post('/api/auth/register',register);
router.post('/api/auth/sign-in',signIn);
router.get('/api/auth/verify/email/:userId',signedMiddleware,verifyEmail);
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

export default router;
