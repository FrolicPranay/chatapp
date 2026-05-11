import { Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
