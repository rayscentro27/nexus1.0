
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, StopCircle, Play, Sparkles, Volume2, Award, AlertCircle, BarChart3 } from 'lucide-react';
import { SalesSession } from '../types';

const SCENARIOS = [
  {
    id: 'cold_call',
    title: 'Cold Call: The Gatekeeper',
    description: 'You are calling a construction company. The receptionist is trying to block you from speaking to the owner.',
    systemInstruction: 'You are "Sarah", a busy and slightly annoyed receptionist at a construction firm. Your goal is to screen calls. Do not let the user speak to the owner unless they give a very compelling reason or sound like a partner. Be curt but professional.'
  },
  {
    id: 'objection_price',
    title: 'Objection: "Rates are too high"',
    description: 'The client has received an offer but thinks the 1.35 factor rate is a rip-off. Explain the value.',
    systemInstruction: 'You are "Mike", a business owner. You just saw the funding offer and you are angry about the cost. You think 35% interest is crazy. You are skeptical and thinking about walking away. Demand a lower rate.'
  },
  {
    id: 'closing',
    title: 'Closing: Urgency',
    description: 'The client is stalling on signing the contract. Create urgency without being pushy.',
    systemInstruction: 'You are "David", a hesitant client. You like the deal but you want to "think about it" for a week. You are afraid of the daily payments. You need reassurance and a reason to act now.'
  }
];

// Audio Utils (from Google GenAI examples)
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

