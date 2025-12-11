
import React from 'react';
import { Contact } from '../types';
import { Shield, Hammer, Zap, Crown, Award, CheckCircle, Lock, ChevronRight, AlertCircle } from 'lucide-react';

interface TierProgressWidgetProps {
  contact: Contact;
}

type TierLevel = 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

const TIERS: Record<TierLevel, { 
  rank: number; 
  color: string; 
  bg: string;
  icon: any; 
  requirements: { score: number; docs: number; revenue: number };
  perks: string[];
}> = {
  Iron: {
    rank: 1,
    color: 'text-slate-500',
    bg: 'bg-slate-500',
    icon: Shield,
    requirements: { score: 0, docs: 0, revenue: 0 },
    perks: ['Basic CRM Access', 'Educational Resources']
  },
  Bronze: {
    rank: 2,
    color: 'text-amber-700',
    bg: 'bg-amber-700',
    icon: Hammer,
    requirements: { score: 600, docs: 1, revenue: 0 },
    perks: ['Net-30 Vendor Accounts', 'Credit Monitoring']
  },
  Silver: {
    rank: 3,
    color: 'text-slate-400',
    bg: 'bg-slate-400',
    icon: Zap,
    requirements: { score: 680, docs: 2, revenue: 5000 },
    perks: ['Business Credit Cards (0% APR)', 'Revolving Lines']
  },
  Gold: {
    rank: 4,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500',
    icon: Crown,
    requirements: { score: 720, docs: 3, revenue: 15000 },
    perks: ['Bank Lines of Credit', 'Term Loans (<10%)']
  },
  Platinum: {
    rank: 5,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500',
    icon: Award,
    requirements: { score: 760, docs: 4, revenue: 50000 },
    perks: ['SBA 7(a) Funding', 'Private Equity', 'White Glove Support']
  }
};

const TierProgressWidget: React.FC<TierProgressWidgetProps> = ({ contact }) => {
  const score = contact.creditAnalysis?.score || 0;
  const verifiedDocs = contact.documents?.filter(d => d.status === 'Verified').length || 0;
  const revenue = contact.revenue || 0;

  // Calculate Current Tier
  let currentTier: TierLevel = 'Iron';
  let nextTier: TierLevel | null = 'Bronze';

  if (score >= 760 && verifiedDocs >= 4 && revenue >= 50000) { currentTier = 'Platinum'; nextTier = null; }
  else if (score >= 720 && verifiedDocs >= 3 && revenue >= 15000) { currentTier = 'Gold'; nextTier = 'Platinum'; }
  else if (score >= 680 && verifiedDocs >= 2 && revenue >= 5000) { currentTier = 'Silver'; nextTier = 'Gold'; }
  else if (score >= 600 && verifiedDocs >= 1) { currentTier = 'Bronze'; nextTier = 'Silver'; }

  const currInfo = TIERS[currentTier];
  const nextInfo = nextTier ? TIERS[nextTier] : null;

  // Calculate Progress to Next Tier
  let progress = 100;
  if (nextInfo) {
    const scoreGap = nextInfo.requirements.score - currInfo.requirements.score;
    const scoreProg = Math.min(scoreGap, Math.max(0, score - currInfo.requirements.score)) / scoreGap;

    const docGap = nextInfo.requirements.docs - currInfo.requirements.docs;
    const docProg = docGap === 0 ? 1 : Math.min(docGap, Math.max(0, verifiedDocs - currInfo.requirements.docs)) / docGap;
    
    // Revenue logic (simplified)
    const revNeeded = nextInfo.requirements.revenue > 0;
    const revProg = !revNeeded ? 1 : Math.min(1, revenue / nextInfo.requirements.revenue);

    progress = ((scoreProg + docProg + revProg) / 3) * 100;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center ${currInfo.bg} shadow-lg`}>
            <currInfo.icon size={32} className="text-white" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Status</p>
            <h3 className="text-2xl font-bold">{currentTier} Tier</h3>
            <p className="text-sm text-slate-300 opacity-80">
              Unlocking {currInfo.perks[0]}
            </p>
          </div>
        </div>
        
        {/* Progress Circle (Desktop) */}
        {nextInfo && (
          <div className="hidden md:block text-right relative z-10">
             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Progress to {nextTier}</p>
             <div className="text-3xl font-bold">{Math.round(progress)}%</div>
          </div>
        )}

        {/* Background Pattern */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 transform translate-x-10">
           <Crown size={140} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 w-full">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${currInfo.bg}`} 
          style={{ width: `${nextTier ? progress : 100}%` }}
        ></div>
      </div>

      {/* Requirements Grid */}
      {nextInfo ? (
        <div className="p-6">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Lock size={16} className="text-slate-400" /> 
            Requirements for {nextTier} Tier
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Credit Score Req */}
            <div className={`p-3 rounded-lg border ${score >= nextInfo.requirements.score ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
               <div className="flex justify-between items-center mb-1">
                 <span className="text-xs font-bold text-slate-500 uppercase">Credit Score</span>
                 {score >= nextInfo.requirements.score ? <CheckCircle size={14} className="text-green-600"/> : <span className="text-xs font-bold text-slate-400">{score}/{nextInfo.requirements.score}</span>}
               </div>
               <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                 <div className={`h-full rounded-full ${score >= nextInfo.requirements.score ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (score/nextInfo.requirements.score)*100)}%` }}></div>
               </div>
            </div>

            {/* Documents Req */}
            <div className={`p-3 rounded-lg border ${verifiedDocs >= nextInfo.requirements.docs ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
               <div className="flex justify-between items-center mb-1">
                 <span className="text-xs font-bold text-slate-500 uppercase">Verified Docs</span>
                 {verifiedDocs >= nextInfo.requirements.docs ? <CheckCircle size={14} className="text-green-600"/> : <span className="text-xs font-bold text-slate-400">{verifiedDocs}/{nextInfo.requirements.docs}</span>}
               </div>
               <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                 <div className={`h-full rounded-full ${verifiedDocs >= nextInfo.requirements.docs ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (verifiedDocs/nextInfo.requirements.docs)*100)}%` }}></div>
               </div>
            </div>

            {/* Revenue Req */}
            <div className={`p-3 rounded-lg border ${revenue >= nextInfo.requirements.revenue ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
               <div className="flex justify-between items-center mb-1">
                 <span className="text-xs font-bold text-slate-500 uppercase">Monthly Rev</span>
                 {revenue >= nextInfo.requirements.revenue ? <CheckCircle size={14} className="text-green-600"/> : <span className="text-xs font-bold text-slate-400">${(revenue/1000).toFixed(1)}k/${(nextInfo.requirements.revenue/1000).toFixed(0)}k</span>}
               </div>
               <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                 <div className={`h-full rounded-full ${revenue >= nextInfo.requirements.revenue ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (revenue/nextInfo.requirements.revenue)*100)}%` }}></div>
               </div>
            </div>

          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
             <AlertCircle className="text-blue-600 mt-0.5" size={18} />
             <div>
               <p className="text-sm text-blue-900 font-bold">Unlock these benefits at {nextTier}:</p>
               <ul className="text-xs text-blue-700 mt-1 list-disc pl-4">
                 {nextInfo.perks.map(p => <li key={p}>{p}</li>)}
               </ul>
             </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <h4 className="text-xl font-bold text-slate-800 mb-2">Maximum Tier Reached!</h4>
          <p className="text-slate-500">You have qualified for the highest level of funding access.</p>
        </div>
      )}
    </div>
  );
};

export default TierProgressWidget;
