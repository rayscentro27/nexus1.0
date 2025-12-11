
import React, { useState } from 'react';
import { Contact, LedgerEntry } from '../types';
import { Plus, Activity } from 'lucide-react';

interface LedgerManagerProps {
  contact: Contact;
  onUpdateContact?: (contact: Contact) => void;
}

const LedgerManager: React.FC<LedgerManagerProps> = ({ contact, onUpdateContact }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<LedgerEntry['type']>('Repayment');
  const [description, setDescription] = useState('');

  // Calculate Balance
  const ledger = contact.ledger || [];
  const totalFunded = ledger
    .filter(e => e.type === 'Funding' || e.type === 'Draw')
    .reduce((acc, e) => acc + e.amount, 0);
  
  const totalRepaid = ledger
    .filter(e => e.type === 'Repayment')
    .reduce((acc, e) => acc + Math.abs(e.amount), 0);

  const outstandingBalance = ledger.reduce((acc, e) => acc + e.amount, 0);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateContact || !amount) return;

    const val = parseFloat(amount);
    // Repayments reduce balance (Negative impact on debt), others increase
    const finalAmount = type === 'Repayment' ? -Math.abs(val) : Math.abs(val);

    const newEntry: LedgerEntry = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type,
      amount: finalAmount,
      description: description || type,
      status: 'Posted'
    };

    const updatedLedger = [newEntry, ...ledger];
    
    const newActivity = {
      id: `sys_led_${Date.now()}`,
      type: 'system' as const,
      description: `Ledger Update: ${type} of $${val.toLocaleString()} recorded.`,
      date: new Date().toLocaleString(),
      user: 'Admin'
    };

    onUpdateContact({
      ...contact,
      ledger: updatedLedger,
      activities: [...(contact.activities || []), newActivity]
    });

    setAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Outstanding Balance</p>
          <h3 className="text-2xl font-bold mt-1">${outstandingBalance.toLocaleString()}</h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Funded</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">${totalFunded.toLocaleString()}</h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Repaid</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">${totalRepaid.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Activity size={16} /> Post Transaction
        </h4>
        <form onSubmit={handleAddTransaction} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Repayment</option>
              <option>Draw</option>
              <option>Funding</option>
              <option>Interest</option>
              <option>Fee</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex-[2]">
            <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Monthly Payment - Wire"
            />
          </div>
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <Plus size={16} /> Post
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-bold">Date</th>
              <th className="px-6 py-3 font-bold">Description</th>
              <th className="px-6 py-3 font-bold">Type</th>
              <th className="px-6 py-3 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ledger.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  No transactions recorded.
                </td>
              </tr>
            ) : (
              ledger.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-slate-600 font-mono text-xs">{entry.date}</td>
                  <td className="px-6 py-3 text-slate-800 font-medium">{entry.description}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      entry.type === 'Repayment' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      entry.type === 'Draw' || entry.type === 'Funding' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className={`px-6 py-3 text-right font-bold ${entry.amount < 0 ? 'text-blue-600' : 'text-slate-900'}`}>
                    {entry.amount < 0 ? '-' : '+'}${Math.abs(entry.amount).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerManager;
