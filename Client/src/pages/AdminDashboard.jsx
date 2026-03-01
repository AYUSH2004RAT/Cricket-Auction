import { useState, useEffect, useMemo } from 'react';
import API from '../api/axiosConfig';
import io from 'socket.io-client';
import Papa from 'papaparse';
import TeamRegistration from './TeamRegistration';
import AuctionResultOverlay from '../components/AuctionResultOverlay';
import { Upload, Database, PlusCircle, Search, Zap, Hammer, XCircle, Users, Trophy } from 'lucide-react';

const socket = io('http://localhost:5000', { transports: ['websocket'] });

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('players');
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({ name: '', role: 'Batsman', basePrice: '', phone: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [image, setImage] = useState(null);
  const [adminUsername, setAdminUsername] = useState('');

  // Live auction state
  const [livePlayer, setLivePlayer] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState('No Bids Yet');

  // Auction result overlay state
  const [resultOverlay, setResultOverlay] = useState({
    show: false,
    type: null,
    data: null
  });

  const fetchPlayers = async () => {
    try {
      const res = await API.get('/players/all');
      setPlayers(res.data);
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.role === 'admin') {
        setAdminUsername(user.username);
      }
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  };

  const filteredPlayers = useMemo(() => {
    return players.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [players, searchTerm]);

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const user = JSON.parse(localStorage.getItem('user'));
    const currentAdminId = user ? (user.id || user._id) : '';

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const convertDriveLink = (url) => {
          if (!url) return 'https://via.placeholder.com/150';
          let fileId = null;
          if (url.includes('id=')) {
            fileId = url.split('id=')[1].split('&')[0];
          } else if (url.includes('/d/')) {
            fileId = url.split('/d/')[1].split('/')[0];
          }
          if (fileId) {
            return `http://lh3.googleusercontent.com/d/$${fileId}`;
          }
          return url;
        };

        const playersData = results.data.map(p => {
          const rawName = p["Name of the candidate "] || p["Name of the candidate"] || p.Name || p.name;
          const rawRole = p["Role "] || p.Role || p.role;
          const rawPrice = p["Base Price"] || p.BasePrice || p.price;
          const rawPhone = p["Phone no "] || p["Phone no"] || p.Phone || p.phone;
          const rawPhoto = p["Photo of the candidate "] || p["Photo of the candidate"] || p.Photo || p.photo;
          return {
            name: rawName || 'Unknown',
            role: rawRole || 'All-Rounder',
            basePrice: Number(rawPrice || 2000),
            phone: rawPhone || '',
            imageUrl: convertDriveLink(rawPhoto),
            status: 'Available',
            adminId: currentAdminId
          };
        }).filter(p => p.name !== 'Unknown');

        if (playersData.length === 0) {
          return alert("❌ No valid players found. Check CSV format.");
        }

        try {
          const res = await API.post('/players/bulk-add', playersData);
          if (res.status === 201) {
            alert(`✅ Success! ${res.data.count} players added!`);
            fetchPlayers();
          }
        } catch (err) {
          alert("❌ Error uploading to database.");
        }
      }
    });
  };

  const handleStartAuction = (player) => {
    if (window.confirm(`Start auction for ${player.name}?`)) {
      socket.emit('startAuction', { player, room: adminUsername });
      setLivePlayer(player);
      setCurrentBid(player.basePrice);
      setCurrentBidder('Waiting for bids...');
    }
  };

  const handleSold = () => {
    if (!livePlayer) return;
    if (currentBidder === 'Waiting for bids...' || currentBidder === 'No Bids Yet') {
      return alert('No bids placed yet! Cannot sell.');
    }
    if (window.confirm(`Sell ${livePlayer.name} to ${currentBidder} for ₹${currentBid}?`)) {
      socket.emit('playerSold', {
        player: livePlayer,
        team: currentBidder,
        amount: currentBid,
        room: adminUsername
      });
      setResultOverlay({
        show: true,
        type: 'sold',
        data: { player: livePlayer, team: currentBidder, amount: currentBid }
      });
      resetController();
      setTimeout(() => setResultOverlay(prev => ({ ...prev, show: false })), 3000);
    }
  };

  const handleUnsold = () => {
    if (!livePlayer) return;
    if (window.confirm(`Mark ${livePlayer.name} as UNSOLD?`)) {
      socket.emit('playerUnsold', { player: livePlayer, room: adminUsername });
      setResultOverlay({
        show: true,
        type: 'unsold',
        data: { player: livePlayer }
      });
      resetController();
      setTimeout(() => setResultOverlay(prev => ({ ...prev, show: false })), 3000);
    }
  };

  const resetController = () => {
    setLivePlayer(null);
    setCurrentBid(0);
    setCurrentBidder('');
  };

  useEffect(() => {
    if (currentView === 'players') fetchPlayers();
  }, [currentView]);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    if (adminUsername) {
      socket.emit('joinRoom', adminUsername);
    }
    socket.on('updateBid', (data) => {
      setCurrentBid(data.newBid);
      setCurrentBidder(data.bidderName);
    });
    return () => {
      socket.off('updateBid');
    };
  }, [adminUsername]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert('Please select a player photo!');
    const user = JSON.parse(localStorage.getItem('user'));
    const currentAdminId = user ? (user.id || user._id) : '';

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = async () => {
      try {
        await API.post('/players/add', {
          name: formData.name,
          role: formData.role,
          basePrice: formData.basePrice,
          phone: formData.phone,
          adminId: currentAdminId,
          image: reader.result
        });
        alert('✅ Player Saved!');
        setFormData({ name: '', role: 'Batsman', basePrice: '', phone: '' });
        setImage(null);
        fetchPlayers();
      } catch (err) {
        alert('Error saving player');
      }
    };
  };

  const roleColors = {
    Batsman: 'text-blue-400',
    Bowler: 'text-red-400',
    'All-Rounder': 'text-violet-400',
    Wicketkeeper: 'text-amber-400',
  };

  return (
    <>
      <AuctionResultOverlay
        show={resultOverlay.show}
        type={resultOverlay.type}
        data={resultOverlay.data}
      />

      <div className="min-h-screen text-white p-4 md:p-8 flex flex-col items-center pb-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #030712 0%, #0f172a 50%, #030712 100%)' }}>

        {/* Background ambient effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-amber-500/3 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-violet-500/3 rounded-full blur-[150px]" />
        </div>

        {/* FIXED BOTTOM CONTROLLER */}
        {livePlayer && (
          <div className="fixed bottom-0 left-0 right-0 glass border-t border-amber-500/20 shadow-[0_-10px_40px_rgba(245,158,11,0.1)] z-50 p-4 md:p-5 animate-slide-up">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-shimmer" />

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5 relative">

              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={livePlayer.imageUrl}
                    className="w-14 h-14 rounded-xl border-2 border-amber-500/50 object-cover relative z-10"
                    alt=""
                  />
                  <div className="absolute -inset-1 rounded-xl bg-amber-500/20 blur-md animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">
                    {livePlayer.name}
                  </h3>
                  <span className={`text-xs font-bold uppercase tracking-widest ${roleColors[livePlayer.role] || 'text-slate-400'}`}>
                    {livePlayer.role}
                  </span>
                </div>
              </div>

              <div className="text-center bg-slate-950/60 backdrop-blur px-8 py-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  Current Highest Bid
                </p>
                <div key={currentBid} className="text-3xl font-mono font-black text-emerald-400 animate-bid-flash">
                  ₹{currentBid.toLocaleString()}
                </div>
                <div className="text-xs text-amber-400/80 font-bold uppercase mt-1">
                  Holder: {currentBidder}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSold}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 rounded-xl font-black text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all duration-200 flex items-center gap-2 uppercase tracking-wider"
                >
                  <Hammer size={18} /> SOLD
                </button>
                <button
                  onClick={handleUnsold}
                  className="bg-red-600 hover:bg-red-500 text-white px-7 py-3.5 rounded-xl font-black text-sm shadow-lg shadow-red-600/20 active:scale-95 transition-all duration-200 flex items-center gap-2 uppercase tracking-wider"
                >
                  <XCircle size={18} /> UNSOLD
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN DASHBOARD AREA */}
        <div className="w-full max-w-6xl relative z-10">

          {/* Header */}
          <div className="text-center mb-10 relative">
            <div className="inline-flex items-center gap-2 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Live Control Room</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
              <span className="text-gradient-premium">Auction Control</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-violet-500 to-pink-500 mx-auto mt-4 rounded-full" />
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-10">
            <div className="relative flex glass-light p-1 rounded-xl">
              <button
                onClick={() => setCurrentView('players')}
                className={`relative px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 z-10 flex items-center gap-2 ${currentView === 'players' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Database size={16} /> Manage Players
              </button>
              <button
                onClick={() => setCurrentView('teams')}
                className={`relative px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 z-10 flex items-center gap-2 ${currentView === 'teams' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Trophy size={16} /> Register Teams
              </button>
              <div
                className={`absolute bottom-1 top-1 w-1/2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 transition-transform duration-300 ease-out shadow-lg shadow-violet-600/20 ${currentView === 'teams' ? 'translate-x-full' : 'translate-x-0'
                  }`}
                style={{ width: 'calc(50% - 0.25rem)' }}
              />
            </div>
          </div>

          {/* VIEWS SWITCHER */}
          {currentView === 'teams' ? (
            <TeamRegistration />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

              {/* LEFT COLUMN: Forms */}
              <div className="lg:col-span-2 space-y-6">

                {/* Bulk Import */}
                <div className="group glass rounded-2xl p-6 border-2 border-dashed border-blue-500/20 flex flex-col items-center text-center transition-all hover:border-blue-400/40 hover:bg-blue-500/5">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-blue-400 w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-blue-400 uppercase tracking-wider mb-1">Bulk Import</h3>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                    Upload CSV from Google Forms<br />
                    <span className="font-mono text-[10px] text-blue-300/40 uppercase tracking-tighter">Cols: Name, Role, BasePrice, Phone, Photo</span>
                  </p>
                  <label className="w-full cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleBulkUpload}
                      className="hidden"
                    />
                    <div className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95 text-center uppercase tracking-wider">
                      Choose CSV File
                    </div>
                  </label>
                </div>

                {/* Manual Player Form */}
                <div className="glass rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-5">
                    <PlusCircle size={60} />
                  </div>
                  <h2 className="text-base font-black mb-6 text-violet-400 flex items-center gap-2 uppercase tracking-wider">
                    <Zap className="fill-violet-400" size={18} /> Manual Registration
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-[0.15em]">Player Details</label>
                      <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-900/60 border border-white/5 rounded-xl outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <input type="tel" placeholder="Phone Number (Optional)" className="w-full p-4 bg-slate-900/60 border border-white/5 rounded-xl outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all text-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

                    <div className="grid grid-cols-2 gap-3">
                      <select className="p-4 bg-slate-900/60 border border-white/5 rounded-xl outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer text-sm" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                        <option>Batsman</option><option>Bowler</option><option>All-Rounder</option><option>Wicketkeeper</option>
                      </select>
                      <input type="number" placeholder="Base Price" className="p-4 bg-slate-900/60 border border-white/5 rounded-xl outline-none focus:border-violet-500/50 transition-all text-sm" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} required />
                    </div>

                    <div className="p-5 border-2 border-dashed border-white/5 rounded-xl text-center bg-slate-900/30 group hover:border-violet-500/30 transition-colors">
                      <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Player Photo</label>
                      <input type="file" onChange={(e) => setImage(e.target.files[0])} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-5 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white hover:file:bg-violet-600 cursor-pointer transition-all file:text-xs file:font-bold" accept="image/*" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl font-bold text-sm shadow-xl shadow-violet-600/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase tracking-wider">
                      Save to Player Pool
                    </button>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN: Player Pool List */}
              <div className="lg:col-span-3 glass rounded-2xl p-6 flex flex-col h-[850px]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-xl font-black text-amber-400 uppercase flex items-center gap-2 tracking-wide">
                    <Database className="text-amber-400" size={20} /> Player Pool
                  </h2>
                  <div className="relative w-full md:w-56">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" placeholder="Filter by name..." className="w-full py-2.5 pl-10 pr-4 bg-slate-900/60 border border-white/5 rounded-xl text-sm focus:border-amber-500/50 outline-none transition-all focus:ring-2 focus:ring-amber-500/10" onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredPlayers.map((p) => (
                    <div key={p._id} className="group relative flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-amber-500/20 transition-all duration-300 hover:bg-slate-900/60">
                      <div className="flex items-center gap-4">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} className="w-12 h-12 rounded-xl border border-white/10 object-cover group-hover:border-amber-500/30 transition-all" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-white/10">👤</div>
                        )}
                        <div>
                          <p className="font-bold text-base uppercase group-hover:text-amber-400 transition-colors tracking-tight">{p.name}</p>
                          <div className="flex items-center gap-2.5 mt-0.5">
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${roleColors[p.role] || 'text-slate-400'}`}>{p.role}</span>
                            <span className="text-xs font-mono text-emerald-400 font-bold">₹{p.basePrice?.toLocaleString()}</span>
                            {p.phone && <span className="text-[9px] text-slate-500">📞 {p.phone}</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleStartAuction(p)} className="relative bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/15 overflow-hidden flex items-center gap-1.5 tracking-wider">
                        <span className="relative z-10 flex items-center gap-1.5">GO LIVE <Zap size={13} fill="black" /></span>
                      </button>
                    </div>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <div className="text-center py-16 opacity-20">
                      <Database size={80} className="mx-auto mb-4" />
                      <p className="font-black text-xl uppercase">No Players in Pool</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;