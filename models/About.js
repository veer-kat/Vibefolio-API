const mongoose = require('mongoose');
const detailsDb = mongoose.connection.useDb('details');

const aboutSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
    default: 'John Doe'
  },
  bio: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
    default: 'Default bio - update me'
  },
  links: {
    type: Map,
    of: String,
    required: true,
    default: () => new Map([
      ['website', 'https://example.com'],
      ['github', 'https://github.com']
    ]),
    validate: {
      validator: (linksMap) => {
        const urlRegex = /https?:\/\/[^\s]+/;
        for (const [key, url] of linksMap) {
          if (!urlRegex.test(url)) {
            return false;
          }
        }
        return true;
      },
      message: 'All links must be valid URLs'
    }
  },
  pfp: {
    type: String,
    required: true,
    maxlength: 255,
    default: '/default-pfp.jpg'
  }
}, { 
  timestamps: true 
});

// POST-specific method - overwrites all fields
aboutSchema.statics.createOrOverwrite = async function(data) {
  const defaults = {
    username: 'John Doe',
    bio: 'Default bio - update me',
    links: new Map([['website','https://example.com'], ['github','https://github.com']]),
    pfp: '/default-pfp.jpg'
  };

  const doc = await this.findOneAndUpdate(
    {},
    { 
      ...defaults,
      ...data,
      links: new Map(Object.entries(data.links || {}))
    },
    { 
      upsert: true,
      new: true,
      setDefaultsOnInsert: true 
    }
  );
  
  return doc;
};

module.exports = detailsDb.model('About', aboutSchema);