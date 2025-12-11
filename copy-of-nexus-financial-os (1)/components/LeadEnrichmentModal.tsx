
import React, { useState } from 'react';
import { Search, Globe, Building2, User, Phone, DollarSign, Newspaper, CheckCircle, ArrowRight, Loader, Sparkles, ExternalLink, X } from 'lucide-react';
import { EnrichedData, Contact } from '../types';
import * as geminiService from '../services/geminiService';

interface LeadEnrichmentModalProps {
  onClose: () => void;
  onCreateLead: (lead: Partial<Contact>) => void;
  existingName?: string;
}

const LeadEnrichmentModal: React.FC<LeadEnrichmentModalProps> = ({ onClose, onCreateLead, existingName = '' }) => {
  const [companyName, setCompanyName] = useState(existingName);
  const [website, setWebsite] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<EnrichedData | null>(null);

  const handleScan = async () => {
    if (!companyName) return;
    setIsScanning(true);
    setResult(null);
    try {
      const data = await geminiService.enrichLeadData(companyName, website);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    
    const newLead: Partial<Contact> = {
      name: result.ceo || 'Unknown Contact', // Best guess for contact person
      company: result.company || companyName,
      email: '', // Search rarely returns direct emails for privacy, leave blank
      phone: result.phone || '',
      status: 'Lead',
      lastContact: 'Just now',
      notes: `AI Enriched Lead.\n\nDescription: ${result.description}\n\nIcebreakers:\n${result.icebreakers.map(i => `- ${i}`).join('\n')}`,
      value: 0, // Admin sets this later
      source: 'AI Enrichment',
      businessProfile: {
        legalName: result.company,
        address: result.address || '',
        industry: result.industry || '',
        website: website,
        riskLevel: 'Low',
        taxId: '',
        structure: 'LLC',
        ownershipPercentage: 100,
        establishedDate: '',
        city: '',
        state: '',
        zip: ''
      }
    };
    
    onCreateLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-4xl rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 md:p-6 flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/30">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">AI Lead Enrichment</h2>
              <p className="text-indigo-200 text-xs">Real-time web scraping & data consolidation.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Panel: Search */}
          <div className={`w-full md:w-1/3 bg-slate-50 p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col flex-shrink-0 ${result ? 'hidden md:flex' : 'flex'}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Tesla, Inc."
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website (Optional)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. tesla.com"
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  />
                </div>
              </div>
              <button 
                onClick={handleScan}
                disabled={isScanning || !companyName}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isScanning ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
                {isScanning ? 'Scanning Web...' : 'Find Data'}
              </button>
            </div>

            {isScanning && (
              <div className="mt-8 text-center">
                <div className="inline-block relative w-16 h-16">
                   <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-xs text-slate-500 mt-4 animate-pulse">Searching news, revenue, and execs...</p>
              </div>
            )}
          </div>

          {/* Right Panel: Results */}
          <div className={`w-full md:w-2/3 p-4 md:p-6 overflow-y-auto bg-white ${!result && !isScanning ? 'hidden md:block' : 'block'}`}>
            {!result && !isScanning && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <Globe size={64} className="mb-4" />
                <p>Enter a company to uncover details.</p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Mobile Back to Search Trigger */}
                <button onClick={() => setResult(null)} className="md:hidden text-xs text-indigo-600 font-bold mb-2 flex items-center gap-1">
                   ← New Search
                </button>

                {/* Identity Card */}
                <div className="flex justify-between items-start">
                   <div>
                     <h3 className="text-2xl font-bold text-slate-900">{result.company}</h3>
                     <p className="text-sm text-slate-500 mt-1 max-w-md">{result.description}</p>
                   </div>
                   {website && <a href={`https://${website}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs flex items-center gap-1"><ExternalLink size={12}/> <span className="hidden sm:inline">Visit Site</span></a>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-2"><User size={14}/> CEO / Owner</div>
                      <div className="font-bold text-slate-800">{result.ceo || 'Not found'}</div>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-2"><DollarSign size={14}/> Est. Revenue</div>
                      <div className="font-bold text-emerald-600">{result.revenue || 'Unknown'}</div>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-2"><Building2 size={14}/> Industry</div>
                      <div className="font-bold text-slate-800">{result.industry || 'Unknown'}</div>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-2"><Phone size={14}/> Phone / HQ</div>
                      <div className="font-bold text-slate-800 text-sm truncate">{result.phone || result.address}</div>
                   </div>
                </div>

                {/* News / Icebreakers */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Newspaper size={18} className="text-indigo-500" /> Recent News (Icebreakers)
                  </h4>
                  {result.icebreakers.length > 0 ? (
                    <div className="space-y-2">
                      {result.icebreakers.map((news, idx) => (
                        <div key={idx} className="flex gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                           <div className="mt-1"><CheckCircle size={14} className="text-indigo-600" /></div>
                           <p className="text-sm text-slate-700">{news}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No recent news found.</p>
                  )}
                </div>

                {/* Sources Footer */}
                {result.sources.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((src, idx) => (
                        <a key={idx} href={src.url} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 truncate max-w-[150px]">
                          {src.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0 pb-8 md:pb-4">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-colors">Cancel</button>
          <button 
            onClick={handleConfirm}
            disabled={!result}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex items-center gap-2 transition-transform hover:scale-105"
          >
            Create Lead <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default LeadEnrichmentModal;
