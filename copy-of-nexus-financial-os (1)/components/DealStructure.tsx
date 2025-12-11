
import React, { useState } from 'react';
import { Contact, FundingOffer } from '../types';
import { Calculator, Zap, DollarSign, TrendingUp, ShieldCheck, AlertCircle, RefreshCw, CheckCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as geminiService from '../services/geminiService';

interface DealStructureProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
}

const DealStructure: React.FC<DealStructureProps> = ({ contact, onUpdateContact }) => {
  const [amount, setAmount] = useState(50000);
  const [term, setTerm] = useState(12); // Months
  const [factor, setFactor] = useState(1.25);
  const [freq, setFreq] = useState<'Daily' | 'Weekly'>('Weekly');
  const [margin, setMargin] = useState(30); // ROI Margin %
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // --- Calculations ---
  const payback = amount * factor;
  const costOfCapital = payback - amount;
  const numPayments = freq === 'Daily' ? term * 21 : term * 4; // Approx business days/weeks
  const paymentAmount = payback / numPayments;
  
  // ROI Calc
  const grossReturn = amount * (1 + margin / 100);
  const netProfit = grossReturn - payback;
  const roiPercent = (netProfit / amount) * 100;

  const chartData = [
    { name: 'Financial Outcome', Principal: amount, Interest: costOfCapital, Profit: netProfit > 0 ? netProfit : 0 }
  ];

  const handleAIAnalyze = async () => {
    if (!contact.financialSpreading) {
      alert("No financial data available. Please run the Bank Statement Analyzer first.");
      return;
    }
    setIsAnalyzing(true);
    const result = await geminiService.analyzeDealStructure(contact.financialSpreading, amount);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const applyOption = (opt: any) => {
    setAmount(opt.amount);
    // Parse term string "9 Months" -> 9
    const termNum = parseInt(opt.term) || 12;
    setTerm(termNum);
    setFactor(opt.rate);
    setFreq(opt.freq);
  };

  const handleCreateOffer = () => {
    const newOffer: FundingOffer = {
      id: `off_${Date.now()}`,
      lenderName: 'Direct Internal Funding', // Placeholder
      amount: amount,
      term: `${term} Months`,
      rate: factor.toString(),
      payment: freq,
      paymentAmount: Math.round(paymentAmount),
      status: 'Sent',
      dateSent: new Date().toLocaleDateString(),
      stips: 'Standard'
    };
    
    onUpdateContact({
      ...contact,
      offers: [...(contact.offers || []), newOffer],
      activities: [...(contact.activities || []), {
        id: `act_struct_${Date.now()}`,
        type: 'system',
        description: `Created structured offer: $${amount.toLocaleString()} at ${factor} factor.`,
        date: new Date().toLocaleString(),
        user: 'Admin'
      }],
      status: 'Negotiation'
    });
    
    alert("Offer created and sent to Negotiation stage!");
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      
      {/* Header & AI Trigger */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Calculator className="text-blue-400" /> Deal Structuring Engine</h2>
            <p className="text-slate-400 text-sm mt-1">AI-powered underwriting and ROI modeling.</p>
         </div>
         <div className="relative z-10">
            <button 
              onClick={handleAIAnalyze}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
            >
               {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Zap className="fill-yellow-400 text-yellow-400" />}
               {isAnalyzing ? 'Underwriting...' : 'Run AI Underwriter'}
            </button>
         </div>
         {/* Decoration */}
         <div className="absolute right-0 top-0 opacity-10 p-4"><TrendingUp size={140} /></div>
      </div>

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-500" /> Max Approval</h4>
              <div className="text-3xl font-bold text-emerald-600 mb-1">${aiAnalysis.maxApproval.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mb-4">Based on revenue & balances</p>
              
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                 <strong>Risk Assessment:</strong><br/>
                 {aiAnalysis.riskAssessment}
              </div>
           </div>

           <div className="lg:col-span-3 grid grid-cols-3 gap-4">
              {aiAnalysis.options?.map((opt: any, idx: number) => (
                 <div key={idx} onClick={() => applyOption(opt)} className="bg-white p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group">
                    <div className="flex justify-between items-center mb-2">
                       <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${idx === 0 ? 'bg-blue-100 text-blue-700' : idx === 1 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>{opt.name}</span>
                       <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-blue-500 group-hover:bg-blue-500 transition-colors"></div>
                    </div>
                    <div className="text-xl font-bold text-slate-800">${opt.amount.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 mt-1 space-y-1">
                       <div className="flex justify-between"><span>Term:</span> <strong>{opt.term}</strong></div>
                       <div className="flex justify-between"><span>Rate:</span> <strong>{opt.rate}</strong></div>
                       <div className="flex justify-between"><span>Pmt:</span> <strong>${opt.payment}/ {opt.freq === 'Daily' ? 'd' : 'w'}</strong></div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Main Calculator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
         
         {/* Left: Controls */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 mb-6 border-b pb-2">Structure Terms</h3>
            
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between mb-2">
                     <label className="text-sm font-bold text-slate-600">Funded Amount</label>
                     <span className="text-sm font-bold text-blue-600">${amount.toLocaleString()}</span>
                  </div>
                  <input type="range" min="5000" max="250000" step="5000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               </div>

               <div>
                  <div className="flex justify-between mb-2">
                     <label className="text-sm font-bold text-slate-600">Factor Rate</label>
                     <span className="text-sm font-bold text-blue-600">{factor.toFixed(2)}</span>
                  </div>
                  <input type="range" min="1.10" max="1.55" step="0.01" value={factor} onChange={(e) => setFactor(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-600 mb-2">Term (Months)</label>
                     <select value={term} onChange={(e) => setTerm(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg">
                        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24].map(m => <option key={m} value={m}>{m} Months</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-600 mb-2">Payment Freq</label>
                     <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setFreq('Daily')} className={`flex-1 text-xs font-bold py-1.5 rounded-md ${freq === 'Daily' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Daily</button>
                        <button onClick={() => setFreq('Weekly')} className={`flex-1 text-xs font-bold py-1.5 rounded-md ${freq === 'Weekly' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Weekly</button>
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500"/> Project ROI (Margin)</label>
                     <span className="text-sm font-bold text-emerald-600">{margin}%</span>
                  </div>
                  <input type="range" min="10" max="100" step="5" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  <p className="text-xs text-slate-400 mt-2">Adjust based on what the client earns on their inventory/project.</p>
               </div>
            </div>
         </div>

         {/* Right: Visualization & Output */}
         <div className="flex flex-col gap-6">
            
            {/* Payment Card */}
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
               <div className="grid grid-cols-2 gap-8">
                  <div>
                     <p className="text-xs text-slate-400 uppercase font-bold">Total Payback</p>
                     <p className="text-2xl font-bold">${payback.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-slate-400 uppercase font-bold">Est. Payment ({freq})</p>
                     <p className="text-3xl font-bold text-emerald-400">${Math.round(paymentAmount).toLocaleString()}</p>
                  </div>
               </div>
            </div>

            {/* ROI Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
               <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={18} /> Cost vs. Profit Analysis</h4>
               <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Legend />
                        <Bar dataKey="Principal" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Interest" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Profit" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
               
               <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex justify-between items-center">
                  <div>
                     <p className="text-xs font-bold text-emerald-800 uppercase">Net Profit After Loan</p>
                     <p className="text-xl font-bold text-emerald-600">${Math.round(netProfit).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-bold text-emerald-800 uppercase">ROI</p>
                     <p className="text-xl font-bold text-emerald-600">{roiPercent.toFixed(1)}%</p>
                  </div>
               </div>
            </div>

            <button 
               onClick={handleCreateOffer}
               className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg transition-all flex items-center justify-center gap-2"
            >
               <CheckCircle size={20} /> Create Formal Offer
            </button>
         </div>

      </div>
    </div>
  );
};

export default DealStructure;
