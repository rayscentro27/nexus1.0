
import React from 'react';
import { Contact } from '../types';
import { Award, Zap, Users, TrendingUp, Lock, CheckCircle, Crown, Star } from 'lucide-react';

interface LoyaltyLevelWidgetProps {
  contact: Contact;
}

type Level = 'Member' | 'Insider' | 'Elite' | 'Partner';

const LEVELS: Record<Level, { minXP: number; color: string; icon: any; perks: string[] }> = {
  Member: {
    minXP: 0,
    color: 'text-slate-400',
    icon: UserIcon,
    perks: ['Standard Support', 'Access to Portal']
  },
  Insider: {
    minXP: 500,
    color: 'text-blue-400',
    icon: Star,
    perks: ['Priority Support', 'Weekly Market Updates']
  },
  Elite: {
    minXP: 2000,
    color: 'text-amber-400',
    icon: Crown,
    perks: ['10% Success Fee Discount', 'Dedicated Advisor']
  },
  Partner: {
    minXP: 5000,
    color: 'text-indigo-400',
    icon: Award,
    perks: ['Direct Lender Access', 'Revenue Share on Referrals']
  }
};

function UserIcon(props: any) {
    return <Users {...props} />;
}

const LoyaltyLevelWidget: React.FC<LoyaltyLevelWidgetProps> = ({ contact }) => {
  // 1. Calculate XP
  const dealsXP = (contact.fundedDeals?.length || 0) * 1000;
  const referralsXP = (contact.referralData?.totalSignups || 0) * 250;
  const activityXP = (contact.activities?.length || 0) * 10;
  
  const totalXP = dealsXP + referralsXP + activityXP;

  // 2. Determine Level
  let currentLevel: Level = 'Member';
  let nextLevel: Level | null = 'Insider';

  if (totalXP >= 5000) { currentLevel = 'Partner'; nextLevel = null; }
  else if (totalXP >= 2000) { currentLevel = 'Elite'; nextLevel = 'Partner'; }
  else if (totalXP >= 500) { currentLevel = 'Insider'; nextLevel = 'Elite'; }

  const currInfo = LEVELS[currentLevel];
  const nextInfo = nextLevel ? LEVELS[nextLevel] : null;

  // 3. Calculate Progress
  let progress = 100;
  if (nextInfo) {
    const gap = nextInfo.minXP - currInfo.minXP;
    const currentProgress = totalXP - currInfo.minXP;
    progress = (currentProgress / gap) * 100;
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg border border-slate-700 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <currInfo.icon size={140} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Rewards Status</p>
            <h3 className={`text-2xl font-black flex items-center gap-2 ${currInfo.color}`}>
              <currInfo.icon size={24} className="fill-current" />
              {currentLevel}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono">{totalXP.toLocaleString()}</p>
            <p className="text-xs text-slate-500 uppercase font-bold">Total XP</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2 flex justify-between text-xs font-bold text-slate-400">
          <span>{currentLevel}</span>
          {nextLevel && <span>{nextLevel} ({nextInfo?.minXP.toLocaleString()} XP)</span>}
        </div>
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-6 border border-slate-700">
          <div 
            className={`h-full transition-all duration-1000 ${currInfo.color.replace('text-', 'bg-')}`} 
            style={{ width: `${progress}%` }}
          >
            <div className="w-full h-full bg-white/20 animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-6">
           <div className="bg-slate-800 p-2 rounded-lg text-center">
              <p className="text-[10px] text-slate-400 uppercase">Deals</p>
              <p className="font-bold text-emerald-400">{contact.fundedDeals?.length || 0}</p>
           </div>
           <div className="bg-slate-800 p-2 rounded-lg text-center">
              <p className="text-[10px] text-slate-400 uppercase">Referrals</p>
              <p className="font-bold text-blue-400">{contact.referralData?.totalSignups || 0}</p>
           </div>
           <div className="bg-slate-800 p-2 rounded-lg text-center">
              <p className="text-[10px] text-slate-400 uppercase">Activity</p>
              <p className="font-bold text-purple-400">{contact.activities?.length || 0}</p>
           </div>
        </div>

        {/* Perks */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
           <p className="text-xs font-bold text-slate-300 mb-2 uppercase flex items-center gap-2">
             <Zap size={12} className="text-yellow-400" /> Active Perks
           </p>
           <ul className="space-y-2">
             {currInfo.perks.map((perk, i) => (
               <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                 <CheckCircle size={12} className="text-emerald-500" /> {perk}
               </li>
             ))}
             {nextInfo && (
               <li className="text-xs text-slate-600 flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/50">
                 <Lock size={12} /> Next: {nextInfo.perks[0]}
               </li>
             )}
           </ul>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyLevelWidget;
