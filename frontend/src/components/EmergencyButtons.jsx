import React from 'react';
import { Phone, Siren, ShieldAlert, Flame, PhoneCall, Heart } from 'lucide-react';

const buttons = [
  { id: 'ambulance', label: 'Ambulance', number: '108', icon: Siren,
    bg: 'bg-gradient-to-br from-red-600 to-red-800', glow: 'glow-red' },
  { id: 'police', label: 'Police', number: '100', icon: ShieldAlert,
    bg: 'bg-gradient-to-br from-blue-600 to-blue-800', glow: 'glow-blue' },
  { id: 'fire', label: 'Fire', number: '101', icon: Flame,
    bg: 'bg-gradient-to-br from-amber-500 to-amber-700', glow: 'glow-amber' },
  { id: 'road-helpline', label: 'Road Help', number: '1073', icon: PhoneCall,
    bg: 'bg-gradient-to-br from-rose-700 to-rose-900', glow: 'glow-red' },
  { id: 'women-helpline', label: 'Women', number: '1091', icon: Heart,
    bg: 'bg-gradient-to-br from-pink-600 to-pink-800', glow: 'glow-purple' },
];

export default function EmergencyButtons() {
  return (
    <div className="space-y-3">
      <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.15em] px-0.5">
        One-Tap Emergency Call
      </h2>

      <div className="grid grid-cols-3 gap-2.5">
        {buttons.slice(0, 3).map(btn => {
          const Icon = btn.icon;
          return (
            <a key={btn.id} href={`tel:${btn.number}`} id={`btn-sos-${btn.id}`}
              className={`btn-sos flex flex-col items-center gap-1.5 py-5 px-2 rounded-2xl ${btn.bg} ${btn.glow} animate-pulse-glow`}>
              <Icon className="w-7 h-7 text-white drop-shadow-lg" strokeWidth={2} />
              <span className="text-white font-black text-[22px] leading-none tracking-tight drop-shadow">{btn.number}</span>
              <span className="text-white/50 text-[8px] font-bold uppercase tracking-[0.15em]">{btn.label}</span>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {buttons.slice(3).map(btn => {
          const Icon = btn.icon;
          return (
            <a key={btn.id} href={`tel:${btn.number}`} id={`btn-sos-${btn.id}`}
              className={`btn-sos flex items-center gap-3 py-4 px-4 rounded-2xl ${btn.bg} ${btn.glow}`}>
              <Icon className="w-5 h-5 text-white/90" strokeWidth={2} />
              <div>
                <span className="text-white font-black text-lg leading-none block">{btn.number}</span>
                <span className="text-white/40 text-[8px] font-bold uppercase tracking-wider">{btn.label}</span>
              </div>
            </a>
          );
        })}
      </div>

      <div className="glass-subtle px-3.5 py-2.5 flex items-center gap-2.5">
        <Phone className="w-4 h-4 text-accent-400/60 flex-shrink-0" />
        <p className="text-[11px] text-white/25 leading-relaxed">
          Tap to <strong className="text-white/50">instantly call</strong>. Free without balance.
        </p>
      </div>
    </div>
  );
}
