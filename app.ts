import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import AppError from './types/AppError';
import appErrorService from './service/appErrorService';
import { resErrorProd, resErrorDev } from './service/resError';
import swaggerUI from 'swagger-ui-express';
import apiLimiter from './service/rateLimit';
//router
import usersRouter from './routes/users';
import uploadRouter from './routes/upload';
//env
import dotenv from 'dotenv';
const app = express();
const fs = require('fs');
const YAML = require('yaml');
const file = fs.readFileSync('./spec/@typespec/openapi3/openapi.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);
dotenv.config({ path: './.env' });

//mongoose
const DB = process.env.DATABASE!.replace('<password>', process.env.DATABASE_PASSWORD!);
mongoose
  .connect('mongodb+srv://pp840405:Pp600721@cluster0.ri7wpxp.mongodb.net/')
  .then(() => {
    console.log('資料庫連線成功');
  })
  .catch((err: Error) => {
    console.log(err, '資料庫連線異常');
  });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//api rate limit
app.use('/api', apiLimiter);
//route
app.use('/', usersRouter);
app.use('/', uploadRouter);
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
//404
app.use(function (req: Request, res: Response, next: NextFunction) {
  appErrorService(404, '找不到路徑', next);
});
//error
app.use(function (err: AppError, req: Request, res: Response, next: NextFunction) {
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  }
  resErrorProd(err, res);
});

export default app;
