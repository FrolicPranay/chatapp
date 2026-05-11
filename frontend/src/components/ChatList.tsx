import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChatState } from '../context/ChatProvider';
import { Search, LogOut } from 'lucide-react';

const ChatList = ({ fetchAgain }: { fetchAgain: boolean }) => {
  const [loggedUser, setLoggedUser] = useState<any>();
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const fetchChats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/chats', config);
      setChats(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/users`, config);
      setAllUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = async (e: any) => {
    setSearch(e.target.value);
    if (!e.target.value) {
      setSearchResult([]);
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/users?search=${e.target.value}`, config);
      setSearchResult(data);
    } catch (error) {
      console.log(error);
    }
  };

  const accessChat = async (userId: string) => {
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post('/api/chats', { userId }, config);

      if (!chats.find((c: any) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setSearch('');
      setSearchResult([]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem('userInfo')!));
    if (user) {
      fetchChats();
      fetchAllUsers();
    }
  }, [fetchAgain, user]);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title" style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Messages
        </div>
      </div>
      <div className="search-box" style={{ position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Search users..." 
          value={search}
          onChange={handleSearch}
        />
        {search && (
          <button 
            onClick={() => { setSearch(''); setSearchResult([]); }}
            style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            &times;
          </button>
        )}
      </div>
      <div className="chat-list">
        {searchResult.length > 0 ? (
          searchResult.map(searchedUser => (
            <div key={searchedUser._id} className="chat-item" onClick={() => accessChat(searchedUser._id)}>
              <div className="avatar">{searchedUser.name[0]}</div>
              <div className="chat-info">
                <div className="chat-name">{searchedUser.name}</div>
                <div className="chat-preview">{searchedUser.email}</div>
              </div>
            </div>
          ))
        ) : (
          <>
            {chats.map((chat: any) => {
              const sender = chat.participants.find((p: any) => p._id !== loggedUser?._id);
              if (!sender) return null;
              return (
                <div 
                  key={chat._id} 
                  className={`chat-item ${selectedChat === chat ? 'active' : ''}`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="avatar">
                    {sender.name[0]}
                    <div className={`status-indicator status-${sender.status || 'offline'}`}></div>
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{sender.name}</div>
                    <div className="chat-preview">
                      {chat.latestMessage ? chat.latestMessage.message : 'No messages yet'}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Show other available users to start a chat */}
            {allUsers.length > 0 && (
              <div style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '1rem' }}>
                Other Users
              </div>
            )}
            {allUsers.map((u: any) => {
              // Only show users we don't already have a chat with
              const hasChat = chats.find((c: any) => c.participants.some((p: any) => p._id === u._id));
              if (hasChat) return null;
              return (
                <div key={u._id} className="chat-item" onClick={() => accessChat(u._id)}>
                  <div className="avatar">
                    {u.name[0]}
                    <div className={`status-indicator status-${u.status || 'offline'}`}></div>
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{u.name}</div>
                    <div className="chat-preview">Click to start chatting</div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      
      <div className="sidebar-footer" style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '1.1rem', flexShrink: 0 }}>
            {user?.name[0]}
            <div className="status-indicator status-online"></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</span>
          </div>
        </div>
        <button 
          className="btn-icon" 
          onClick={() => {
            localStorage.removeItem("userInfo");
            window.location.href = "/";
          }}
          style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.75rem', flexShrink: 0 }}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatList;
