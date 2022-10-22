const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const franchiseeLidSchema = new Schema({
  franchiseeId: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 }
}, { versionKey: false });
module.exports = mongoose.model('FranchiseeLid', franchiseeLidSchema);