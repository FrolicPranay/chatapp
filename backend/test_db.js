const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chatapp')
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB on localhost:27017');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILED: Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
