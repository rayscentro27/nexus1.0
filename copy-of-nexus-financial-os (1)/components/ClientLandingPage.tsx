
import React from 'react';
import { Hexagon, CheckCircle, ArrowRight, Zap, TrendingUp, ShieldCheck, DollarSign, Clock, LayoutDashboard } from 'lucide-react';
import { ViewMode } from '../types';

interface ClientLandingPageProps {
  onNavigate: (view: ViewMode) => void;
}

const ClientLandingPage: React.FC<ClientLandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Hexagon className="text-white fill-white/20" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">Nexus<span className="text-emerald-500">Capital</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600 items-center">
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#benefits" className="hover:text-emerald-600 transition-colors">Benefits</a>
            <a href="#success-stories" className="hover:text-emerald-600 transition-colors">Success Stories</a>
            
            {/* Broker Link */}
            <button 
              onClick={() => onNavigate(ViewMode.LANDING)}
              className="ml-4 text-indigo-600 font-bold hover:text-indigo-700 transition-colors bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 flex items-center gap-2 text-xs uppercase tracking-wide"
            >
              <LayoutDashboard size={14} /> For Brokers & Partners
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => onNavigate(ViewMode.LOGIN)}
              className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Client Login
            </button>
            <button 
              onClick={() => onNavigate(ViewMode.SIGNUP)}
              className="px-6 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              Apply Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-24 px-6 relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2370&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-emerald-500/20">
              <Zap size={14} className="fill-emerald-400" /> Fast Funding Approvals
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
              Get $50k to $5M for your business in <span className="text-emerald-400">24 hours</span>.
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-lg">
              Skip the bank headaches. Apply in minutes with no hard credit check and get multiple offers from top-tier lenders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate(ViewMode.SIGNUP)}
                className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-bold text-xl hover:bg-emerald-600 shadow-xl shadow-emerald-900/50 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
              >
                Check Eligibility <ArrowRight size={24} />
              </button>
              <div className="flex items-center gap-4 px-6 text-sm font-medium text-slate-400">
                <div className="flex gap-1">
                   <ShieldCheck size={18} className="text-emerald-500" /> Secure
                </div>
                <div className="flex gap-1">
                   <Clock size={18} className="text-emerald-500" /> Fast
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative hidden lg:block animate-slide-in-right">
             {/* Abstract Card Visual */}
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="flex justify-between items-center mb-8">
                   <div>
                      <p className="text-slate-400 text-sm uppercase font-bold">Approved Amount</p>
                      <h3 className="text-5xl font-bold text-white">$250,000</h3>
                   </div>
                   <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle size={32} className="text-white" />
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
                   <div className="h-4 bg-white/10 rounded-full w-1/2"></div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between text-sm">
                   <span className="text-emerald-400 font-bold">Funds Deployed</span>
                   <span className="text-slate-400">Just now</span>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-slate-100">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
               <p className="text-4xl font-black text-slate-900 mb-1">$500M+</p>
               <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Funded</p>
            </div>
            <div className="text-center">
               <p className="text-4xl font-black text-slate-900 mb-1">24h</p>
               <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Avg. Approval</p>
            </div>
            <div className="text-center">
               <p className="text-4xl font-black text-slate-900 mb-1">98%</p>
               <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Satisfaction</p>
            </div>
            <div className="text-center">
               <p className="text-4xl font-black text-slate-900 mb-1">75+</p>
               <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Lenders</p>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Simple, Transparent Funding.</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              We connect your business with the capital it needs to grow, without the red tape of traditional banks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform">
               <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Clock size={32} className="text-blue-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">1. Apply in Minutes</h3>
               <p className="text-slate-500 leading-relaxed">Complete a simple online application. Link your bank account for instant verification.</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform">
               <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp size={32} className="text-purple-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">2. Choose Your Offer</h3>
               <p className="text-slate-500 leading-relaxed">Receive multiple offers from our network of 75+ lenders. Compare rates and terms easily.</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform">
               <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  <DollarSign size={32} className="text-emerald-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">3. Get Funded</h3>
               <p className="text-slate-500 leading-relaxed">Sign digitally and receive funds in your business account as fast as 24 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-20 opacity-5"><Hexagon size={500} /></div>
         
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to grow your business?</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">Join thousands of business owners who trust Nexus for their capital needs.</p>
            <button 
              onClick={() => onNavigate(ViewMode.SIGNUP)}
              className="px-12 py-6 bg-emerald-500 text-white rounded-2xl font-bold text-xl hover:bg-emerald-600 shadow-2xl shadow-emerald-500/30 transition-transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
            >
              Get Your Offer Now <ArrowRight size={24} />
            </button>
            <p className="mt-6 text-sm text-slate-500">No commitment • No hard credit pull to apply</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="bg-emerald-500 p-1.5 rounded-lg">
                  <Hexagon className="text-white fill-white/20" size={16} />
                </div>
                <span className="text-lg font-bold text-slate-900">Nexus<span className="text-emerald-600">Capital</span></span>
            </div>
            <div className="text-sm text-slate-500">
               © 2024 Nexus Funding. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm font-medium text-slate-600">
               <a href="#" className="hover:text-emerald-600">Privacy</a>
               <a href="#" className="hover:text-emerald-600">Terms</a>
               <button onClick={() => onNavigate(ViewMode.LANDING)} className="text-slate-400 hover:text-slate-600">Broker Login</button>
            </div>
         </div>
      </footer>

    </div>
  );
};

export default ClientLandingPage;
