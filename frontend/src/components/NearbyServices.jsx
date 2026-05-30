import React, { useState, useEffect } from 'react';
import { Building2, Siren, Car, Flame, Phone, MapPin, Star, ChevronRight, Navigation, Loader2 } from 'lucide-react';
import { haversine, formatDistance } from '../utils/haversine';
import { LUCKNOW_SERVICES } from '../utils/mockData';

const tabs = [
  { id: 'hospitals', label: 'Hospitals', icon: Building2, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15', glow: 'shadow-[0_0_12px_rgba(255,51,51,0.06)]' },
  { id: 'police', label: 'Police', icon: Siren, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.06)]' },
  { id: 'towing', label: 'Towing', icon: Car, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.06)]' },
  { id: 'fire_stations', label: 'Fire', icon: Flame, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/15', glow: 'shadow-[0_0_12px_rgba(139,92,246,0.06)]' },
];

export default function NearbyServices({ location, demoMode }) {
  const [activeTab, setActiveTab] = useState('hospitals');
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) return;
    const fetchServices = async () => {
      setLoading(true);
      // Always try backend first (works in both demo and live mode on deployment)
      try {
        const res = await fetch(`/services?lat=${location.lat}&lng=${location.lng}`);
        if (res.ok) { setServices(await res.json()); setLoading(false); return; }
      } catch { /* backend unreachable — use client-side mock */ }

      // Fallback: client-side Haversine calculation with Lucknow mock data
      const computed = {};
      Object.entries(LUCKNOW_SERVICES).forEach(([cat, list]) => {
        const withDist = list.map(svc => ({ ...svc, distance_km: haversine(location.lat, location.lng, svc.lat, svc.lng) }));
        withDist.sort((a, b) => a.distance_km - b.distance_km);
        computed[cat] = withDist.slice(0, 3);
      });
      setServices(computed);
      setLoading(false);
    };
    fetchServices();
  }, [location, demoMode]);

  if (loading || !services) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-7 h-7 text-accent-500 animate-spin" />
        <p className="text-sm text-white/25">Finding nearby services...</p>
      </div>
    );
  }

  const tabCfg = tabs.find(t => t.id === activeTab);
  const list = services[activeTab] || [];

  return (
    <div className="space-y-4 page-enter">
      <h2 className="text-lg font-bold text-white">Nearby Emergency Services</h2>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} id={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all border ${
                isActive ? `${tab.bg} ${tab.color} ${tab.border} ${tab.glow}` : 'bg-white/[0.03] text-white/30 border-white/[0.04] hover:border-white/[0.08]'
              }`}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5">
        {list.map((svc, i) => (
          <div key={svc.name} className="glass p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-bold text-white text-[13px] truncate">{svc.name}</h3>
                  {svc.open24 && <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/15">24/7</span>}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-white/15" />
                  <p className="text-[11px] text-white/30 truncate">{svc.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-[11px] font-semibold ${tabCfg.color}`}>
                    <Navigation className="w-3 h-3" /> {svc.distance_km != null ? formatDistance(svc.distance_km) : svc.distance_label || ''}
                  </span>
                  {svc.rating && (
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {svc.rating}
                    </span>
                  )}
                </div>
              </div>
              <a href={`tel:${svc.phone}`} className={`flex-shrink-0 w-11 h-11 rounded-xl ${tabCfg.bg} border ${tabCfg.border} flex items-center justify-center hover:scale-110 active:scale-95 transition-transform`}>
                <Phone className={`w-4 h-4 ${tabCfg.color}`} />
              </a>
            </div>
            <div className="divider my-3" />
            <div className="flex items-center justify-between">
              <a href={`tel:${svc.phone}`} className={`text-xs font-semibold ${tabCfg.color} flex items-center gap-1`}>
                <Phone className="w-3 h-3" /> {svc.phone}
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${svc.lat},${svc.lng}&origin=${location.lat},${location.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="text-[11px] text-white/25 flex items-center gap-0.5 hover:text-white/50 transition-colors">
                Directions <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
