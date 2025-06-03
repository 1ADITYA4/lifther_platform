const mongoose = require('mongoose');
const User = require('./models/User');
const Donation = require('./models/Donation');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Donation.deleteMany();

    // Create test users
    const donor = await User.create({
      name: 'Test Donor',
      email: 'donor@test.com',
      password: 'password123'
    });

    const recipient = await User.create({
      name: 'Test Recipient',
      email: 'recipient@test.com',
      password: 'password123'
    });

    // Create test donations
    await Donation.create([
      {
        donor: donor._id,
        recipient: recipient._id,
        amount: 1000,
        status: 'completed',
        message: 'Test donation 1',
        createdAt: new Date('2024-01-15')
      },
      {
        donor: donor._id,
        recipient: recipient._id,
        amount: 2000,
        status: 'completed',
        message: 'Test donation 2',
        createdAt: new Date('2024-02-01')
      },
      {
        donor: donor._id,
        recipient: recipient._id,
        amount: 1500,
        status: 'pending',
        message: 'Test donation 3',
        isAnonymous: true,
        createdAt: new Date('2024-02-15')
      }
    ]);

    console.log('Test data seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData(); 