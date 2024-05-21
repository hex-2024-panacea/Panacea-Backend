import crypto from 'crypto';
import { Request ,Response,NextFunction} from 'express';
import appErrorService from '../service/appErrorService';

import dotenv from 'dotenv';
dotenv.config();

type Dict<T> = {
  [key: string]: T;
};

export const generateSignature = (apiUrl:string, params:object, expiry:string, secretKey:string) => {
  const hmac = crypto.createHmac('sha256', secretKey);
  const data = `${apiUrl}:${JSON.stringify(params)}:${expiry}`;
  hmac.update(data);
  return hmac.digest('hex');
}

export const verifySignature = (apiUrl:string, params:object, expiry:string,signature:string,secretKey:string)=>{
  const expectedSignature = generateSignature(apiUrl,params, expiry, secretKey);
  const now = Date.now();
  if(Number(expiry) < now){
    return  false;
  }
  return signature === expectedSignature;
}

export const temporaraySignature = (apiUrl:string,min:number,params:Dict<string | number | boolean>)=>{
  const expiry = Date.now() + min * 60 * 1000;
  const secretKey = process.env.SIGNATURE_KEY!;
  const signature = generateSignature(apiUrl,params, expiry.toString(), secretKey);

  const url = `${apiUrl}?expires=${expiry}&signature=${signature}`;
  return {
    url:url,
    expires:expiry,
    signature:signature
  }
}

export const signedMiddleware = (req:Request, res:Response, next:NextFunction) => {
  const expires = req.query.expires as string;
  const signature  = req.query.signature as string;

  if(!expires || !signature) {
    return appErrorService(403,'Invalid signature',next);
  }
  
  const params = req.params;
  const secretKey = process.env.SIGNATURE_KEY!;
  const originalUrl = req.originalUrl;
  const urlWithoutQuery = originalUrl.split('?')[0];
  const isValid = verifySignature(urlWithoutQuery, params, expires, signature, secretKey);
  
  if (!isValid) {
    return appErrorService(403,'Invalid signature',next);
  }
  
  next();
}
