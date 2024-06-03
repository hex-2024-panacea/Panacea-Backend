import mongoose from 'mongoose';
import type { ICourseSchedule } from './type';

const CourseScheduleSchema = new mongoose.Schema<ICourseSchedule>({
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
    ref: 'user',
    required: [true, 'user ID 必填'],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'course',
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
});

export const CourseScheduleModel = mongoose.model(
  'CourseSchedule',
  CourseScheduleSchema,
);
