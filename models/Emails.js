const mongoose = require('mongoose');
const detailsDb = mongoose.connection.useDb('details');

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    maxlength: 255
  }
}, {
  timestamps: true
});

module.exports = detailsDb.model('Email', emailSchema);
