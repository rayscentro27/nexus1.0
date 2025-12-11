
import React, { useState } from 'react';
import { Contact, ComplianceRecord } from '../types';
import { ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, Lock, UserCheck, Building2, Globe, Clock, Shield } from 'lucide-react';

interface ComplianceCenterProps {
  contact: Contact;
  onUpdateContact?: (contact: Contact) => void;
}

const ComplianceCenter: React.FC<ComplianceCenterProps> = ({ contact, onUpdateContact }) => {
  const [isChecking, setIsChecking] = useState(false);

  const compliance = contact.compliance || {
    kycStatus: 'Not Started',
    kybStatus: 'Not Started',
    ofacCheck: 'Pending',
    lastCheckDate: 'N/A',
    riskScore: 'Low',
    flags: []
  };

  const handleRunChecks = () => {
    if (!onUpdateContact) return;
    setIsChecking(true);
    setTimeout(() => {
      const newCompliance: ComplianceRecord = {
        kycStatus: 'Verified',
        kybStatus: 'Verified',
        ofacCheck: 'Clear',
        lastCheckDate: new Date().toISOString().split('T')[0],
        riskScore: 'Low',
        flags: []
      };

      onUpdateContact({
        ...contact,
        compliance: newCompliance,
        activities: [
          ...(contact.activities || []),
          {
            id: `sys_comp_${Date.now()}`,
            type: 'system',
            description: 'Compliance checks completed: KYC/KYB/OFAC Cleared.',
            date: new Date().toLocaleString(),
            user: 'System'
          }
        ]
      });
      setIsChecking(false);
    }, 2500);
  };

  const StatusBadge = ({ status, label, icon: Icon }: any) => {
    let colors = 'bg-slate-100 text-slate-500 border-slate-200';
    if (status === 'Verified' || status === 'Clear') colors = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Pending') colors = 'bg-amber-50 text-amber-700 border-amber-200';
    if (status === 'Flagged' || status === 'Match Found') colors = 'bg-red-50 text-red-700 border-red-200';

    return (
      <div className={`p-4 rounded-xl border ${colors} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
             <Icon size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase opacity-70">{label}</p>
            <p className="font-bold">{status}</p>
          </div>
        </div>
        {status === 'Verified' || status === 'Clear' ? <CheckCircle size={20} /> : status === 'Flagged' ? <AlertTriangle size={20} /> : <Clock size={20} />}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" /> Compliance & Risk
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Automated KYC (Know Your Customer) and KYB (Know Your Business) verification.
          </p>
        </div>
        <div className="relative z-10 flex gap-4 text-right">
           <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Risk Score</p>
              <p className={`text-2xl font-bold ${compliance.riskScore === 'Low' ? 'text-emerald-400' : 'text-red-400'}`}>{compliance.riskScore}</p>
           </div>
           <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Last Check</p>
              <p className="text-lg font-bold">{compliance.lastCheckDate}</p>
           </div>
        </div>
        <Shield className="absolute -right-6 -bottom-6 text-white opacity-5 w-40 h-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusBadge status={compliance.kycStatus} label="Identity (KYC)" icon={UserCheck} />
        <StatusBadge status={compliance.kybStatus} label="Business (KYB)" icon={Building2} />
        <StatusBadge status={compliance.ofacCheck} label="Watchlist (OFAC)" icon={Globe} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
         <div className="flex justify-between items-center mb-6">
           <h4 className="font-bold text-slate-800 flex items-center gap-2">
             <Lock size={18} className="text-slate-500" /> Verification Actions
           </h4>
           <button 
             onClick={handleRunChecks}
             disabled={isChecking}
             className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
           >
             {isChecking ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
             {isChecking ? 'Running Checks...' : 'Run Compliance Scan'}
           </button>
         </div>

         <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
               <div className="mt-0.5"><CheckCircle size={16} className="text-slate-400" /></div>
               <div>
                 <p className="text-sm font-medium text-slate-700">Identity Verification</p>
                 <p className="text-xs text-slate-500">Matches provided SSN/DOB against credit bureaus and public records.</p>
               </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
               <div className="mt-0.5"><CheckCircle size={16} className="text-slate-400" /></div>
               <div>
                 <p className="text-sm font-medium text-slate-700">Entity Verification</p>
                 <p className="text-xs text-slate-500">Validates Secretary of State standing and EIN validity.</p>
               </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
               <div className="mt-0.5"><CheckCircle size={16} className="text-slate-400" /></div>
               <div>
                 <p className="text-sm font-medium text-slate-700">AML/OFAC Screening</p>
                 <p className="text-xs text-slate-500">Screens against global sanctions and watchlists (Patriot Act compliance).</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ComplianceCenter;
