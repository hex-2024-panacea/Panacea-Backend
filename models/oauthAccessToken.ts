import mongoose from 'mongoose';

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
  expiresAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, 'user ID 必填'],
  },
  name: {
    type: String,
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
});

const OauthAccessTokenModel = mongoose.model('OauthAccessToken', schema);

export default OauthAccessTokenModel;
