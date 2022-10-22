const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wecupLidSchema = new Schema({
  _id: { type: String, default: 'wecup' },
  quantity: { type: Number, required: true }
}, { versionKey: false });
module.exports = mongoose.model('WecupLid', wecupLidSchema);