import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import { User, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tourneyCode, setTourneyCode] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.clear();
    sessionStorage.clear();
    try {
      const res = await API.post('/auth/login', {
        identifier: credentials.identifier,
        password: credentials.password,
        isAdmin: isAdmin,
      });
      if (res.data.success) {
        const userData = res.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', res.data.token);
        login(userData);
        const targetPath = userData.role === 'admin' ? '/admin' : '/auction';
        window.location.href = targetPath;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed - Check Credentials');
    } finally {
      setLoading(false);
    }
  };

  const hasValue = (field) => credentials[field]?.length > 0;

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans bg-slate-950">
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-red-600/20 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent" />
      </div>
      <div className="relative w-full max-w-[90%] sm:max-w-md z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] sm:rounded-[3rem] opacity-20 blur-2xl" />
        <div className="relative backdrop-blur-xl bg-slate-800/60 border border-white/10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-6 sm:p-10">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400">
                Auction Arena
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 tracking-wide">
              {isAdmin ? 'Admin command center' : 'Team owner portal'}
            </p>
          </div>
          <div className="relative bg-slate-900/80 p-1 rounded-2xl border border-white/5 mb-8 flex">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r rounded-xl transition-all duration-300 ease-out shadow-lg"
              style={{
                left: isAdmin ? 'calc(50% )' : '4px',
                background: isAdmin
                  ? 'linear-gradient(to right, #dc2626, #ea580c)'
                  : 'linear-gradient(to right, #2563eb, #7c3aed)',
              }}
            />
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`relative flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-200 z-10 ${!isAdmin ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Team Owner
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`relative flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-200 z-10 ${isAdmin ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Admin
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={18} className="sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                value={credentials.identifier}
                onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
                onFocus={() => setFocusedField('identifier')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 sm:py-5 pl-11 sm:pl-12 pr-4 text-sm sm:text-base text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder={isAdmin ? 'Admin username' : 'Team ID'}
                required
              />
              <label
                className={`absolute left-11 sm:left-12 transition-all duration-200 pointer-events-none ${focusedField === 'identifier' || hasValue('identifier')
                    ? '-top-3 text-[10px] sm:text-xs bg-slate-800 px-2 py-0.5 rounded-lg text-blue-400 border border-white/10'
                    : 'top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400'
                  }`}
              >
                {isAdmin ? 'Username' : 'Team ID'}
              </label>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} className="sm:w-5 sm:h-5" />
              </div>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 sm:py-5 pl-11 sm:pl-12 pr-4 text-sm sm:text-base text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Password"
                required
              />
              <label
                className={`absolute left-11 sm:left-12 transition-all duration-200 pointer-events-none ${focusedField === 'password' || hasValue('password')
                    ? '-top-3 text-[10px] sm:text-xs bg-slate-800 px-2 py-0.5 rounded-lg text-blue-400 border border-white/10'
                    : 'top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400'
                  }`}
              >
                Password
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`relative w-full py-4 sm:py-5 rounded-xl font-black text-sm sm:text-lg tracking-wider uppercase shadow-2xl transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group ${isAdmin
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-600/30'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-600/30'
                }`}
            >
              <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2 text-white">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Enter Arena ⚡</span>
                )}
              </span>
            </button>
          </form>
          {isAdmin && (
            <div className="mt-4 text-center">
              <Link to="/register" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Don't have an admin account? Register here
              </Link>
            </div>
          )}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-center text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
              Just watching a tournament?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Tourney Code"
                value={tourneyCode}
                onChange={(e) => setTourneyCode(e.target.value)}
                className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-red-500 outline-none font-mono uppercase transition-all placeholder:text-slate-600 placeholder:normal-case text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => {
                  if (tourneyCode.trim()) {
                    navigate(`/live?host=${tourneyCode.toLowerCase()}`);
                  }
                }}
                className="bg-red-600 hover:bg-red-500 text-white px-6 rounded-xl font-black uppercase transition-all flex items-center gap-2 shadow-lg hover:shadow-red-500/50 active:scale-95"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </button>
            </div>
            <p className="text-center text-[9px] text-slate-600 mt-3">
              Ask the Admin for their Username to watch live
            </p>
          </div>
          <p className="text-center text-slate-500 text-[10px] sm:text-xs mt-6 opacity-60">
            Secure • Live Auction Environment
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;