import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../context/ChatProvider';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  const { setUser } = ChatState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { 'Content-type': 'application/json' } };
      let data;
      
      if (isLogin) {
        const res = await axios.post('/api/auth/login', { email, password }, config);
        data = res.data;
      } else {
        const res = await axios.post('/api/auth/register', { name, email, password }, config);
        data = res.data;
      }
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      navigate('/chats');
    } catch (error) {
      alert('Authentication failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Antigravity Chat</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
