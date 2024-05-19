import { Response } from 'express';
import jwt from 'jsonwebtoken';
import handleSuccess from './handleSuccess';
import { ObjectId } from "mongodb";
//checkUserExist
//generateJwtSend
export const generateJwtSend = (userId:ObjectId,res:Response)=>{
  const secret = process.env.JWT_SECRET!;
  const expiresDay = process.env.JWT_EXPIRES_DAY!;
  const token =jwt.sign({ id:userId },secret,{
    expiresIn: expiresDay
  })
  const data = {
    token
  }
  handleSuccess(res,200,'',data);
}
//isAuth