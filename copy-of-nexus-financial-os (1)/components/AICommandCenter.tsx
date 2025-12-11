
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, ChevronDown, CheckCircle, Activity as ActivityIcon } from 'lucide-react';
import { Contact, ChatMessage, Activity } from '../types';
import * as geminiService from '../services/geminiService';

interface AICommandCenterProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
}

const AICommandCenter: React.FC<AICommandCenterProps> = ({ contacts, onUpdateContact }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Hello! I am your Nexus Co-Pilot. I can analyze your pipeline, identify risks, or even update records for you. How can I help?' 
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Security: Simple sanitizer to prevent XSS from AI responses
  const sanitizeHtml = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = html; 
    // Basic formatting allowed, stripping scripts/on* events
    // In a real prod env, use a library like DOMPurify
    let safeHtml = tempDiv.innerHTML
        .replace(/&lt;strong&gt;/g, '<strong>')
        .replace(/&lt;\/strong&gt;/g, '</strong>')
        .replace(/&lt;br&gt;/g, '<br/>')
        .replace(/&lt;ul&gt;/g, '<ul>')
        .replace(/&lt;\/ul&gt;/g, '</ul>')
        .replace(/&lt;li&gt;/g, '<li>')
        .replace(/&lt;\/li&gt;/g, '</li>');
        
    return safeHtml;
  };

  const executeToolCalls = (actions: any[]) => {
    if (!actions || actions.length === 0) return;

    actions.forEach(action => {
      if (action.name === 'updateStatus') {
        const { contactName, newStatus } = action.args;
        const contact = contacts.find(c => c.name.toLowerCase().includes(contactName.toLowerCase()) || c.company.toLowerCase().includes(contactName.toLowerCase()));
        
        if (contact) {
          const updatedContact = { ...contact, status: newStatus };
          onUpdateContact(updatedContact);
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `✅ Updated status for **${contact.name}** to **${newStatus}**.`
          }]);
        }
      } 
      else if (action.name === 'logNote') {
        const { contactName, content } = action.args;
        const contact = contacts.find(c => c.name.toLowerCase().includes(contactName.toLowerCase()) || c.company.toLowerCase().includes(contactName.toLowerCase()));
        
        if (contact) {
          const newActivity: Activity = {
            id: `act_ai_${Date.now()}`,
            type: 'note',
            description: `[AI Co-Pilot] ${content}`,
            date: new Date().toLocaleString(),
            user: 'AI'
          };
          
          const updatedContact = { 
            ...contact, 
            activities: [...(contact.activities || []), newActivity],
            lastContact: 'Just now'
          };
          
          onUpdateContact(updatedContact);
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `📝 Logged note for **${contact.name}**: "${content}"`
          }]);
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.chatWithCRM(input, contacts);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text
      };
      setMessages(prev => [...prev, aiMsg]);

      // Execute any actions returned by the AI
      if (response.actions && response.actions.length > 0) {
        executeToolCalls(response.actions);
      }

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the neural core. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      
      {/* Trigger Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg shadow-blue-900/30 transition-all hover:scale-105 flex items-center gap-2 group"
        >
          <Sparkles size={24} className="group-hover:animate-spin-slow" />
          <span className="font-bold pr-1">Ask AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[380px] h-[550px] flex flex-col border border-slate-200 animate-slide-in-right overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Nexus Co-Pilot</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-slate-300 font-medium">Online & Actionable</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                  }`}
                >
                   {msg.role === 'assistant' && (
                     <Sparkles size={12} className="text-blue-500 mb-1" />
                   )}
                   {/* Secure Rendering */}
                   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-3 rounded-bl-none border border-slate-200 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask to update status, log notes, or analyze..." 
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AICommandCenter;
