import mongoose from 'mongoose';
import type { ICoursePrice } from './type';

const CoursePriceSchema = new mongoose.Schema<ICoursePrice>({
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'course',
    required: [true, 'course ID 必填'],
  },
  count: {
    type: Number,
    dafault: 1,
  },
  price: {
    type: Number,
    dafault: 1,
  },
});

export const CoursePriceModel = mongoose.model(
  'CoursePrice',
  CoursePriceSchema,
);
