import mongoose from 'mongoose';
import type { IBookingCourse } from './type';

const BookingCourse = new mongoose.Schema<IBookingCourse>(
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
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user ID 必填'],
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'course ID 必填'],
    },
    coach: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user ID 必填'],
    },
    startTime: {
      type: Date,
      required: [true, 'startTime 必填'],
    },
    endTime: {
      type: Date,
      required: [true, 'endTime 必填'],
    },
    courseSchedule: {
      type: mongoose.Schema.ObjectId,
      ref: 'CourseSchedule',
      required: [true, 'courseSchedule ID 必填'],
    },
    meetingUrl: {
      type: String,
      default: '',
    },
    order: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: [true, 'order ID 必填'],
    },
    isCanceled: {
      type: Boolean,
      default: false,
    },
    userCancelReason: {
      type: String,
      default: '',
    },
    coachCancelReason: {
      type: String,
      default: '',
    },
  },
  {
    id: false,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

BookingCourse.virtual('coachDetail', {
  ref: 'User',
  localField: 'coach',
  foreignField: '_id',
  justOne: true,
});
BookingCourse.virtual('userDetail', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});
BookingCourse.virtual('courseDetail', {
  ref: 'Course',
  localField: 'course',
  foreignField: '_id',
  justOne: true,
});
BookingCourse.virtual('courseScheduleDetail', {
  ref: 'CourseSchedule',
  localField: 'courseSchedule',
  foreignField: '_id',
  justOne: true,
});

export const BookingCourseModel = mongoose.model('BookingCourse', BookingCourse);
