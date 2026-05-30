import React, { useState, useEffect } from 'react';
import useGeolocation from './hooks/useGeolocation';
import Header from './components/Header';
import MapView from './components/MapView';
import EmergencyButtons from './components/EmergencyButtons';
import ShareLocation from './components/ShareLocation';
import NearbyServices from './components/NearbyServices';
import TriageChat from './components/TriageChat';
import AccidentReport from './components/AccidentReport';
import { Home, Building2, MessageCircle, FileText } from 'lucide-react';
import { haversine } from './utils/haversine';
import { LUCKNOW_SERVICES } from './utils/mockData';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'nearby', label: 'Nearby', icon: Building2 },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'report', label: 'Report', icon: FileText },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [demoMode, setDemoMode] = useState(true);
  const geo = useGeolocation();

  const [services, setServices] = useState(null);
  useEffect(() => {
    if (!geo.location) return;
    const computed = {};
    Object.entries(LUCKNOW_SERVICES).forEach(([cat, list]) => {
      computed[cat] = list.map(s => ({
        ...s,
        distance_km: haversine(geo.location.lat, geo.location.lng, s.lat, s.lng),
      })).sort((a, b) => a.distance_km - b.distance_km).slice(0, 3);
    });
    setServices(computed);
  }, [geo.location]);

  useEffect(() => {
    if (geo.isDemo) setDemoMode(true);
    else setDemoMode(false);
  }, [geo.isDemo]);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-5 page-enter">
            <MapView location={geo.location} address={geo.address} loading={geo.loading} services={services} demoMode={demoMode}
              searchLocation={geo.searchLocation} setManualLocation={geo.setManualLocation} requestLocation={geo.requestLocation} />
            <EmergencyButtons />
            <div className="divider" />
            <ShareLocation location={geo.location} address={geo.address} />
          </div>
        );
      case 'nearby':
        return <NearbyServices location={geo.location} demoMode={demoMode} />;
      case 'chat':
        return <TriageChat demoMode={demoMode} />;
      case 'report':
        return <AccidentReport location={geo.location} address={geo.address} demoMode={demoMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-surface-500 relative">
      {/* Ambient background glow */}
      <div className="ambient-bg" />
      <div className="grid-pattern fixed inset-0 z-[-1] pointer-events-none" />

      <Header demoMode={demoMode} setDemoMode={setDemoMode} locationError={geo.error} />

      <main className="flex-1 w-full max-w-mobile mx-auto px-4 py-5 pb-24 overflow-y-auto relative z-10">
        {renderPage()}
      </main>

      {/* Bottom Navigation — Glass */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-500/80 backdrop-blur-2xl border-t border-white/[0.04]">
        <div className="flex items-center justify-around px-2 py-2 max-w-mobile mx-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} id={`nav-${item.id}`} onClick={() => setActiveTab(item.id)}
                className={`nav-tab flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl ${isActive ? 'active' : 'text-white/25'}`}>
                <div className={isActive ? 'nav-pill' : 'p-1.5'}>
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-accent-500' : 'text-white/25'}`} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={`text-[9px] font-bold tracking-wider ${isActive ? 'text-accent-500' : 'text-white/20'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
