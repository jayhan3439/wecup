const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
  franchiseeId: { type: String, required: true },
  cupQuantity: Number,
  lidQuantity: Number,
  type: { type: String, required: true, enum: ['restore', 'receive'] },
  status: { type: String, required: true, enum: ['canceled', 'completed', 'waiting'], default: 'waiting' }
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true }, id: false });
applicationSchema.virtual('franchisee', {
  ref: 'Franchisee',
  localField: 'franchiseeId',
  foreignField: '_id',
  justOne: true
});
module.exports = mongoose.model('Application', applicationSchema);