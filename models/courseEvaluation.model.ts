import mongoose from 'mongoose';
import type { ICourseEvaluation } from './type';

const CourseEvaluationSchema = new mongoose.Schema<ICourseEvaluation>(
  {
    courseId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'course ID 必填'],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User ID 必填'],
    },
    star: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
      required: [true, '評價 必填'],
    },
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
  },
  {
    versionKey: false,
  }
);

export const CourseEvaluationModel = mongoose.model('CourseEvaluation', CourseEvaluationSchema);
