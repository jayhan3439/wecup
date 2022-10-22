const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userLogSchema = new Schema({
  franchiseeId: { type: String, required: true },
  userPhoneNumber: { type: String, required: true },
  cupSerialNumber: String,
  lidSerialNumber: String,
  type: { type: String, required: true, enum: ['rental', 'restored'] },
  expiredAt: Date,
  overdue: Boolean,
  canceled: Boolean
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true}, id: false });
userLogSchema.virtual('franchisee', {
  ref: 'Franchisee',
  localField: 'franchiseeId',
  foreignField: '_id',
  justOne: true
});
module.exports = mongoose.model('UserLog', userLogSchema);