import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function SeverityBadge({ result, compact = false }) {
  if (!result) return null;

  const config = {
    CRITICAL: {
      icon: AlertTriangle, badge: 'badge-critical',
      bg: 'from-red-500/10 to-red-900/10 border-red-500/20',
      text: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(255,51,51,0.1)]',
    },
    MODERATE: {
      icon: AlertCircle, badge: 'badge-moderate',
      bg: 'from-amber-500/10 to-amber-900/10 border-amber-500/20',
      text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
    },
    LOW: {
      icon: CheckCircle, badge: 'badge-low',
      bg: 'from-emerald-500/10 to-emerald-900/10 border-emerald-500/20',
      text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    },
  };

  const cfg = config[result.severity] || config.MODERATE;
  const Icon = cfg.icon;

  if (compact) {
    return (
      <span className={`${cfg.badge} inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold`}>
        <Icon className="w-3 h-3" /> {result.severity}
      </span>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${cfg.bg} border rounded-2xl p-4 animate-bounce-in ${cfg.glow}`}>
      <div className="flex items-center gap-3 mb-2.5">
        <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${cfg.text}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`${cfg.badge} px-2.5 py-0.5 rounded-full text-[10px] font-bold`}>
              {result.severity}
            </span>
            <span className="text-[11px] text-white/30 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {(result.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-white/50 leading-relaxed">{result.recommended_action}</p>

      {result.severity === 'CRITICAL' && (
        <a href="tel:108"
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-sm glow-red active:scale-[0.97] transition-transform">
          <AlertTriangle className="w-4 h-4" /> Call 108 — Ambulance NOW
        </a>
      )}
    </div>
  );
}
