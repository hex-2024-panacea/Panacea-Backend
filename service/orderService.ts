import { OrderModel } from '../models/order.model';
import { NextFunction } from 'express';
import appErrorService from '../service/appErrorService';
import type { ObjectId } from 'mongoose';

export const updateOrderCount = async (courseId: ObjectId, next: NextFunction) => {
  //取消預約課程後，更新訂單可預約數量
  try {
    const order = await OrderModel.findOneAndUpdate(
      {
        courseId: courseId,
      },
      {
        $inc: {
          bookingCount: -1,
          remainingCount: 1,
        },
      },
    );
    return order;
  } catch (err) {
    return appErrorService(400, 'update order count failed', next);
  }
};
