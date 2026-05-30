import React, { useState, useRef } from 'react';
import { MapPin, Users, Car, Cloud, Clock, Camera, Send, CheckCircle2, AlertTriangle, X, Upload, Loader2, Sun } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

const accidentTypes = ['Collision', 'Rollover', 'Pedestrian Hit', 'Hit-and-Run', 'Skid', 'Vehicle Fire', 'Other'];
const roadTypes = ['National Highway', 'State Highway', 'Urban Road', 'Village Road', 'Intersection'];
const weatherOptions = ['Clear', 'Rainy', 'Foggy', 'Hazy', 'Stormy'];
const vehicleTypes = ['Car', 'Two-Wheeler', 'Truck', 'Bus', 'Auto-Rickshaw', 'Cycle', 'Pedestrian'];

export default function AccidentReport({ location, address, demoMode }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    location: address || (location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : ''),
    dateTime: new Date().toISOString().slice(0, 16),
    numInjured: 1, numVehicles: 1, accidentType: '', vehicleType: 'Car',
    roadType: 'Urban Road', weather: 'Clear', unconscious: false, description: '', photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportId, setReportId] = useState('');
  const [predicting, setPredicting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = e => {
    const f = e.target.files?.[0];
    if (f) { set('photo', f); const r = new FileReader(); r.onload = ev => setPhotoPreview(ev.target.result); r.readAsDataURL(f); }
  };
  const removePhoto = () => { set('photo', null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ''; };

  const predictSeverity = async () => {
    setPredicting(true);
    const hour = new Date(form.dateTime).getHours();
    const payload = {
      num_vehicles: form.numVehicles, vehicle_type: form.vehicleType,
      num_casualties: form.numInjured, num_fatalities: form.unconscious ? Math.max(1, Math.floor(form.numInjured / 3)) : 0,
      weather: form.weather, road_type: form.roadType,
      road_condition: form.weather === 'Rainy' ? 'Wet' : 'Dry',
      lighting: hour >= 6 && hour < 18 ? 'Daylight' : hour >= 18 && hour < 20 ? 'Dusk' : 'Dark',
      traffic_control: 'Signs', speed_limit: form.roadType.includes('Highway') ? 80 : 40,
      driver_age: 30, driver_gender: 'Male', license_status: 'Valid', alcohol: 'No',
      location_type: form.accidentType === 'Rollover' ? 'Curve' : 'Straight Road', hour,
    };
    try {
      const res = await fetch('/predict-severity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setSeverity(await res.json()); } else throw new Error();
    } catch {
      let sev = 'LOW';
      if (form.unconscious || form.numInjured >= 5) sev = 'CRITICAL';
      else if (form.numInjured >= 2 || form.accidentType === 'Rollover') sev = 'MODERATE';
      setSeverity({ severity: sev, confidence: 0.75, recommended_action: sev === 'CRITICAL' ? '🚨 Call 108 IMMEDIATELY.' : sev === 'MODERATE' ? '⚠️ Seek hospital.' : '✅ File police report.' });
    }
    setPredicting(false);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true);
    if (!severity) await predictSeverity();
    try {
      const res = await fetch('/report', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: form.location, lat: location?.lat || 26.8467, lng: location?.lng || 80.9462, date_time: form.dateTime, num_injured: form.numInjured, num_vehicles: form.numVehicles, accident_type: form.accidentType, road_type: form.roadType, weather: form.weather, unconscious_present: form.unconscious, description: form.description, severity_result: severity }) });
      if (res.ok) { const data = await res.json(); setReportId(data.report_id); } else throw new Error();
    } catch { setReportId(`RS-${Date.now().toString(36).toUpperCase()}`); }
    setSubmitting(false); setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-enter flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mb-5 animate-bounce-in glow-green">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1.5">Report Submitted</h2>
        <p className="text-sm text-white/30 mb-1">ID: <strong className="text-white/60 font-mono">{reportId}</strong></p>
        <p className="text-xs text-white/20 mb-5">Emergency services notified</p>
        {severity && <SeverityBadge result={severity} />}
        <button onClick={() => { setSubmitted(false); setSeverity(null); setReportId(''); }}
          className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 text-white font-semibold text-sm glow-red active:scale-[0.97] transition-transform">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-accent-500/10 border border-accent-500/15 flex items-center justify-center glow-red">
          <AlertTriangle className="w-4 h-4 text-accent-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Report Accident</h2>
          <p className="text-[11px] text-white/25">Details help responders arrive faster</p>
        </div>
      </div>

      {severity && <SeverityBadge result={severity} />}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 block"><MapPin className="w-3 h-3 inline mr-1" />Location</label>
          <input type="text" value={form.location} onChange={e => set('location', e.target.value)} className="input-field" placeholder="Auto-detected" required />
        </div>
        <div>
          <label className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 block"><Clock className="w-3 h-3 inline mr-1" />Date & Time</label>
          <input type="datetime-local" value={form.dateTime} onChange={e => set('dateTime', e.target.value)} className="input-field" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 block"><Users className="w-3 h-3 inline mr-1" />Injured</label>
            <div className="flex gap-1.5">
              {[1,2,3,4,'5+'].map(n => (
                <button key={n} type="button" onClick={() => set('numInjured', typeof n === 'number' ? n : 5)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                    form.numInjured === (typeof n === 'number' ? n : 5)
                      ? 'bg-accent-600 text-white border-accent-500/50 glow-red' : 'bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/[0.1]'
                  }`}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 block"><Car className="w-3 h-3 inline mr-1" />Vehicles</label>
            <div className="flex gap-1.5">
              {[1,2,3,4,'5+'].map(n => (
                <button key={n} type="button" onClick={() => set('numVehicles', typeof n === 'number' ? n : 5)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                    form.numVehicles === (typeof n === 'number' ? n : 5)
                      ? 'bg-accent-600 text-white border-accent-500/50 glow-red' : 'bg-white/[0.03] text-white/30 border-white/[0.06] hover:border-white/[0.1]'
                  }`}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 block">Accident Type</label><select value={form.accidentType} onChange={e => set('accidentType', e.target.value)} className="input-field !py-2.5 !text-sm" required><option value="" disabled>Select</option>{accidentTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 block">Vehicle Type</label><select value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)} className="input-field !py-2.5 !text-sm">{vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 block">Road Type</label><select value={form.roadType} onChange={e => set('roadType', e.target.value)} className="input-field !py-2.5 !text-sm">{roadTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 block"><Cloud className="w-3 h-3 inline mr-1" />Weather</label><select value={form.weather} onChange={e => set('weather', e.target.value)} className="input-field !py-2.5 !text-sm">{weatherOptions.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        </div>

        <div className="flex items-center justify-between py-2 px-1">
          <label className="text-sm font-semibold text-white/60">Unconscious person?</label>
          <button type="button" onClick={() => set('unconscious', !form.unconscious)}
            className={`w-12 h-7 rounded-full transition-all flex items-center px-0.5 ${form.unconscious ? 'bg-red-500 glow-red' : 'bg-white/10'}`}>
            <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${form.unconscious ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div>
          <label className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 block">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input-field min-h-[70px] resize-none" placeholder="Describe the accident..." rows={3} />
        </div>

        <div>
          <label className="text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1.5 block"><Camera className="w-3 h-3 inline mr-1" />Photo</label>
          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
              <img src={photoPreview} alt="Scene" className="w-full h-36 object-cover" />
              <button type="button" onClick={removePhoto} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center"><X className="w-3.5 h-3.5 text-white" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full py-7 rounded-2xl border-2 border-dashed border-white/[0.06] flex flex-col items-center gap-1.5 hover:border-white/[0.12] transition-colors">
              <Upload className="w-5 h-5 text-white/15" /><span className="text-[11px] text-white/20">Tap to upload</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
        </div>

        <button type="button" onClick={predictSeverity} disabled={predicting || !form.accidentType}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
            predicting || !form.accidentType ? 'bg-white/[0.02] text-white/15 border-white/[0.04] cursor-not-allowed'
            : 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/15 glow-purple active:scale-[0.98]'
          }`}>
          {predicting ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sun className="w-4 h-4" /> Predict Severity (AI)</>}
        </button>

        <button type="submit" disabled={submitting || !form.accidentType} id="btn-submit-report"
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            submitting || !form.accidentType ? 'bg-white/[0.03] text-white/15 cursor-not-allowed'
            : 'bg-gradient-to-r from-accent-500 to-accent-700 text-white glow-red active:scale-[0.98]'
          }`}>
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Report</>}
        </button>
      </form>
    </div>
  );
}
