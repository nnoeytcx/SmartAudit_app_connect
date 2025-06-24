import React, { useState } from 'react';
import '../component/css/IP.css';
import securityLogo from '../component/asset/Security Shield.png';
import { useNavigate } from "react-router-dom";

const LoginIPPage = () => {
  const [serverIP, setServerIP] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSave = async () => {
    const trimmedIP = serverIP.trim();
    if (!trimmedIP) {
      setError("Please enter a valid IP address.");
      return;
    }

    try {
      const result = await window.electronAPI.pingServer(trimmedIP);

      if (result.success) {
        localStorage.setItem('serverIP', trimmedIP);
        navigate("/login");
      } else {
        setError("❌ Unable to connect to Server.");
      }
    } catch (err) {
      setError("❌ An error occurred while connecting to the server.");
    }
  };

  return (
    <div className="container">
      <div className="box-container">
        <div className="pic-container">
          <img src={securityLogo} alt="securityLogo" />
        </div>
        <div className="text">
          <h1>Select IP</h1>
          <p>Smart Audit</p>
        </div>
        <div className="text-input">
          <input
            type="text"
            placeholder="Smart audit server IP"
            value={serverIP}
            onChange={(e) => setServerIP(e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default LoginIPPage;
