const mongoose = require('mongoose');
const detailsDb = mongoose.connection.useDb('details');

const storySchema = new mongoose.Schema({
  storyId: {
    type: Number,
    unique: true
  },
  aContentLink: {
    type: String,
    required: true,
    maxlength: 255
  },
  likes: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    required: true
  }
}, { 
  timestamps: true
});

// Auto-increment storyId before saving
storySchema.pre('save', async function(next) {
  if (!this.isNew || this.storyId) {
    return next();
  }
  
  try {
    const lastStory = await this.constructor.findOne({}, {}, { sort: { 'storyId': -1 } });
    this.storyId = lastStory ? lastStory.storyId + 1 : 1;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = detailsDb.model('Story', storySchema);