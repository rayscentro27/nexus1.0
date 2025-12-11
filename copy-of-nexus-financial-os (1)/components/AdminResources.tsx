
import React, { useState } from 'react';
import { ExternalLink, CreditCard, Landmark, Search, FileText, Shield, Briefcase, Hash, Video, PlayCircle, Sparkles, Youtube, ArrowRight, Loader, Calculator, Percent, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import * as geminiService from '../services/geminiService';

const AdminResources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tools' | 'calculators'>('tools');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoNotes, setVideoNotes] = useState('');
  const [generatedStrategy, setGeneratedStrategy] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- CALCULATOR STATES ---
  // MCA Calc
  const [mcaAmount, setMcaAmount] = useState(50000);
  const [mcaFactor, setMcaFactor] = useState(1.35);
  const [mcaTerm, setMcaTerm] = useState(9); // Months
  const [mcaFees, setMcaFees] = useState(500); // Admin/Origination fees

  // Stacking Calc
  const [stackRevenue, setStackRevenue] = useState(100000);
  const [positions, setPositions] = useState<{lender: string, daily: number}[]>([{ lender: 'Existing 1st Pos', daily: 250 }]);
  
  // --- CALCULATOR LOGIC ---
  const calculateMCA = () => {
    const payback = mcaAmount * mcaFactor;
    const totalCost = payback + mcaFees;
    const businessDays = mcaTerm * 21; // Approx 21 days/mo
    const dailyPayment = payback / businessDays;
    const interestCost = totalCost - mcaAmount;
    // Rough APR estimation: (Interest / Principal) / (Years)
    const years = businessDays / 252; // 252 trading days usually used or 365 calendar. using business days relative.
    const annualizedRate = (interestCost / mcaAmount) / (mcaTerm / 12); 
    const apr = annualizedRate * 100;
    
    return { payback, dailyPayment, apr, totalCost };
  };

  const mcaResults = calculateMCA();

  const calculateStacking = () => {
    const totalDailyDebt = positions.reduce((sum, p) => sum + p.daily, 0);
    // Assuming 21 business days
    const monthlyDebt = totalDailyDebt * 21;
    const capacity = stackRevenue * 0.15; // Max 15% of gross revenue for debt service
    const remainingMonthly = capacity - monthlyDebt;
    const remainingDaily = remainingMonthly / 21;
    const utilization = (monthlyDebt / capacity) * 100;

    return { totalDailyDebt, monthlyDebt, remainingDaily, utilization, capacity };
  };

  const stackResults = calculateStacking();

  const addPosition = () => {
    setPositions([...positions, { lender: 'New Position', daily: 0 }]);
  };

  const updatePosition = (index: number, field: 'lender' | 'daily', value: any) => {
    const newPos = [...positions];
    // @ts-ignore
    newPos[index][field] = value;
    setPositions(newPos);
  };

  const removePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index));
  };

  const tools = [
    {
      id: 'hmbc',
      title: 'Credit Card Matcher',
      description: 'Access the Help Me Build Credit database to find the best personal and business cards for clients based on credit profiles.',
      url: 'https://helpmebuildcredit.com/user-cc-results/#',
      icon: <CreditCard className="text-blue-600" size={32} />,
      color: 'bg-blue-50 border-blue-200',
      btnColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'acr',
      title: 'Official Credit Reports',
      description: 'The only source for free credit reports authorized by federal law. Weekly access to Equifax, Experian, and TransUnion.',
      url: 'https://www.annualcreditreport.com',
      icon: <FileText className="text-cyan-600" size={32} />,
      color: 'bg-cyan-50 border-cyan-200',
      btnColor: 'bg-cyan-600 hover:bg-cyan-700'
    },
    {
      id: 'dnb',
      title: 'D-U-N-S Number Search',
      description: 'OFFICIAL LOOKUP: Use this tool to verify D-U-N-S existence. INSTRUCTIONS: 1. Search by legal name. 2. If missing, select "Get a D-U-N-S Number". 3. Choose the "Free" option (up to 30 days) and avoid paid expedited upsells unless urgent.',
      url: 'https://www.dnb.com/duns-number/lookup.html',
      icon: <Hash className="text-indigo-600" size={32} />,
      color: 'bg-indigo-50 border-indigo-200',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      id: 'sos',
      title: 'Secretary of State Search',
      description: 'Quick lookup for business entity registration details across all 50 states to verify client LLC age and standing.',
      url: '#',
      icon: <Search className="text-emerald-600" size={32} />,
      color: 'bg-emerald-50 border-emerald-200',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      id: 'sba',
      title: 'SBA Size Standards',
      description: 'Official SBA size standards tool to determine if a business qualifies as small for government contracting.',
      url: 'https://www.sba.gov/size-standards',
      icon: <Landmark className="text-purple-600" size={32} />,
      color: 'bg-purple-50 border-purple-200',
      btnColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'nav',
      title: 'NAV Business Login',
      description: 'Direct access to NAV portal to check business credit scores (D&B, Experian, Equifax) for clients.',
      url: 'https://app.nav.com/login',
      icon: <Shield className="text-orange-600" size={32} />,
      color: 'bg-orange-50 border-orange-200',
      btnColor: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  const trainingVideos = [
    {
      id: 'vid_masterclass',
      title: 'Business Credit Masterclass 2024',
      description: 'Step-by-step guide on building corporate credit profiles from scratch.',
      url: 'https://www.youtube.com/watch?v=1C9o_7xSY-Q'
    },
    {
      id: 'vid_fast_build',
      title: 'Build Business Credit Fast',
      description: 'Beginner strategies to accelerate the credit building timeline.',
      url: 'https://www.youtube.com/watch?v=yxpvRRnXVnI'
    },
    {
      id: 'vid_101',
      title: 'Business Credit 101',
      description: 'Foundational knowledge for structuring and funding.',
      url: 'https://www.youtube.com/watch?v=MlFRKi8tpU4'
    }
  ];

  const handleGenerateStrategy = async () => {
    if (!videoTitle) return;
    setIsGenerating(true);
    const strategy = await geminiService.generateStrategyFromContent(videoTitle, videoNotes);
    setGeneratedStrategy(strategy);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Resources & Toolkit</h1>
            <p className="text-slate-500 mt-2">External tools, internal calculators, and training.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('tools')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'tools' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
                External Tools
            </button>
            <button 
                onClick={() => setActiveTab('calculators')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'calculators' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
                Calculators
            </button>
        </div>
      </div>

      {activeTab === 'calculators' && (
        <div className="space-y-8 animate-fade-in">
            {/* MCA CALCULATOR */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Calculator size={24} className="text-emerald-400" /> MCA Reverse Calculator</h2>
                    <p className="text-sm text-slate-400">Convert Factor Rates to APR</p>
                </div>
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Funding Amount</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="number" value={mcaAmount} onChange={(e) => setMcaAmount(Number(e.target.value))} className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Factor Rate</label>
                                <input type="number" step="0.01" value={mcaFactor} onChange={(e) => setMcaFactor(Number(e.target.value))} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Term (Months)</label>
                                <input type="number" value={mcaTerm} onChange={(e) => setMcaTerm(Number(e.target.value))} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Origination Fees</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="number" value={mcaFees} onChange={(e) => setMcaFees(Number(e.target.value))} className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Total Payback</p>
                                <p className="text-2xl font-bold text-slate-900">${mcaResults.payback.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Daily Payment</p>
                                <p className="text-2xl font-bold text-blue-600">${Math.round(mcaResults.dailyPayment).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-slate-200">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Estimated APR</p>
                                    <p className="text-4xl font-black text-slate-900">{mcaResults.apr.toFixed(1)}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Cost of Capital</p>
                                    <p className="text-xl font-bold text-red-500">+${(mcaResults.totalCost - mcaAmount).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STACKING CALCULATOR */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Activity size={24} className="text-blue-400" /> Deal Stacking & Affordability</h2>
                    <p className="text-sm text-slate-400">Check DSCR & Position Capacity</p>
                </div>
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Inputs */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Monthly Gross Revenue</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="number" value={stackRevenue} onChange={(e) => setStackRevenue(Number(e.target.value))} className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-lg font-bold text-lg" />
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-slate-700">Current Positions</label>
                                <button onClick={addPosition} className="text-xs text-blue-600 font-bold hover:underline">+ Add Position</button>
                            </div>
                            <div className="space-y-3">
                                {positions.map((pos, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input type="text" value={pos.lender} onChange={(e) => updatePosition(idx, 'lender', e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" placeholder="Lender Name" />
                                        <input type="number" value={pos.daily} onChange={(e) => updatePosition(idx, 'daily', Number(e.target.value))} className="w-24 p-2 border rounded-lg text-sm" placeholder="Daily $" />
                                        <button onClick={() => removePosition(idx)} className="p-2 text-slate-400 hover:text-red-500"><AlertTriangle size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Gauge */}
                    <div className="lg:col-span-2 bg-slate-50 p-8 rounded-xl border border-slate-200 flex flex-col justify-center">
                        <h4 className="text-center font-bold text-slate-700 mb-6 uppercase tracking-wider text-sm">Debt Service Capacity (Max 15% of Gross)</h4>
                        
                        <div className="w-full h-8 bg-slate-200 rounded-full overflow-hidden mb-2 relative">
                            <div 
                                className={`h-full transition-all duration-1000 ${stackResults.utilization > 100 ? 'bg-red-500' : stackResults.utilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min(stackResults.utilization, 100)}%` }}
                            ></div>
                            {/* Marker for current usage */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-white mix-blend-overlay" style={{ left: `${Math.min(stackResults.utilization, 100)}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-8">
                            <span>0%</span>
                            <span>Safe (50%)</span>
                            <span>Max (100%)</span>
                        </div>

                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-xs text-slate-400 uppercase font-bold">Total Daily Debt</p>
                                <p className="text-xl font-black text-slate-800">${stackResults.totalDailyDebt.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-xs text-slate-400 uppercase font-bold">Max Capacity</p>
                                <p className="text-xl font-black text-slate-800">${(stackResults.capacity / 21).toFixed(0)}/day</p>
                            </div>
                            <div className={`p-4 rounded-lg shadow-sm ${stackResults.remainingDaily > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                                <p className={`text-xs uppercase font-bold ${stackResults.remainingDaily > 0 ? 'text-emerald-600' : 'text-red-600'}`}>Remaining Space</p>
                                <p className={`text-xl font-black ${stackResults.remainingDaily > 0 ? 'text-emerald-700' : 'text-red-700'}`}>${Math.max(0, Math.round(stackResults.remainingDaily)).toLocaleString()}/day</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <>
          {/* AI CONTENT ANALYZER (New Feature) */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Youtube size={150} />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-yellow-300" />
                  <h2 className="text-xl font-bold">AI Content Intelligence</h2>
                </div>
                <p className="text-indigo-100 mb-6 leading-relaxed">
                  Found a great YouTube channel or video? Enter the details here, and Gemini will automatically extract actionable checklist items to add to your client roadmaps.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-indigo-200 uppercase mb-1 block">Video / Channel Topic</label>
                    <input 
                      type="text" 
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g., 'How to get a Paydex 80 in 30 days'"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-indigo-300/50 focus:outline-none focus:bg-white/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-indigo-200 uppercase mb-1 block">Video URL (Optional)</label>
                    <input 
                      type="text" 
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-indigo-300/50 focus:outline-none focus:bg-white/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-indigo-200 uppercase mb-1 block">Context / Key Points</label>
                    <textarea 
                      value={videoNotes}
                      onChange={(e) => setVideoNotes(e.target.value)}
                      placeholder="Briefly describe what the video is about so the AI can extract specific steps..."
                      rows={2}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-indigo-300/50 focus:outline-none focus:bg-white/20 resize-none"
                    />
                  </div>
                  <button 
                    onClick={handleGenerateStrategy}
                    disabled={isGenerating || !videoTitle}
                    className="bg-white text-indigo-600 font-bold py-2 px-6 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGenerating ? <Loader className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {isGenerating ? 'Analyzing...' : 'Generate Checklist Tasks'}
                  </button>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/10 flex flex-col">
                <h3 className="text-sm font-bold text-indigo-100 uppercase mb-4 flex items-center gap-2">
                  <Youtube size={16} /> Generated Strategy
                </h3>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-lg p-4 font-mono text-sm leading-relaxed text-indigo-50 min-h-[200px]">
                  {generatedStrategy ? (
                    <div className="whitespace-pre-line">{generatedStrategy}</div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-indigo-300/50 text-center">
                      <ArrowRight size={24} className="mb-2 opacity-50" />
                      <p>Enter video details on the left<br/>to generate actionable tasks.</p>
                    </div>
                  )}
                </div>
                {generatedStrategy && (
                   <div className="mt-4 pt-4 border-t border-white/10 text-xs text-center text-indigo-200">
                     Copy these tasks to your CRM Checklist
                   </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <div key={tool.id} className={`p-6 rounded-xl border ${tool.color} bg-white shadow-sm transition-all hover:shadow-md flex flex-col`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                    {tool.icon}
                  </div>
                  <ExternalLink className="text-slate-400" size={20} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">{tool.title}</h3>
                <p className="text-slate-600 mb-6 flex-1 leading-relaxed">
                  {tool.description}
                </p>

                <a 
                  href={tool.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-colors shadow-sm ${tool.btnColor}`}
                >
                  Launch Tool <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>

          {/* Internal Reference Section */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cheat Sheets */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="text-slate-600" size={24} />
                Internal Cheat Sheets
              </h2>
              
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-full">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-800">Funding Tier Requirements</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">1</span>
                      Tier 1 (Vendor)
                    </h4>
                    <ul className="space-y-2 text-slate-600 list-disc pl-4">
                      <li>3-5 Net 30 Accounts</li>
                      <li>$50 min purchase per account</li>
                      <li>Pay 5 days early</li>
                      <li>Wait 30-45 days for reporting</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">2</span>
                      Tier 2 (Revolving)
                    </h4>
                    <ul className="space-y-2 text-slate-600 list-disc pl-4">
                      <li>Paydex Score 80+ Required</li>
                      <li>Store Cards (Staples, Amazon)</li>
                      <li>Fleet Cards (Wex, Shell)</li>
                      <li>Min 3 accounts needed</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">3</span>
                      Tier 3 (Cash/Bank)
                    </h4>
                    <ul className="space-y-2 text-slate-600 list-disc pl-4">
                      <li>2 Years in Business (Preferred)</li>
                      <li>$10k+ Monthly Revenue</li>
                      <li>10-14 Tradelines reporting</li>
                      <li>700+ Personal Guarantor Score</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Library */}
            <div className="lg:col-span-1">
               <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Video className="text-slate-600" size={24} />
                Training & Strategy
              </h2>
              <div className="space-y-4">
                {trainingVideos.map((video) => (
                  <div key={video.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex gap-4 items-start">
                     <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <PlayCircle size={28} className="text-red-500"/>
                     </div>
                     <div>
                       <h3 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{video.title}</h3>
                       <p className="text-xs text-slate-500 mb-2 leading-relaxed line-clamp-2">{video.description}</p>
                       <a 
                         href={video.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                       >
                         Watch Video <ExternalLink size={10} />
                       </a>
                     </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default AdminResources;
