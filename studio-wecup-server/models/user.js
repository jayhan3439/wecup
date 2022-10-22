const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  serviceUsed: Boolean,
  overdue: Boolean
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
module.exports = mongoose.model('User', userSchema);