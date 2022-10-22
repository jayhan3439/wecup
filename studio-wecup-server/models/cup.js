const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cupSchema = new Schema({
  serialNumber: { type: String, required: true, unique: true },
  deleteReason: { type: String, enum: ['lost', 'breakage'] },
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model('Cup', cupSchema);