const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const franchiseeLogSchema = new Schema({
  franchiseeId: { type: String, required: true },
  releaseCup: Number,
  releaseLid: Number,
  wecupCupQuantity: Number,
  wecupLidQuantity: Number,
  franchiseeCupQuantity: Number,
  franchiseeLidQuantity: Number,
  receiveCup: Number,
  receiveLid: Number,
  canceled: Boolean
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false, toObject: { virtuals: true }, toJSON: { virtuals: true }, id: false });
franchiseeLogSchema.virtual('franchisee', {
  ref: 'Franchisee',
  localField: 'franchiseeId',
  foreignField: '_id',
  justOne: true
});
module.exports = mongoose.model('FranchiseeLog', franchiseeLogSchema);