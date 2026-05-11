require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});

    console.log('Adding dummy users...');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const user1 = await User.create({ name: 'Alice', email: 'alice@example.com', password });
    const user2 = await User.create({ name: 'Bob', email: 'bob@example.com', password });
    const user3 = await User.create({ name: 'Charlie', email: 'charlie@example.com', password });

    console.log('Adding dummy chat...');
    const chat1 = await Chat.create({
      isGroup: false,
      participants: [user1._id, user2._id]
    });

    console.log('Adding dummy messages...');
    const msg1 = await Message.create({
      chatId: chat1._id,
      senderId: user1._id,
      message: 'Hello Bob! How are you?'
    });

    const msg2 = await Message.create({
      chatId: chat1._id,
      senderId: user2._id,
      message: 'Hi Alice! I am doing great, thanks for asking.'
    });

    // Update latest message
    await Chat.findByIdAndUpdate(chat1._id, { latestMessage: msg2._id });

    console.log('Dummy data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
