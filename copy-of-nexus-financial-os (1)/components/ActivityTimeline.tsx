
import React, { useState } from 'react';
import { Contact, Activity } from '../types';
import { Phone, Mail, FileText, Calendar, Send, User, Cpu, Clock, Mic, StopCircle, Sparkles, Loader } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface ActivityTimelineProps {
  contact: Contact;
  onAddActivity: (contactId: string, activity: Activity) => void;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ contact, onAddActivity }) => {
  const [newNote, setNewNote] = useState('');
  const [activityType, setActivityType] = useState<Activity['type']>('note');
  const [isRecording, setIsRecording] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const activities = contact.activities || [];
  // Sort by date/id descending (newest first)
  const sortedActivities = [...activities].reverse();

  const handleStartRecording = () => {
    // @ts-ignore - SpeechRecognition is not standard in all TS definitions yet
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser does not support voice dictation. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      // We append to existing note if we want, or just replace.
      // For this UX, let's just show the current stream
      // But we need to handle the "existing text" problem if user pauses and starts again.
      // Simplified: We'll set the new text.
      // Ideally, we'd manage a separate 'transcript' state and merge it.
      if (finalTranscript) {
         setNewNote((prev) => prev ? prev + ' ' + finalTranscript : finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    setRecognitionInstance(recognition);
  };

  const handleStopRecording = async () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setIsRecording(false);
      
      // Auto-trigger AI refinement after a short pause
      if (newNote.length > 5) {
        setIsRefining(true);
        const polishedText = await geminiService.refineNoteContent(newNote);
        setNewNote(polishedText);
        setIsRefining(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newActivity: Activity = {
      id: `act_${Date.now()}`,
      type: activityType,
      description: newNote,
      date: new Date().toLocaleString(),
      user: 'Admin'
    };

    onAddActivity(contact.id, newActivity);
    setNewNote('');
  };

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call': return <Phone size={14} className="text-blue-500" />;
      case 'email': return <Mail size={14} className="text-purple-500" />;
      case 'meeting': return <Calendar size={14} className="text-orange-500" />;
      case 'system': return <Cpu size={14} className="text-slate-400" />;
      default: return <FileText size={14} className="text-emerald-500" />;
    }
  };

  const getBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'call': return 'bg-blue-50 border-blue-100';
      case 'email': return 'bg-purple-50 border-purple-100';
      case 'meeting': return 'bg-orange-50 border-orange-100';
      case 'system': return 'bg-slate-50 border-slate-100';
      default: return 'bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Input Area */}
      <div className={`mb-6 p-3 rounded-xl border transition-colors ${isRecording ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            {['note', 'call', 'email', 'meeting'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActivityType(type as Activity['type'])}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-colors flex items-center gap-1 ${
                  activityType === type 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type === 'call' && <Phone size={12} />}
                {type === 'email' && <Mail size={12} />}
                {type === 'meeting' && <Calendar size={12} />}
                {type === 'note' && <FileText size={12} />}
                {type}
              </button>
            ))}
          </div>
          
          {/* AI Voice Dictation Toggle */}
          <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isRecording 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isRecording ? <StopCircle size={14} /> : <Mic size={14} />}
            {isRecording ? 'Stop Recording' : 'Dictate'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={isRecording ? "Listening..." : `Log a ${activityType} or add a note...`}
            rows={2}
            className={`w-full text-sm p-3 pr-10 rounded-lg border focus:outline-none focus:ring-2 resize-none bg-white transition-colors ${
              isRecording ? 'border-red-300 placeholder-red-400' : 'border-slate-300 focus:ring-blue-500'
            }`}
          />
          
          {isRefining && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
                <Sparkles size={16} /> Refining text...
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={!newNote.trim() || isRecording}
            className="absolute bottom-3 right-3 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* Timeline Feed */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
          {sortedActivities.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-4 italic">No activity history yet.</div>
          )}
          
          {sortedActivities.map((act) => (
            <div key={act.id} className="relative">
              {/* Dot */}
              <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ring-1 ring-slate-200 ${
                act.type === 'system' ? 'bg-slate-300' : 'bg-blue-500'
              }`}></div>
              
              <div className={`p-3 rounded-lg border ${getBgColor(act.type)}`}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {getIcon(act.type)}
                    <span className="text-xs font-bold text-slate-700 capitalize">{act.type}</span>
                    {act.user && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><User size={10}/> {act.user}</span>}
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> {act.date}
                  </span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
