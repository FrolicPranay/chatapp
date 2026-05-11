# Full-Stack Real-Time Chat Application

This project is a complete real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js) and Socket.io.

## Features Implemented
- **User Authentication**: Secure JWT-based registration and login with bcrypt password hashing.
- **One-to-One Real-Time Chat**: Send and receive messages instantly via WebSockets (Socket.io).
- **Message Persistence**: Chat history is stored in a MongoDB database and loaded seamlessly.
- **Online/Offline Status**: Real-time user presence tracking.
- **Typing Indicators**: See when the other person is typing in real time.
- **Emoji Support**: Integrated emoji picker in the chat window.
- **Premium UI/UX**: Designed using pure, custom CSS with a sleek, modern dark theme.

## Architecture & Tech Stack
- **Frontend**: React (Vite, TypeScript), Context API for state management, Axios, Lucide React (Icons), Emoji Picker React.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Real-time Communication**: Socket.io.

## How to Run the Application

### 1. Prerequisites
- **Node.js** installed on your system.
- **MongoDB** running locally on default port (27017) or update the `MONGO_URI` in `backend/.env`.

### 2. Start the Backend Server
```bash
cd backend
npm install
node server.js
```
*The backend will run on `http://localhost:5000`.*

### 3. Start the Frontend Development Server
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

## API Endpoints Overview
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate an existing user.
- `GET /api/users?search=<query>` - Search for users to chat with.
- `GET /api/chats` - Fetch all conversations for the logged-in user.
- `POST /api/chats` - Create or access a 1-on-1 chat.
- `GET /api/messages/:chatId` - Retrieve the message history for a specific chat.
- `POST /api/messages` - Send a new message.
