import handleErrorAsync from '../service/handleErrorAsync';
import bcrypt from 'bcryptjs';
import User from '../models/users';
import appErrorService from '../service/appErrorService';
import { z } from "zod";
import { temporaraySignature } from '../service/signature';

const loginSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "password don't match",
  path: ["confirmPassword"], // path of error
});

export const register = handleErrorAsync(async (req, res, next) => {
  //check email、password、name、confirmpassword
  let { name, email, password, confirmPassword } = req.body
  loginSchema.parse( { name, email, password, confirmPassword });

  //確認 email 是否已被註冊過
  const existUser = await User.findOne({email});
  console.log(existUser);
  if(existUser){
    appErrorService(400,'email is exist',next);
  }
  //如果已被註冊，但沒有認證帳號，會重新寄一次認證信嗎？

  //加密密碼
  password = await bcrypt.hash(req.body.password, 12)
  //建立使用者
  const user = await User.create({
    name, email, password
  });
  //發送帳號驗證信，使用 user id 認證
  //需要用/api/auth/verify/email/:user_id
  const verifyUrl = `/api/auth/verify/email/${user.id}`;
  const temporarayUrl = temporaraySignature(verifyUrl,60,{userId:user.id});
  console.log(temporarayUrl);
  res.status(200).send({
    url:temporarayUrl,
  });
});

export const signIn = handleErrorAsync(async (req, res, next) => {
  //test
  let { email, password, name } = req.body
  password = await bcrypt.hash(req.body.password, 12)
  console.log(password);
  //確認 email,password
  //產生 token
});