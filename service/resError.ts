import { Response } from 'express';
import AppError from '../types/AppError';

const resErrorProd = function (err:AppError, res:Response) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    console.error('error', err);
    res.status(400).json({
      code: 400,
      message: '發生錯誤',
    });
  }
};
const resErrorDev = function (err:AppError, res:Response) {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    code: err.statusCode,
  });
};

export {
  resErrorProd,
  resErrorDev,
};
