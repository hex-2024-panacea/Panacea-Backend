import express, { NextFunction } from 'express';
import crypto from 'crypto';
import querystring from 'querystring';
import { Request } from 'express';
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
export const verifySignature = (params:object, expiry:string, secretKey:string,signature:string)=>{
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

function verifySignatureMiddleware(req:Request, res:Response, next:NextFunction) {
  const expires = req.query.expries as string;
  const signature  = req.query.expries as string;
  if(!expires || !signature) {
    appErrorService(403,'Invalid signature',next);
  }
  
  const params  = req.params;
  const secretKey = process.env.SIGNATURE_KEY!;
  const isValid = verifySignature(params, expires, signature, secretKey);
  
  if (!isValid) {
    appErrorService(403,'Invalid signature',next);
  }
  
  next();
}
