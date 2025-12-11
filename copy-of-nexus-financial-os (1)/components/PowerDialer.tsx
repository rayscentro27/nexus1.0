
import React, { useState, useEffect, useRef } from 'react';
import { Contact, Activity } from '../types';
import { Phone, PhoneOff, Mic, StopCircle, User, FileText, ChevronRight, X, Clock, Play, SkipForward, CheckCircle, AlertTriangle, Calendar, MessageSquare, BarChart2 } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface PowerDialerProps {
  queue: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onClose: () => void;
}

const PowerDialer: React.FC<PowerDialerProps> = ({ queue, onUpdateContact, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'wrapping'>('idle');
  const [duration, setDuration] = useState(0);
  const [script, setScript] = useState('Loading intelligent script...');
  const [note, setNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sentiment, setSentiment] = useState<'Neutral' | 'Positive' | 'Negative'>('Neutral');
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);

  const currentContact = queue && queue.length > 0 ? queue[currentIndex] : null;
  
  // Safe timer ref type
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate Script on Contact Load
  useEffect(() => {
    if (currentContact) {
      setScript('Generating context-aware script...');
      setNote('');
      setCallStatus('idle');
      setDuration(0);
      setSentiment('Neutral');
      
      const loadScript = async () => {
        try {
          const generated = await geminiService.generateSalesScript(currentContact, 'Power Dialer Outreach');
          setScript(generated);
        } catch (e) {
          setScript("Error generating script. Use standard greeting.");
        }
      };
      loadScript();
    }
  }, [currentIndex, currentContact]);

  // Call Timer & Sentiment Pulse
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          // Mock Sentiment Pulse updates every 5 seconds
          if (newDuration % 5 === 0) {
             const sentiments: any[] = ['Neutral', 'Positive', 'Negative', 'Positive'];
             setSentiment(sentiments[Math.floor(Math.random() * sentiments.length)]);
          }
          return newDuration;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDial = () => {
    setCallStatus('calling');
    setTimeout(() => setCallStatus('connected'), 1500); // Simulate connection
  };

  const handleHangUp = () => {
    setCallStatus('wrapping');
  };

  const handleDisposition = (outcome: string) => {
    if (!currentContact) return;

    // Log Activity
    const newActivity: Activity = {
      id: `call_${Date.now()}`,
      type: 'call',
      description: `Power Dialer: ${outcome}.\nNotes: ${note}\nDuration: ${formatTime(duration)}`,
      date: new Date().toLocaleString(),
      user: 'Admin'
    };

    // Update Status Logic
    let newStatus = currentContact.status;
    if (outcome === 'Meeting Booked' || outcome === 'Interested') newStatus = 'Active';
    if (outcome === 'Bad Number' || outcome === 'Not Interested') newStatus = 'Closed';

    const updatedContact = {
      ...currentContact,
      status: newStatus,
      lastContact: 'Just now',
      activities: [...(currentContact.activities || []), newActivity]
    };

    onUpdateContact(updatedContact);

    // Auto Advance
    handleNext();
  };

  const handleNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Start countdown for next lead
    let countdown = 3;
    setAutoAdvanceTimer(countdown);
    const countdownInterval = setInterval(() => {
      countdown -= 1;
      setAutoAdvanceTimer(countdown);
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        setAutoAdvanceTimer(null);
        if (currentIndex < queue.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          alert("Session Complete!");
          onClose();
        }
      }
    }, 1000);
  };

  const handleVoiceNote = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate dictation start
      setNote(prev => prev + " [Listening...]");
    } else {
      // Simulate stop and refinement
      setTimeout(async () => {
         const refined = await geminiService.refineNoteContent("Customer is interested in equipment financing for a new truck next month.");
         setNote(refined);
      }, 1000);
    }
  };

  // --- EMPTY STATE HANDLING ---
  if (!queue || queue.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center text-white p-8">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="text-amber-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Dialer Queue is Empty</h2>
        <p className="text-slate-400 mb-8 text-center max-w-md">No contacts were selected or the filter returned no results.</p>
        <button 
          onClick={onClose}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <X size={18} /> Return to CRM
        </button>
      </div>
    );
  }

  // --- LOADING STATE HANDLING ---
  if (!currentContact) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin mb-4 text-blue-500"><Phone size={48} /></div>
        <h2 className="text-xl font-bold mb-6">Loading Contact...</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white underline text-sm">Cancel</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col animate-fade-in text-slate-100">
      
      {/* Header */}
      <div className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg"><Phone size={20} className="text-white"/></div>
          <div>
            <h2 className="font-bold text-lg">Power Dialer Session</h2>
            <p className="text-xs text-slate-400">Lead {currentIndex + 1} of {queue.length} • {queue.length - currentIndex - 1} remaining</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            {autoAdvanceTimer !== null && (
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 animate-pulse">
                Next Lead in {autoAdvanceTimer}s... 
                <button onClick={() => { setAutoAdvanceTimer(null); setCurrentIndex(prev => prev + 1); }} className="bg-blue-800 p-1 rounded hover:bg-blue-700"><SkipForward size={14} /></button>
            </div>
            )}

            <button 
                onClick={onClose} 
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-slate-600"
            >
                <X size={16} /> Exit Session
            </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* Left: Dossier */}
        <div className="col-span-3 border-r border-slate-700 bg-slate-900 p-6 overflow-y-auto">
           <div className="text-center mb-8">
              <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-4 border-4 border-slate-600">
                {currentContact.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold text-white">{currentContact.name}</h3>
              <p className="text-lg text-slate-400">{currentContact.company}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-sm">
                 <span className={`w-2 h-2 rounded-full ${currentContact.status === 'Lead' ? 'bg-blue-50' : 'bg-emerald-500'}`}></span>
                 {currentContact.status}
              </div>
           </div>

           <div className="space-y-6">
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                 <p className="text-xs font-bold text-slate-500 uppercase mb-2">Contact Info</p>
                 <div className="flex items-center gap-2 mb-2">
                    <Phone size={14} className="text-slate-400" /> <span className="font-mono text-lg">{currentContact.phone}</span>
                 </div>
                 <p className="text-xs text-slate-500">{currentContact.email}</p>
                 <p className="text-xs text-slate-500 mt-2">{currentContact.businessProfile?.address}, {currentContact.businessProfile?.city}</p>
              </div>

              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                 <p className="text-xs font-bold text-slate-500 uppercase mb-2">Funding Goal</p>
                 {currentContact.fundingGoal ? (
                    <>
                      <p className="text-xl font-bold text-emerald-400">${currentContact.fundingGoal.targetAmount.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">{currentContact.fundingGoal.fundingType}</p>
                    </>
                 ) : (
                    <p className="text-sm text-slate-500 italic">No goal set.</p>
                 )}
              </div>

              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                 <p className="text-xs font-bold text-slate-500 uppercase mb-2">Last Note</p>
                 <p className="text-sm text-slate-300 italic">"{currentContact.notes || 'No notes available.'}"</p>
                 <p className="text-xs text-slate-500 mt-2 text-right">{currentContact.lastContact}</p>
              </div>
           </div>
        </div>

        {/* Center: Command Center */}
        <div className="col-span-6 bg-slate-800 p-8 flex flex-col relative overflow-hidden">
           {/* Background Grid */}
           <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

           {/* Call Status & Timer */}
           <div className="flex justify-center mb-8 relative z-10">
              <div className={`flex flex-col items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-500 ${
                 callStatus === 'connected' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.3)]' :
                 callStatus === 'calling' ? 'border-yellow-500 bg-yellow-500/10 animate-pulse' :
                 'border-slate-600 bg-slate-700'
              }`}>
                 {callStatus === 'connected' && <div className="text-4xl font-mono font-bold text-white mb-1">{formatTime(duration)}</div>}
                 {callStatus === 'calling' && <div className="text-xl font-bold text-yellow-400 animate-bounce">Dialing...</div>}
                 {callStatus === 'idle' && <Phone size={48} className="text-slate-500" />}
                 {callStatus === 'wrapping' && <div className="text-xl font-bold text-slate-300">Wrapping Up</div>}
                 
                 {callStatus === 'connected' && (
                    <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                       sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' :
                       sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' :
                       'bg-slate-500/20 text-slate-400'
                    }`}>
                       {sentiment} Pulse
                    </div>
                 )}
              </div>
           </div>

           {/* Call Controls */}
           <div className="flex justify-center gap-6 mb-8 relative z-10">
              {callStatus === 'idle' || callStatus === 'wrapping' ? (
                 <button onClick={handleDial} className="bg-emerald-600 hover:bg-emerald-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                    <Phone size={28} />
                 </button>
              ) : (
                 <button onClick={handleHangUp} className="bg-red-600 hover:bg-red-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                    <PhoneOff size={28} />
                 </button>
              )}
           </div>

           {/* Script Display */}
           <div className="flex-1 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700 p-6 overflow-hidden flex flex-col relative z-10">
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                 <h4 className="font-bold text-slate-300 flex items-center gap-2"><FileText size={16} /> Dynamic Script</h4>
                 <span className="text-xs text-blue-400">AI Generated</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-lg leading-relaxed text-slate-200 whitespace-pre-wrap">
                 {script}
              </div>
           </div>
        </div>

        {/* Right: Disposition & Notes */}
        <div className="col-span-3 border-l border-slate-700 bg-slate-900 p-6 flex flex-col">
           <h3 className="font-bold text-slate-400 uppercase text-xs mb-4">Call Outcome</h3>
           
           <div className="grid grid-cols-2 gap-3 mb-8">
              <button onClick={() => handleDisposition('No Answer')} className="p-3 bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-700 transition-all text-left">
                 🚫 No Answer
              </button>
              <button onClick={() => handleDisposition('Left Voicemail')} className="p-3 bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-700 transition-all text-left">
                 📞 Left VM
              </button>
              <button onClick={() => handleDisposition('Not Interested')} className="p-3 bg-slate-800 border border-slate-700 hover:border-red-500 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-900/20 transition-all text-left group">
                 <span className="group-hover:text-red-400">👎 Not Interested</span>
              </button>
              <button onClick={() => handleDisposition('Bad Number')} className="p-3 bg-slate-800 border border-slate-700 hover:border-red-500 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-900/20 transition-all text-left group">
                 <span className="group-hover:text-red-400">❌ Bad Number</span>
              </button>
              <button onClick={() => handleDisposition('Follow Up')} className="p-3 bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xl text-sm font-medium text-slate-300 hover:bg-blue-900/20 transition-all text-left col-span-2 group">
                 <span className="group-hover:text-blue-400">📅 Follow Up Later</span>
              </button>
              <button onClick={() => handleDisposition('Meeting Booked')} className="p-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold shadow-lg shadow-emerald-900/20 transition-all text-center col-span-2 flex items-center justify-center gap-2">
                 <CheckCircle size={18} /> Meeting Booked!
              </button>
           </div>

           <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-slate-400 uppercase text-xs">Notes</h3>
                 <button onClick={handleVoiceNote} className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                    {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
                 </button>
              </div>
              <textarea 
                 value={note}
                 onChange={(e) => setNote(e.target.value)}
                 className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                 placeholder="Type notes or use dictation..."
              />
           </div>

           <div className="mt-6 pt-6 border-t border-slate-700">
              <button onClick={handleNext} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                 Skip Lead <ChevronRight size={16} />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PowerDialer;
