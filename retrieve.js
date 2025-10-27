const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Story = require('./models/Story');
const Post = require('./models/Post');
const Skill = require('./models/Skill');
const Venture = require('./models/Venture');
const About = require('./models/About');

const app = express();
app.use(express.json());

// Allow CORS only for specific origins
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3005',
    'https://vibefolio.vercel.app/'
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

// GET all stories
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await Story.find();
    const formattedStories = stories.map((story, index) => ({
      storyId: index + 1,
      aContentLink: story.aContentLink,
      likes: story.likes || 0,
      duration: story.duration,
      caption: story.captions
    }));

    res.status(200).json({
      success: true,
      data: formattedStories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    const formattedPosts = posts.map((post, index) => ({
      postId: index + 1,
      nContentLink: post.nContentLink,
      likes: post.likes || 0,
      caption: post.captions
    }));

    res.status(200).json({
      success: true,
      data: formattedPosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET all skills
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find();
    const formattedSkills = skills.map((skill, index) => ({
      skillId: index + 1,
      sContentLink: skill.sContentLink,
      likes: skill.likes || 0,
      duration: skill.duration,
      caption: skill.captions
    }));

    res.status(200).json({
      success: true,
      data: formattedSkills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET all ventures
app.get('/api/ventures', async (req, res) => {
  try {
    const ventures = await Venture.find();
    const formattedVentures = ventures.map((venture, index) => ({
      ventureId: index + 1,
      vContentLink: venture.vContentLink,
      likes: venture.likes || 0,
      duration: venture.duration,
      captions: venture.captions
    }));

    res.status(200).json({
      success: true,
      data: formattedVentures
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET endpoint to retrieve about data as-is from database
app.get('/api/about', async (req, res) => {
  try {
    // Find the about document (assuming there's only one)
    const aboutData = await About.findOne();
    
    if (!aboutData) {
      return res.status(404).json({
        success: false,
        error: 'About information not found'
      });
    }

    // Return the raw MongoDB document
    res.status(200).json({
      success: true,
      data: aboutData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.use('/api', require('./upload'));


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Retrieve server running on port ${PORT}`);
});