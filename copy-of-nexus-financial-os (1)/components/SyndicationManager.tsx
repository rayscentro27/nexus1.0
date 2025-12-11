
import React, { useState } from 'react';
import { Contact, Investor, Syndication } from '../types';
import { PieChart, Users, DollarSign, Briefcase, Plus, CheckCircle, Mail, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface SyndicationManagerProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
}

const SyndicationManager: React.FC<SyndicationManagerProps> = ({ contacts, onUpdateContact }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'investors' | 'deals'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');

  // Mock Investors
  const [investors, setInvestors] = useState<Investor[]>([
    { id: 'inv_1', name: 'Eagle Capital', email: 'partners@eagle.com', totalCommitted: 1000000, totalDeployed: 450000, activeDeals: 12, status: 'Active' },
    { id: 'inv_2', name: 'Private Wealth Group', email: 'invest@pwg.com', totalCommitted: 500000, totalDeployed: 120000, activeDeals: 4, status: 'Active' }
  ]);

  // Filter contacts for closed deals that need syndication
  const closedDeals = contacts.filter(c => c.status === 'Closed' && c.value > 0);

  const handleGenerateReport = async (investor: Investor) => {
    setIsGenerating(true);
    const draft = await geminiService.generateInvestorReport(investor, []);
    setEmailDraft(draft);
    setIsGenerating(false);
  };

  const handleAddInvestor = () => {
    const name = prompt("Investor Name:");
    if (name) {
        setInvestors([...investors, {
            id: `inv_${Date.now()}`,
            name,
            email: '',
            totalCommitted: 0,
            totalDeployed: 0,
            activeDeals: 0,
            status: 'Active'
        }]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <PieChart className="text-blue-600" size={32} /> Syndication & Investors
          </h1>
          <p className="text-slate-500 mt-2">Manage capital partners, syndication splits, and payouts.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Overview</button>
            <button onClick={() => setActiveTab('investors')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'investors' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Investors</button>
            <button onClick={() => setActiveTab('deals')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'deals' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Deal Participation</button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total AUM</p>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20}/></div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900">$1.5M</h3>
                <p className="text-xs text-slate-500 mt-1">Committed Capital</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Deployed</p>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20}/></div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900">$570k</h3>
                <p className="text-xs text-slate-500 mt-1">38% Utilization</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Active Investors</p>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={20}/></div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900">{investors.length}</h3>
                <p className="text-xs text-slate-500 mt-1">Partners</p>
            </div>
        </div>
      )}

      {activeTab === 'investors' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Investor Directory</h3>
                <button onClick={handleAddInvestor} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700"><Plus size={16} /> Add Investor</button>
            </div>
            <div className="flex-1 flex overflow-hidden">
                <div className="w-1/3 border-r border-slate-100 overflow-y-auto">
                    {investors.map(inv => (
                        <div key={inv.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer group">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-800">{inv.name}</h4>
                                <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full uppercase">{inv.status}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{inv.email}</p>
                            <div className="mt-2 text-xs flex justify-between">
                                <span className="text-slate-400">Committed: <strong>${inv.totalCommitted.toLocaleString()}</strong></span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
                    {investors.length > 0 ? (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{investors[0].name}</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Total Deployed</p>
                                        <p className="text-2xl font-bold text-blue-600">${investors[0].totalDeployed.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Active Deals</p>
                                        <p className="text-2xl font-bold text-slate-800">{investors[0].activeDeals}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleGenerateReport(investors[0])}
                                    disabled={isGenerating}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                    Generate AI Performance Report
                                </button>
                            </div>
                            
                            {emailDraft && (
                                <div className="bg-white p-6 rounded-xl border border-slate-200 animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2"><Mail size={18} className="text-slate-400"/> Draft Email</h4>
                                        <button className="text-xs text-blue-600 font-bold hover:underline" onClick={() => setEmailDraft('')}>Clear</button>
                                    </div>
                                    <textarea 
                                        className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-600 resize-none outline-none"
                                        value={emailDraft}
                                        readOnly
                                    />
                                    <button className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800">Send Update</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">Select an investor</div>
                    )}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'deals' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">Closed Deals (Syndication Opportunities)</h3>
            </div>
            <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                        <th className="px-6 py-4">Deal / Merchant</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">House Share</th>
                        <th className="px-6 py-4">Syndicated</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {closedDeals.map(deal => (
                        <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <p className="font-bold text-slate-900">{deal.company}</p>
                                <p className="text-xs text-slate-500">{deal.name}</p>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-700">${deal.value.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">100%</span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 italic">None</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-xs font-bold text-blue-600 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-50">Syndicate</button>
                            </td>
                        </tr>
                    ))}
                    {closedDeals.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">No closed deals available for syndication.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      )}

    </div>
  );
};

export default SyndicationManager;
