require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');

const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log('connected to socket.io');

  socket.on('setup', async (userData) => {
    socket.userId = userData._id;
    socket.join(userData._id);
    await User.findByIdAndUpdate(userData._id, { status: 'online' });
    socket.broadcast.emit('status', { userId: userData._id, status: 'online' });
    socket.emit('connected');
  });

  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('message:send', (newMessageRecieved) => {
    var chat = newMessageRecieved.chatId;

    if (!chat.participants) return console.log('chat.participants not defined');

    chat.participants.forEach(user => {
      const pId = user._id ? user._id.toString() : user.toString();
      if (pId === newMessageRecieved.senderId._id.toString()) return;
      socket.in(pId).emit('message:receive', newMessageRecieved);
    });
  });

  socket.on('disconnect_user', async (userId) => {
    await User.findByIdAndUpdate(userId, { status: 'offline' });
    socket.broadcast.emit('status', { userId: userId, status: 'offline' });
  });

  socket.on('disconnect', async () => {
    console.log('USER DISCONNECTED');
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, { status: 'offline' });
      socket.broadcast.emit('status', { userId: socket.userId, status: 'offline' });
    }
  });
});
