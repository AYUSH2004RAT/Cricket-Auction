import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import API from '../api/axiosConfig';
import io from 'socket.io-client';
import { Users, Wallet, TrendingUp, Award, Sparkles, Download } from 'lucide-react';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});

const Squads = () => {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastWonTeam, setLastWonTeam] = useState(null);
  const [tickerMessages, setTickerMessages] = useState([]);
  const tickerRef = useRef(null);

  const fetchSquads = useCallback(async () => {
    try {
      const res = await API.get('/teams/all');
      setSquads(res.data);
    } catch (err) {
      console.error('Error fetching squads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownloadReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Team Name,Owner,Remaining Purse (Rs),Player Name,Role,Bought Price (Rs)\n";

    squads.forEach(team => {
      if (!team.players || team.players.length === 0) {
        csvContent += `"${team.teamName}","${team.owner}",${team.purse},"No players bought","-","-"\n`;
      } else {
        team.players.forEach(player => {
          csvContent += `"${team.teamName}","${team.owner}",${team.purse},"${player.name}","${player.role}",${player.currentBid || player.basePrice}\n`;
        });
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Final_Tournament_Squads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchSquads();

    socket.on('auctionResult', (data) => {
      if (data.status === 'SOLD') {
        setLastWonTeam(data.winningTeam);
        setTimeout(() => setLastWonTeam(null), 3000);

        if (data.player?.name && data.winningTeam && data.amount) {
          const message = `🔥 ${data.player.name} → ${data.winningTeam} for ₹${data.amount.toLocaleString('en-IN')}`;
          setTickerMessages((prev) => [message, ...prev.slice(0, 4)]);
        }

        setTimeout(() => fetchSquads(), 800);
      }
    });

    return () => {
      socket.off('auctionResult');
    };
  }, [fetchSquads]);

  const processedSquads = useMemo(() => {
    return squads.map((team) => {
      const players = team.players || [];
      const totalSpent = players.reduce((sum, p) => sum + (p.currentBid || p.basePrice || 0), 0);
      const remaining = team.purse || 0;
      const originalBudget = totalSpent + remaining;
      const percentage = originalBudget > 0 ? (totalSpent / originalBudget) * 100 : 0;
      return {
        ...team,
        stats: { totalSpent, remaining, percentage }
      };
    });
  }, [squads]);

  const roleColors = useMemo(() => ({
    Batsman: 'bg-blue-500/20 text-blue-400',
    Bowler: 'bg-red-500/20 text-red-400',
    'All-Rounder': 'bg-purple-500/20 text-purple-400',
    Wicketkeeper: 'bg-yellow-500/20 text-yellow-400',
  }), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-10 relative overflow-x-hidden font-sans">

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Ticker */}
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
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            TOURNAMENT SQUADS
          </h1>
          <div className="flex justify-center items-center gap-3 mt-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">LIVE SQUAD BOARD</span>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full mb-8" />

          {/* Download Button */}
          {!loading && squads.length > 0 && (
            <button
              onClick={handleDownloadReport}
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-2xl shadow-blue-900/30 active:scale-95"
            >
              <Download className="w-5 h-5 group-hover:animate-bounce" />
              Download Final Squads Report
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-[2rem] p-8 space-y-4 animate-pulse">
                <div className="h-8 bg-slate-700 rounded-xl w-3/4" />
                <div className="h-5 bg-slate-700 rounded-lg w-1/2" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-12 bg-slate-800 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedSquads.map((team) => {
              const isRecentlyWon = lastWonTeam === team.teamName;

              return (
                <div
                  key={team._id}
                  className={`group relative bg-slate-800/50 backdrop-blur-xl rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isRecentlyWon
                      ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                      : 'border-slate-700 hover:border-blue-500/30'
                    }`}
                >
                  {/* Header */}
                  <div className="relative p-6 border-b border-slate-700/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                          {team.teamName}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 font-bold tracking-wider">
                          OWNER • {team.owner}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isRecentlyWon && (
                          <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-green-500/30 animate-bounce">
                            <Award className="w-3 h-3" />
                            NEW BUY!
                          </span>
                        )}
                        <div className="bg-blue-500/10 text-blue-400 text-[10px] px-3 py-1.5 rounded-full font-black border border-blue-500/20">
                          {team.players?.length || 0} PLAYERS
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-bold uppercase mb-1">
                          <Wallet className="w-3 h-3" />
                          Spent
                        </div>
                        <p className="text-lg font-black text-green-400 font-mono">
                          ₹{team.stats.totalSpent.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-bold uppercase mb-1">
                          <TrendingUp className="w-3 h-3" />
                          Remaining
                        </div>
                        <p className="text-lg font-black text-yellow-400 font-mono">
                          ₹{team.stats.remaining.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(team.stats.percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Players */}
                  <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {team.players && team.players.length > 0 ? (
                      team.players.map((player, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800 hover:bg-slate-800/50 hover:border-blue-500/20 transition-all group/player"
                        >
                          <div className="relative">
                            {player.imageUrl ? (
                              <img
                                src={player.imageUrl}
                                alt={player.name}
                                className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700 group-hover/player:border-blue-500 transition-all"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border-2 border-slate-700">
                                👤
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="font-bold text-sm uppercase italic text-slate-200 truncate">
                                {player.name}
                              </h3>
                              <span className="text-green-400 font-mono font-bold text-sm ml-2">
                                ₹{(player.currentBid || player.basePrice).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${roleColors[player.role] || 'bg-slate-500/20 text-slate-400'
                                  }`}
                              >
                                {player.role}
                              </span>
                              <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">
                                SOLD
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-slate-600 text-xs font-bold uppercase tracking-widest italic">
                          No players in squad yet
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Squads;