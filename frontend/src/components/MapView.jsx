import React, { useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export default function MapView({ location, address, loading, services, demoMode }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!location || !mapRef.current) return;
    const initMap = async () => {
      const L = await import('leaflet');
      if (mapInstanceRef.current) mapInstanceRef.current.remove();

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
        .setView([location.lat, location.lng], 14);

      // Dark map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

      const userIcon = L.divIcon({ className: 'user-marker', iconSize: [18, 18], iconAnchor: [9, 9] });
      L.marker([location.lat, location.lng], { icon: userIcon }).addTo(map)
        .bindPopup(`<div style="text-align:center;padding:4px"><strong style="color:#3B82F6">📍 Your Location</strong><br/><span style="font-size:11px;color:rgba(255,255,255,0.5)">${address || ''}</span></div>`);

      if (services) {
        const cfg = {
          hospitals:     { color: '#FF3333', emoji: '🏥' },
          police:        { color: '#3B82F6', emoji: '🚔' },
          towing:        { color: '#F59E0B', emoji: '🚗' },
          fire_stations: { color: '#8B5CF6', emoji: '🚒' },
        };
        Object.entries(services).forEach(([cat, list]) => {
          const { color, emoji } = cfg[cat] || { color: '#6B7280', emoji: '📍' };
          list.forEach(svc => {
            const icon = L.divIcon({
              className: 'svc-marker',
              html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px ${color}40, 0 2px 8px rgba(0,0,0,.4)">${emoji}</div>`,
              iconSize: [30, 30], iconAnchor: [15, 15],
            });
            L.marker([svc.lat, svc.lng], { icon }).addTo(map)
              .bindPopup(`<div style="padding:4px"><strong style="color:${color}">${svc.name}</strong><br/><span style="font-size:11px;color:rgba(255,255,255,0.5)">${svc.address}</span><br/><a href="tel:${svc.phone}" style="color:#FF3333;font-size:12px;font-weight:700">📞 ${svc.phone}</a></div>`);
          });
        });
      }
      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
    };
    initMap();
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [location, services, address]);

  if (loading) {
    return (
      <div className="glass h-[230px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-accent-500 animate-spin" />
        <p className="text-sm text-white/30">Detecting location...</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div ref={mapRef} id="map-container" className="w-full h-[230px] rounded-[20px] overflow-hidden border border-white/[0.06]" />
      <div className="absolute bottom-3 left-3 right-3 z-[1000]">
        <div className="glass-bright px-3 py-2 flex items-center gap-2 rounded-xl">
          <MapPin className="w-3.5 h-3.5 text-neon-blue flex-shrink-0" />
          <p className="text-[11px] text-white/50 truncate flex-1">{address || `${location?.lat.toFixed(4)}, ${location?.lng.toFixed(4)}`}</p>
          {demoMode && <span className="demo-badge">Demo</span>}
        </div>
      </div>
    </div>
  );
}
