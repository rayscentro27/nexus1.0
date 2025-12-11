
import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { Trophy, TrendingUp, Phone, Star, Activity, Crown, Flame, Target, DollarSign, X } from 'lucide-react';

interface SalesLeaderboardProps {
  contacts: Contact[];
  onClose: () => void;
}

const SalesLeaderboard: React.FC<SalesLeaderboardProps> = ({ contacts, onClose }) => {
  // Mock Agent Data - In real app, aggregate from Contact activities
  const agents = [
    { name: 'John Doe', avatar: 'JD', revenue: 0, calls: 0, deals: 0 },
    { name: 'Sarah Sales', avatar: 'SS', revenue: 0, calls: 0, deals: 0 },
    { name: 'Mike Closer', avatar: 'MC', revenue: 0, calls: 0, deals: 0 },
    { name: 'Jessica Wolf', avatar: 'JW', revenue: 0, calls: 0, deals: 0 },
  ];

  // Aggregate Real Data
  contacts.forEach(c => {
    // Distribute randomly for demo purposes since contacts don't strictly have an 'owner' field in simple mock
    // In production: use c.ownerId
    const agentIndex = Math.abs(c.company.length) % agents.length; 
    
    if (c.status === 'Closed') {
        agents[agentIndex].revenue += c.value;
        agents[agentIndex].deals += 1;
    }
    
    // Count calls from activities
    const calls = c.activities?.filter(a => a.type === 'call').length || 0;
    agents[agentIndex].calls += calls;
  });

  // Sort by Revenue
  const sortedAgents = [...agents].sort((a, b) => b.revenue - a.revenue);
  
  // Recent Activity Feed (Ticker)
  const recentActivities = contacts
    .flatMap(c => c.activities?.map(a => ({ ...a, contactName: c.name, company: c.company, value: c.value })) || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Auto-scrolling ticker logic is handled via CSS marquee usually, or simple intervals
  const [tickerIndex, setTickerIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
        setTickerIndex(prev => (prev + 1) % recentActivities.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [recentActivities.length]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 text-white overflow-hidden flex flex-col font-sans">
      
      {/* Top Bar */}
      <div className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shadow-2xl">
         <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Trophy size={32} className="text-white animate-pulse" />
            </div>
            <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    Sales Floor Live
                </h1>
                <p className="text-xs text-slate-400 font-mono tracking-widest">REAL-TIME PERFORMANCE TRACKER</p>
            </div>
         </div>
         
         <div className="flex items-center gap-8">
            <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold">Monthly Target</p>
                <div className="text-2xl font-black text-emerald-400">$1,000,000</div>
            </div>
            <div className="w-px h-10 bg-slate-800"></div>
            <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold">Current Pace</p>
                <div className="text-2xl font-black text-blue-400">$750,000</div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
                <X size={24} />
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 grid grid-cols-12 gap-8">
         
         {/* Leaderboard (Left) */}
         <div className="col-span-8 space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {sortedAgents.map((agent, index) => (
                    <div 
                        key={agent.name} 
                        className={`relative overflow-hidden rounded-2xl border p-6 flex items-center transition-all transform hover:scale-[1.01] ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-900/20 to-slate-900 border-yellow-600/50 shadow-[0_0_30px_rgba(234,179,8,0.1)]' : 
                            index === 1 ? 'bg-slate-900 border-slate-700' : 
                            index === 2 ? 'bg-slate-900 border-slate-700' : 
                            'bg-slate-900/50 border-slate-800'
                        }`}
                    >
                        {/* Rank Badge */}
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black mr-8 border-4 shadow-lg ${
                            index === 0 ? 'bg-yellow-500 text-yellow-900 border-yellow-400' : 
                            index === 1 ? 'bg-slate-300 text-slate-800 border-slate-200' : 
                            index === 2 ? 'bg-orange-700 text-orange-200 border-orange-600' : 
                            'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                            {index + 1}
                        </div>

                        {/* Avatar & Name */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className={`text-3xl font-bold ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>{agent.name}</h3>
                                {index === 0 && <Crown size={24} className="text-yellow-400 fill-yellow-400 animate-bounce" />}
                            </div>
                            <div className="flex items-center gap-6 mt-2 text-slate-400 text-sm font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Phone size={14}/> {agent.calls} Calls</span>
                                <span className="flex items-center gap-1"><CheckCircleIcon size={14}/> {agent.deals} Deals</span>
                            </div>
                        </div>

                        {/* Revenue */}
                        <div className="text-right">
                            <div className={`text-4xl font-black font-mono tracking-tight ${
                                index === 0 ? 'text-emerald-400 text-shadow-glow' : 'text-slate-200'
                            }`}>
                                ${agent.revenue.toLocaleString()}
                            </div>
                            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Total Funded</div>
                        </div>

                        {/* Progress Bar Background for visual flair */}
                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full opacity-30"></div>
                    </div>
                ))}
            </div>
         </div>

         {/* Side Stats (Right) */}
         <div className="col-span-4 flex flex-col gap-6">
            
            {/* Top Hustler (Most Calls) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Flame size={120} /></div>
                <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Flame size={18} /> Top Hustler
                </h3>
                <div className="text-center py-4">
                    <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-4 border-4 border-orange-500 flex items-center justify-center text-2xl font-bold">
                        {agents.sort((a,b) => b.calls - a.calls)[0].avatar}
                    </div>
                    <div className="text-3xl font-black text-white">{agents.sort((a,b) => b.calls - a.calls)[0].name}</div>
                    <div className="text-5xl font-black text-orange-500 mt-2 font-mono">{agents.sort((a,b) => b.calls - a.calls)[0].calls}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold mt-1">Calls Today</div>
                </div>
            </div>

            {/* Goal Progress */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Target size={18} /> Monthly Goal
                </h3>
                <div className="relative w-full h-64 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-end justify-center">
                    <div className="w-24 bg-blue-600 h-[75%] rounded-t-lg relative group">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xl font-bold text-white">75%</div>
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                        <div className="border-t border-slate-600 w-full h-px"></div>
                        <div className="border-t border-slate-600 w-full h-px"></div>
                        <div className="border-t border-slate-600 w-full h-px"></div>
                        <div className="border-t border-slate-600 w-full h-px"></div>
                    </div>
                </div>
            </div>

         </div>
      </div>

      {/* Bottom Ticker */}
      <div className="h-16 bg-blue-900/20 backdrop-blur border-t border-blue-900/50 flex items-center relative overflow-hidden">
         <div className="absolute left-0 bg-blue-600 h-full px-6 flex items-center justify-center z-10 font-bold uppercase tracking-widest text-sm shadow-xl">
            Live Feed
         </div>
         <div className="flex-1 flex items-center pl-6 animate-pulse">
            {recentActivities[tickerIndex] && (
                <div className="text-xl font-medium text-blue-100 flex items-center gap-4 transition-all duration-500">
                    <span className="font-bold text-white">{recentActivities[tickerIndex].user || 'Agent'}</span>
                    <span className="text-blue-300">logged</span>
                    <span className="bg-blue-800/50 px-3 py-1 rounded text-white font-mono border border-blue-500/30">
                        {recentActivities[tickerIndex].type.toUpperCase()}
                    </span>
                    <span className="text-blue-200">for {recentActivities[tickerIndex].company}</span>
                    <span className="text-slate-400 text-sm ml-4">({recentActivities[tickerIndex].date})</span>
                </div>
            )}
         </div>
         <div className="pr-8 flex gap-4 text-xs font-mono text-blue-400/50">
            <span>NEXUS OS v1.0</span>
            <span>::</span>
            <span>SECURE CONNECTION</span>
         </div>
      </div>

    </div>
  );
};

const CheckCircleIcon = (props: any) => <Activity {...props} />;

export default SalesLeaderboard;
