const mongoose = require('mongoose');

const approvalReasonSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
});

export const approvalReasonModel = mongoose.model('approvalReason', approvalReasonSchema);
