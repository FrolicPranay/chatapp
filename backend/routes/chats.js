const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Chat = require('../models/Chat');
const User = require('../models/User');

const router = express.Router();

// Fetch all chats for the logged in user
router.get('/', protect, async (req, res) => {
  try {
    let results = await Chat.find({ participants: { $elemMatch: { $eq: req.user._id } } })
      .populate('participants', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });
      
    results = await User.populate(results, {
      path: 'latestMessage.senderId',
      select: 'name email',
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Access or create a 1-to-1 chat
router.post('/', protect, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId param not sent with request' });
  }

  let isChat = await Chat.find({
    isGroup: false,
    $and: [
      { participants: { $elemMatch: { $eq: req.user._id } } },
      { participants: { $elemMatch: { $eq: userId } } }
    ]
  }).populate('participants', '-password').populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.senderId',
    select: 'name email',
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      name: "sender",
      isGroup: false,
      participants: [req.user._id, userId]
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate('participants', '-password');
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;
