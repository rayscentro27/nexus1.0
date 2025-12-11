
import React, { useState } from 'react';
import { Target, Search, Loader, Zap, Globe, TrendingUp, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';
import * as geminiService from '../services/geminiService';
import { MarketReport } from '../types';

const MarketIntelligence: React.FC = () => {
  const [formData, setFormData] = useState({ company: '', industry: '', location: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<MarketReport | null>(null);

  const handleAnalyze = async () => {
    if (!formData.company || !formData.industry) return;
    setIsAnalyzing(true);
    setReport(null);
    try {
      const data = await geminiService.analyzeCompetitors(formData.company, formData.industry, formData.location);
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Target className="text-red-600" size={32} /> Market Intelligence
        </h1>
        <p className="text-slate-500 mt-2">Use AI to spy on competitors and find funding opportunities.</p>
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Name</label>
               <input 
                 type="text" 
                 value={formData.company} 
                 onChange={e => setFormData({...formData, company: e.target.value})}
                 placeholder="e.g. Joe's Pizza"
                 className="w-full p-2 border border-slate-300 rounded-lg"
               />
            </div>
            <div className="md:col-span-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Industry</label>
               <input 
                 type="text" 
                 value={formData.industry} 
                 onChange={e => setFormData({...formData, industry: e.target.value})}
                 placeholder="e.g. Restaurant"
                 className="w-full p-2 border border-slate-300 rounded-lg"
               />
            </div>
            <div className="md:col-span-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
               <input 
                 type="text" 
                 value={formData.location} 
                 onChange={e => setFormData({...formData, location: e.target.value})}
                 placeholder="e.g. Chicago, IL"
                 className="w-full p-2 border border-slate-300 rounded-lg"
               />
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !formData.company}
              className="bg-red-600 text-white font-bold py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
              {isAnalyzing ? 'Scanning...' : 'Analyze Market'}
            </button>
         </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
           
           {/* Left: Competitors */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Competitor Cards */}
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Globe size={18} className="text-blue-500"/> Top Competitors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {report.competitors.map((comp, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                       <h4 className="font-bold text-slate-900 mb-2">{comp.name}</h4>
                       <div className="space-y-2">
                          <div className="text-xs">
                             <span className="font-bold text-green-600 block mb-1">Strength</span>
                             {comp.strengths[0]}
                          </div>
                          <div className="text-xs">
                             <span className="font-bold text-red-500 block mb-1">Weakness</span>
                             {comp.weaknesses[0]}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Funding Angles */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                 <div className="relative z-10">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Zap className="text-yellow-400" /> Sales Attack Plan</h3>
                    <ul className="space-y-3">
                       {report.fundingAngles.map((angle, i) => (
                          <li key={i} className="flex items-start gap-3 bg-white/10 p-3 rounded-lg border border-white/10">
                             <CheckCircle size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                             <span className="text-sm font-medium">{angle}</span>
                          </li>
                       ))}
                    </ul>
                 </div>
                 <div className="absolute right-0 top-0 opacity-10 p-4"><TrendingUp size={150} /></div>
              </div>

              {/* Digital Gap */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><BarChart2 size={18} className="text-purple-500"/> Digital Gap Analysis</h3>
                 <p className="text-slate-600 text-sm leading-relaxed">{report.digitalGap}</p>
              </div>

           </div>

           {/* Right: SWOT */}
           <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                 <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 text-center">SWOT Analysis</div>
                 <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                    
                    <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><CheckCircle size={12}/> Strengths</h4>
                       <ul className="list-disc pl-4 text-sm text-slate-600 space-y-1">
                          {report.swot.strengths.map((s, i) => <li key={i}>{s}</li>)}
                       </ul>
                    </div>

                    <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Weaknesses</h4>
                       <ul className="list-disc pl-4 text-sm text-slate-600 space-y-1">
                          {report.swot.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                       </ul>
                    </div>

                    <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Zap size={12}/> Opportunities</h4>
                       <ul className="list-disc pl-4 text-sm text-slate-600 space-y-1">
                          {report.swot.opportunities.map((s, i) => <li key={i}>{s}</li>)}
                       </ul>
                    </div>

                    <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Threats</h4>
                       <ul className="list-disc pl-4 text-sm text-slate-600 space-y-1">
                          {report.swot.threats.map((s, i) => <li key={i}>{s}</li>)}
                       </ul>
                    </div>

                 </div>
              </div>
           </div>

        </div>
      )}

    </div>
  );
};

export default MarketIntelligence;
