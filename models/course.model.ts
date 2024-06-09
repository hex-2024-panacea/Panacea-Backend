import mongoose from 'mongoose';
import type { ICourse } from './type';
import coursePrice from '../types/CoursePrice';

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
      dafault: '',
    },
    description: {
      type: String,
      dafault: '',
    },
    category: {
      type: [String],
      dafault: [],
    },
    subCategory: {
      type: [String],
      dafault: [],
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
      dafault: 0,
    },
  },
  {
    id: false,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

CourseSchema.virtual('coursePrice', {
  ref: 'CoursePrice',
  localField: '_id',
  foreignField: 'course',
});
CourseSchema.virtual('user', {
  ref: 'User',
  localField: '_id',
  foreignField: 'coach',
});

export const CourseModel = mongoose.model('Course', CourseSchema);
