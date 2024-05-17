import crypto from 'crypto';
import querystring from 'querystring';
import { Request ,Response,NextFunction} from 'express';
import appErrorService from '../service/appErrorService';

import dotenv from 'dotenv';
dotenv.config();

type Dict<T> = {
  [key: string]: T;
};

//generalSignature
export const generateSignature = (params:object, expiry:string, secretKey:string) => {
  const hmac = crypto.createHmac('sha256', secretKey);
  const data = `${JSON.stringify(params)}:${expiry}`;
  hmac.update(data);
  return hmac.digest('hex');
}

//verifySignature
export const verifySignature = (params:object, expiry:string,signature:string,secretKey:string)=>{
  const expectedSignature = generateSignature(params, expiry, secretKey);
  return signature === expectedSignature;
}

//temporarayUrl
export const temporaraySignature = (apiUrl:string,min:number,params:Dict<string | number | boolean>)=>{
  const expiry = Date.now() + min * 60 * 1000;
  const secretKey = process.env.SIGNATURE_KEY!;
  const signature = generateSignature(params, expiry.toString(), secretKey);
  const queryString = querystring.stringify(params);

  const url = `${apiUrl}?expires=${expiry}&signature=${signature}`;
    return url;
}

export const signedMiddleware = (req:Request, res:Response, next:NextFunction) => {
  const expires = req.query.expires as string;
  const signature  = req.query.signature as string;

  if(!expires || !signature) {
    return appErrorService(403,'Invalid signature',next);
  }
  
  const params = req.params;
  const secretKey = process.env.SIGNATURE_KEY!;
  const isValid = verifySignature(params, expires, signature, secretKey);
  
  if (!isValid) {
    return appErrorService(403,'Invalid signature',next);
  }
  
  next();
}
