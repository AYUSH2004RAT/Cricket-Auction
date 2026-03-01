import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // AuthProvider import karein
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AuctionRoom from './pages/AuctionRoom';
import TeamRegistration from './pages/TeamRegistration';
import Leaderboard from './pages/Leaderboard';
import Squads from './pages/Squads';
import LiveBroadcast from './pages/LiveBroadcast';

function App() {
  return (
    // Sabse pehle AuthProvider se wrap karein
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="min-h-screen bg-slate-900">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Control Path */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/teams" element={<TeamRegistration />} />

            {/* Auction & Live Stats Path */}
            <Route path="/auction" element={<AuctionRoom />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/squads" element={<Squads />} />
            <Route path="/live" element={<LiveBroadcast />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;