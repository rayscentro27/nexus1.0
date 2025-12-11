
import React, { useState, useRef, useEffect } from 'react';
import { VoiceAgentConfig, CallLog } from '../types';
import { PhoneCall, Mic, StopCircle, Settings, Save, PlayCircle, BarChart3, User, BookOpen, Volume2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Audio Utils (Reused from SalesTrainer)
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const VoiceReceptionist: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'simulator' | 'logs'>('config');
  const [config, setConfig] = useState<VoiceAgentConfig>({
    id: 'va_1',
    name: 'Sarah',
    voiceName: 'Puck',
    openingLine: "Thanks for calling Nexus Funding, this is Sarah. How can I help you today?",
    systemInstruction: `You are Sarah, a professional and warm receptionist for Nexus Funding. 
Your goal is to screen calls, answer basic questions about business funding, and book appointments for the sales team.
Do NOT give specific interest rate quotes (say "rates start at 1% per month depending on qualifications").
If they want to apply, ask for their monthly revenue and time in business.
If qualified (>10k/mo revenue), offer to book a meeting with a senior advisor.
Be concise and helpful.`,
    knowledgeBase: `Nexus Funding offers: Business Lines of Credit, SBA Loans, and Equipment Financing.
Minimum requirements: 6 months in business, $10k monthly revenue, 600+ FICO.
Office hours: 9am - 5pm EST.
Address: 123 Finance Way, NY.`,
    isActive: true
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>([
    {
      id: 'cl_1',
      caller: '(555) 123-4567',
      duration: '1m 42s',
      date: 'Today, 10:15 AM',
      status: 'Completed',
      outcome: 'Booked Meeting',
      transcriptSummary: 'Caller asked about SBA loans. Confirmed $50k monthly revenue. Booked for tomorrow at 2pm.'
    },
    {
      id: 'cl_2',
      caller: 'Unknown',
      duration: '0m 23s',
      date: 'Today, 09:30 AM',
      status: 'Missed',
      outcome: 'Spam',
      transcriptSummary: 'Robocall about car warranty. Hung up.'
    }
  ]);

  // Simulator State
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);

  // Refs for Audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const startSession = async () => {
    setStatus('connecting');
    setTranscript([]);
    currentInputTranscription.current = '';
    currentOutputTranscription.current = '';

    try {
      // Initialize AI with Vite safe env access
      const meta = import.meta as any;
      const apiKey = meta.env?.VITE_API_KEY;
      
      if (!apiKey) {
        alert("API Key is missing. AI Voice features are disabled in this demo.");
        setStatus('idle');
        return;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = ctx;
      nextStartTimeRef.current = ctx.currentTime;

      const ai = new GoogleGenAI({ apiKey });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000 } });
      streamRef.current = stream;

      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Combine instructions
      const fullSystemPrompt = `${config.systemInstruction}\n\nKnowledge Base:\n${config.knowledgeBase}`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName } } },
          systemInstruction: fullSystemPrompt,
          inputAudioTranscription: { model: "google-1" },
          outputAudioTranscription: { model: "google-1" }
        },
        callbacks: {
          onopen: () => {
            console.log("Connected");
            setStatus('active');
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolumeLevel(Math.sqrt(sum / inputData.length) * 50);

              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              
              const now = audioContextRef.current.currentTime;
              const start = Math.max(nextStartTimeRef.current, now);
              source.start(start);
              nextStartTimeRef.current = start + buffer.duration;
              
              source.onended = () => sourcesRef.current.delete(source);
              sourcesRef.current.add(source);
            }

            if (msg.serverContent?.outputTranscription?.text) {
               currentOutputTranscription.current += msg.serverContent.outputTranscription.text;
            }
            if (msg.serverContent?.inputTranscription?.text) {
               currentInputTranscription.current += msg.serverContent.inputTranscription.text;
            }

            if (msg.serverContent?.turnComplete) {
               if (currentInputTranscription.current) {
                 setTranscript(prev => [...prev, { role: 'user', text: currentInputTranscription.current }]);
                 currentInputTranscription.current = '';
               }
               if (currentOutputTranscription.current) {
                 setTranscript(prev => [...prev, { role: 'ai', text: currentOutputTranscription.current }]);
                 currentOutputTranscription.current = '';
               }
            }
          },
          onclose: () => setStatus('idle'),
          onerror: (e) => { console.error(e); stopSession(); }
        }
      });
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      alert("Connection failed");
      setStatus('idle');
    }
  };

  const stopSession = async () => {
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (sessionRef.current) {
        try { (await sessionRef.current).close(); } catch(e){}
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setStatus('idle');
  };

  const handleSaveConfig = () => {
    alert("Agent configuration saved and live!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <PhoneCall className="text-blue-600" size={32} /> AI Voice Receptionist
          </h1>
          <p className="text-slate-500 mt-2">Configure your 24/7 inbound AI agent.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
           <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Configuration</button>
           <button onClick={() => setActiveTab('simulator')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'simulator' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Live Simulator</button>
           <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'logs' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Call Logs</button>
        </div>
      </div>

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-4 mb-4"><User size={20} className="text-blue-500"/> Agent Persona</h3>
              
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Agent Name</label>
                 <input type="text" value={config.name} onChange={(e) => setConfig({...config, name: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Voice Model</label>
                 <div className="grid grid-cols-5 gap-2">
                    {['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'].map(v => (
                       <button 
                         key={v}
                         onClick={() => setConfig({...config, voiceName: v as any})}
                         className={`py-2 rounded-lg text-xs font-bold border ${config.voiceName === v ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                       >
                         {v}
                       </button>
                    ))}
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Opening Line</label>
                 <textarea value={config.openingLine} onChange={(e) => setConfig({...config, openingLine: e.target.value})} className="w-full border rounded-lg p-2 h-20 resize-none text-sm" />
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">System Instructions (The "Brain")</label>
                 <textarea value={config.systemInstruction} onChange={(e) => setConfig({...config, systemInstruction: e.target.value})} className="w-full border rounded-lg p-2 h-40 resize-none text-sm font-mono text-slate-600" />
                 <p className="text-xs text-slate-400 mt-1">Define tone, goals, and guardrails here.</p>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-4 mb-4"><BookOpen size={20} className="text-emerald-500"/> Knowledge Base</h3>
                 <p className="text-sm text-slate-500 mb-4">Paste FAQs, company policies, or product details here. The AI will use this to answer questions.</p>
                 <textarea value={config.knowledgeBase} onChange={(e) => setConfig({...config, knowledgeBase: e.target.value})} className="w-full border rounded-lg p-4 h-64 resize-none text-sm" placeholder="Paste text here..." />
              </div>

              <div className="flex justify-end gap-4">
                 <button className="px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Discard</button>
                 <button onClick={handleSaveConfig} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2">
                    <Save size={18} /> Save & Activate
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'simulator' && (
        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
           
           <div className="absolute top-6 right-6">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                 <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                 {status === 'active' ? 'Live Connection' : 'Offline'}
              </div>
           </div>

           {status === 'idle' ? (
              <div className="text-center">
                 <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700">
                    <PhoneCall size={40} className="text-slate-400" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Test Your Agent</h2>
                 <p className="text-slate-400 mb-8 max-w-md mx-auto">Call your AI receptionist directly from the browser to verify instructions and tone.</p>
                 <button onClick={startSession} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg flex items-center gap-3 mx-auto transition-transform hover:scale-105">
                    <Mic size={24} /> Start Test Call
                 </button>
              </div>
           ) : (
              <div className="w-full max-w-2xl flex flex-col h-full">
                 <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative mb-8">
                       <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-transform" style={{ transform: `scale(${1 + volumeLevel/100})` }}>
                          <Volume2 size={48} className="text-white" />
                       </div>
                       <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white font-bold">{config.name}</div>
                    </div>
                    <div className="h-48 w-full overflow-y-auto px-4 text-center">
                       {transcript.map((t, i) => (
                          <p key={i} className={`text-sm mb-2 ${t.role === 'ai' ? 'text-indigo-300' : 'text-slate-400'}`}>
                             <span className="font-bold opacity-50 text-xs uppercase mr-2">{t.role === 'ai' ? config.name : 'You'}</span>
                             {t.text}
                          </p>
                       ))}
                       {transcript.length === 0 && <p className="text-slate-500 italic text-sm">" {config.openingLine} "</p>}
                    </div>
                 </div>
                 <div className="flex justify-center mt-8">
                    <button onClick={stopSession} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2">
                       <StopCircle size={20} /> Hang Up
                    </button>
                 </div>
              </div>
           )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><BarChart3 size={20} className="text-slate-500"/> Call History</h3>
              <button className="text-xs text-blue-600 font-bold hover:underline">Export CSV</button>
           </div>
           <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                 <tr>
                    <th className="px-6 py-4">Caller</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Outcome</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Summary</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {callLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 font-medium text-slate-900">{log.caller}<div className="text-xs text-slate-400 font-normal">{log.date}</div></td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                       </td>
                       <td className="px-6 py-4 text-sm font-bold text-slate-700">{log.outcome}</td>
                       <td className="px-6 py-4 text-sm text-slate-600 font-mono">{log.duration}</td>
                       <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{log.transcriptSummary}</td>
                       <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-blue-600 p-2"><PlayCircle size={18} /></button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

    </div>
  );
};

export default VoiceReceptionist;
