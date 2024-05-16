import express from "express";
const router = express.Router();
import { register,signIn } from "../controllers/users";

//user signin,signup
router.post('/api/auth/register',register);
router.post('/api/auth/sign-in',signIn);
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

export default router;
