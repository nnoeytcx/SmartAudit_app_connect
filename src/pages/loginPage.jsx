import React, { useState } from 'react';
import '../component/css/login.css';
import securityLogo from '../component/asset/Security Shield.png';
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const serverIP = localStorage.getItem('serverIP');


  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Please enter both username and password.");
      return;
    }

    const serverIP = localStorage.getItem('serverIP');

    if (!serverIP) {
      setError("Server IP not found. Please configure it first.");
      return;
    }

    try {
      const result = await window.electronAPI.loginRequestWithIP({
        user_id: trimmedUsername,
        password: trimmedPassword,
        server_ip: serverIP
      });

      if (result.success) {
        // เก็บข้อมูลหลัง login
        localStorage.setItem('username', trimmedUsername);
        localStorage.setItem('password', trimmedPassword);

        // 👉 ถ้ามี user_info อื่น ๆ เก็บเพิ่มได้ที่นี่
        // localStorage.setItem('role', result.user_info.role);

        navigate("/profile");
      } else {
        setError(result.message || "Login failed");
        setUsername('');
        setPassword('');
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Cannot connect to server");
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

        {serverIP && (
        <div className="ip-wrapper">
        <span>IP: {serverIP}</span>
        <span className="change-ip" onClick={() => navigate('/custom-ip')}>
          Change IP
        </span>
        </div>
      )}

        <form onSubmit={handleSubmit} className="text-input">
          <input
            type="text"
            placeholder="Username"
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
          <button type="submit">Login</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
