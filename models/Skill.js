const mongoose = require('mongoose');
const detailsDb = mongoose.connection.useDb('details');

const skillSchema = new mongoose.Schema({
  skillId: {
    type: Number,
    unique: true
  },
  sContentLink: {
    type: String,
    required: true,
    maxlength: 255,
    validate: {
      validator: v => v.startsWith('http'),
      message: 'Content link must be a valid URL'
    }
  },
  captions: {
    type: String,
    maxlength: 255
  },
  duration: {
    type: Number, // in seconds
    required: true,
    min: 1
  }
}, { 
  timestamps: true 
});

// Auto-increment ID
skillSchema.pre('save', async function(next) {
  if (!this.isNew || this.skillId) return next();
  
  const lastSkill = await this.constructor.findOne({})
    .sort({ skillId: -1 })
    .select('skillId')
    .lean();
    
  this.skillId = lastSkill ? lastSkill.skillId + 1 : 1;
  next();
});

module.exports = detailsDb.model('Skill', skillSchema);