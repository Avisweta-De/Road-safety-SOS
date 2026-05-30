import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Loader2, Search, X, Navigation, LocateFixed } from 'lucide-react';

// Fix default marker icon issue in bundled builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({ className: 'user-marker', iconSize: [18, 18], iconAnchor: [9, 9] });

function svcIcon(color, emoji) {
  return L.divIcon({
    className: 'svc-marker',
    html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px ${color}40,0 2px 8px rgba(0,0,0,.4)">${emoji}</div>`,
    iconSize: [30, 30], iconAnchor: [15, 15],
  });
}

const svcConfig = {
  hospitals:     { color: '#FF3333', emoji: '🏥' },
  police:        { color: '#3B82F6', emoji: '🚔' },
  towing:        { color: '#F59E0B', emoji: '🚗' },
  fire_stations: { color: '#8B5CF6', emoji: '🚒' },
};

function RecenterMap({ lat, lng }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng], 14);
    setTimeout(() => map.invalidateSize(), 200);
  }, [lat, lng, map]);
  return null;
}

export default function MapView({ location, address, loading, services, demoMode, searchLocation, setManualLocation, requestLocation }) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = async () => {
    if (!query.trim() || !searchLocation) return;
    setSearching(true);
    const res = await searchLocation(query.trim());
    setResults(res);
    setSearching(false);
  };

  const selectResult = (r) => {
    setManualLocation(r.lat, r.lng, r.short);
    setShowSearch(false);
    setQuery('');
    setResults([]);
  };

  const openSearch = () => {
    setShowSearch(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setQuery('');
    setResults([]);
  };

  if (loading || !location) {
    return (
      <div className="glass h-[230px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-accent-500 animate-spin" />
        <p className="text-sm text-white/30">Detecting location...</p>
      </div>
    );
  }

  const serviceMarkers = [];
  if (services) {
    Object.entries(services).forEach(([cat, list]) => {
      const cfg = svcConfig[cat] || { color: '#6B7280', emoji: '📍' };
      list.forEach(svc => serviceMarkers.push({ ...svc, cat, ...cfg }));
    });
  }

  return (
    <div className="space-y-2.5">
      {/* Search Bar */}
      {showSearch ? (
        <div className="glass p-3 space-y-2.5 animate-fade-in">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search city, address, landmark..."
                className="input-field !pl-9 !py-2.5 !text-sm"
              />
            </div>
            <button onClick={handleSearch} disabled={!query.trim() || searching}
              className="px-4 rounded-xl bg-accent-600 text-white text-xs font-bold hover:bg-accent-500 transition-colors disabled:opacity-30">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
            </button>
            <button onClick={closeSearch} className="w-10 rounded-xl bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors">
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {results.map((r, i) => (
                <button key={i} onClick={() => selectResult(r)}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-start gap-2.5">
                  <Navigation className="w-3.5 h-3.5 text-accent-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white/70 font-medium leading-tight">{r.short}</p>
                    <p className="text-[10px] text-white/20 mt-0.5 leading-tight">{r.display}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searching && (
            <div className="flex items-center justify-center gap-2 py-3">
              <Loader2 className="w-4 h-4 text-accent-500 animate-spin" />
              <span className="text-xs text-white/25">Searching...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={openSearch}
            className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl glass-subtle hover:bg-white/[0.06] transition-all">
            <Search className="w-4 h-4 text-white/20" />
            <span className="text-sm text-white/30">Search location...</span>
          </button>
          <button onClick={requestLocation} title="Use my GPS"
            className="w-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
            <LocateFixed className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      )}

      {/* Map */}
      <div className="relative group">
        <div className="w-full h-[230px] rounded-[20px] overflow-hidden border border-white/[0.06]">
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={14}
            zoomControl={true}
            attributionControl={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
            <RecenterMap lat={location.lat} lng={location.lng} />

            <Marker position={[location.lat, location.lng]} icon={userIcon}>
              <Popup><div style={{ textAlign: 'center', padding: 2 }}><strong style={{ color: '#3B82F6' }}>📍 Your Location</strong><br/><span style={{ fontSize: 11, color: '#666' }}>{address}</span></div></Popup>
            </Marker>

            {serviceMarkers.map(svc => (
              <Marker key={svc.name} position={[svc.lat, svc.lng]} icon={svcIcon(svc.color, svc.emoji)}>
                <Popup>
                  <div style={{ padding: 2 }}>
                    <strong style={{ color: svc.color }}>{svc.name}</strong><br/>
                    <span style={{ fontSize: 11, color: '#666' }}>{svc.address}</span><br/>
                    <a href={`tel:${svc.phone}`} style={{ color: '#FF3333', fontSize: 12, fontWeight: 700 }}>📞 {svc.phone}</a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <div className="glass-bright px-3 py-2 flex items-center gap-2 rounded-xl">
            <MapPin className="w-3.5 h-3.5 text-neon-blue flex-shrink-0" />
            <p className="text-[11px] text-white/50 truncate flex-1">{address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}</p>
            {demoMode && <span className="demo-badge">Demo</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
