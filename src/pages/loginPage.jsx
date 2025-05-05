import React, { useState } from 'react';
import '../component/css/login.css';
import securityLogo from '../component/asset/Security Shield.png';
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตัดช่องว่างก่อนส่งข้อมูลไป API
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedUsername || !trimmedPassword) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      // เรียกใช้ Electron IPC เพื่อทำการตรวจสอบ login
      const result = await window.electronAPI.loginRequest(trimmedUsername, trimmedPassword);
      
      if (result.success) {
        // ถ้าล็อกอินสำเร็จ, เก็บข้อมูล username, password ลง localStorage
        localStorage.setItem('username', trimmedUsername);
        localStorage.setItem('password', trimmedPassword);

        // เปลี่ยนไปหน้า Profile
        navigate("/profile");
      } else {
        setError(result.message); // แสดงข้อความ error ถ้าล็อกอินไม่สำเร็จ

        // รีเซ็ตข้อมูลในฟอร์ม
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      setError('Error connecting to the server');

      // รีเซ็ตข้อมูลในฟอร์มเมื่อเกิดข้อผิดพลาด
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
        <form onSubmit={handleSubmit} className="text-input">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* แสดงข้อความ error */}
      </div>
    </div>
  );
};

export default LoginPage;
