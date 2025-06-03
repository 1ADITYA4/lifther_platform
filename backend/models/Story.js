const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  story: { type: String, required: true },
  image: { type: String },
  userId: { type: String, required: true }, // Firebase UID or custom user id
}, { timestamps: true });

module.exports = mongoose.model('Story', StorySchema); 