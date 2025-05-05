import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPage';
import ProfilePage from './pages/profilePage';

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </main>
  );
}

export default App;
