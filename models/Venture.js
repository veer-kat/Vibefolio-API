const mongoose = require('mongoose');
const detailsDb = mongoose.connection.useDb('details');

const ventureSchema = new mongoose.Schema({
  ventureId: {
    type: Number,
    unique: true
  },
  vContentLink: {
    type: String,
    required: true,
    maxlength: 255,
    validate: {
      validator: v => v.startsWith('http'),
      message: 'Content link must be a valid URL'
    }
  },
  duration: {
    type: Number, // in seconds
    required: true,
    min: 1
  },
  captions: {
    type: String,
    maxlength: 500
  }
  
}, { 
  timestamps: true 
});

// Auto-increment ID
ventureSchema.pre('save', async function(next) {
  if (!this.isNew || this.ventureId) return next();
  
  const lastVenture = await this.constructor.findOne({})
    .sort({ ventureId: -1 })
    .select('ventureId')
    .lean();
    
  this.ventureId = lastVenture ? lastVenture.ventureId + 1 : 1;
  next();
});

module.exports = detailsDb.model('Venture', ventureSchema);