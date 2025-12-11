
import React, { useState } from 'react';
import { Contact, ClientTask } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User, Mic, FileText, Send, Sparkles, X, CheckCircle, StopCircle, RefreshCw } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface SmartCalendarProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  contactId: string;
  type: 'meeting' | 'call' | 'follow_up';
  description?: string;
  contact: Contact;
}

const SmartCalendar: React.FC<SmartCalendarProps> = ({ contacts, onUpdateContact }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'prep' | 'debrief'>('prep');
  
  // AI State
  const [dossier, setDossier] = useState<any>(null);
  const [isPrepLoading, setIsPrepLoading] = useState(false);
  
  // Voice Debrief State
  const [isRecording, setIsRecording] = useState(false);
  const [debriefTranscript, setDebriefTranscript] = useState('');
  const [isProcessingDebrief, setIsProcessingDebrief] = useState(false);
  const [debriefResult, setDebriefResult] = useState<any>(null);

  // Generate Calendar Days (Simple Weekly View)
  const getDaysInWeek = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Start Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getDaysInWeek(currentDate);

  // Map Tasks to Events
  const events: CalendarEvent[] = contacts.flatMap(c => 
    c.clientTasks
      .filter(t => t.type === 'meeting' || t.type === 'action') // Assuming actions can be follow-ups
      .map(t => ({
        id: t.id,
        title: t.title,
        time: t.meetingTime || '09:00 AM', // Fallback
        contactId: c.id,
        type: t.type === 'meeting' ? 'meeting' : 'follow_up',
        description: t.description,
        contact: c
      }))
  );

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    // In a real app, match task.date === dateStr
    // For demo, we might randomize or assume tasks have 'date' field matching YYYY-MM-DD
    return events.filter(e => {
        // Find task in contact
        const task = e.contact.clientTasks.find(t => t.id === e.id);
        return task?.date === dateStr;
    });
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleGenerateDossier = async () => {
    if (!selectedEvent) return;
    setIsPrepLoading(true);
    const data = await geminiService.generateMeetingPrep(selectedEvent.contact);
    setDossier(data);
    setIsPrepLoading(false);
  };

  const handleStartRecording = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Browser not supported."); return; }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results)
            .map((result: any) => result[0].transcript)
            .join('');
        setDebriefTranscript(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.start();
    
    // Store ref to stop later (simplified for this component scope)
    (window as any).currentRecognition = recognition;
  };

  const handleStopRecording = async () => {
    if ((window as any).currentRecognition) {
        (window as any).currentRecognition.stop();
    }
    setIsRecording(false);
    
    // Auto process
    if (debriefTranscript.length > 5) {
        setIsProcessingDebrief(true);
        const result = await geminiService.processMeetingDebrief(debriefTranscript);
        setDebriefResult(result);
        setIsProcessingDebrief(false);
    }
  };

  const handleApplyDebrief = () => {
    if (!debriefResult || !selectedEvent) return;
    
    const { contact } = selectedEvent;
    
    // 1. Add Note
    const newActivity = {
        id: `act_${Date.now()}`,
        type: 'meeting' as const,
        description: `Meeting Debrief: ${debriefResult.note}`,
        date: new Date().toLocaleString(),
        user: 'Admin'
    };
    
    // 2. Update Status if suggested
    const newStatus = debriefResult.suggestedStatus || contact.status;
    
    onUpdateContact({
        ...contact,
        status: newStatus,
        activities: [...(contact.activities || []), newActivity]
    });
    
    // 3. Close & Reset
    setSelectedEvent(null);
    setDebriefResult(null);
    setDebriefTranscript('');
    setDossier(null);
    alert("Meeting logged and contact updated!");
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <CalendarIcon className="text-blue-600" /> Smart Calendar
            </h1>
            <p className="text-slate-500 text-sm mt-1">AI-powered scheduling and meeting preparation.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={handlePrevWeek} className="p-2 hover:bg-slate-100 rounded-md text-slate-500"><ChevronLeft size={20} /></button>
            <span className="font-bold text-slate-700 min-w-[150px] text-center">
                {weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <button onClick={handleNextWeek} className="p-2 hover:bg-slate-100 rounded-md text-slate-500"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Calendar Grid (Week View) */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex">
         {weekDays.map((day, index) => {
             const isToday = day.toDateString() === new Date().toDateString();
             const dayEvents = getEventsForDay(day);
             
             return (
                 <div key={index} className="flex-1 border-r border-slate-100 last:border-0 flex flex-col min-w-[140px]">
                     {/* Day Header */}
                     <div className={`p-4 text-center border-b border-slate-100 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                         <p className={`text-xs font-bold uppercase mb-1 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                             {day.toLocaleDateString(undefined, { weekday: 'short' })}
                         </p>
                         <p className={`text-xl font-bold ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                             {day.getDate()}
                         </p>
                     </div>
                     
                     {/* Events Container */}
                     <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                         {dayEvents.map(event => (
                             <div 
                                key={event.id}
                                onClick={() => { setSelectedEvent(event); setDossier(null); setDebriefResult(null); }}
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md group ${
                                    event.type === 'meeting' ? 'bg-indigo-50 border-indigo-100 hover:border-indigo-300' : 'bg-amber-50 border-amber-100 hover:border-amber-300'
                                }`}
                             >
                                 <div className="flex justify-between items-start mb-1">
                                     <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                         event.type === 'meeting' ? 'bg-indigo-200 text-indigo-800' : 'bg-amber-200 text-amber-800'
                                     }`}>
                                         {event.time}
                                     </span>
                                 </div>
                                 <h4 className="font-bold text-sm text-slate-800 leading-tight mb-1">{event.contact.name}</h4>
                                 <p className="text-xs text-slate-500 truncate">{event.title}</p>
                             </div>
                         ))}
                     </div>
                 </div>
             );
         })}
      </div>

      {/* Event Modal */}
      {selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Header */}
                  <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                      <div>
                          <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedEvent.type === 'meeting' ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                                  {selectedEvent.type}
                              </span>
                              <span className="text-slate-300 text-sm flex items-center gap-1">
                                  <Clock size={14} /> {selectedEvent.time}
                              </span>
                          </div>
                          <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                          <div className="flex items-center gap-2 mt-2 text-slate-300 text-sm">
                              <User size={16} /> {selectedEvent.contact.name} • {selectedEvent.contact.company}
                          </div>
                      </div>
                      <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-200">
                      <button 
                        onClick={() => setActiveModalTab('prep')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeModalTab === 'prep' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                      >
                          Meeting Prep
                      </button>
                      <button 
                        onClick={() => setActiveModalTab('debrief')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeModalTab === 'debrief' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                      >
                          Post-Meeting Debrief
                      </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                      
                      {activeModalTab === 'prep' && (
                          <div className="space-y-6">
                              {!dossier ? (
                                  <div className="text-center py-10">
                                      <Sparkles size={48} className="text-blue-300 mx-auto mb-4" />
                                      <h3 className="font-bold text-slate-700 text-lg mb-2">Generate AI Dossier</h3>
                                      <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Get a cheat sheet with relationship history, predicted objections, and icebreakers.</p>
                                      <button 
                                        onClick={handleGenerateDossier}
                                        disabled={isPrepLoading}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 mx-auto disabled:opacity-70"
                                      >
                                          {isPrepLoading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                          {isPrepLoading ? 'Analyzing...' : 'Generate Prep'}
                                      </button>
                                  </div>
                              ) : (
                                  <div className="animate-fade-in space-y-4">
                                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                          <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Summary</h4>
                                          <p className="text-slate-600 text-sm leading-relaxed">{dossier.summary}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                          <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                                              <h4 className="font-bold text-red-600 mb-3 text-sm uppercase tracking-wider">Predicted Objections</h4>
                                              <ul className="list-disc pl-4 space-y-1 text-sm text-slate-600">
                                                  {dossier.predictedObjections?.map((obj: string, i: number) => <li key={i}>{obj}</li>)}
                                              </ul>
                                          </div>
                                          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                                              <h4 className="font-bold text-emerald-600 mb-3 text-sm uppercase tracking-wider">Icebreakers</h4>
                                              <ul className="list-disc pl-4 space-y-1 text-sm text-slate-600">
                                                  {dossier.icebreakers?.map((ice: string, i: number) => <li key={i}>{ice}</li>)}
                                              </ul>
                                          </div>
                                      </div>
                                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900 text-sm font-medium flex items-center gap-2">
                                          <CheckCircle size={16} /> <strong>Goal:</strong> {dossier.goal}
                                      </div>
                                  </div>
                              )}
                          </div>
                      )}

                      {activeModalTab === 'debrief' && (
                          <div className="space-y-6">
                              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                                  <p className="text-sm text-slate-500 mb-4">Record your post-meeting notes. AI will extract actions and draft follow-ups.</p>
                                  
                                  {!isRecording ? (
                                      <button 
                                        onClick={handleStartRecording}
                                        className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-red-50 hover:text-red-600 border-2 border-slate-200 hover:border-red-200 transition-all mx-auto shadow-sm"
                                      >
                                          <Mic size={32} />
                                      </button>
                                  ) : (
                                      <button 
                                        onClick={handleStopRecording}
                                        className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white animate-pulse mx-auto shadow-lg shadow-red-200"
                                      >
                                          <StopCircle size={32} />
                                      </button>
                                  )}
                                  
                                  {debriefTranscript && (
                                      <div className="mt-6 p-3 bg-slate-50 rounded-lg text-left">
                                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Transcript</p>
                                          <p className="text-sm text-slate-600 italic">"{debriefTranscript}"</p>
                                      </div>
                                  )}
                              </div>

                              {isProcessingDebrief && (
                                  <div className="flex items-center justify-center gap-2 text-blue-600 py-4">
                                      <RefreshCw className="animate-spin" size={20} /> Processing Intelligence...
                                  </div>
                              )}

                              {debriefResult && (
                                  <div className="animate-fade-in space-y-4">
                                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                                          <h4 className="font-bold text-slate-800 text-sm mb-2">Suggested Note</h4>
                                          <p className="text-sm text-slate-600">{debriefResult.note}</p>
                                      </div>
                                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                                          <h4 className="font-bold text-slate-800 text-sm mb-2">Status Update</h4>
                                          <div className="flex items-center gap-2">
                                              <span className="text-sm text-slate-500">Current: {selectedEvent.contact.status}</span>
                                              <ChevronRight size={14} className="text-slate-300" />
                                              <span className="text-sm font-bold text-blue-600">{debriefResult.suggestedStatus}</span>
                                          </div>
                                      </div>
                                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                                          <h4 className="font-bold text-slate-800 text-sm mb-2">Email Draft</h4>
                                          <textarea 
                                            readOnly 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 h-32 resize-none outline-none"
                                            value={debriefResult.emailDraft}
                                          />
                                      </div>
                                      <button 
                                        onClick={handleApplyDebrief}
                                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg flex items-center justify-center gap-2"
                                      >
                                          <CheckCircle size={18} /> Apply Updates & Log
                                      </button>
                                  </div>
                              )}
                          </div>
                      )}

                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default SmartCalendar;
