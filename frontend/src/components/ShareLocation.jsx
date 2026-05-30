import React, { useState } from 'react';
import { Share2, MessageCircle, Smartphone, Copy, Check, UserPlus, ExternalLink } from 'lucide-react';

export default function ShareLocation({ location, address }) {
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(() => localStorage.getItem('roadsos_contact') || '');
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(contact);

  const coords = location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : '';
  const mapsUrl = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : '';
  const msg = `🚨 Road accident at ${address || coords}. Location: ${mapsUrl} — Please send help. (via RoadSoS)`;

  const shareWhatsApp = () => {
    const ph = contact.replace(/[^0-9]/g, '');
    window.open(ph ? `https://wa.me/${ph}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };
  const shareSMS = () => window.open(`sms:${contact}?body=${encodeURIComponent(msg)}`, '_self');
  const copyCoords = async () => {
    try { await navigator.clipboard.writeText(`${coords}\n${mapsUrl}`); } catch { const t = document.createElement('textarea'); t.value = `${coords}\n${mapsUrl}`; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const saveContact = () => { localStorage.setItem('roadsos_contact', input); setContact(input); setEditing(false); };

  return (
    <div className="page-enter space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center glow-green">
          <Share2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Share Location</h2>
          <p className="text-[11px] text-white/25">Send GPS coordinates for help</p>
        </div>
      </div>

      <div className="glass p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-white/40 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-accent-400/60" /> Emergency Contact
          </h3>
          {!editing && <button onClick={() => setEditing(true)} className="text-[11px] text-accent-400 font-semibold">{contact ? 'Edit' : 'Add'}</button>}
        </div>
        {editing ? (
          <div className="flex gap-2">
            <input type="tel" value={input} onChange={e => setInput(e.target.value)} className="input-field flex-1 !py-2 !text-sm" placeholder="+91 98765 43210" autoFocus />
            <button onClick={saveContact} className="px-4 py-2 rounded-xl bg-accent-600 text-white text-xs font-bold hover:bg-accent-500 transition-colors">Save</button>
          </div>
        ) : (
          <p className="text-sm text-white/40">{contact || <span className="text-white/15 italic">No contact — tap Add</span>}</p>
        )}
      </div>

      <div className="glass p-4 space-y-1.5">
        <h3 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em]">Your Coordinates</h3>
        <p className="text-sm font-mono font-bold text-white/70">{coords}</p>
        {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-neon-blue flex items-center gap-1 hover:text-blue-300 transition-colors">Open in Maps <ExternalLink className="w-3 h-3" /></a>}
      </div>

      <div className="space-y-2.5">
        <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.15em]">Share via</h3>
        <button onClick={shareWhatsApp} id="btn-share-whatsapp" className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-500/8 border border-emerald-500/12 hover:bg-emerald-500/15 transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg glow-green"><MessageCircle className="w-5 h-5 text-white" /></div>
          <div className="text-left flex-1"><p className="text-white/80 font-bold text-sm">WhatsApp</p><p className="text-[10px] text-white/20">Share with emergency contact</p></div>
          <ExternalLink className="w-4 h-4 text-emerald-400/50" />
        </button>
        <button onClick={shareSMS} id="btn-share-sms" className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-500/8 border border-blue-500/12 hover:bg-blue-500/15 transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg glow-blue"><Smartphone className="w-5 h-5 text-white" /></div>
          <div className="text-left flex-1"><p className="text-white/80 font-bold text-sm">SMS</p><p className="text-[10px] text-white/20">Send via text message</p></div>
          <ExternalLink className="w-4 h-4 text-blue-400/50" />
        </button>
        <button onClick={copyCoords} className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">{copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-white/50" />}</div>
          <div className="text-left flex-1"><p className="text-white/80 font-bold text-sm">{copied ? 'Copied!' : 'Copy Location'}</p><p className="text-[10px] text-white/20">Copy to clipboard</p></div>
        </button>
      </div>
    </div>
  );
}
