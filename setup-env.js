/**
 * Setup script to create .env file if it doesn't exist
 * Run this once: node setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envContent = `# MongoDB Connection String
# For local MongoDB: mongodb://localhost:27017/student-progress
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/student-progress
MONGODB_URI=mongodb://localhost:27017/student-progress

# JWT Secret Key (change this to a random string in production)
JWT_SECRET=student-progress-secret-key-2024

# Server Port
PORT=5000
`;

const envPath = path.join(__dirname, 'backend', '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created in backend folder');
  console.log('📝 Please update MONGODB_URI if using MongoDB Atlas');
} else {
  console.log('ℹ️  .env file already exists');
}

