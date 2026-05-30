import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

export default function Header({ demoMode, setDemoMode, locationError }) {
  return (
    <header className="sticky top-0 z-50 bg-surface-500/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-mobile mx-auto px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-lg glow-red">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[19px] font-black tracking-tight leading-none">
              Road<span className="text-gradient">SoS</span>
            </h1>
            <p className="text-[8px] font-bold text-white/25 uppercase tracking-[0.2em] mt-0.5">
              Emergency Response
            </p>
          </div>
        </div>

        <button
          onClick={() => setDemoMode(!demoMode)}
          id="toggle-demo-mode"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border backdrop-blur-sm ${
            demoMode
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${demoMode ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]'}`} />
          {demoMode ? 'DEMO' : 'LIVE'}
        </button>
      </div>

      {locationError && (
        <div className="max-w-mobile mx-auto px-4 py-2 border-t border-amber-500/10 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
          <p className="text-[11px] text-amber-400/60">{locationError}</p>
        </div>
      )}
    </header>
  );
}
