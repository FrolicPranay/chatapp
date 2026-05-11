import { useState } from 'react';
import { ChatState } from '../context/ChatProvider';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div className="chat-layout">
      {user && <ChatList fetchAgain={fetchAgain} />}
      {user && <ChatWindow setFetchAgain={setFetchAgain} />}
    </div>
  );
};

export default ChatPage;
