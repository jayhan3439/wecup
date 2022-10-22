const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const franchiseeSchema = new Schema({
  _id: String,
  name: { type: String, required: true },
  address: { type: String, required: true },
  detailAddress: String,
  callNumber: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerPhoneNumber: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  activation: Boolean,
  location: [Number],
  hidden: Boolean
}, { timestamps: true, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true }, id: false });
franchiseeSchema.virtual('cupQuantity', {
  ref: 'FranchiseeCup',
  localField: '_id',
  foreignField: 'franchiseeId',
  justOne: true
});
franchiseeSchema.virtual('lidQuantity', {
  ref: 'FranchiseeLid',
  localField: '_id',
  foreignField: 'franchiseeId',
  justOne: true
});
franchiseeSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Franchisee', franchiseeSchema);