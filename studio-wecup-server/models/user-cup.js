const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userCupSchema = new Schema({
  userId: { type: ObjectId, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 }
}, { versionKey: false });
module.exports = mongoose.model('UserCup', userCupSchema);