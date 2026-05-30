import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { MOCK_TRIAGE } from '../utils/mockData';

export default function TriageChat({ demoMode }) {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'ai',
      content: "👋 I'm the **RoadSoS AI Triage Assistant**.\n\nDescribe the accident or injury, and I'll provide **step-by-step first-aid guidance**.\n\nExamples:\n• \"Someone is bleeding heavily from the leg\"\n• \"Person hit their head and is unconscious\"\n• \"There's a burn from a vehicle fire\"",
      intent: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = { id: Date.now(), role: 'user', content: input.trim(), intent: null };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      let aiText, intentData;
      if (demoMode) {
        await new Promise(r => setTimeout(r, 1000));
        const lower = userMsg.content.toLowerCase();
        const intents = [
          { tag: 'UNCONSCIOUS', kw: ['unconscious', 'not breathing', 'fainted', 'collapsed', 'unresponsive', 'no pulse', 'cpr'] },
          { tag: 'HEAD', kw: ['head', 'skull', 'brain', 'concussion', 'dizzy', 'hit head'] },
          { tag: 'BLEEDING', kw: ['bleed', 'blood', 'cut', 'wound', 'gash'] },
          { tag: 'FRACTURE', kw: ['broken', 'fracture', 'bone', 'snap', 'dislocated'] },
          { tag: 'BURNS', kw: ['burn', 'fire', 'flame', 'scald', 'hot'] },
          { tag: 'SHOCK', kw: ['shock', 'pale', 'cold skin', 'shaking', 'confused'] },
          { tag: 'SPINAL', kw: ['spine', 'spinal', 'neck', 'paralyzed', 'can\'t feel'] },
        ];
        let detected = 'UNKNOWN';
        for (const i of intents) { if (i.kw.some(k => lower.includes(k))) { detected = i.tag; break; } }
        const emojiMap = { HEAD: '🧠', BLEEDING: '🩸', FRACTURE: '🦴', BURNS: '🔥', UNCONSCIOUS: '🚨', SHOCK: '💫', SPINAL: '🔴', UNKNOWN: '❓' };
        const colorMap = { HEAD: '#8B5CF6', BLEEDING: '#FF3333', FRACTURE: '#F59E0B', BURNS: '#EA580C', UNCONSCIOUS: '#EF4444', SHOCK: '#8B5CF6', SPINAL: '#EF4444', UNKNOWN: '#6B7280' };
        intentData = { tag: detected, emoji: emojiMap[detected], color: colorMap[detected] };
        aiText = MOCK_TRIAGE[detected] || MOCK_TRIAGE.UNKNOWN;
      } else {
        const res = await fetch('/triage', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg.content, history: messages.filter(m => m.role !== 'system').slice(-10).map(m => ({ role: m.role === 'ai' ? 'model' : 'user', content: m.content })) }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        aiText = data.response;
        intentData = data.intent;
      }
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: aiText, intent: intentData }]);
    } catch {
      setError('AI service unavailable. Using offline guidance.');
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: MOCK_TRIAGE.UNKNOWN, intent: { tag: 'UNKNOWN', emoji: '❓', color: '#6B7280' } }]);
    } finally { setIsTyping(false); }
  };

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white/80 font-semibold">$1</strong>');
      if (line.startsWith('• ') || line.startsWith('- ')) return <div key={i} className="flex gap-1.5 ml-0.5"><span className="text-accent-400 mt-0.5">•</span><span dangerouslySetInnerHTML={{ __html: line.slice(2) }} /></div>;
      const num = line.match(/^(\d+)\.\s(.*)/);
      if (num) return <div key={i} className="flex gap-1.5 ml-0.5"><span className="text-accent-400 font-bold text-xs w-4 flex-shrink-0 mt-0.5">{num[1]}.</span><span dangerouslySetInnerHTML={{ __html: num[2] }} /></div>;
      if (line.startsWith('⚠️')) return <div key={i} className="mt-2 p-2 rounded-lg bg-amber-500/8 border border-amber-500/15 text-amber-300/80 text-xs"><span dangerouslySetInnerHTML={{ __html: line }} /></div>;
      if (line.startsWith('📞')) return <div key={i} className="mt-2 p-2 rounded-lg bg-red-500/8 border border-red-500/15 text-red-300/80 text-xs font-semibold"><span dangerouslySetInnerHTML={{ __html: line }} /></div>;
      if (line.trim() === '') return <div key={i} className="h-1.5" />;
      return <p key={i} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div className="page-enter flex flex-col" style={{ minHeight: 'calc(100dvh - 170px)' }}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center glow-purple">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">AI Triage Assistant</h2>
          <p className="text-[11px] text-white/25">{demoMode ? 'Demo — offline guidance' : 'Powered by Gemini AI'}</p>
        </div>
        {demoMode && <span className="demo-badge">Demo</span>}
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/8 border border-amber-500/15 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400/60 flex-shrink-0" />
          <p className="text-[11px] text-amber-300/60">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3.5 pb-4 pr-0.5">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${
              msg.role === 'ai' ? 'bg-purple-500/10 border-purple-500/15' : 'bg-accent-500/10 border-accent-500/15'
            }`}>
              {msg.role === 'ai' ? <Bot className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5 text-accent-400" />}
            </div>
            <div className="max-w-[82%] space-y-1.5">
              {msg.intent && msg.intent.tag !== 'UNKNOWN' && msg.role === 'ai' && (
                <span className="intent-tag" style={{ background: `${msg.intent.color}15`, color: msg.intent.color, border: `1px solid ${msg.intent.color}25` }}>
                  {msg.intent.emoji} {msg.intent.tag}
                </span>
              )}
              <div className={`px-3.5 py-3 text-[13px] leading-relaxed ${msg.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
                {msg.role === 'ai' ? renderContent(msg.content) : msg.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/15 flex items-center justify-center flex-shrink-0"><Bot className="w-3.5 h-3.5 text-purple-400" /></div>
            <div className="chat-ai px-4 py-3.5 flex gap-1.5"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 pt-3 bg-gradient-to-t from-surface-500 via-surface-500/95 to-transparent">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Describe the injury..." className="input-field flex-1 !py-2.5" disabled={isTyping} id="triage-input" />
          <button onClick={sendMessage} disabled={!input.trim() || isTyping} id="btn-send-triage"
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !isTyping
                ? 'bg-gradient-to-br from-accent-500 to-accent-700 text-white glow-red active:scale-95'
                : 'bg-white/[0.04] text-white/15 cursor-not-allowed'
            }`}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
