
import React from 'react';
import { Hexagon, ArrowRight, ShieldCheck, Zap, BarChart3, Globe, CheckCircle, Star, Sparkles, Layout, Users, Smartphone } from 'lucide-react';
import { ViewMode } from '../types';

interface LandingPageProps {
  onNavigate: (view: ViewMode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <Hexagon className="text-white fill-white/20" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">Nexus<span className="text-blue-600">OS</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600 items-center">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            {/* Link to Client Landing Page */}
            <button 
              onClick={() => onNavigate(ViewMode.CLIENT_LANDING)}
              className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2"
            >
              <DollarSignIcon /> Applying for Funding?
            </button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => onNavigate(ViewMode.LOGIN)}
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate(ViewMode.SIGNUP)}
              className="px-5 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 animate-pulse-slow">
              <SparklesIcon /> New: AI Sales Agent 2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
              The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Business Funding</span>.
            </h1>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
              For Brokers & Lenders: Nexus consolidates your CRM, Power Dialer, Marketing Automation, and Underwriting into one AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate(ViewMode.SIGNUP)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                Start Free Trial <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => onNavigate(ViewMode.CLIENT_LANDING)}
                className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                I'm a Borrower
              </button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-slate-400 font-medium">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />)}
              </div>
              Trusted by 500+ funding experts
            </div>
          </div>
          
          <div className="relative animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50 -z-10 transform translate-x-20 translate-y-20"></div>
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
               <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" alt="Dashboard" className="rounded-xl w-full" />
               <div className="absolute bottom-6 right-6 bg-slate-900 text-white p-4 rounded-xl shadow-lg animate-bounce-slow">
                  <div className="flex items-center gap-3">
                     <div className="bg-green-500 p-2 rounded-lg"><CheckCircle size={20} className="text-white"/></div>
                     <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Deal Funded</p>
                        <p className="text-lg font-bold">$250,000</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Integrated with industry leaders</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
               <div className="text-xl font-black">LENDIO</div>
               <div className="text-xl font-black">BLUEVINE</div>
               <div className="text-xl font-black">ONDECK</div>
               <div className="text-xl font-black">FUNDBOX</div>
               <div className="text-xl font-black">STRIPE</div>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Everything you need to close more deals</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Stop toggling between 5 different tools. Nexus brings your entire funding lifecycle into one command center.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap size={32} className="text-amber-500" />}
              title="AI Power Dialer"
              desc="Call 3x more leads with our predictive dialer. Includes real-time sentiment analysis and objection handling scripts."
            />
            <FeatureCard 
              icon={<ShieldCheck size={32} className="text-emerald-500" />}
              title="Automated Underwriting"
              desc="Upload bank statements and get an instant AI analysis of revenue, NSFs, and daily balances."
            />
            <FeatureCard 
              icon={<Globe size={32} className="text-blue-500" />}
              title="Lead Generation"
              desc="Find new businesses on Google Maps and enrich their data with CEO names and emails instantly."
            />
            <FeatureCard 
              icon={<BarChart3 size={32} className="text-purple-500" />}
              title="Revenue Intelligence"
              desc="Forecast your commission checks with precision. Track pipeline velocity and agent performance."
            />
            <FeatureCard 
              icon={<Hexagon size={32} className="text-indigo-500" />}
              title="Client Portal"
              desc="Give your borrowers a white-labeled login to upload docs, sign contracts, and view their funding status."
            />
            <FeatureCard 
              icon={<Star size={32} className="text-pink-500" />}
              title="Marketing Automation"
              desc="Launch email drip campaigns and generate viral social media videos with our built-in AI studio."
            />
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 bg-slate-900 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 p-20 opacity-10"><Hexagon size={400} /></div>
         
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-black mb-4">Built for every stage of growth</h2>
               <p className="text-slate-400 max-w-2xl mx-auto text-lg">Whether you are a solo broker or a 50-person sales floor, Nexus adapts to your workflow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                  <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6"><Users size={24} /></div>
                  <h3 className="text-xl font-bold mb-2">Solo Brokers</h3>
                  <p className="text-slate-400 leading-relaxed">Replace your messy spreadsheets with a professional CRM. Automate follow-ups so you never lose a lead.</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                  <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6"><Layout size={24} /></div>
                  <h3 className="text-xl font-bold mb-2">ISO Shops</h3>
                  <p className="text-slate-400 leading-relaxed">Scale your sales team with the Power Dialer and AI Sales Trainer. Monitor agent performance in real-time.</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                  <div className="bg-emerald-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6"><Smartphone size={24} /></div>
                  <h3 className="text-xl font-bold mb-2">Direct Lenders</h3>
                  <p className="text-slate-400 leading-relaxed">Streamline underwriting with AI bank statement analysis and automated stipulation collection.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Simple, transparent pricing</h2>
               <p className="text-slate-500 max-w-2xl mx-auto text-lg">Start for free, upgrade as you close more deals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
               {/* Starter */}
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Starter</h3>
                  <div className="text-4xl font-black text-slate-900 mb-6">$0<span className="text-base font-medium text-slate-500">/mo</span></div>
                  <ul className="space-y-4 mb-8 flex-1">
                     <li className="flex gap-3 text-sm text-slate-600"><CheckCircle size={18} className="text-slate-400 flex-shrink-0" /> 1 User Seat</li>
                     <li className="flex gap-3 text-sm text-slate-600"><CheckCircle size={18} className="text-slate-400 flex-shrink-0" /> Basic CRM</li>
                     <li className="flex gap-3 text-sm text-slate-600"><CheckCircle size={18} className="text-slate-400 flex-shrink-0" /> 50 AI Credits / mo</li>
                  </ul>
                  <button onClick={() => onNavigate(ViewMode.SIGNUP)} className="w-full py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-slate-900 hover:text-slate-900 transition-colors">Start Free</button>
               </div>

               {/* Pro */}
               <div className="bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col relative transform scale-105 z-10">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Pro <Sparkles size={16} className="text-yellow-400"/></h3>
                  <div className="text-4xl font-black text-white mb-6">$97<span className="text-base font-medium text-slate-400">/mo</span></div>
                  <ul className="space-y-4 mb-8 flex-1">
                     <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-blue-400 flex-shrink-0" /> <strong>Unlimited</strong> AI Credits</li>
                     <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-blue-400 flex-shrink-0" /> Power Dialer & Recording</li>
                     <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-blue-400 flex-shrink-0" /> Automated Underwriting</li>
                     <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-blue-400 flex-shrink-0" /> Marketing Automation</li>
                  </ul>
                  <button onClick={() => onNavigate(ViewMode.SIGNUP)} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50">Get Pro</button>
               </div>

               {/* Elite */}
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Elite</h3>
                  <div className="text-4xl font-black text-slate-900 mb-6">$297<span className="text-base font-medium text-slate-500">/mo</span></div>
                  <ul className="space-y-4 mb-8 flex-1">
                     <li className="flex gap-3 text-sm text-slate-600"><CheckCircle size={18} className="text-slate-400 flex-shrink-0" /> Everything in Pro</li>
                     <li className="flex gap-3 text-sm text-slate-600"><CheckCircle size={18} className="text-slate-400 flex-shrink-0" /> 10 User Seats</li>
                     <li className="flex gap-3 text-sm text-slate-600"><CheckCircle size={18} className="text-slate-400 flex-shrink-0" /> White Label Client Portal</li>
                     <li className="flex gap-3 text-sm text-slate-600"><CheckCircle size={18} className="text-slate-400 flex-shrink-0" /> API Access</li>
                  </ul>
                  <button onClick={() => onNavigate(ViewMode.SIGNUP)} className="w-full py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-slate-900 hover:text-slate-900 transition-colors">Contact Sales</button>
               </div>
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to scale your brokerage?</h2>
            <p className="text-xl text-slate-500 mb-10">Join thousands of funding experts who use Nexus to automate their workflow.</p>
            <button 
              onClick={() => onNavigate(ViewMode.SIGNUP)}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl hover:bg-blue-700 shadow-2xl shadow-blue-300 transition-transform hover:scale-105"
            >
              Get Started for Free
            </button>
            <p className="mt-4 text-xs text-slate-400">No credit card required • 14-day free trial</p>
         </div>
         {/* Bg Elements */}
         <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 via-white to-white"></div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
               <div className="flex items-center gap-2 mb-4">
                  <div className="bg-blue-600 p-1 rounded">
                    <Hexagon className="text-white fill-white/20" size={14} />
                  </div>
                  <span className="font-bold text-slate-900">Nexus</span>
               </div>
               <p className="text-xs text-slate-500">The #1 CRM for Business Funding.</p>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 mb-4 text-sm">Product</h4>
               <ul className="space-y-2 text-xs text-slate-500">
                  <li><a href="#features" className="hover:text-blue-600">Features</a></li>
                  <li><a href="#pricing" className="hover:text-blue-600">Pricing</a></li>
                  <li><a href="#" className="hover:text-blue-600">API</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 mb-4 text-sm">Company</h4>
               <ul className="space-y-2 text-xs text-slate-500">
                  <li><a href="#" className="hover:text-blue-600">About</a></li>
                  <li><a href="#" className="hover:text-blue-600">Careers</a></li>
                  <li><a href="#" className="hover:text-blue-600">Contact</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 mb-4 text-sm">Legal</h4>
               <ul className="space-y-2 text-xs text-slate-500">
                  <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-blue-600">Security</a></li>
               </ul>
            </div>
         </div>
         <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-8">
            © 2024 Nexus Financial OS. All rights reserved.
         </div>
      </footer>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
     <div className="mb-6 bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">{icon}</div>
     <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
     <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const SparklesIcon = () => <Sparkles size={14} className="animate-pulse" />;
const DollarSignIcon = () => <div className="w-4 h-4 rounded-full bg-emerald-200 flex items-center justify-center text-[10px] text-emerald-800 font-bold">$</div>;

export default LandingPage;
