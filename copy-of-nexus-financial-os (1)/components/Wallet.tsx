
import React, { useState } from 'react';
import { Contact } from '../types';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, CreditCard, AlertCircle, Loader } from 'lucide-react';

interface WalletProps {
  contact: Contact;
}

const Wallet: React.FC<WalletProps> = ({ contact }) => {
  const [drawAmount, setDrawAmount] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const ledger = contact.ledger || [];
  const acceptedOffer = contact.offers?.find(o => o.status === 'Accepted');
  const totalLimit = acceptedOffer ? acceptedOffer.amount : 0;
  const currentBalance = ledger.reduce((acc, entry) => acc + entry.amount, 0);
  const available = Math.max(0, totalLimit - currentBalance);

  const handleRequestDraw = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequesting(true);
    setTimeout(() => {
      setIsRequesting(false);
      setDrawAmount('');
      alert('Draw request submitted for approval!');
    }, 1500);
  };

  if (!acceptedOffer) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
        <div className="bg-slate-200 p-4 rounded-full mb-4">
           <WalletIcon size={40} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Capital Wallet Locked</h3>
        <p className="text-slate-500 max-w-md mt-2 text-sm">
          Your wallet will activate once you have an accepted funding offer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Available Capital</p>
            <h3 className="text-3xl font-bold">${available.toLocaleString()}</h3>
            <div className="mt-4 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${(available/totalLimit)*100}%` }}></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">of ${totalLimit.toLocaleString()} limit</p>
          </div>
          <WalletIcon className="absolute right-4 bottom-4 text-slate-800 opacity-50" size={100} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Outstanding Balance</p>
            <h3 className="text-2xl font-bold text-slate-900">${currentBalance.toLocaleString()}</h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
            <AlertCircle size={14} className="text-blue-500" /> 
            {currentBalance > 0 ? 'Payment due on 1st of month' : 'No balance due'}
          </div>
        </div>

        <div className="bg-blue-600 rounded-xl p-6 text-white shadow-md flex flex-col justify-center">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wide opacity-90">Request Funds</h3>
          <form onSubmit={handleRequestDraw} className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200">$</span>
              <input 
                type="number" 
                value={drawAmount}
                onChange={(e) => setDrawAmount(e.target.value)}
                placeholder="Amount"
                className="w-full bg-blue-700 border border-blue-500 rounded-lg py-2 pl-8 pr-3 text-sm text-white placeholder-blue-300 focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <button 
              disabled={isRequesting || !drawAmount || Number(drawAmount) > available}
              className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
            >
              {isRequesting ? <Loader size={16} className="animate-spin" /> : 'Initiate Draw'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <History size={18} className="text-slate-500" /> Transaction History
          </h3>
          <button className="text-blue-600 text-xs font-bold hover:underline">Download CSV</button>
        </div>
        
        {ledger.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No transactions found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ledger.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.amount < 0 ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {tx.amount < 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{tx.description}</p>
                    <p className="text-xs text-slate-500">{tx.date} • {tx.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString()}
                  </p>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
