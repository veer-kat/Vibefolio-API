# VibeFolio Backend

The backend server for VibeFolio - an interactive, social media-styled portfolio platform built with modern web technologies.

## 🚀 Overview

VibeFolio is a dynamic portfolio platform that enables professionals and creators to showcase their work through interactive, social media-style profiles. This backend service powers the core functionality including user data management, media uploads, and API integrations.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Cloud Storage**: Cloudinary CDN
- **Deployment**: AWS (Amazon Web Services)

## 🔌 API Endpoints

### Media Management
- `GET /api/media` - Retrieve media metadata
- `GET /api/media/:id` - Get specific media item

### User Data
- `GET /api/user/profile` - Get user profile data
- `PUT /api/user/profile` - Update user profile

### Content Management
- `GET /api/feed` - Retrieve feed posts
- `GET /api/trips` - Get trips data
- `GET /api/skeels` - Retrieve skills information
- `GET /api/memories` - Get memories data