import mongoose from 'mongoose';
import type { ICourseSchedule } from './type';

const CourseScheduleSchema = new mongoose.Schema<ICourseSchedule>(
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
    coach: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user ID 必填'],
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'course ID 必填'],
    },
    startTime: {
      type: Date,
      required: [true, 'startTime 必填'],
    },
    endTime: {
      type: Date,
      required: [true, 'endTime 必填'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
  },
);

CourseScheduleSchema.index(
  { coach: 1, startTime: 1, endTime: 1 },{ unique: true });

CourseScheduleSchema.index(
  { course: 1, startTime: 1, endTime: 1 },{ unique: true });

export const CourseScheduleModel = mongoose.model(
  'CourseSchedule',
  CourseScheduleSchema,
);
