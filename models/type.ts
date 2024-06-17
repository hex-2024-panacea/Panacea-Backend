import type { Document, ObjectId } from 'mongoose';
export interface IUser extends Document {
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  password: string;
  avatar: string;
  emailVerifiedAt: Date;
  isAdmin: boolean;
  isCoach: boolean;
  subject?: string;
  specialty?: string;
  profilePicture?: string;
  language?: [
    {
      language: string;
      level: string;
    },
  ];
  workExperience?: {
    startYear: string;
    endYear: string;
    startMonth: string;
    endMonth: string;
    department: string;
    position: string;
    title: string;
  };
  birthday: Date;
  education: {
    startDate: Date;
    endDate: Date;
    schoolName: string;
    major: string;
    degree: '學士' | '碩士' | '博士';
  };
  certifiedDocuments: string[];
  bankName: string;
  bankCode: string;
  bankAccount: string;
  earnings: Number;
  actualAmount: Number;
  approvalStatus: 'pending' | 'success' | 'fail';
  reason: string;
}

export interface INotifications extends Document {
  receiver: ObjectId;
  title: string;
  type: 'bookingSuccess' | 'classNotification';
  status: 'seen' | 'active';
  createdAt: Date;
}
export interface ICourse extends Document {
  createdAt: Date;
  updatedAt: Date;
  coach: ObjectId;
  name: string;
  coverImage: string;
  description: string;
  category: string[];
  subCategory: string[];
  startDate: Date;
  isActive: boolean;
  approvalStatus: 'pending' | 'success' | 'fail';
  reason: string;
  rating: Number;
}
export interface ICoursePrice extends Document {
  createdAt: Date;
  updatedAt: Date;
  course: ObjectId;
  count: Number;
  price: Number;
}
export interface ICourseSchedule extends Document {
  createdAt: Date;
  updatedAt: Date;
  course: ObjectId;
  coach: ObjectId;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
}
export interface IBookingCourse extends Document {
  createdAt: Date;
  updatedAt: Date;
  user: ObjectId;
  course: ObjectId;
  coach: ObjectId;
  courseSchedule: ObjectId;
  meetingUrl: string;
  order: ObjectId;
  isCanceled: boolean;
  userCancelReason: string;
  coachCancelReason: string;
}
export interface ICourseComment extends Document {
  createdAt: Date;
  updatedAt: Date;
  user: ObjectId;
  course: ObjectId;
  bookingCourse: ObjectId;
  content: string;
  rating: Number;
}

export interface IOrder extends Document {
  userId: ObjectId;
  courseId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  merchantId: string;
  orderId: string;
  name: string;
  price: string;
  purchaseCount: string;
  totalPrice: string;
  remainingCount: string;
  bookingCount: string;
  tradeInfo: string;
  tradeSha: string;
  status: 'pending' | 'success' | 'fail';
  ip: string;
  tradeNo: string;
  escrowBank: string;
  paymentType: string;
  payerAccount5Code: string;
  payBankCode: string;
  payTime: string;
  message: string;
}
