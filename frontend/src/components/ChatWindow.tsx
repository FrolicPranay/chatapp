import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { ChatState } from '../context/ChatProvider';
import { Send, Smile, MessageCircle } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:5000";
let socket: Socket, selectedChatCompare: any;

const ChatWindow = ({ fetchAgain, setFetchAgain }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { selectedChat, user } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/messages/${selectedChat._id}`, config);
      setMessages(data);
      socket.emit('join', selectedChat._id);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newMessage) {
      socket.emit('stop typing', selectedChat._id);
      try {
        const config = { headers: { 'Content-type': 'application/json', Authorization: `Bearer ${user.token}` } };
        setNewMessage('');
        const { data } = await axios.post('/api/messages', {
          message: newMessage,
          chatId: selectedChat._id,
        }, config);

        socket.emit('message:send', data);
        setMessages((prev) => [...prev, data]);
        setFetchAgain((prev: boolean) => !prev);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    if (user) {
      socket.emit('setup', user);
      socket.on('connected', () => setSocketConnected(true));
      socket.on('typing', () => setIsTyping(true));
      socket.on('stop typing', () => setIsTyping(false));
      
      socket.on('status', () => {
        setFetchAgain((prev: boolean) => !prev);
      });
    }
    return () => {
      socket.disconnect();
    }
  }, [user]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    const messageListener = (newMessageReceived: any) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chatId._id) {
        setFetchAgain((prev: boolean) => !prev);
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        setFetchAgain((prev: boolean) => !prev);
      }
    };
    
    socket.on('message:receive', messageListener);
    
    return () => {
      socket.off('message:receive', messageListener);
    };
  }, []);

  const typingHandler = (e: any) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage(prevInput => prevInput + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!selectedChat) {
    return (
      <div className="chat-window" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', background: 'var(--panel-bg)' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)' }}>
          <MessageCircle size={64} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome, {user?.name}!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Select a user from the sidebar to start a real-time conversation.</p>
      </div>
    );
  }

  const sender = selectedChat.participants.find((p: any) => p._id !== user._id);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar">
          {sender?.name[0]}
          <div className={`status-indicator status-${sender?.status || 'offline'}`}></div>
        </div>
        <div>
          <div className="chat-name">{sender?.name}</div>
          <div className="chat-preview" style={{ fontSize: '0.75rem' }}>{sender?.status === 'online' ? 'Online' : 'Offline'}</div>
        </div>
      </div>
      
      <div className="messages-area">
        {messages.map((m, i) => {
          const isSender = m.senderId._id === user._id;
          return (
          <div key={i} className={`message-wrapper ${isSender ? 'message-sent' : 'message-received'}`} style={{ flexDirection: isSender ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '0.75rem', maxWidth: '75%' }}>
            {!isSender && (
              <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', flexShrink: 0 }}>
                {sender?.name[0]}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="message-bubble">
                {m.message}
              </div>
              <div className="message-time">
                {m.createdAt ? format(new Date(m.createdAt), 'p') : format(new Date(), 'p')}
              </div>
            </div>
          </div>
        )})}
        {isTyping && (
          <div className="message-wrapper message-received" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', flexShrink: 0 }}>
              {sender?.name[0]}
            </div>
            <div className="message-bubble typing-indicator" style={{ background: 'transparent', padding: '0.5rem 1rem' }}>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area" style={{ position: 'relative' }}>
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '80px', left: '20px', zIndex: 10 }}>
            <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" as any />
          </div>
        )}
        <button type="button" className="btn-icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Add Emoji">
          <Smile size={20} />
        </button>
        <form onSubmit={sendMessage} style={{ flex: 1, display: 'flex', gap: '1rem' }}>
          <input 
            className="chat-input" 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={typingHandler}
          />
          <button type="submit" className="btn-icon btn-send">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
