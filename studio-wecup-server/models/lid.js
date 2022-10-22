const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lidSchema = new Schema({
  serialNumber: { type: String, required: true, unique: true },
  deleteReason: { type: String, enum: ['lost', 'breakage'] },
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model('Lid', lidSchema);