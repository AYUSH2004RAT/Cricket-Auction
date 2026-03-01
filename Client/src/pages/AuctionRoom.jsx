import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import io from 'socket.io-client';
import AuctionResultOverlay from '../components/AuctionResultOverlay';
import {
  Wallet,
  Clock,
  TrendingUp,
  Hammer,
  Zap,
  Shield,
  Crown,
  Sparkles
} from 'lucide-react';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
  autoConnect: false,
});

const AuctionRoom = () => {
  const [livePlayer, setLivePlayer] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [myTeamName, setMyTeamName] = useState('Guest');
  const [myPurse, setMyPurse] = useState(0);
  const [overlay, setOverlay] = useState({ show: false, type: '', data: null });
  const [roomName, setRoomName] = useState('');

  const playerCardRef = useRef(null);
  const currentBidRef = useRef(null);
  const timerRef = useRef(null);

  const calculateIncrement = useCallback((currentPrice) => {
    if (currentPrice < 10000) return 500;
    if (currentPrice < 100000) return 2000;
    if (currentPrice < 500000) return 10000;
    if (currentPrice < 2000000) return 25000;
    return 50000;
  }, []);

  const increment = useMemo(() => calculateIncrement(bidAmount), [bidAmount, calculateIncrement]);
  const nextBidAmount = useMemo(() => bidAmount + increment, [bidAmount, increment]);
  const canAfford = useMemo(() => myPurse >= nextBidAmount, [myPurse, nextBidAmount]);

  const updateIdentity = useCallback(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      const name = userData.teamName || userData.username || 'Guest';
      setMyTeamName(name);
      setMyPurse(userData.purse || 0);
      const room = userData.role === 'admin' ? userData.username : userData.adminUsername;
      setRoomName(room);
    }
  }, []);

  useEffect(() => {
    updateIdentity();
    if (!socket.connected) socket.connect();

    if (roomName) {
      socket.emit('joinRoom', roomName);
    }

    socket.on('newPlayerLive', (data) => {
      setLivePlayer(data.player);
      setBidAmount(data.bid);
      setTimeLeft(30);
      setIsActive(true);
      setBidHistory(
        data.bidderName
          ? [{ amount: data.bid, bidder: data.bidderName, time: 'Latest' }]
          : []
      );
      if (playerCardRef.current) {
        playerCardRef.current.classList.add('animate-card-enter');
        setTimeout(
          () => playerCardRef.current?.classList.remove('animate-card-enter'),
          500
        );
      }
    });

    socket.on('updateBid', (data) => {
      setBidAmount(data.newBid);
      setTimeLeft(30);
      setBidHistory((prev) => [
        {
          amount: data.newBid,
          bidder: data.bidderName,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
      if (currentBidRef.current) {
        currentBidRef.current.classList.add('animate-flash-green');
        setTimeout(
          () => currentBidRef.current?.classList.remove('animate-flash-green'),
          500
        );
      }
    });

    socket.on('auctionResult', (data) => {
      setLivePlayer(null);
      setIsActive(false);
      setBidHistory([]);

      if (data.status === 'SOLD' && data.winningTeam === myTeamName) {
        const newBalance = myPurse - data.amount;
        setMyPurse(newBalance);
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          user.purse = newBalance;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }

      setOverlay({
        show: true,
        type: data.status.toLowerCase(),
        data: {
          player: data.player,
          team: data.winningTeam,
          amount: data.amount,
        },
      });

      setTimeout(() => {
        setOverlay({ show: false, type: '', data: null });
      }, 5000);
    });

    return () => {
      socket.off('newPlayerLive');
      socket.off('updateBid');
      socket.off('auctionResult');
    };
  }, [updateIdentity, roomName, myTeamName, myPurse]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && isActive) {
      if (timerRef.current) {
        timerRef.current.classList.add('animate-timer-shake');
        setTimeout(
          () => timerRef.current?.classList.remove('animate-timer-shake'),
          300
        );
      }
    }
  }, [timeLeft, isActive]);

  const handlePlaceBid = () => {
    if (!canAfford) {
      const btn = document.getElementById('bid-button');
      btn?.classList.add('animate-shake');
      setTimeout(() => btn?.classList.remove('animate-shake'), 500);
      return;
    }

    socket.emit('placeBid', {
      player: livePlayer,
      newBid: nextBidAmount,
      bidderName: myTeamName,
      room: roomName
    });
  };

  const pursePercentage = useMemo(() => {
    return ((20000000 - myPurse) / 20000000) * 100;
  }, [myPurse]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white overflow-hidden font-sans">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-600/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-slate-950 to-transparent" />

        {/* Animated beams */}
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent" style={{ animation: 'beam 8s infinite linear' }} />
        <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent" style={{ animation: 'beam 12s infinite linear reverse' }} />

        {/* Floating particles */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Ambient vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_80%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Wallet Display */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl transition-all duration-300 hover:border-blue-500/30 group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-md group-hover:bg-green-500/40 transition-all" />
                <Wallet className="w-5 h-5 text-green-400 relative z-10" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">My Purse</p>
                <p className={`text-xl font-black font-mono transition-all duration-300 ${myPurse < 100000 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                  ₹{myPurse.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2 h-1 w-36 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(pursePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Auction Stage */}
        {livePlayer ? (
          <div ref={playerCardRef} className="relative max-w-xl w-full transition-all duration-500">
            {/* Spotlight effect behind card */}
            <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-[4rem] blur-3xl animate-pulse-slow" />

            {/* Main Player Card */}
            <div className="relative bg-slate-800/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_0_60px_rgba(59,130,246,0.1)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_80px_rgba(59,130,246,0.15)]">
              {/* Shimmer border effect */}
              <div className="absolute inset-0 rounded-[3rem] p-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" style={{ animation: 'shimmer 3s linear infinite' }} />

              {/* Content */}
              <div className="relative p-8 md:p-12">
                {/* Timer */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56" cy="56" r="50"
                        stroke="currentColor" strokeWidth="4" fill="transparent"
                        className="text-slate-800"
                      />
                      <circle
                        cx="56" cy="56" r="50"
                        stroke="currentColor" strokeWidth="4" fill="transparent"
                        strokeDasharray={314.16}
                        strokeDashoffset={314.16 * (1 - timeLeft / 30)}
                        className={`transition-all duration-1000 ${timeLeft <= 5 ? 'text-red-500' : timeLeft <= 10 ? 'text-yellow-500' : 'text-blue-500'}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div ref={timerRef} className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-4xl font-black font-mono ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : timeLeft <= 10 ? 'text-yellow-500' : 'text-blue-500'}`}>
                        {timeLeft}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Player Image */}
                <div className="relative w-36 h-36 mx-auto mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse-slow" />
                  <img
                    src={livePlayer.imageUrl}
                    alt={livePlayer.name}
                    className="relative w-36 h-36 mx-auto rounded-full object-cover border-4 border-white/10 shadow-2xl"
                  />
                </div>

                {/* Player Name & Role */}
                <h1 className="text-3xl md:text-5xl font-black italic uppercase text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
                  {livePlayer.name}
                </h1>
                <p className="text-center text-blue-400 font-bold uppercase tracking-[0.3em] text-sm mb-8">
                  {livePlayer.role}
                </p>

                {/* Current Bid */}
                <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/5 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Bid</span>
                    <Hammer className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div
                    ref={currentBidRef}
                    className="text-4xl md:text-5xl font-black font-mono text-green-400 text-center transition-all duration-300"
                  >
                    ₹{bidAmount.toLocaleString()}
                  </div>
                </div>

                {/* Next Bid & Bid Button */}
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Next Valid Bid</p>
                    <p className="text-2xl font-black font-mono text-yellow-400">
                      ₹{nextBidAmount.toLocaleString()}
                      <span className="ml-3 text-sm font-normal text-slate-500">(+{increment.toLocaleString()})</span>
                    </p>
                  </div>

                  <button
                    id="bid-button"
                    onClick={handlePlaceBid}
                    disabled={timeLeft === 0 || !canAfford}
                    className={`relative w-full py-5 rounded-2xl font-black text-xl transition-all duration-300 overflow-hidden group ${timeLeft === 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : !canAfford
                          ? 'bg-red-900/30 text-red-400 cursor-not-allowed border border-red-500/30'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]'
                      }`}
                  >
                    <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center justify-center gap-3">
                      {timeLeft === 0 ? (
                        'TIME OUT ⏰'
                      ) : !canAfford ? (
                        <>
                          <Shield className="w-6 h-6" />
                          INSUFFICIENT FUNDS
                        </>
                      ) : (
                        <>
                          <Zap className="w-6 h-6" />
                          BID ₹{nextBidAmount.toLocaleString()} ⚡
                        </>
                      )}
                    </span>
                  </button>
                </div>

                {/* Bid History */}
                <div className="mt-8">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    LIVE BID HISTORY
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {bidHistory.map((log, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5"
                        style={{ animation: `slideIn 0.3s ease-out ${index * 0.1}s both` }}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-blue-400 uppercase italic">{log.bidder}</span>
                          <span className="text-[9px] text-slate-600 font-bold">{log.time}</span>
                        </div>
                        <span className="text-base font-mono text-green-400 font-black">
                          ₹{log.amount.toLocaleString()}
                        </span>
                        {index === 0 && <Crown className="w-4 h-4 text-yellow-500 ml-2" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Waiting State */
          <div className="text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <Sparkles className="w-20 h-20 text-blue-500/30 relative" />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-widest text-slate-600">
              Waiting for Admin...
            </h2>
            <p className="text-slate-700 mt-3">The auction is about to begin</p>
            <div className="mt-8 flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-blue-500/30 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
          </div>
        )}

        <AuctionResultOverlay show={overlay.show} type={overlay.type} data={overlay.data} />
      </div>

      {/* Inline Styles for Animations */}
      <style>{`
        @keyframes beam { 0% { transform: translateY(-100%); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(100%); opacity: 0; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes slideIn { 0% { opacity: 0; transform: translateX(-20px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes card-enter { 0% { opacity: 0; transform: scale(0.9) translateY(30px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-card-enter { animation: card-enter 0.5s ease-out; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes timer-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
        .animate-timer-shake { animation: timer-shake 0.3s ease-in-out; }
        @keyframes flash-green { 0%, 100% { text-shadow: 0 0 0 rgba(74,222,128,0); } 50% { text-shadow: 0 0 20px rgba(74,222,128,0.8); } }
        .animate-flash-green { animation: flash-green 0.5s ease-out; }
        @keyframes bid-flash { 0% { transform: scale(1); } 50% { transform: scale(1.08); color: #4ade80; } 100% { transform: scale(1); } }
        .animate-bid-flash { animation: bid-flash 0.5s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #3b82f6, #8b5cf6); border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default AuctionRoom;