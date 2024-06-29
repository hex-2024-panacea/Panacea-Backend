import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import YAML from 'yaml';
import AppError from './types/AppError';
import appErrorService from './service/appErrorService';
import { resErrorProd, resErrorDev } from './service/resError';
import swaggerUI from 'swagger-ui-express';
import apiLimiter from './service/rateLimit';
dotenv.config({ path: './.env' });
//router
import usersRouter from './routes/user.route';
import uploadRouter from './routes/upload.route';
import coachRouter from './routes/coach.route';
import notificationRouter from './routes/notification.route';
import adminRouter from './routes/admin.route';
import coachCourseRouter from './routes/coachCourse.route';
import courseRouter from './routes/course.route';
import bookingCourseCoach from './routes/bookingCourseCoach.route';
import bookingCourseUser from './routes/bookingCourseUser.route';
import orderUser from './routes/orderUser.route';

const file = fs.readFileSync('./spec/@typespec/openapi3/openapi.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);

//mongoose
const DB = process.env.DATABASE!.replace('<password>', process.env.DATABASE_PASSWORD!);
mongoose
  .connect(DB)
  .then(() => {
    console.log('資料庫連線成功');
  })
  .catch((err: Error) => {
    console.log(err, '資料庫連線異常');
  });
const cors = require('cors');
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
//api rate limit
if (process.env.NODE_ENV !== 'development') {
  app.use('/api', apiLimiter);
}
//route
app.use('/api/auth', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/coach', coachRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);
app.use('/api/course', courseRouter);
app.use('/api/coach/course', coachCourseRouter);
app.use('/api/coach/booking-course', bookingCourseCoach);
app.use('/api/user/booking-course', bookingCourseUser);
app.use('/api/user/order', orderUser);
app.use('/order', express.static(path.join(__dirname, 'public/order.html')));
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
//404
app.use(function (req: Request, res: Response, next: NextFunction) {
  appErrorService(404, '找不到路徑', next);
});
//error
app.use(function (err: AppError, req: Request, res: Response, next: NextFunction) {
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'development') {
    return resErrorDev(err, res);
  }
  return resErrorProd(err, res);
});

export default app;
