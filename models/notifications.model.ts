import mongoose from 'mongoose';
import type { INotifications } from './type';

const schema = new mongoose.Schema<INotifications>({
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, '標題必填'],
  },
  type: {
    type: String,
    enum: ['bookingSuccess', 'classNotification'],
    default: 'bookingSuccess',
    required: true,
  },
  status: {
    type: String,
    enum: ['seen', 'active'],
    default: 'active',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const NotificationsModel = mongoose.model('Notifications', schema);
