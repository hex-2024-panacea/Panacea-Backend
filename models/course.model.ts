import mongoose from "mongoose";
import type { ICourse } from "./type";

const CourseSchema = new mongoose.Schema<ICourse>({
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
  name: {
    type: String,
    requried: [true, '名稱必填'],
  },
  coach: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, 'user ID 必填'],
  },
  coverImage: {
    type: String,
    dafault:''
  },
  description: {
    type: String,
    dafault:''
  },
  category: {
    type: [String],
    dafault:[]
  },
  subCategory: {
    type: [String],
    dafault:[]
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
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  reason: {
    type: String,
    dafault:''
  },
  rating: {
    type: Number,
    dafault:0
  },
});