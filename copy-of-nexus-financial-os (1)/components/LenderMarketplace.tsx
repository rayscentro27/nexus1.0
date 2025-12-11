
import React, { useState, useRef } from 'react';
import { Lender } from '../types';
import { Building2, Search, Upload, RefreshCw, FileText, CheckCircle, XCircle, AlertTriangle, Briefcase, DollarSign, Calendar, Sliders } from 'lucide-react';
import * as geminiService from '../services/geminiService';

const MOCK_LENDERS: Lender[] = [
  {
    id: 'l_bluevine',
    name: 'Bluevine',
    logo: '🟦',
    type: 'Fintech',
    minScore: 625,
    minRevenue: 10000,
    minTimeInBusinessMonths: 6,
    maxAmount: 250000,
    description: 'Fast LOC. Requires 3 months bank statements.',
    applicationLink: 'https://www.bluevine.com',
    matchCriteria: { restrictedIndustries: ['Cannabis', 'Adult'], maxTermMonths: 12, minAvgDailyBalance: 1000, maxNSFs: 3, requiresCollateral: false }
  },
  {
    id: 'l_chase',
    name: 'Chase Ink',
    logo: '🏦',
    type: 'Bank',
    minScore: 700,
    minRevenue: 0,
    minTimeInBusinessMonths: 0,
    maxAmount: 100000,
    description: 'Tier 1 Business Card. Hard pull on Experian.',
    applicationLink: 'https://creditcards.chase.com/business',
    matchCriteria: { restrictedIndustries: [], maxTermMonths: 0, minAvgDailyBalance: 0, maxNSFs: 0, requiresCollateral: false }
  },
  {
    id: 'l_premier',
    name: 'Premier Brokerage',
    logo: '🏢',
    type: 'Fintech',
    minScore: 680,
    minRevenue: 20000,
    minTimeInBusinessMonths: 12,
    maxAmount: 100000,
    description: 'Offers flexible terms and fast processing.',
    applicationLink: 'https://premierbrokerage.example.com',
    matchCriteria: { 
        restrictedIndustries: ['Restaurant', 'Nightclub'], 
        maxTermMonths: 24, 
        minAvgDailyBalance: 2000, 
        maxNSFs: 2, 
        requiresCollateral: true 
    }
  }
];

