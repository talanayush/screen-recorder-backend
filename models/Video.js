const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  url: String,
  publicId: String,
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', videoSchema);
