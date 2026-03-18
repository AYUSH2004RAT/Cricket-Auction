import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axiosConfig';
import { User, Lock, Loader2, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        username: formData.username,
        password: formData.password
      });
      if (res.data.success) {
        alert("Admin registered successfully! Please log in.");
        navigate('/login');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const hasValue = (field) => formData[field]?.length > 0;

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
                Admin Setup
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 tracking-wide">
              Register a new admin command center
            </p>
          </div>
          <form onSubmit={handleRegister} className="space-y-5 sm:space-y-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={18} className="sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 sm:py-5 pl-11 sm:pl-12 pr-4 text-sm sm:text-base text-white placeholder-transparent focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Admin username"
                required
              />
              <label
                className={`absolute left-11 sm:left-12 transition-all duration-200 pointer-events-none ${focusedField === 'username' || hasValue('username')
                    ? '-top-3 text-[10px] sm:text-xs bg-slate-800 px-2 py-0.5 rounded-lg text-red-400 border border-white/10'
                    : 'top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400'
                  }`}
              >
                Username
              </label>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} className="sm:w-5 sm:h-5" />
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 sm:py-5 pl-11 sm:pl-12 pr-4 text-sm sm:text-base text-white placeholder-transparent focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Password"
                required
              />
              <label
                className={`absolute left-11 sm:left-12 transition-all duration-200 pointer-events-none ${focusedField === 'password' || hasValue('password')
                    ? '-top-3 text-[10px] sm:text-xs bg-slate-800 px-2 py-0.5 rounded-lg text-red-400 border border-white/10'
                    : 'top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400'
                  }`}
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
              </div>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 sm:py-5 pl-11 sm:pl-12 pr-4 text-sm sm:text-base text-white placeholder-transparent focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Confirm Password"
                required
              />
              <label
                className={`absolute left-11 sm:left-12 transition-all duration-200 pointer-events-none ${focusedField === 'confirmPassword' || hasValue('confirmPassword')
                    ? '-top-3 text-[10px] sm:text-xs bg-slate-800 px-2 py-0.5 rounded-lg text-red-400 border border-white/10'
                    : 'top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400'
                  }`}
              >
                Confirm Password
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 sm:py-5 rounded-xl font-black text-sm sm:text-lg tracking-wider uppercase shadow-2xl transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-600/30"
            >
              <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2 text-white">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Create Admin ⚡</span>
                )}
              </span>
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Already have an account? Log In here
            </Link>
          </div>
          <p className="text-center text-slate-500 text-[10px] sm:text-xs mt-6 opacity-60">
            Secure • Admin Registration Environment
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
