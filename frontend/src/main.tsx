import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ChatProvider from './context/ChatProvider.tsx';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ChatProvider>
      <App />
    </ChatProvider>
  </BrowserRouter>
);
