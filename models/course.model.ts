import mongoose from 'mongoose';
import type { ICourse } from './type';

const CourseSchema = new mongoose.Schema<ICourse>(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    name: {
      type: String,
      requried: [true, '名稱必填'],
    },
    coach: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user ID 必填'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: [String],
      default: [],
    },
    subCategory: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'success', 'fail'],
      default: 'pending',
    },
    reason: {
      type: String,
      default: null,
      required: function () {
        return this.approvalStatus === 'fail';
      },
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  {
    id: false,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CourseSchema.virtual('coursePrice', {
  ref: 'CoursePrice',
  localField: '_id',
  foreignField: 'course',
});
CourseSchema.virtual('coachDetail', {
  ref: 'User',
  localField: '_id',
  foreignField: 'coach',
  justOne: true,
});

CourseSchema.virtual('commentsNum', {
  ref: 'CourseEvaluation',
  localField: 'coach',
  foreignField: 'userId',
  count: true,
});

CourseSchema.virtual('recurrenceSchedules', {
  ref: 'CourseSchedule',
  localField: 'coach',
  foreignField: 'coach',
});
export const CourseModel = mongoose.model('Course', CourseSchema);
