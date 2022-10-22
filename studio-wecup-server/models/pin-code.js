const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const pinCodeSchema = new Schema({
  _id: { type: String, default: () => crypto.randomBytes(32).toString('hex') },
  code: { type: String, required: true, index: true },
  phoneNumber: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
pinCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 3 });
module.exports = mongoose.model('PinCode', pinCodeSchema);