const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

const router = express.Router();

router.get('/:chatId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'name email')
      .populate('chatId');
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  const { message, chatId } = req.body;

  if (!message || !chatId) {
    return res.status(400).json({ message: 'Invalid data passed into request' });
  }

  var newMessage = {
    senderId: req.user._id,
    message: message,
    chatId: chatId
  };

  try {
    let msg = await Message.create(newMessage);

    msg = await msg.populate('senderId', 'name');
    msg = await msg.populate('chatId');
    const User = require('../models/User');
    msg = await User.populate(msg, {
      path: 'chatId.participants',
      select: 'name email',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: msg,
    });

    res.json(msg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
