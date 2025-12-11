
import React, { useState } from 'react';
import { Contact, BankAccount, FinancialSpreading } from '../types';
import { Building2, ShieldCheck, Lock, Loader, CheckCircle } from 'lucide-react';

interface BankConnectProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
}

const BankConnect: React.FC<BankConnectProps> = ({ contact, onUpdateContact }) => {
  const [isLinking, setIsLinking] = useState(false);
  const [step, setStep] = useState<'intro' | 'institutions' | 'credentials' | 'syncing' | 'success'>('intro');
  const [selectedBank, setSelectedBank] = useState('');

  const banks = [{ name: 'Chase', color: 'bg-blue-600' }, { name: 'Bank of America', color: 'bg-red-600' }, { name: 'Wells Fargo', color: 'bg-yellow-600' }, { name: 'Citi', color: 'bg-blue-500' }];

  const submitCredentials = () => {
    setStep('syncing');
    setTimeout(() => {
      const newBank: BankAccount = { id: `ba_${Date.now()}`, institutionName: selectedBank, last4: '4242', status: 'Connected', lastSynced: 'Just now', balance: 24500.50 };
      const autoFinancials: FinancialSpreading = {
        lastUpdated: new Date().toISOString().split('T')[0],
        months: [
          { month: 'Nov 2023', revenue: 18500, expenses: 12000, endingBalance: 8500, nsfCount: 0, negativeDays: 0 },
          { month: 'Oct 2023', revenue: 21200, expenses: 15500, endingBalance: 11200, nsfCount: 0, negativeDays: 0 },
          { month: 'Sep 2023', revenue: 19800, expenses: 14000, endingBalance: 9100, nsfCount: 1, negativeDays: 0 }, 
        ]
      };
      const newActivity = { id: `act_bank_${Date.now()}`, type: 'system' as const, description: `Bank Connected: ${selectedBank}. Financial data auto-synced.`, date: new Date().toLocaleString(), user: 'System' };

      onUpdateContact({
        ...contact,
        connectedBanks: [...(contact.connectedBanks || []), newBank],
        financialSpreading: autoFinancials,
        activities: [...(contact.activities || []), newActivity]
      });

      setStep('success');
      setTimeout(() => setIsLinking(false), 2000);
    }, 2500);
  };

  if (contact.connectedBanks?.[0] && !isLinking) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
        <div className="flex justify-between items-start">
          <div><h3 className="font-bold text-slate-800 flex items-center gap-2"><Building2 className="text-blue-600" size={20} /> Bank Connection</h3><p className="text-sm text-slate-500 mt-1">Verified source of funds connected.</p></div>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Active</span>
        </div>
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm font-bold text-slate-700">{contact.connectedBanks[0].institutionName[0]}</div><div><p className="font-bold text-slate-900">{contact.connectedBanks[0].institutionName} ****{contact.connectedBanks[0].last4}</p><p className="text-xs text-slate-500">Synced: {contact.connectedBanks[0].lastSynced}</p></div></div>
          <div className="text-right"><p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Balance</p><p className="text-lg font-bold text-slate-900">${contact.connectedBanks[0].balance.toLocaleString()}</p></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => { setIsLinking(true); setStep('institutions'); }}>
           <div className="relative z-10">
             <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Building2 size={20} /> Connect Business Bank</h3>
             <p className="text-blue-100 text-sm mb-4 max-w-xs">Securely connect your primary business account. Allows instant underwriting.</p>
             <button className="bg-white text-blue-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors">Connect Now <ShieldCheck size={14} /></button>
           </div>
      </div>
      {isLinking && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-bold text-slate-800">Secure Link</h3><button onClick={() => setIsLinking(false)} className="text-slate-400 hover:text-slate-600">✕</button></div>
            <div className="p-6 flex-1 flex flex-col">
              {step === 'institutions' && (
                <div className="space-y-2">{banks.map(bank => (<button key={bank.name} onClick={() => { setSelectedBank(bank.name); setStep('credentials'); }} className="w-full p-3 border border-slate-200 rounded-lg flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"><div className={`w-8 h-8 rounded ${bank.color}`}></div><span className="font-medium text-slate-700">{bank.name}</span></button>))}</div>
              )}
              {step === 'credentials' && (
                <div><div className="space-y-3 mb-6"><input disabled className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" value="user_good" /><input disabled className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" type="password" value="pass_good" /></div><button onClick={submitCredentials} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-blue-700">Submit</button></div>
              )}
              {step === 'syncing' && (<div className="text-center my-auto"><Loader size={40} className="animate-spin text-blue-600 mx-auto mb-4" /><h4 className="font-bold text-slate-900">Verifying...</h4></div>)}
              {step === 'success' && (<div className="text-center my-auto animate-fade-in"><CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" /><h4 className="font-bold text-slate-900 text-lg">Success!</h4></div>)}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center"><p className="text-[10px] text-slate-400 flex items-center justify-center gap-1"><Lock size={8} /> Secured by Plaid</p></div>
          </div>
        </div>
      )}
    </>
  );
};

export default BankConnect;
