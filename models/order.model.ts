import mongoose from 'mongoose';
import { IOrder } from './type';
const schema = new mongoose.Schema<IOrder>(
  {
    //購買使用者ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    //課程ID
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // 商店ID
    merchantId: {
      type: String,
      required: true,
    },
    //訂單ID
    orderId: {
      type: String,
      required: true,
    },
    // 購買課程名稱
    name: {
      type: String,
      required: true,
    },
    // 購買價格
    price: {
      type: String,
      required: true,
    },
    // 購買數量(堂數)
    purchaseCount: {
      type: String,
      required: true,
    },
    // 總金額
    totalPrice: {
      type: String,
      required: true,
    },
    // 剩餘堂數
    remainingCount: {
      type: String,
      default: '0',
      required: true,
    },
    // 預約堂數
    bookingCount: {
      type: String,
      default: '0',
      required: true,
    },
    //交易資訊
    tradeInfo: { type: String, required: true },
    //交易SHA
    tradeSha: { type: String, required: true },
    //訂單狀態
    status: {
      type: String,
      enum: ['pending', 'success', 'fail'],
      default: 'pending',
    },
    //建立時間
    createdAt: {
      type: Date,
      default: Date.now,
    },
    //更新時間
    updatedAt: {
      type: Date,
      default: null,
    },
    ip: {
      type: String,
      default: null,
      required: function () {
        return this.status === 'success';
      },
    },

    //交易編號
    tradeNo: {
      type: String,
      default: null,
      required: function () {
        return this.status === 'success';
      },
    },
    //付款銀行
    escrowBank: {
      type: String,
      default: null,
      required: function () {
        return this.status === 'success';
      },
    },
    //付款方式
    paymentType: {
      type: String,
      default: null,
      required: function () {
        return this.status === 'success';
      },
    },
    //付款人後五碼
    payerAccount5Code: {
      type: String,
      default: null,
      required: function () {
        return this.status === 'success';
      },
    },
    //收款銀行代碼
    payBankCode: {
      type: String,
      default: null,
      required: function () {
        return this.status === 'success';
      },
    },
    //付款時間
    payTime: {
      type: String,
      default: null,
      required: function () {
        return this.status === 'success';
      },
    },
    //交易訊息
    message: {
      type: String,
      default: null,
      required: function () {
        return this.status === 'success';
      },
    },
  },
  {
    id: false,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

schema.virtual('user', {
  ref: 'User',
  localField: '_id',
  foreignField: 'userId',
});
schema.virtual('course', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'courseId',
});

export const OrderModel = mongoose.model('Order', schema);
