import AppError from "../types/AppError";
import { NextFunction } from 'express';

const appError = (httpStatus:number, errMessage:string, next :NextFunction) => {
  const error = new AppError(errMessage,httpStatus);
  next(error);
};

export default appError;
