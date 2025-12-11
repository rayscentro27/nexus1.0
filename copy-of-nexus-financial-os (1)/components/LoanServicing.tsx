
import React, { useState } from 'react';
import { ActiveLoan } from '../types';
import { Briefcase, AlertCircle, CheckCircle, Clock, DollarSign, Calendar, Send, Calculator, Download, FileText, RefreshCw, Smartphone } from 'lucide-react';
import * as geminiService from '../services/geminiService';

// Mock Loans
const MOCK_LOANS: ActiveLoan[] = [
  {
    id: 'loan_1',
    contactId: '1',
    contactName: 'TechCorp Solutions',
    principal: 50000,
    paybackAmount: 65000,
    balance: 42000,
    termMonths: 12,
    startDate: '2023-10-01',
    paymentFrequency: 'Daily',
    paymentAmount: 250,
    status: 'Current',
    missedPayments: 0,
    payments: []
  },
  {
    id: 'loan_2',
    contactId: '2',
    contactName: 'BuildIt Construction',
    principal: 100000,
    paybackAmount: 135000,
    balance: 110000,
    termMonths: 18,
    startDate: '2023-09-15',
    paymentFrequency: 'Weekly',
    paymentAmount: 1800,
    status: 'Late',
    missedPayments: 2,
    payments: []
  }
];

const LoanServicing: React.FC = () => {
  const [loans, setLoans] = useState<ActiveLoan[]>(MOCK_LOANS);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'collections' | 'calculator'>('portfolio');
  const [payoffDate, setPayoffDate] = useState(new Date().toISOString().split('T')[0]);
  const [collectionDraft, setCollectionDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Stats
  const totalOutstanding = loans.reduce((acc, l) => acc + l.balance, 0);
  const totalPrincipal = loans.reduce((acc, l) => acc + l.principal, 0);
  const portfolioYield = ((loans.reduce((acc, l) => acc + l.paybackAmount, 0) - totalPrincipal) / totalPrincipal) * 100;
  const atRiskLoans = loans.filter(l => l.status === 'Late' || l.status === 'Default');

  const handleGenerateScript = async (loan: ActiveLoan) => {
    setIsGenerating(true);
    const draft = await geminiService.generateCollectionsMessage(loan.contactName, loan.missedPayments * 7, loan.paymentAmount * loan.missedPayments);
    setCollectionDraft(draft);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Briefcase className="text-blue-600" size={32} /> Loan Servicing
          </h1>
          <p className="text-slate-500 mt-2">Manage portfolio performance, payments, and collections.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
           <button onClick={() => setActiveTab('portfolio')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'portfolio' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Portfolio</button>
           <button onClick={() => setActiveTab('collections')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'collections' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}>Collections Queue</button>
           <button onClick={() => setActiveTab('calculator')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'calculator' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Payoff Calc</button>
        </div>
      </div>

      {activeTab === 'portfolio' && (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-xs text-slate-400 uppercase font-bold">Total Outstanding</p>
                    <h3 className="text-3xl font-bold mt-1">${totalOutstanding.toLocaleString()}</h3>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-bold">Portfolio Yield</p>
                    <h3 className="text-3xl font-bold text-emerald-600 mt-1">{portfolioYield.toFixed(1)}%</h3>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-bold">Active Loans</p>
                    <h3 className="text-3xl font-bold text-blue-600 mt-1">{loans.length}</h3>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-bold">Default Rate</p>
                    <h3 className="text-3xl font-bold text-red-600 mt-1">
                        {((atRiskLoans.length / loans.length) * 100).toFixed(1)}%
                    </h3>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50 font-bold text-slate-800">Active Loan Tape</div>
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Borrower</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4">Progress</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loans.map(loan => {
                            const progress = ((loan.paybackAmount - loan.balance) / loan.paybackAmount) * 100;
                            return (
                                <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{loan.contactName}</td>
                                    <td className="px-6 py-4 font-mono text-slate-700">${loan.balance.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">${loan.paymentAmount} / {loan.paymentFrequency}</td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                                            <div className={`h-full ${progress > 50 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${progress}%`}}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${loan.status === 'Current' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                {atRiskLoans.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
                        <CheckCircle size={48} className="mx-auto mb-4 text-emerald-200" />
                        <p>No loans currently at risk.</p>
                    </div>
                ) : (
                    atRiskLoans.map(loan => (
                        <div key={loan.id} className="bg-white p-6 rounded-xl border border-red-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-900">{loan.contactName}</h4>
                                    <p className="text-red-600 text-sm font-medium">{loan.missedPayments} Missed Payments</p>
                                </div>
                                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">PAST DUE</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Amount Due</p>
                                    <p className="text-xl font-bold text-slate-800">${(loan.missedPayments * loan.paymentAmount).toLocaleString()}</p>
                                </div>
                                <button 
                                    onClick={() => handleGenerateScript(loan)}
                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 flex items-center gap-2"
                                >
                                    <Smartphone size={14} /> Contact
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <RefreshCw size={18} className="text-blue-500" /> Collections Assistant
                </h3>
                {isGenerating ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <RefreshCw className="animate-spin mr-2" /> Drafting notice...
                    </div>
                ) : collectionDraft ? (
                    <div className="flex-1 flex flex-col">
                        <textarea 
                            className="flex-1 p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 resize-none outline-none mb-4"
                            value={collectionDraft}
                            onChange={(e) => setCollectionDraft(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded-lg font-bold text-sm hover:bg-slate-50">Copy</button>
                            <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Send size={14} /> Send SMS/Email
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center">
                        <AlertCircle size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">Select an at-risk loan to generate a collection script.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Calculator size={24} className="text-blue-600"/> Payoff Letter Generator</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Loan</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                        {loans.map(l => <option key={l.id} value={l.id}>{l.contactName}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payoff Date</label>
                    <input 
                        type="date" 
                        value={payoffDate}
                        onChange={(e) => setPayoffDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Current Balance</span>
                    <span className="font-bold">$42,000.00</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Interest Rebate (Early Payoff)</span>
                    <span className="font-bold text-emerald-600">-$4,500.00</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-200">
                    <span className="text-lg font-bold text-slate-900">Net Payoff Amount</span>
                    <span className="text-lg font-bold text-blue-600">$37,500.00</span>
                </div>
            </div>

            <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2">
                <FileText size={18} /> Generate Official PDF
            </button>
        </div>
      )}

    </div>
  );
};

export default LoanServicing;
