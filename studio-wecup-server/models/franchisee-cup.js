const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const franchiseeCupSchema = new Schema({
  franchiseeId: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 }
}, { versionKey: false });
module.exports = mongoose.model('FranchiseeCup', franchiseeCupSchema);