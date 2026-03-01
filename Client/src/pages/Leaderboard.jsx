import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import API from '../api/axiosConfig';
import io from 'socket.io-client';
import { Crown, TrendingUp, TrendingDown, Award, Sparkles } from 'lucide-react';

const socket = io('http://localhost:5000', {
    transports: ['websocket']
});

const TOTAL_BUDGET = 20000000;

const Leaderboard = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tickerMessages, setTickerMessages] = useState([]);
    const prevTeamsRef = useRef([]);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await API.get('/teams/all');
            setTeams(res.data);
        } catch (err) {
            console.error("Error fetching leaderboard", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const sortedTeams = useMemo(() => {
        return [...teams].sort((a, b) => b.purse - a.purse);
    }, [teams]);

    const topBuys = useMemo(() => {
        const allBoughtPlayers = [];
        teams.forEach(team => {
            team.players.forEach(player => {
                allBoughtPlayers.push({
                    ...player,
                    teamName: team.teamName
                });
            });
        });
        return allBoughtPlayers
            .sort((a, b) => b.currentBid - a.currentBid)
            .slice(0, 10);
    }, [teams]);

    useEffect(() => {
        if (prevTeamsRef.current.length > 0 && teams.length > 0) {
            const prevMap = new Map(prevTeamsRef.current.map(t => [t._id, t]));
            teams.forEach((team, index) => {
                const prevTeam = prevMap.get(team._id);
                if (prevTeam) {
                    const prevRank = prevTeamsRef.current.findIndex(t => t._id === team._id) + 1;
                    const newRank = index + 1;
                    if (prevRank !== newRank) {
                        const direction = newRank < prevRank ? '↑' : '↓';
                        setTickerMessages(prev => [
                            `📊 Rank Update: ${team.teamName} moved to #${newRank} ${direction}`,
                            ...prev.slice(0, 4)
                        ]);
                    }
                }
            });
        }
        prevTeamsRef.current = teams;
    }, [teams]);

    useEffect(() => {
        fetchLeaderboard();
        socket.on('connect', () => console.log("✅ Leaderboard Connected to Socket"));

        socket.on('auctionResult', (data) => {
            if (data.status === 'SOLD') {
                if (data.player?.name && data.winningTeam && data.amount) {
                    setTickerMessages(prev => [
                        `🔥 ${data.player.name} → ${data.winningTeam} for ₹${data.amount.toLocaleString('en-IN')}`,
                        ...prev.slice(0, 4)
                    ]);
                }
                setTimeout(() => fetchLeaderboard(), 500);
            }
        });

        return () => {
            socket.off('auctionResult');
            socket.off('connect');
        };
    }, [fetchLeaderboard]);

    const getSpentPercentage = (purse) => {
        const spent = TOTAL_BUDGET - purse;
        return (spent / TOTAL_BUDGET) * 100;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-10 relative overflow-x-hidden font-sans">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-delayed" />
            </div>

            {/* Live Ticker */}
            {tickerMessages.length > 0 && (
                <div className="relative z-20 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700 overflow-hidden -mx-4 md:-mx-10 -mt-4 md:-mt-10 mb-8">
                    <div className="flex whitespace-nowrap animate-ticker py-3 text-sm font-bold">
                        {tickerMessages.concat(tickerMessages).map((msg, idx) => (
                            <span key={idx} className="mx-8 text-yellow-400">{msg}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                        LEADERBOARD
                    </h1>
                    <div className="flex justify-center items-center gap-3 mt-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                        </span>
                        <span className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">LIVE TOURNAMENT STANDINGS</span>
                    </div>
                    <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto mt-4 rounded-full" />
                </div>

                {/* Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

                    {/* LEFT: Team Standings */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest flex items-center gap-3 mb-6">
                            <Sparkles className="text-yellow-500" /> TEAM STANDINGS
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sortedTeams.map((team, index) => {
                                const spentPercentage = getSpentPercentage(team.purse);

                                return (
                                    <div key={team._id} className={`group relative bg-slate-800/50 backdrop-blur-xl rounded-[2rem] border transition-all duration-500 overflow-hidden hover:scale-[1.02] ${index === 0 ? 'border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]' :
                                            index === 1 ? 'border-slate-500/30' :
                                                index === 2 ? 'border-orange-800/30' : 'border-slate-700'
                                        }`}>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    {index === 0 ? <Crown className="w-6 h-6 text-yellow-500" /> :
                                                        index === 1 ? <Award className="w-6 h-6 text-slate-400" /> :
                                                            index === 2 ? <Award className="w-6 h-6 text-orange-700" /> :
                                                                <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-black text-slate-500 border border-slate-700">{index + 1}</span>}
                                                    <div>
                                                        <h2 className="text-xl font-black text-white italic uppercase">{team.teamName}</h2>
                                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Owner: {team.owner}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black font-mono text-green-400">₹{team.purse.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-4">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${spentPercentage}%` }} />
                                            </div>

                                            {/* Mini Squad */}
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                                {team.players.length > 0 ? (
                                                    team.players.map((p, i) => (
                                                        <div key={i} className="flex justify-between text-xs bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                                            <span className="font-bold text-slate-400 uppercase italic">{p.name}</span>
                                                            <span className="font-mono text-yellow-500">₹{p.currentBid.toLocaleString()}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[10px] text-slate-600 italic text-center py-2">No players bought yet</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT: TOP 10 BUYS */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-[2rem] border border-slate-700 p-6 lg:sticky lg:top-20">
                        <h2 className="text-lg font-black text-yellow-500 uppercase italic flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                            🔥 TOP 10 BUYS
                        </h2>

                        <div className="space-y-3">
                            {topBuys.map((player, index) => (
                                <div key={index} className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800 hover:border-yellow-500/30 transition-all">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-yellow-500 text-black' :
                                            index === 1 ? 'bg-slate-400 text-black' :
                                                index === 2 ? 'bg-orange-800 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'
                                        }`}>
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white italic uppercase text-sm">{player.name}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase">{player.teamName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-black text-green-400 text-sm">₹{(player.currentBid / 100000).toFixed(1)}L</p>
                                    </div>
                                </div>
                            ))}
                            {topBuys.length === 0 && <p className="text-slate-600 text-center text-xs py-10 italic">Waiting for first sale...</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Leaderboard;