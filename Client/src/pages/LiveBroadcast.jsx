import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';
import AuctionResultOverlay from '../components/AuctionResultOverlay';

const SOCKET_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://aapka-backend-url.onrender.com';

const socket = io(SOCKET_URL, { transports: ['websocket'] });

const LiveBroadcast = () => {
  const [searchParams] = useSearchParams();
  const host = searchParams.get('host');

  const [livePlayer, setLivePlayer] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [highestBidder, setHighestBidder] = useState("Waiting...");
  const [overlay, setOverlay] = useState({ show: false, type: '', data: null });

  // ✅ Google Drive HQ Image Fix
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150';
    let fileId = null;
    if (url.includes('id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    } else if (url.includes('/d/')) {
      fileId = url.split('/d/')[1].split('/')[0];
    }
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    return url;
  };

  const formattedBid = useMemo(() => {
    return bidAmount.toLocaleString('en-IN');
  }, [bidAmount]);

  const displayHost = useMemo(() => {
    return host ? host.toUpperCase() : '';
  }, [host]);

  useEffect(() => {
    if (!host) return;
    if (!socket.connected) socket.connect();

    socket.emit('joinRoom', host);

    socket.on('newPlayerLive', (data) => {
      setLivePlayer(data.player);
      setBidAmount(data.bid);
      setHighestBidder("Waiting for Bid...");
    });

    socket.on('updateBid', (data) => {
      setBidAmount(data.newBid);
      setHighestBidder(data.bidderName);
    });

    socket.on('auctionResult', (data) => {
      setOverlay({
        show: true,
        type: data.status.toLowerCase(),
        data: { player: data.player, team: data.winningTeam, amount: data.amount }
      });

      setTimeout(() => {
        setOverlay({ show: false, type: '', data: null });
        setLivePlayer(null);
      }, 5000);
    });

    return () => {
      socket.off('newPlayerLive');
      socket.off('updateBid');
      socket.off('auctionResult');
    };
  }, [host]);

  if (!host) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4 text-center">
        <h1 className="text-4xl font-black text-red-500 mb-4">⚠️ Access Denied</h1>
        <p className="text-slate-400">Invalid Tourney Code. Please enter a valid code on the login page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center overflow-hidden relative font-sans">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      </div>

      {/* LIVE Badge */}
      <div className="absolute top-6 left-6 flex items-center gap-3 bg-slate-800/80 backdrop-blur-xl border border-slate-700 px-5 py-3 rounded-full shadow-2xl z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.8)]"></div>
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-red-500 font-black tracking-widest uppercase text-sm">LIVE</span>
        </div>
        <div className="w-px h-5 bg-slate-700"></div>
        <span className="text-slate-400 font-bold tracking-wider uppercase text-xs">
          HOST: <span className="text-white ml-1">{displayHost}</span>
        </span>
      </div>

      {livePlayer ? (
        <div className="relative w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-12 p-6 md:p-16 mt-16 md:mt-0">

          {/* Player Info - Left Side */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative w-72 h-72 md:w-[32rem] md:h-[32rem] mb-10">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
              <img
                src={getImageUrl(livePlayer.imageUrl)}
                alt={livePlayer.name}
                className="relative w-full h-full rounded-full object-cover border-[8px] border-slate-800 shadow-2xl"
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 px-8 py-3 rounded-full border-4 border-slate-950 shadow-2xl">
                <span className="text-white font-black tracking-widest uppercase text-lg">{livePlayer.role}</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
              {livePlayer.name}
            </h1>
          </div>

          {/* Bidding Card - Right Side */}
          <div className="flex-1 w-full max-w-xl bg-slate-800/50 backdrop-blur-2xl border border-slate-700 rounded-[3rem] p-10 md:p-14 text-center shadow-2xl">
            <h3 className="text-slate-500 font-bold uppercase tracking-[0.3em] mb-6">Current Highest Bid</h3>
            <div className="text-7xl md:text-9xl font-black text-green-400 font-mono tracking-tighter mb-10">
              ₹{formattedBid}
            </div>
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Highest Bidder</p>
              <p className="text-3xl md:text-5xl font-black text-yellow-400 italic uppercase truncate">
                {highestBidder}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center flex flex-col items-center">
          <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-8">
            <span className="text-6xl opacity-50">🏏</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-700 uppercase italic tracking-widest">
            Waiting for next player...
          </h2>
          <div className="mt-8 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-blue-500/30 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      )}

      <AuctionResultOverlay show={overlay.show} type={overlay.type} data={overlay.data} />
    </div>
  );
};

export default LiveBroadcast;