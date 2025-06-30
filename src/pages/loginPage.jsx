import React, { useState } from 'react';
import '../component/css/login.css';
import securityLogo from '../component/asset/Security Shield.png';
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authType, setAuthType] = useState('server'); // server หรือ ad

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      setError("Please enter UserID");
      return;
    }

    if (!/^\d+$/.test(trimmedUsername)) {
      setError("Please enter your UserID as numbers only.");
      return;
    }

    if (!trimmedPassword) {
      setError("Please enter Password");
      return;
    }

    let selectedIP = '';
    if (authType === 'server') {
      selectedIP = localStorage.getItem('serverIP');
      if (!selectedIP) {
        setError("Server IP not found. Please set it first.");
        return;
      }
    } else if (authType === 'ad') {
      selectedIP = '192.168.121.123'; // ใส่ IP ของ AD ที่นี่
    }

    try {
      const result = await window.electronAPI.loginRequestWithIP({
        user_id: trimmedUsername,
        password: trimmedPassword,
        server_ip: selectedIP
      });

      if (result.success) {
        localStorage.setItem('username', trimmedUsername);
        localStorage.setItem('password', trimmedPassword);
        navigate("/profile");
      } else {
        setError(result.message || "Login failed");
        setUsername('');
        setPassword('');
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server.");
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="container">
      <div className="box-container">
        <div className="pic-container">
          <img src={securityLogo} alt="securityLogo" />
        </div>
        <div className="text">
          <h1>Login</h1>
          <p>Smart Audit</p>
        </div>

        {localStorage.getItem('serverIP') && (
          <div className="ip-wrapper">
            <span>IP: {localStorage.getItem('serverIP')}</span>
            <span className="change-ip" onClick={() => navigate('/custom-ip')}>
              Change IP
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="text-input">
          <input
            type="text"
            placeholder="UserID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="authType"
                value="server"
                checked={authType === 'server'}
                onChange={(e) => setAuthType(e.target.value)}
              />
              <span>Server</span>
            </label>
            <label>
              <input
                type="radio"
                name="authType"
                value="ad"
                checked={authType === 'ad'}
                onChange={(e) => setAuthType(e.target.value)}
              />
              <span>AD</span>
            </label>
          </div>

          <button type="submit">Login</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
