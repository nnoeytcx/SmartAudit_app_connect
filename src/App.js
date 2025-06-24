import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPage';
import ProfilePage from './pages/profilePage';
import LoginIPPage from './pages/loginIPPage';
import CustomIPPage from './pages/customIPPage';

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<LoginIPPage />} /> 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/custom-ip" element={<CustomIPPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </main>
  );
}

export default App;
