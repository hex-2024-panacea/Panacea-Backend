import mongoose from 'mongoose';
import type { IUser } from './type';

const UserSchema = new mongoose.Schema<IUser>({
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
    trim: true,
    unique: true,
    requried: [true, '信箱必填'],
  },
  password: {
    type: String,
    trim: true,
    requried: [true, '密碼必填'],
  },
  avatar: {
    type: String,
    default: null,
  },
  emailVerifiedAt: {
    type: Date,
    default: null,
  },
  birthday: {
    type: Date,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isCoach: {
    type: Boolean,
    default: false,
  },
  // ----------------- coach ----------------- //
  //課程主題
  subject: {
    type: String,
    required: function () {
      return this.isCoach;
    },
  },
  //專長
  specialty: {
    type: String,
    required: function () {
      return this.isCoach;
    },
  },
  language: {
    type: [
      {
        speakLanguage: {
          type: String,
        },
        languageLevel: {
          type: String,
          enum: ['中等', '略懂', '精通'],
        },
      },
    ],
    required: function () {
      return this.isCoach;
    },
  },
  workExperience: {
    type: {
      startYear: {
        type: String,
        default: null,
      },
      endYear: {
        type: String,
        default: null,
      },
      startMonth: {
        type: String,
        default: null,
      },
      endMonth: {
        type: String,
        default: null,
      },
      department: {
        type: String,
        default: null,
      },
      position: {
        type: String,
        default: null,
      },
      title: {
        type: String,
        default: null,
      },
    },
    required: function () {
      return this.isCoach;
    },
  },
  //學歷
  education: {
    type: {
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      schoolName: {
        type: String,
      },
      major: {
        type: String,
      },
      degree: {
        type: String,
        enum: ['學士', '碩士', '博士'],
      },
    },
    required: function () {
      return this.isCoach;
    },
  },
  //證照URL
  certifiedDocuments: {
    type: [String],
    required: function () {
      return this.isCoach;
    },
  },
  //銀行名稱
  bankName: {
    type: String,
    required: function () {
      return this.isCoach;
    },
  },
  //銀行代碼
  bankCode: {
    type: String,
    required: function () {
      return this.isCoach;
    },
  },
  //銀行帳號
  bankAccount: {
    type: String,
    required: function () {
      return this.isCoach;
    },
  },
  //收益金額
  earnings: {
    type: Number,
    default: 0,
    required: function () {
      return this.isCoach;
    },
  },
  //收益金額
  actualAmount: {
    type: Number,
    default: 0,
    required: function () {
      return this.isCoach;
    },
  },
  //審核狀態
  approvalStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
    required: function () {
      return this.isCoach;
    },
  },
});

export const UserModel = mongoose.model('User', UserSchema);
