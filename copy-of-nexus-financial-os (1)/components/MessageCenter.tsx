
import React, { useState, useRef, useEffect } from 'react';
import { Contact, Message } from '../types';
import { Send, User, Bot, CheckCheck } from 'lucide-react';

interface MessageCenterProps {
  contact: Contact;
  onUpdateContact?: (contact: Contact) => void;
  currentUserRole: 'admin' | 'client';
}

const MessageCenter: React.FC<MessageCenterProps> = ({ contact, onUpdateContact, currentUserRole }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = contact.messageHistory || [];

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !onUpdateContact) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: currentUserRole,
      content: newMessage,
      timestamp: new Date().toLocaleString(),
      read: false
    };
    
    let updatedMessages = [...messages, userMsg];
    onUpdateContact({ ...contact, messageHistory: updatedMessages });
    setNewMessage('');

    if (currentUserRole === 'client') {
      setTimeout(() => {
        const reply = "Thanks for your message. An advisor will review it shortly.";
        const autoReply: Message = { id: `msg_auto_${Date.now()}`, sender: 'system', content: reply, timestamp: new Date().toLocaleString(), read: false };
        onUpdateContact({ ...contact, messageHistory: [...updatedMessages, autoReply] });
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div><h3 className="font-bold text-slate-800 flex items-center gap-2">{currentUserRole === 'client' ? 'Your Dedicated Advisor' : `Chat with ${contact.name}`}</h3><p className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>{currentUserRole === 'client' ? 'Online' : 'Active Now'}</p></div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
        {messages.length === 0 && (<div className="text-center text-slate-400 my-10"><p className="text-sm">Start a secure conversation...</p></div>)}
        {messages.map((msg) => {
          const isMe = msg.sender === currentUserRole;
          const isSystem = msg.sender === 'system';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isMe ? 'bg-slate-900 text-white' : isSystem ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>{isMe ? 'Me' : isSystem ? <Bot size={16}/> : msg.sender === 'admin' ? 'JD' : contact.name.charAt(0)}</div>
                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-slate-900 text-white rounded-br-none' : isSystem ? 'bg-white border border-blue-100 text-slate-700 rounded-bl-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>{msg.content}<div className={`text-[10px] mt-1 flex items-center gap-1 justify-end ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>{msg.timestamp.split(',')[1]}</div></div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3 items-end">
        <div className="flex-1 relative"><textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message securely..." className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={1}/></div>
        <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-md"><Send size={20} /></button>
      </form>
    </div>
  );
};

export default MessageCenter;
