import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AuctionRoom from './pages/AuctionRoom';
import TeamRegistration from './pages/TeamRegistration';
import Leaderboard from './pages/Leaderboard';
import Squads from './pages/Squads';
import LiveBroadcast from './pages/LiveBroadcast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="min-h-screen bg-slate-900">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/teams" element={<TeamRegistration />} />
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