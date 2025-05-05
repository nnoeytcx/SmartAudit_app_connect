import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter } from 'react-router-dom'; // ✅ เพิ่ม

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>     {/* ✅ ครอบ App ด้วย HashRouter */}
      <App />
    </HashRouter>
  </React.StrictMode>
);

reportWebVitals();