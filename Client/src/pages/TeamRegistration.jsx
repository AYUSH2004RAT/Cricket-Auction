import { useState } from 'react';
import API from '../api/axiosConfig';

const TeamRegistration = () => {
    const [teamData, setTeamData] = useState({
        teamName: '',
        ownerName: '',
        purse: '',
        username: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/teams/register', {
                teamName: teamData.teamName,
                owner: teamData.ownerName,
                purse: Number(teamData.purse),
                username: teamData.username,
                password: teamData.password
            });

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            setTeamData({ teamName: '', ownerName: '', purse: '', username: '', password: '' });
        } catch (err) {
            console.error(err);
            alert("❌ Registration Failed: Username might be taken.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Success Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-fade-out">
                    <div className="bg-slate-800/90 backdrop-blur-2xl border border-green-500/30 rounded-3xl p-10 shadow-2xl animate-pop">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl animate-bounce">
                                ✅
                            </div>
                            <p className="text-white font-black text-xl uppercase italic">Team Registered!</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center items-start pt-6 relative font-sans">
                {/* Background beams */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-1 h-64 bg-blue-500/10 blur-3xl" style={{ animation: 'beam 8s infinite linear' }} />
                    <div className="absolute bottom-0 right-1/4 w-1 h-64 bg-green-500/10 blur-3xl" style={{ animation: 'beam 12s infinite linear reverse' }} />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-full blur-3xl animate-pulse" />
                </div>

                {/* Main Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-[3rem] p-10 w-full max-w-xl relative z-10">

                    {/* Decorative glows */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>

                    {/* Header */}
                    <div className="relative text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                            🏆 Team Registration
                        </h2>
                        <p className="text-slate-500 text-[10px] mt-2 uppercase font-bold tracking-[0.3em]">
                            Secure Access & Budget Control
                        </p>
                        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-3 rounded-full" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative">
                        {/* Team Name */}
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </span>
                            <input
                                type="text"
                                id="teamName"
                                className="w-full p-5 pl-14 bg-slate-900/50 border border-slate-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all peer"
                                value={teamData.teamName}
                                onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
                                required
                                placeholder=" "
                            />
                            <label
                                htmlFor="teamName"
                                className="absolute left-14 top-5 text-slate-500 transition-all duration-200 peer-focus:text-blue-400 peer-focus:text-xs peer-focus:-top-3 peer-focus:left-5 peer-focus:bg-slate-800 peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-5 peer-[:not(:placeholder-shown)]:bg-slate-800 peer-[:not(:placeholder-shown)]:px-2"
                            >
                                Team Name
                            </label>
                        </div>

                        {/* Owner Name */}
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </span>
                            <input
                                type="text"
                                id="ownerName"
                                className="w-full p-5 pl-14 bg-slate-900/50 border border-slate-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all peer"
                                value={teamData.ownerName}
                                onChange={(e) => setTeamData({ ...teamData, ownerName: e.target.value })}
                                required
                                placeholder=" "
                            />
                            <label
                                htmlFor="ownerName"
                                className="absolute left-14 top-5 text-slate-500 transition-all duration-200 peer-focus:text-blue-400 peer-focus:text-xs peer-focus:-top-3 peer-focus:left-5 peer-focus:bg-slate-800 peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-5 peer-[:not(:placeholder-shown)]:bg-slate-800 peer-[:not(:placeholder-shown)]:px-2"
                            >
                                Owner Name
                            </label>
                        </div>

                        {/* Purse */}
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-green-500 group-focus-within:text-green-400 transition-colors z-10">₹</span>
                            <input
                                type="text"
                                id="purse"
                                className="w-full p-5 pl-14 bg-slate-900/50 border border-slate-700 rounded-2xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-green-400 font-mono font-bold text-lg peer"
                                value={teamData.purse}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setTeamData({ ...teamData, purse: val });
                                }}
                                required
                                placeholder=" "
                            />
                            <label
                                htmlFor="purse"
                                className="absolute left-14 top-5 text-slate-500 transition-all duration-200 peer-focus:text-green-400 peer-focus:text-xs peer-focus:-top-3 peer-focus:left-5 peer-focus:bg-slate-800 peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-5 peer-[:not(:placeholder-shown)]:bg-slate-800 peer-[:not(:placeholder-shown)]:px-2"
                            >
                                Total Purse (₹)
                            </label>
                            <div className="absolute inset-0 rounded-2xl border-2 border-green-500/0 group-focus-within:border-green-500/10 group-focus-within:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all duration-300 pointer-events-none" />
                        </div>

                        {/* Credentials Section */}
                        <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-[2rem] border border-blue-500/10 mt-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex items-center gap-2 mb-6 justify-center relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <p className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">
                                    Secure Team Login Access
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Username */}
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className="w-full p-4 pl-11 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        value={teamData.username}
                                        onChange={(e) => setTeamData({ ...teamData, username: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </span>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="w-full p-4 pl-11 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        value={teamData.password}
                                        onChange={(e) => setTeamData({ ...teamData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <p className="text-center text-[8px] text-slate-600 mt-4 tracking-wider uppercase">
                                🔐 Data encrypted • Admin controlled
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-2xl mt-4 flex justify-center items-center gap-3 relative overflow-hidden ${loading
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-green-900/30 hover:shadow-green-500/30 active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <span>Registering</span>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </>
                            ) : (
                                <>
                                    <span>REGISTER TEAM</span>
                                    <span>→</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-[10px] text-slate-600 mt-6 uppercase tracking-[0.2em]">
                        ⚡ Secure registration • Data encrypted
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes beam { 0% { transform: translateY(-100%); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(100%); opacity: 0; } }
                @keyframes fade-out { 0% { opacity: 1; } 100% { opacity: 0; } }
                .animate-fade-out { animation: fade-out 1s ease-in 1.5s forwards; }
                @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
                .animate-pop { animation: pop 0.3s ease-out; }
            `}</style>
        </>
    );
};

export default TeamRegistration;