const SalesTrainer: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'analyzing' | 'feedback'>('idle');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const [feedback, setFeedback] = useState<SalesSession | null>(null);
  
  // Refs for audio handling
  const aiRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<any>(null); // LiveSession type is complex, using any for brevity
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopSession();
    };
  }, []);

  const startSession = async () => {
    setStatus('connecting');
    setTranscript([]);
    setFeedback(null);
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
      const ctx = new AudioContextClass({ sampleRate: 24000 }); // 24kHz for output
      audioContextRef.current = ctx;
      nextStartTimeRef.current = ctx.currentTime;

      const ai = new GoogleGenAI({ apiKey });
      aiRef.current = ai;

      // Get Mic Stream (16kHz required for input)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000 } });
      streamRef.current = stream;

      // Separate context for input if needed (usually can use same, but sample rate differs)
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }, // Deep, authoritative voice
          systemInstruction: activeScenario.systemInstruction,
          inputAudioTranscription: { model: "google-1" }, // Enable transcription
          outputAudioTranscription: { model: "google-1" }
        },
        callbacks: {
          onopen: () => {
            console.log("Connection established");
            setStatus('active');
            
            // Start audio processing
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Simple volume meter
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
            // Handle Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              
              // Schedule playback
              const now = audioContextRef.current.currentTime;
              const start = Math.max(nextStartTimeRef.current, now);
              source.start(start);
              nextStartTimeRef.current = start + buffer.duration;
              
              source.onended = () => sourcesRef.current.delete(source);
              sourcesRef.current.add(source);
            }

            // Handle Transcription (Accumulate chunks)
            if (msg.serverContent?.outputTranscription?.text) {
               currentOutputTranscription.current += msg.serverContent.outputTranscription.text;
            }
            if (msg.serverContent?.inputTranscription?.text) {
               currentInputTranscription.current += msg.serverContent.inputTranscription.text;
            }

            // Handle Turn Complete (Commit transcript)
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
          onclose: () => {
            console.log("Connection closed");
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            alert("Connection error. Please try again.");
            stopSession();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error("Setup Failed:", e);
      setStatus('idle');
      alert("Microphone access denied or API error.");
    }
  };

  const stopSession = async () => {
    // 1. Stop Recording
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    
    // 2. Close Session
    if (sessionRef.current) {
        // Wait for promise if needed, or just assume it's there
        try {
            const session = await sessionRef.current;
            session.close();
        } catch(e) { console.log("Session already closed"); }
    }

    // 3. Stop Playback
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    if (audioContextRef.current) audioContextRef.current.close();

    // 4. Generate Feedback if we had a conversation
    if (transcript.length > 0) {
      generateFeedback();
    } else {
      setStatus('idle');
    }
  };

  const generateFeedback = async () => {
    setStatus('analyzing');
    const fullText = transcript.map(t => `${t.role}: ${t.text}`).join('\n');
    
    const prompt = `
      Act as a Sales Coaching AI. Analyze this roleplay transcript between a Sales Rep (user) and a Prospect (AI).
      
      Scenario: ${activeScenario.title}
      Transcript:
      ${fullText}
      
      Provide a JSON response:
      {
        "score": number (0-100),
        "feedback": "Short summary of performance. 2 Strengths, 2 Weaknesses.",
        "duration": "Duration string"
      }
    `;

    try {
      const meta = import.meta as any;
      const apiKey = meta.env?.VITE_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const json = JSON.parse(res.text || "{}");
      setFeedback({
        id: `sess_${Date.now()}`,
        date: new Date().toLocaleDateString(),
        scenario: activeScenario.title,
        duration: json.duration || '2 mins',
        score: json.score || 75,
        feedback: json.feedback || 'Good effort.'
      });
      setStatus('feedback');
    } catch (e) {
      console.error("Feedback Gen Error", e);
      setStatus('idle');
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Mic className="text-blue-600" /> Sales Roleplay Trainer
        </h1>
        <p className="text-slate-500 mt-2">Practice difficult conversations with a realistic AI persona.</p>
      </div>

      {status === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCENARIOS.map(scen => (
            <div 
              key={scen.id} 
              onClick={() => setActiveScenario(scen)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${activeScenario.id === scen.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
            >
              <h3 className="font-bold text-slate-800 mb-2">{scen.title}</h3>
              <p className="text-sm text-slate-500">{scen.description}</p>
              {activeScenario.id === scen.id && (
                <div className="mt-4 flex justify-end">
                  <div className="bg-blue-600 text-white rounded-full p-2"><Play size={16} /></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {status === 'idle' && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={startSession}
            className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 shadow-xl flex items-center gap-3 transition-transform hover:scale-105"
          >
            <Mic size={24} /> Start Training Session
          </button>
        </div>
      )}

      {(status === 'connecting' || status === 'active') && (
        <div className="flex-1 bg-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          {/* Status Indicator */}
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
            <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <span className="text-white text-sm font-bold uppercase tracking-wider">{status === 'active' ? 'Live Call' : 'Connecting...'}</span>
          </div>

          {/* Visualizer */}
          <div className="relative mb-12">
             <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.5)] transition-transform duration-100`} style={{ transform: `scale(${1 + volumeLevel/100})` }}>
                <Volume2 size={64} className="text-white opacity-80" />
             </div>
             {/* Ripples */}
             <div className="absolute inset-0 rounded-full border border-white/20 animate-ping"></div>
             <div className="absolute inset-0 rounded-full border border-white/10 animate-ping delay-300"></div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{activeScenario.title}</h2>
          <p className="text-slate-400 mb-12">AI Persona is listening...</p>

          <button 
            onClick={stopSession}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
          >
            <StopCircle size={20} /> End Call
          </button>
          
          {/* Transcript Preview */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
             <div className="text-center text-slate-300 text-sm italic opacity-80">
               {transcript.length > 0 ? `"${transcript[transcript.length-1].text}"` : "..."}
             </div>
          </div>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
           <Sparkles size={64} className="text-blue-500 animate-spin mb-6" />
           <h3 className="text-xl font-bold text-slate-800">Generating Performance Report...</h3>
           <p className="text-slate-500 mt-2">Our AI coach is reviewing your objection handling.</p>
        </div>
      )}

      {status === 'feedback' && feedback && (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-lg p-8 overflow-y-auto">
           <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Session Analysis</h2>
                <p className="text-slate-500">{feedback.scenario} • {feedback.duration}</p>
              </div>
              <div className="text-center">
                 <div className={`text-4xl font-black ${feedback.score > 80 ? 'text-emerald-500' : feedback.score > 60 ? 'text-amber-500' : 'text-red-500'}`}>
                   {feedback.score}
                 </div>
                 <div className="text-xs font-bold text-slate-400 uppercase">Score</div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                 <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><Award size={18} /> Coach's Feedback</h4>
                 <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{feedback.feedback}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-64 overflow-y-auto">
                 <h4 className="font-bold text-slate-700 mb-3 sticky top-0 bg-slate-50 pb-2 border-b border-slate-200">Transcript</h4>
                 <div className="space-y-3">
                    {transcript.map((t, i) => (
                      <div key={i} className={`text-xs p-2 rounded-lg ${t.role === 'ai' ? 'bg-blue-100 text-blue-900 ml-4' : 'bg-white border border-slate-200 mr-4'}`}>
                        <strong>{t.role === 'ai' ? 'Prospect' : 'You'}:</strong> {t.text}
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex justify-center gap-4">
              <button onClick={() => setStatus('idle')} className="px-6 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50">Back to Menu</button>
              <button onClick={startSession} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Retry Scenario</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesTrainer;
