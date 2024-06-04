import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: {
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
    required: true,
  },
  status: {
    type: String,
    enum: ['seen', 'active '],
    default: 'active',
    required: true,
  },
  createdAt: Date,
});

export const NotificationsModel = mongoose.model('Notifications', schema);