const LenderMarketplace: React.FC = () => {
  const [lenders, setLenders] = useState<Lender[]>(MOCK_LENDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Lender State
  const [newLenderName, setNewLenderName] = useState('');
  const [newLenderType, setNewLenderType] = useState<Lender['type']>('Fintech');
  const [extractedCriteria, setExtractedCriteria] = useState<Partial<Lender> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    setIsAnalyzing(true);
    const file = e.target.files[0];
    
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const data = await geminiService.parseLenderGuidelines(base64);
            if (data) {
                setExtractedCriteria(data);
            }
            setIsAnalyzing(false);
            setIsUploading(false);
        };
    } catch (err) {
        console.error(err);
        setIsAnalyzing(false);
        setIsUploading(false);
    }
  };

  const handleSaveLender = () => {
    if (!newLenderName || !extractedCriteria) return;
    
    const newLender: Lender = {
        id: `l_${Date.now()}`,
        name: newLenderName,
        logo: '🏦', // Default
        type: newLenderType,
        description: 'Added via AI Rate Sheet Parser',
        applicationLink: '#',
        minScore: extractedCriteria.minScore || 600,
        minRevenue: extractedCriteria.minRevenue || 10000,
        minTimeInBusinessMonths: extractedCriteria.minTimeInBusinessMonths || 6,
        maxAmount: extractedCriteria.maxAmount || 100000,
        matchCriteria: extractedCriteria.matchCriteria,
        lastUpdated: new Date().toLocaleDateString()
    };
    
    setLenders([...lenders, newLender]);
    setShowAddModal(false);
    setNewLenderName('');
    setExtractedCriteria(null);
  };

  const filteredLenders = lenders.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-full flex flex-col animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="text-blue-600" size={32} /> Lender Marketplace
          </h1>
          <p className="text-slate-500 mt-2">Manage funding partners and automate guidelines with AI.</p>
        </div>
        <button 
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2"
        >
            <Upload size={18} /> Add Lender / Rate Sheet
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
         <input 
            type="text" 
            placeholder="Search lenders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
         />
      </div>

      {/* Lender Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredLenders.map(lender => (
             <div key={lender.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl shadow-sm border border-slate-100">
                             {lender.logo}
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-900">{lender.name}</h3>
                             <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{lender.type}</span>
                         </div>
                     </div>
                     {lender.lastUpdated && <span className="text-[10px] text-slate-400">Updated {lender.lastUpdated}</span>}
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                     <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                         <p className="text-[10px] text-slate-400 uppercase font-bold">Min Score</p>
                         <p className="font-bold text-slate-800">{lender.minScore}</p>
                     </div>
                     <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                         <p className="text-[10px] text-slate-400 uppercase font-bold">Min Rev</p>
                         <p className="font-bold text-slate-800">${(lender.minRevenue/1000).toFixed(0)}k/mo</p>
                     </div>
                     <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                         <p className="text-[10px] text-slate-400 uppercase font-bold">Max Amount</p>
                         <p className="font-bold text-emerald-600">${(lender.maxAmount/1000).toFixed(0)}k</p>
                     </div>
                     <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                         <p className="text-[10px] text-slate-400 uppercase font-bold">Max Term</p>
                         <p className="font-bold text-slate-800">{lender.matchCriteria?.maxTermMonths || 12} Mo</p>
                     </div>
                 </div>

                 {/* Restricted List */}
                 {lender.matchCriteria?.restrictedIndustries && lender.matchCriteria.restrictedIndustries.length > 0 && (
                     <div className="mb-4">
                         <p className="text-xs font-bold text-red-500 mb-1 flex items-center gap-1"><AlertTriangle size={10} /> Restricted Industries</p>
                         <div className="flex flex-wrap gap-1">
                             {lender.matchCriteria.restrictedIndustries.slice(0, 3).map((ind, i) => (
                                 <span key={i} className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100">{ind}</span>
                             ))}
                             {lender.matchCriteria.restrictedIndustries.length > 3 && <span className="text-[10px] text-slate-400">+{lender.matchCriteria.restrictedIndustries.length - 3} more</span>}
                         </div>
                     </div>
                 )}

                 <div className="pt-4 border-t border-slate-100 flex gap-2">
                     <button className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg">View Guidelines</button>
                     <button className="flex-1 py-2 text-xs font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg">Edit Criteria</button>
                 </div>
             </div>
         ))}
      </div>

      {/* Add Lender Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                      <h2 className="text-xl font-bold flex items-center gap-2"><Upload size={20} /> Import Lender Guidelines</h2>
                      <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><XCircle size={24}/></button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto">
                      <div className="mb-6 grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Lender Name</label>
                              <input 
                                type="text" 
                                value={newLenderName} 
                                onChange={e => setNewLenderName(e.target.value)} 
                                className="w-full border rounded-lg p-2" 
                                placeholder="e.g. OnDeck" 
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                              <select 
                                value={newLenderType} 
                                onChange={e => setNewLenderType(e.target.value as any)} 
                                className="w-full border rounded-lg p-2 bg-white"
                              >
                                  <option>Fintech</option>
                                  <option>Bank</option>
                                  <option>Credit Union</option>
                                  <option>SBA</option>
                              </select>
                          </div>
                      </div>

                      {/* Drop Zone */}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-8 text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                      >
                          {isAnalyzing ? (
                              <div className="flex flex-col items-center">
                                  <RefreshCw className="animate-spin text-blue-600 mb-2" size={32} />
                                  <p className="font-bold text-slate-700">AI Analyzing Guidelines...</p>
                                  <p className="text-xs text-slate-500">Extracting Min Score, Revenue, and Restricted Lists</p>
                              </div>
                          ) : (
                              <>
                                  <FileText className="text-slate-400 mx-auto mb-2" size={32} />
                                  <p className="font-bold text-slate-700">Click to Upload Rate Sheet (PDF)</p>
                                  <p className="text-xs text-slate-500">Gemini will auto-populate the underwriting criteria.</p>
                              </>
                          )}
                          <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileUpload} />
                      </div>

                      {/* Extraction Results */}
                      {extractedCriteria && (
                          <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 animate-fade-in">
                              <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><CheckCircle size={16}/> AI Extraction Successful</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div><span className="text-emerald-700 font-bold">Min Score:</span> {extractedCriteria.minScore}</div>
                                  <div><span className="text-emerald-700 font-bold">Min Revenue:</span> ${extractedCriteria.minRevenue?.toLocaleString()}</div>
                                  <div><span className="text-emerald-700 font-bold">Max Amount:</span> ${extractedCriteria.maxAmount?.toLocaleString()}</div>
                                  <div><span className="text-emerald-700 font-bold">Max Term:</span> {extractedCriteria.matchCriteria?.maxTermMonths} Mo</div>
                              </div>
                              {extractedCriteria.matchCriteria?.restrictedIndustries && (
                                  <div className="mt-3">
                                      <span className="text-emerald-700 font-bold text-xs">Restricted Industries Found:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                          {extractedCriteria.matchCriteria.restrictedIndustries.map((ind, i) => (
                                              <span key={i} className="text-[10px] bg-white border border-emerald-200 px-2 py-0.5 rounded text-emerald-800">{ind}</span>
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                      <button onClick={() => setShowAddModal(false)} className="px-6 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-200">Cancel</button>
                      <button 
                        onClick={handleSaveLender}
                        disabled={!extractedCriteria}
                        className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg"
                      >
                          Save Lender
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default LenderMarketplace;
