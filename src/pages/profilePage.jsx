import React from 'react';
import pic from '../component/asset/p.webp';
import '../component/css/profile.css';

function ProfilePage() {
    const handleEnterServer = () => {
        const selectedIP = "192.168.121.195"; // IP ของเซิร์ฟเวอร์ที่กำหนดไว้ตายตัว

        const username = localStorage.getItem("username");
        const password = localStorage.getItem("password");

        if (!username || !password) {
            alert("Missing login credentials.");
            return;
        }

        window.electronAPI.connectRDP(username, password, selectedIP);
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

                {/* <button>Change Password</button>
                <button>History</button> */}
            </div>
        </div>
    );
}

export default ProfilePage;
