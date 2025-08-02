const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  inquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', required: true },
  packageId: { type: String, required: true },
  userName: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  service: { type: Number, min: 1, max: 5 },
  accommodation: { type: Number, min: 1, max: 5 },
  value: { type: Number, min: 1, max: 5 },
  recommend: { type: String, enum: ['yes', 'no'] },
  feedback: { type: String, required: true },
  anonymous: { type: Boolean, default: false },
  photos: [String], // store file paths or URLs
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema); 