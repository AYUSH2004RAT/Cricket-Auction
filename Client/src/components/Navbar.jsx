import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Context import karein

const Navbar = () => {
    const { user, logout } = useContext(AuthContext); // User aur logout function nikalye

    return (
        <nav className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-50 shadow-2xl">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-black italic text-yellow-500 tracking-tighter uppercase">
                    🏏 Auction<span className="text-white">Pro</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/auction" className="text-xs font-black uppercase hover:text-yellow-500 transition-colors">Live Arena ⚡</Link>
                    <Link to="/leaderboard" className="text-xs font-black uppercase hover:text-yellow-500 transition-colors">Leaderboard 📊</Link>
                    <Link to="/squads" className="text-xs font-black uppercase hover:text-yellow-500 transition-colors">Teams Squads 📋</Link>

                    {/* Admin only Link */}
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="bg-red-600 px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-red-500 transition-all shadow-lg shadow-red-900/20">
                            Admin Panel ⚙️
                        </Link>
                    )}

                    {/* Team only Purse Display */}
                    {user?.role === 'team' && (
                        <div className="bg-green-600/20 border border-green-500/50 px-3 py-1.5 rounded-lg">
                            <span className="text-[10px] font-bold text-green-400 uppercase block leading-none">Your Purse</span>
                            <span className="text-sm font-black text-white leading-none">₹{user.purse?.toLocaleString()}</span>
                        </div>
                    )}

                    {/* Authentication Buttons */}
                    {user ? (
                        <button
                            onClick={logout}
                            className="text-xs font-black uppercase text-slate-400 hover:text-white transition-colors"
                        >
                            Logout 🚪
                        </button>
                    ) : (
                        <Link to="/login" className="text-xs font-black uppercase text-yellow-500 hover:text-white transition-colors">
                            Login 🔑
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Icon */}
                <div className="md:hidden text-yellow-500 text-2xl">☰</div>
            </div>
        </nav>
    );
};

export default Navbar;