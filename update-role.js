const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

async function updateUserRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update the user with email mdaad5555@gmail.com to instructor
    const result = await User.updateOne(
      { email: 'mdaad5555@gmail.com' },
      { role: 'instructor' }
    );

    console.log('Update result:', result);

    // Fetch and display the updated user
    const user = await User.findOne({ email: 'mdaad5555@gmail.com' });
    console.log('Updated user:');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);

    await mongoose.connection.close();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateUserRole();
