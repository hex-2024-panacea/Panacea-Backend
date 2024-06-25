import mongoose from 'mongoose';
import type { ICoursePrice } from './type';

const CoursePriceSchema = new mongoose.Schema<ICoursePrice>(
  {
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
      ref: 'Course',
      required: [true, 'course ID 必填'],
    },
    count: {
      type: Number,
      default: 1,
    },
    price: {
      type: Number,
      default: 1,
    },
  },
  {
    versionKey: false,
  },
);

export const CoursePriceModel = mongoose.model(
  'CoursePrice',
  CoursePriceSchema,
);
