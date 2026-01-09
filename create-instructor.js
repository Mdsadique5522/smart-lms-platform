const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

async function createInstructorUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    let user = await User.findOne({ email: 'mdaad5555@gmail.com' });
    
    if (user) {
      console.log('User exists, updating role...');
      user.role = 'instructor';
      await user.save();
    } else {
      console.log('Creating new instructor user...');
      user = new User({
        name: 'md instructor',
        email: 'mdaad5555@gmail.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'instructor'
      });
      await user.save();
    }

    console.log('✅ Success! User is now an instructor:');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createInstructorUser();
