
import React, { useState } from 'react';
import { Hexagon, Lock, Mail, ArrowRight, User, ShieldCheck, AlertCircle, Fingerprint, Building2, Phone, UserPlus, ChevronLeft } from 'lucide-react';
import { User as UserType, Contact, ClientTask } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import PhoneNotification from './PhoneNotification';

interface LoginProps {
  onLogin: (user: UserType) => void;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up Fields
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  
  // Notification State
  const [notify, setNotify] = useState({ show: false, message: '', title: '', type: 'info' as 'info' | 'success' | 'error' });

  // Only show demo buttons in development mode
  const isDev = import.meta.env.DEV;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulation Mode if no backend (Only in Dev)
    if (!isSupabaseConfigured && isDev) {
       setTimeout(() => {
         if (isSignUp) {
            setNotify({ show: true, title: 'Demo Mode', message: 'Account created locally.', type: 'success' });
            setIsSignUp(false);
         } else {
            // Simulate Login
            onLogin({ id: 'demo_user', name: 'Demo User', email, role: 'admin' });
         }
         setLoading(false);
       }, 1000);
       return;
    }

    try {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: fullName, role: 'client' } }
        });

        if (authError) throw authError;

        // Create Contact Record
        const initialTasks: ClientTask[] = [
          { id: `t_1_${Date.now()}`, title: 'Watch: Personal Credit Guide', status: 'pending', date: new Date().toISOString().split('T')[0], type: 'education', link: 'https://www.youtube.com/watch?v=EPGPgDS0pg0' },
          { id: `t_2_${Date.now()}`, title: 'Upload Credit Report', status: 'pending', date: new Date().toISOString().split('T')[0], type: 'upload' }
        ];

        const newContact: Contact = {
          id: authData.user?.id || `temp_${Date.now()}`,
          name: fullName,
          email: email,
          phone: phone,
          company: companyName,
          status: 'Lead',
          lastContact: 'Just now',
          notes: 'Registered via Login Screen',
          value: 0,
          source: 'Web Sign-Up',
          checklist: {},
          clientTasks: initialTasks,
          invoices: [],
          fundingGoal: { targetAmount: 50000, targetDate: new Date().toISOString().split('T')[0], fundingType: 'Business Line of Credit' }
        };

        const { error: dbError } = await supabase.from('contacts').insert([newContact]);
        if (dbError) console.error("DB Insert Error (might be RLS):", dbError); 

        setNotify({ show: true, title: 'Success', message: 'Account created! Please sign in.', type: 'success' });
        setIsSignUp(false);
      } else {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setNotify({ show: true, title: 'Auth Failed', message: err.message || 'Authentication failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'client') => {
    setLoading(true);
    
    if (!isSupabaseConfigured && isDev) {
       // Skip auth call if no backend
       setTimeout(() => {
         if (role === 'admin') {
           onLogin({ id: 'u_admin', name: 'John Doe', email: 'admin@nexus.funding', role: 'admin' });
         } else {
           onLogin({ id: 'u_client', name: 'Alice Freeman', email: 'alice@techcorp.com', role: 'client', contactId: '1' });
         }
         setLoading(false);
       }, 800);
       return;
    }

    const demoEmail = role === 'admin' ? 'admin@nexus.funding' : 'client@techcorp.com';
    const demoPass = 'nexus123'; 

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass });
      if (error) throw error;
    } catch (err: any) {
       console.warn("Demo user auth failed, proceeding with UI simulation");
       if (isDev) {
         if (role === 'admin') {
           onLogin({ id: 'u_admin', name: 'John Doe', email: 'admin@nexus.funding', role: 'admin' });
         } else {
           onLogin({ id: 'u_client', name: 'Alice Freeman', email: 'alice@techcorp.com', role: 'client', contactId: '1' });
         }
       } else {
         setNotify({ show: true, title: 'Error', message: 'Demo access disabled in production.', type: 'error' });
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center pointer-events-none transition-opacity duration-1000"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")' }}
      ></div>

      {/* Glassmorphism Background Blobs - Standard Colors */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[120px] opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-purple-600 rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div className={`bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col animate-fade-in border border-white/50 transition-all duration-500 ${isSignUp ? 'h-auto py-4' : 'h-auto'}`}>
        
        {/* Back Button */}
        {onBack && (
          <div className="absolute top-4 left-4 z-20">
            <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-600 bg-white/50 rounded-full hover:bg-white transition-all">
              <ChevronLeft size={20} />
            </button>
          </div>
        )}

        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20 transform rotate-3">
            <Hexagon className="text-white fill-white/10" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nexus Funding</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {isSignUp ? 'Create your capital account' : 'Access your financial portal'}
          </p>
        </div>

        <div className="px-8 pb-8">
          
          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Sign Up Extra Fields */}
            {isSignUp && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      required={isSignUp}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company"
                      required={isSignUp}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone"
                      required={isSignUp}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-70 mt-4 transform hover:-translate-y-0.5"
            >
              {loading ? 'Processing...' : isSignUp ? <>Create Account <UserPlus size={18} /></> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Biometric / Quick Access Visual - DEV ONLY */}
          {!isSignUp && isDev && (
             <div className="my-6 flex items-center justify-between gap-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dev Quick Access</span>
                <div className="h-px bg-slate-200 flex-1"></div>
             </div>
          )}

          {!isSignUp && isDev && (
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleDemoLogin('admin')} className="flex flex-col items-center justify-center p-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-bold hover:bg-indigo-100 transition-colors border border-indigo-100">
                <ShieldCheck size={18} className="mb-1" /> Admin
              </button>
              <button onClick={() => handleDemoLogin('client')} className="flex flex-col items-center justify-center p-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold hover:bg-emerald-100 transition-colors border border-emerald-100">
                <User size={18} className="mb-1" /> Client
              </button>
              <button className="flex flex-col items-center justify-center p-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-100 transition-colors border border-slate-200 group">
                <Fingerprint size={18} className="mb-1 group-hover:text-blue-600" /> Touch ID
              </button>
            </div>
          )}

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setNotify({...notify, show: false}); }}
              className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

        </div>
      </div>

      <PhoneNotification 
        show={notify.show} 
        title={notify.title}
        message={notify.message} 
        type={notify.type} 
        onClose={() => setNotify({...notify, show: false})} 
      />
    </div>
  );
};

export default Login;
