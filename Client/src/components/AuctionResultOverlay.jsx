import { useEffect, useState } from 'react';

const AuctionResultOverlay = ({ show, type, data }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  const isSold = type === 'sold';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      {/* Confetti particles for SOLD */}
      {isSold && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 ${['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-red-400', 'bg-purple-400'][i % 5]
                } rounded-full animate-confetti`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${1 + Math.random() * 2}s`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div
          className={`relative bg-slate-800/90 backdrop-blur-2xl border-2 rounded-[3rem] p-10 text-center shadow-2xl transform transition-all duration-500 ${isSold ? 'border-yellow-500/50' : 'border-red-500/50'
            } ${show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
        >
          {/* Glow effect */}
          <div
            className={`absolute inset-0 rounded-[3rem] blur-3xl ${isSold ? 'bg-yellow-500/20' : 'bg-red-500/20'
              } animate-pulse`}
          />

          {/* Icon */}
          <div className="relative mb-6">
            {isSold ? (
              <div className="text-7xl animate-bounce">🏏</div>
            ) : (
              <div className="text-7xl">❌</div>
            )}
          </div>

          {/* Status text */}
          <h2 className={`text-6xl font-black italic uppercase mb-4 ${isSold ? 'text-yellow-400' : 'text-red-400'
            }`}>
            {isSold ? 'SOLD!' : 'UNSOLD'}
          </h2>

          {data?.player && (
            <>
              <p className="text-2xl font-bold text-white mb-1">{data.player.name}</p>
              <p className="text-sm text-slate-400">{data.player.role}</p>
            </>
          )}

          {isSold && data?.team && (
            <div className="mt-6 bg-slate-900/60 rounded-2xl p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Winning Team</p>
              <p className="text-2xl font-black text-yellow-400 italic">{data.team}</p>
              <p className="text-3xl font-black font-mono text-green-400 mt-2">
                ₹{data.amount?.toLocaleString()}
              </p>
            </div>
          )}

          <p className="text-sm text-slate-500 mt-6 animate-pulse">
            {isSold ? 'Hammer down! 🔨' : 'Better luck next time'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuctionResultOverlay;