
import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Sparkles, AlertCircle, RefreshCw, Trophy, Phone, Target, BarChart3 } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface AnalyticsDashboardProps {
  contacts: Contact[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ contacts }) => {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Metrics Calculation ---
  const totalLeads = contacts.length;
  const closedDeals = contacts.filter(c => c.status === 'Closed');
  const activeDeals = contacts.filter(c => c.status === 'Active' || c.status === 'Negotiation');
  
  const totalValue = contacts.reduce((sum, c) => sum + (c.value || 0), 0);
  const closedValue = closedDeals.reduce((sum, c) => sum + (c.value || 0), 0);
  const winRate = totalLeads > 0 ? ((closedDeals.length / totalLeads) * 100).toFixed(1) : '0';
  
  // Funnel Data
  const funnelData = [
    { name: 'Leads', count: contacts.filter(c => c.status === 'Lead').length, fill: '#3b82f6' },
    { name: 'Active', count: contacts.filter(c => c.status === 'Active').length, fill: '#10b981' },
    { name: 'Negotiation', count: contacts.filter(c => c.status === 'Negotiation').length, fill: '#f59e0b' },
    { name: 'Closed', count: closedDeals.length, fill: '#6366f1' },
  ];

  // Forecast Data (Mock projection based on Active/Negotiation probabilities)
  const generateForecast = () => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let cumulative = closedValue;
    
    // Simple projection: Assume 20% growth per month + weighted pipeline
    // This is a simulation since we don't have historical timestamps for all deals
    for (let i = 0; i < 6; i++) {
        const pipelineWeight = (activeDeals.reduce((sum, c) => sum + c.value, 0) * 0.4) / 6; // Spread pipeline over 6 months
        cumulative += pipelineWeight + (Math.random() * 50000); // Random variance
        data.push({
            name: months[i],
            Revenue: Math.round(cumulative),
            Projected: Math.round(cumulative * 1.15) // Target
        });
    }
    return data;
  };
  
  const forecastData = generateForecast();

  // Agent Leaderboard (Mock aggregation from activities)
  const agentStats: Record<string, { calls: number, revenue: number, deals: number }> = {
    'Admin': { calls: 0, revenue: 0, deals: 0 },
    'System': { calls: 0, revenue: 0, deals: 0 }
  };

  contacts.forEach(c => {
      // Attribute revenue to Admin for simplicity in this demo
      if (c.status === 'Closed') {
          agentStats['Admin'].revenue += c.value;
          agentStats['Admin'].deals += 1;
      }
      
      c.activities?.forEach(a => {
          const user = a.user || 'Admin';
          if (!agentStats[user]) agentStats[user] = { calls: 0, revenue: 0, deals: 0 };
          if (a.type === 'call') agentStats[user].calls += 1;
      });
  });

  const leaderboard = Object.entries(agentStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue);

  // --- AI Insights ---
  useEffect(() => {
    handleRefreshInsights();
  }, [contacts]);

  const handleRefreshInsights = async () => {
    setIsAnalyzing(true);
    const insights = await geminiService.generateAnalyticsInsights(contacts);
    setAiInsights(insights);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <BarChart3 size={32} className="text-blue-600" /> Revenue Intelligence
            </h1>
            <p className="text-slate-500 mt-2">Real-time pipeline analytics and AI-driven forecasting.</p>
        </div>
        <button 
            onClick={handleRefreshInsights}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors text-sm shadow-sm"
        >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles className="text-purple-500" size={16} />}
            Refresh AI Analysis
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Pipeline</p>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={20} /></div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">${totalValue.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1">{totalLeads} Total Opportunities</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Revenue Won</p>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20} /></div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">${closedValue.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-bold">+12% vs last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Win Rate</p>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Trophy size={20} /></div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{winRate}%</h3>
            <p className="text-xs text-slate-500 mt-1">Global Average</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Active Deals</p>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Target size={20} /></div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{activeDeals.length}</h3>
            <p className="text-xs text-slate-500 mt-1">Needs Attention</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Funnel */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 mb-6">Conversion Funnel</h3>
              <div className="flex-1 w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                            {funnelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Revenue Forecast */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-500" /> 6-Month Revenue Forecast
              </h3>
              <div className="flex-1 w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                          <Legend />
                          <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                          <Area type="monotone" dataKey="Projected" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProj)" strokeDasharray="5 5" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Leaderboard */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><Trophy size={18} className="text-yellow-500" /> Agent Leaderboard</h3>
              </div>
              <table className="w-full text-left">
                  <thead className="bg-white text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                      <tr>
                          <th className="px-6 py-4">Agent</th>
                          <th className="px-6 py-4 text-center">Calls Made</th>
                          <th className="px-6 py-4 text-center">Deals Closed</th>
                          <th className="px-6 py-4 text-right">Revenue</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {leaderboard.map((agent, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">{agent.name.charAt(0)}</div>
                                  {agent.name}
                              </td>
                              <td className="px-6 py-4 text-center text-slate-600">{agent.calls}</td>
                              <td className="px-6 py-4 text-center">
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">{agent.deals}</span>
                              </td>
                              <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">${agent.revenue.toLocaleString()}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles size={120} />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/50">
                          <Sparkles size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold">AI Strategic Analyst</h3>
                  </div>
                  
                  <div className="flex-1 bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10 overflow-y-auto custom-scrollbar">
                      {isAnalyzing ? (
                          <div className="flex items-center gap-3 text-indigo-200">
                              <RefreshCw className="animate-spin" size={20} />
                              Running deep analysis on pipeline data...
                          </div>
                      ) : (
                          <div className="prose prose-invert prose-sm max-w-none">
                              <div className="whitespace-pre-line leading-relaxed">
                                  {aiInsights || "Click 'Refresh AI Analysis' to generate strategic insights based on your current data."}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
