import React from 'react';
import pic from '../component/asset/p.webp';
import '../component/css/profile.css';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
    const navigate = useNavigate(); // ✅ ใช้ตรงนี้เท่านั้น

    const handleEnterServer = () => {
        const selectedIP = "192.168.121.195";
        const username = localStorage.getItem("username");
        const password = localStorage.getItem("password");

        if (!username || !password) {
            alert("Missing login credentials.");
            return;
        }

        window.electronAPI.connectRDP(username, password, selectedIP);
    };

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('serverIP');
        navigate('/login'); 
    };

    return (
        <div className="container">
            <div className="box-container">
                <div className="profile">
                    <img src={pic} alt="Profile" />
                </div>
                <p className="name">Somwang</p>
                <p className="position">Security Operation</p>

                <div className="server-info">
                    <button className="enter-btn" onClick={handleEnterServer}>
                        ENTER SERVER
                    </button>
                </div>

                <div className="profile-container">
                    <button className="logout-button" onClick={handleLogout}>
                        LOGOUT
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
