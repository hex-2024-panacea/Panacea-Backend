import { OrderModel } from '../models/order.model';
import { NextFunction } from 'express';
import appErrorService from '../service/appErrorService';
import type { ObjectId } from 'mongoose';

export const updateOrderCount = async (courseId: ObjectId, next: NextFunction) => {
  //取消預約課程後，更新訂單可預約數量
  try {
    const order = await OrderModel.findOne({
      courseId: courseId,
    });
    if (order) {
      const { remainingCount, bookingCount } = order;
      let remainingCountNum = parseInt(remainingCount as string, 10);
      let bookingCountNum = parseInt(bookingCount as string, 10);
      if (!isNaN(remainingCountNum)) {
        remainingCountNum += 1;
      }
      if (isNaN(bookingCountNum)) {
        bookingCountNum -= 1;
      }
      order.remainingCount = remainingCountNum.toString();
      order.bookingCount = bookingCountNum.toString();
      await order.save();
    }
    return order;
  } catch (err) {
    return appErrorService(400, 'update order count failed', next);
  }
};
