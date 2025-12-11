
import React, { useState, useEffect, useRef } from 'react';
import { Contact, InboxThread, UnifiedMessage } from '../types';
import { Mail, MessageSquare, MessageCircle, Globe, Search, Filter, Archive, CheckCircle, Tag, Clock, Send, Paperclip, MoreVertical, Phone, User, DollarSign, Activity, AlertCircle, Sparkles, RefreshCw, X } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface UnifiedInboxProps {
  contacts: Contact[];
}

// Mock Data Generator for threads
const generateMockThreads = (contacts: Contact[]): InboxThread[] => {
  return [
    {
      id: 'th_1',
      contactId: contacts[0]?.id,
      contactName: contacts[0]?.name || 'Alice Freeman',
      contactAvatar: contacts[0]?.name.charAt(0) || 'A',
      subject: 'Question about funding terms',
      unreadCount: 1,
      channel: 'email',
      messages: [
        {
          id: 'm1', threadId: 'th_1', sender: 'client', senderName: contacts[0]?.name || 'Alice',
          content: 'Hi, I saw the offer but I have a question about the weekly payment structure. Is it flexible?',
          timestamp: '10:30 AM', channel: 'email', direction: 'inbound', read: true
        },
        {
          id: 'm2', threadId: 'th_1', sender: 'me', senderName: 'Admin',
          content: 'Hi Alice, yes we can look at monthly options if you qualify. Let me check.',
          timestamp: '10:45 AM', channel: 'email', direction: 'outbound', read: true
        },
        {
          id: 'm3', threadId: 'th_1', sender: 'client', senderName: contacts[0]?.name || 'Alice',
          content: 'That would be great. Also, do you need updated bank statements?',
          timestamp: '11:05 AM', channel: 'email', direction: 'inbound', read: false
        }
      ],
      lastMessage: {
          id: 'm3', threadId: 'th_1', sender: 'client', senderName: contacts[0]?.name || 'Alice',
          content: 'That would be great. Also, do you need updated bank statements?',
          timestamp: '11:05 AM', channel: 'email', direction: 'inbound', read: false
      }
    },
    {
      id: 'th_2',
      contactId: contacts[1]?.id,
      contactName: contacts[1]?.name || 'Bob Builder',
      contactAvatar: contacts[1]?.name.charAt(0) || 'B',
      unreadCount: 0,
      channel: 'sms',
      messages: [
        {
          id: 'm4', threadId: 'th_2', sender: 'client', senderName: 'Bob',
          content: 'Hey, did you get my docs?',
          timestamp: 'Yesterday', channel: 'sms', direction: 'inbound', read: true
        }
      ],
      lastMessage: {
          id: 'm4', threadId: 'th_2', sender: 'client', senderName: 'Bob',
          content: 'Hey, did you get my docs?',
          timestamp: 'Yesterday', channel: 'sms', direction: 'inbound', read: true
      }
    },
    {
      id: 'th_3',
      contactName: 'Unknown Lead',
      contactAvatar: '?',
      unreadCount: 1,
      channel: 'whatsapp',
      messages: [
        {
          id: 'm5', threadId: 'th_3', sender: 'client', senderName: '+15550009999',
          content: 'I saw your ad on Facebook. How fast can I get $50k?',
          timestamp: 'Just now', channel: 'whatsapp', direction: 'inbound', read: false
        }
      ],
      lastMessage: {
          id: 'm5', threadId: 'th_3', sender: 'client', senderName: '+15550009999',
          content: 'I saw your ad on Facebook. How fast can I get $50k?',
          timestamp: 'Just now', channel: 'whatsapp', direction: 'inbound', read: false
      }
    }
  ];
};

