import mongoose from "mongoose";

const schema = new mongoose.Schema({
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
    requried: [true, '姓名必填'],
  },
  email: {
    type: String,
    requried: [true, '信箱必填'],
  },
  password: {
    type: String,
    requried: [true, '密碼必填'],
  },
  avatar: {
    type: String,
    default:null,
  },
  emailVerifiedAt: {
    type: Date,
    default:null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isCoach: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model('User', schema);

export default User;
