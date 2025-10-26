require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Story = require('./models/Story');
const Post = require('./models/Post');
const Skill = require('./models/Skill');
const Venture = require('./models/Venture');
const About = require('./models/About');
const Email = require('./models/Emails');

const app = express();
app.use(express.json());

// Allow CORS only for specific origins
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3005',
    'https://your-dummy-url-here.com' // Replace this with your dummy URL
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// MongoDB Atlas connection
const connectDB = async () => {
  try {
    const atlasConnectionString = process.env.MONGODB_ATLAS_URI;
    
    if (!atlasConnectionString) {
      throw new Error('MONGODB_ATLAS_URI environment variable is required');
    }
    
    await mongoose.connect(atlasConnectionString, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    console.log('Connected to MongoDB Atlas');
    
    // Rest of your event handlers remain the same...
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to Atlas DB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from Atlas DB');
    });
    
  } catch (err) {
    console.error('MongoDB Atlas connection failed:', err);
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed due to app termination');
  process.exit(0);
});

app.post('/api/upload', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body cannot be empty"
      });
    }

    // Normalize field names (convert to camelCase)
    const contentData = {
      type: req.body.type,
      aContentLink: req.body.acontentlink || req.body.aContentLink,
      nContentLink: req.body.ncontentlink || req.body.nContentLink,
      sContentLink: req.body.scontentlink || req.body.sContentLink,
      vContentLink: req.body.vcontentlink || req.body.vContentLink,
      caption: req.body.caption || req.body.captions,
      duration: req.body.duration
    };

    let savedData;

    switch(contentData.type) {
      case 'stories':
        if (!contentData.aContentLink) {
          return res.status(400).json({
            success: false,
            error: "Media URL is required for stories"
          });
        }
        savedData = await new Story({
          aContentLink: contentData.aContentLink,
          duration: contentData.duration || 0,
        }).save();
        break;

      case 'post':
        if (!contentData.nContentLink) {
          return res.status(400).json({
            success: false,
            error: "Media URL is required for posts"
          });
        }
        savedData = await new Post({
          nContentLink: contentData.nContentLink,
          captions: contentData.caption || ''
        }).save();
        break;

      case 'skill':
        if (!contentData.sContentLink) {
          return res.status(400).json({
            success: false,
            error: "Media URL is required for skills"
          });
        }
        savedData = await new Skill({
          sContentLink: contentData.sContentLink,
          captions: contentData.caption || '',
          duration: contentData.duration || 0
        }).save();
        break;

      case 'project':
        if (!contentData.vContentLink) {
          return res.status(400).json({
            success: false,
            error: "Media URL is required for projects"
          });
        }
        savedData = await new Venture({
          vContentLink: contentData.vContentLink,
          captions: contentData.caption || '',
          duration: contentData.duration || 0
        }).save();
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid content type"
        });
    }

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      type: contentData.type,
      data: savedData
    });

  } catch (error) {
    console.error('Upload error:', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

app.post('/api/uploadabout', async (req, res) => {
  try {
    const { username, pfp, bio, links } = req.body;

    if (!username || !pfp || !bio) {
      return res.status(400).json({
        success: false,
        error: "Username and profile picture are required for about data"
      });
    }

    const savedData = await About.createOrOverwrite({
      username,
      pfp,
      bio,
      ...(links && { links: new Map(Object.entries(links)) }),
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'About data created/updated successfully',
      data: savedData
    });
  } catch (error) {
    console.error('Upload about error:', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

app.post('/api/uploademail', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    const newEmail = new Email({ email });
    const savedEmail = await newEmail.save();

    res.status(201).json({
      success: true,
      message: 'Email saved successfully',
      data: savedEmail
    });
  } catch (error) {
    console.error('Upload email error:', error);
    const statusCode = error.code === 11000 ? 409 : error.name === 'ValidationError' ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.code === 11000
        ? 'Email already exists'
        : error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});