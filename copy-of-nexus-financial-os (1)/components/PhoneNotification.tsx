
import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X, Hexagon } from 'lucide-react';

interface PhoneNotificationProps {
  show: boolean;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  appName?: string;
}

const PhoneNotification: React.FC<PhoneNotificationProps> = ({ 
  show, 
  title, 
  message, 
  type = 'info', 
  onClose, 
  appName = 'Nexus CRM' 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !visible) return null;

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[92%] max-w-[380px] transition-all duration-500 ease-out ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-black/10 rounded-2xl p-3.5 border border-white/40 flex gap-3 items-start cursor-pointer hover:bg-white/90 transition-colors" onClick={() => setVisible(false)}>
        {/* App Icon Area */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          type === 'success' ? 'bg-emerald-500 text-white' :
          type === 'error' ? 'bg-red-500 text-white' :
          'bg-slate-900 text-white'
        }`}>
          {type === 'success' ? <CheckCircle size={20} /> : type === 'error' ? <AlertCircle size={20} /> : <Hexagon size={20} fill="currentColor" />}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex justify-between items-baseline mb-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide opacity-80">{appName}</span>
            <span className="text-[10px] text-slate-400 font-medium">now</span>
          </div>
          {title && <h4 className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{title}</h4>}
          <p className="text-xs font-medium text-slate-600 leading-snug line-clamp-2">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default PhoneNotification;
