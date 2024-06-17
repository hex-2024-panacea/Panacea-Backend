import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
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
//router
import usersRouter from './routes/user.route';
import uploadRouter from './routes/upload';
import coachRouter from './routes/coach.route';
import notificationRouter from './routes/notification.route';
import adminRouter from './routes/admin.route';
import courseRouter from './routes/course.route';
import bookingCourseCoach from './routes/bookingCourseCoach.route';
import bookingCourseUser from './routes/bookingCourseUser.route';

const file = fs.readFileSync('./spec/@typespec/openapi3/openapi.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);
dotenv.config({ path: './.env' });

//mongoose
const DB = process.env.DATABASE!.replace(
  '<password>',
  process.env.DATABASE_PASSWORD!,
);
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
app.use('/api', apiLimiter);
//route
app.use('/', usersRouter);
app.use('/', uploadRouter);
app.use('/', coachRouter);
app.use('/', notificationRouter);
app.use('/', adminRouter);
app.use('/', courseRouter);
app.use('/api/coach/booking-course', bookingCourseCoach);
app.use('/api/user/booking-course', bookingCourseUser);
app.use('/order', express.static(path.join(__dirname, 'public/order.html')));
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
//404
app.use(function (req: Request, res: Response, next: NextFunction) {
  appErrorService(404, '找不到路徑', next);
});
//error
app.use(function (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  }
  resErrorProd(err, res);
});

export default app;
