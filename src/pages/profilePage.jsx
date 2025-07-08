import React, { useEffect, useState } from 'react';
import pic from '../component/asset/p.webp';
import '../component/css/profile.css';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
    const navigate = useNavigate();
    const [ipList, setIpList] = useState([]);
    const [selectedIP, setSelectedIP] = useState('');
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    const serverIP = localStorage.getItem("serverIP");

    useEffect(() => {
        const fetchIPs = async () => {
            try {
            const list = await window.electronAPI.getSessionIPList();
            console.log("Fetched IP List:", list);  // ✅ DEBUG
            setIpList(list);
            } catch (err) {
            console.error("Failed to fetch IPs:", err);
            }
        };

        fetchIPs();
    }, []);




    const handleEnterServer = () => {
        if (!selectedIP) {
            alert("Please select IP.");
            return;
        }
        if (!username || !password) {
            alert("Missing login credentials.");
            return;
        }

        localStorage.setItem('selectedIP', selectedIP);
        window.electronAPI.connectRDP(username, password, selectedIP);
    };

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
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

                <div className="dropdown-container">
                    <select value={selectedIP} onChange={(e) => setSelectedIP(e.target.value)}>
                        <option value="">Select IP Server</option>
                        {Array.isArray(ipList) && ipList.length > 0 ? (
                            ipList.map((item, index) => (
                            <option key={index} value={item?.ip || item?.IP}>
                                {item?.ip || item?.IP}
                            </option>
                            ))
                        ) : (
                            <option disabled>No IPs found</option>
                        )}
                    </select>
                </div>
                <div className="server-info">
                    <button className="enter-btn" onClick={handleEnterServer}>ENTER SERVER</button>
                </div>

                <div className="profile-container">
                    <button className="logout-button" onClick={handleLogout}>LOGOUT</button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
