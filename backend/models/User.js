const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