const UnifiedInbox: React.FC<UnifiedInboxProps> = ({ contacts }) => {
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'email' | 'sms' | 'whatsapp'>('all');
  const [inputText, setInputText] = useState('');
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Data
  useEffect(() => {
    const data = generateMockThreads(contacts);
    // Simulate AI Triage on load for unread messages
    const triage = async () => {
        const updated = await Promise.all(data.map(async (th) => {
            if (!th.lastMessage.aiTags) {
                const analysis = await geminiService.analyzeInboxMessage(th.lastMessage.content);
                th.lastMessage.aiTags = analysis.tags;
                th.lastMessage.priority = analysis.priority;
                th.lastMessage.sentiment = analysis.sentiment;
            }
            return th;
        }));
        setThreads(updated);
    };
    triage();
  }, [contacts]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThreadId, threads]);

  // Generate Smart Replies when thread changes
  useEffect(() => {
    const generate = async () => {
        const thread = threads.find(t => t.id === selectedThreadId);
        if (thread) {
            setIsAiLoading(true);
            const replies = await geminiService.generateSmartReplies(thread.messages);
            setSmartReplies(replies);
            setIsAiLoading(false);
        }
    };
    if (selectedThreadId) generate();
  }, [selectedThreadId]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !selectedThreadId) return;
    
    const newMessage: UnifiedMessage = {
        id: `msg_${Date.now()}`,
        threadId: selectedThreadId,
        sender: 'me',
        senderName: 'Admin',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: threads.find(t => t.id === selectedThreadId)?.channel || 'email',
        direction: 'outbound',
        read: true
    };

    setThreads(prev => prev.map(t => {
        if (t.id === selectedThreadId) {
            return {
                ...t,
                messages: [...t.messages, newMessage],
                lastMessage: newMessage,
                unreadCount: 0 // Mark read on reply
            };
        }
        return t;
    }));
    setInputText('');
  };

  const selectedThread = threads.find(t => t.id === selectedThreadId);
  const matchedContact = selectedThread?.contactId ? contacts.find(c => c.id === selectedThread.contactId) : null;

  const filteredThreads = threads.filter(t => filter === 'all' || t.channel === filter);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 animate-fade-in overflow-hidden">
      
      {/* Left Pane: Filters */}
      <div className="w-16 md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
         <div className="p-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 hidden md:block">Inbox</h2>
            <button className="md:hidden"><Filter /></button>
         </div>
         <nav className="flex-1 p-2 space-y-1">
            {[
                { id: 'all', label: 'All Messages', icon: <Archive size={18} /> },
                { id: 'email', label: 'Email', icon: <Mail size={18} /> },
                { id: 'sms', label: 'SMS', icon: <MessageSquare size={18} /> },
                { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={18} /> },
            ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => setFilter(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    {item.icon}
                    <span className="hidden md:inline">{item.label}</span>
                    {item.id === 'all' && <span className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{threads.filter(t => t.unreadCount > 0).length}</span>}
                </button>
            ))}
         </nav>
      </div>

      {/* Middle Pane: Thread List */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
         <div className="p-4 border-b border-slate-200">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
         </div>
         <div className="flex-1 overflow-y-auto">
            {filteredThreads.map(thread => (
                <div 
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedThreadId === thread.id ? 'bg-blue-50/50' : ''} ${thread.unreadCount > 0 ? 'bg-slate-50' : ''}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            {thread.channel === 'email' && <Mail size={14} className="text-slate-400"/>}
                            {thread.channel === 'sms' && <MessageSquare size={14} className="text-purple-400"/>}
                            {thread.channel === 'whatsapp' && <MessageCircle size={14} className="text-green-500"/>}
                            <span className={`font-bold text-sm ${thread.unreadCount > 0 ? 'text-slate-900' : 'text-slate-600'}`}>{thread.contactName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{thread.lastMessage.timestamp}</span>
                    </div>
                    <p className={`text-sm mb-2 line-clamp-1 ${thread.unreadCount > 0 ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                        {thread.subject || thread.lastMessage.content}
                    </p>
                    
                    {/* AI Tags */}
                    {thread.lastMessage.aiTags && (
                        <div className="flex gap-1 flex-wrap">
                            {thread.lastMessage.aiTags.map((tag, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{tag}</span>
                            ))}
                            {thread.lastMessage.priority === 'High' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold border border-red-200">Urgent</span>
                            )}
                        </div>
                    )}
                </div>
            ))}
         </div>
      </div>

      {/* Right Pane: Conversation */}
      {selectedThread ? (
          <div className="flex-1 flex flex-col min-w-0">
              
              {/* Chat Header */}
              <div className="h-16 border-b border-slate-200 bg-white flex justify-between items-center px-6">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {selectedThread.contactAvatar}
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-900">{selectedThread.contactName}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="capitalize">{selectedThread.channel}</span> 
                              {selectedThread.contactId && <span className="bg-emerald-100 text-emerald-700 px-1.5 rounded font-bold">CRM Linked</span>}
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><Phone size={20}/></button>
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><MoreVertical size={20}/></button>
                  </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                  
                  {/* Chat Area */}
                  <div className="flex-1 flex flex-col bg-slate-50/50">
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                          {selectedThread.messages.map(msg => (
                              <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.direction === 'outbound' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                                      <p>{msg.content}</p>
                                      <div className={`text-[10px] mt-1 text-right ${msg.direction === 'outbound' ? 'text-blue-100' : 'text-slate-400'}`}>{msg.timestamp}</div>
                                  </div>
                              </div>
                          ))}
                          <div ref={messagesEndRef} />
                      </div>

                      {/* AI Smart Replies */}
                      {smartReplies.length > 0 && (
                          <div className="px-6 py-2 flex gap-2 overflow-x-auto">
                              <div className="flex items-center gap-1 text-xs font-bold text-purple-600 mr-2 flex-shrink-0">
                                  {isAiLoading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />} AI Drafts:
                              </div>
                              {smartReplies.map((reply, i) => (
                                  <button 
                                    key={i} 
                                    onClick={() => setInputText(reply)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-100 transition-colors"
                                  >
                                      {reply}
                                  </button>
                              ))}
                          </div>
                      )}

                      {/* Input */}
                      <div className="p-4 bg-white border-t border-slate-200">
                          <div className="flex gap-2">
                              <button className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl"><Paperclip size={20}/></button>
                              <div className="flex-1 relative">
                                  <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                                    placeholder={`Reply via ${selectedThread.channel}...`}
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                  />
                                  <button onClick={() => handleSendMessage(inputText)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                      <Send size={16} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Context Sidebar */}
                  {matchedContact ? (
                      <div className="w-72 bg-white border-l border-slate-200 p-6 overflow-y-auto hidden xl:block">
                          <div className="text-center mb-6">
                              <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-slate-600 mb-3">
                                  {matchedContact.name.charAt(0)}
                              </div>
                              <h3 className="font-bold text-slate-900 text-lg">{matchedContact.name}</h3>
                              <p className="text-sm text-slate-500">{matchedContact.company}</p>
                              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${matchedContact.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {matchedContact.status}
                              </span>
                          </div>

                          <div className="space-y-6">
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Deal Value</p>
                                  <p className="text-xl font-bold text-slate-900">${matchedContact.value.toLocaleString()}</p>
                              </div>

                              <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Last Note</p>
                                  <div className="text-sm text-slate-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100 italic">
                                      "{matchedContact.notes}"
                                  </div>
                              </div>

                              <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Quick Actions</p>
                                  <div className="space-y-2">
                                      <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                                          <User size={14} /> View Profile
                                      </button>
                                      <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                                          <Activity size={14} /> Log Activity
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="w-72 bg-slate-50 border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center hidden xl:flex">
                          <User size={48} className="text-slate-300 mb-4" />
                          <p className="text-slate-500 font-medium">Unknown Contact</p>
                          <p className="text-xs text-slate-400 mb-4">No matching CRM record found.</p>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">Add to CRM</button>
                      </div>
                  )}

              </div>
          </div>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <MessageSquare size={64} className="mb-4 opacity-20" />
              <p>Select a conversation to start chatting</p>
          </div>
      )}

    </div>
  );
};

export default UnifiedInbox;
