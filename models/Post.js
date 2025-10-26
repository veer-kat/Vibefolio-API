const mongoose = require('mongoose');

// Use the 'details' database
const detailsDb = mongoose.connection.useDb('details');

const postSchema = new mongoose.Schema({
  postId: {
    type: Number,
    unique: true
  },
  nContentLink: {
    type: String,
    required: true,
    maxlength: 255
  },
  likes: {
    type: Number,
    default: 0
  },
  captions: {
    type: String,
    maxlength: 255
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-increment postId before saving
postSchema.pre('save', async function(next) {
  if (!this.isNew || this.postId) {
    return next();
  }
  
  try {
    const lastPost = await this.constructor.findOne({}, {}, { sort: { 'postId': -1 } });
    this.postId = lastPost ? lastPost.postId + 1 : 1;
    next();
  } catch (err) {
    next(err);
  }
});

// Static method to get next available ID
postSchema.statics.getNextId = async function() {
  const lastPost = await this.findOne().sort({ postId: -1 });
  return lastPost ? lastPost.postId + 1 : 1;
};

module.exports = detailsDb.model('Post', postSchema);