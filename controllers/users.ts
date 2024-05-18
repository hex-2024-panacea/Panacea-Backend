import handleErrorAsync from '../service/handleErrorAsync';
import bcrypt from 'bcryptjs';
import User from '../models/users';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { z } from "zod";
import { registerMailSend } from '../service/mail';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "password don't match",
  path: ["confirmPassword"], // path of error
});

const loginSchema = z.object({
  email:z.string().email(),
  password:z.string().min(8)
});

export const register = handleErrorAsync(async (req, res, next) => {
  //check email、password、name、confirmpassword
  let { name, email, password, confirmPassword } = req.body
  registerSchema.parse( { name, email, password, confirmPassword });

  //確認 email 是否已被註冊過
  //如果已被註冊，但沒有認證帳號，重新寄一次認證信
  let user = await User.findOne({email});
  if(user && user.emailVerifiedAt){
    return appErrorService(400,'email is exist',next);
  }

  if (!user){
    password = await bcrypt.hash(req.body.password, 12)
    //建立使用者
    user = await User.create({
      name, email, password
    });
  }
  await registerMailSend(email,user.id);
  handleSuccess(res,200,'email is sent');
});

export const verifyEmail = handleErrorAsync(async(req, res, next)=>{
  const { userId } = req.params;
  const user = await User.findById(userId);

  if(user){
    await User.findByIdAndUpdate(
      {
        _id: userId
      },
      {
        emailVerifiedAt: Date.now(),
      }
    );
    handleSuccess(res,200,'verify success');
  }else{
    return appErrorService(400,'verify failed',next);
  }
});

export const signIn = handleErrorAsync(async (req, res, next) => {
  let { email, password, name } = req.body
  loginSchema.parse( { email, password, name });

  password = await bcrypt.hash(req.body.password, 12)
  console.log(password);
  //確認 email,password
  //產生 token
});