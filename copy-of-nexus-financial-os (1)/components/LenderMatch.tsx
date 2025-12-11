import React from 'react';
import { Contact, Lender, ClientTask } from '../types';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, DollarSign, Calendar, Lock } from 'lucide-react';

// Mock Database of Lenders
const LENDERS: Lender[] = [
  {
    id: 'l_bluevine',
    name: 'Bluevine',
    logo: '🟦',
    type: 'Fintech',
    minScore: 625,
    minRevenue: 10000, // Monthly
    minTimeInBusinessMonths: 6,
    maxAmount: 250000,
    description: 'Fast LOC. Requires 3 months bank statements.',
    applicationLink: 'https://www.bluevine.com'
  },
  {
    id: 'l_chase',
    name: 'Chase Ink',
    logo: '🏦',
    type: 'Bank',
    minScore: 700,
    minRevenue: 0, // Stated income
    minTimeInBusinessMonths: 0, // Startup friendly if personal credit good
    maxAmount: 100000,
    description: 'Tier 1 Business Card. Hard pull on Experian.',
    applicationLink: 'https://creditcards.chase.com/business'
  },
  {
    id: 'l_amex',
    name: 'Amex Blueprint',
    logo: '💳',
    type: 'Bank',
    minScore: 680,
    minRevenue: 5000,
    minTimeInBusinessMonths: 12,
    maxAmount: 50000,
    description: 'Revolving LOC. Soft pull for existing members.',
    applicationLink: 'https://www.americanexpress.com'
  },
  {
    id: 'l_sba_bolt',
    name: 'SBA 7(a) Bolt',
    logo: '🏛️',
    type: 'SBA',
    minScore: 680,
    minRevenue: 20000,
    minTimeInBusinessMonths: 24,
    maxAmount: 150000,
    description: 'Government backed. Requires FICO SBSS score of 165+.',
    applicationLink: 'https://www.sba.gov'
  },
  {
    id: 'l_fundbox',
    name: 'Fundbox',
    logo: '⚡',
    type: 'Fintech',
    minScore: 600,
    minRevenue: 8500,
    minTimeInBusinessMonths: 3,
    maxAmount: 100000,
    description: 'Very fast approval. Integrates with Quickbooks.',
    applicationLink: 'https://fundbox.com'
  }
];

interface LenderMatchProps {
  contact: Contact;
  onAssignTask: (contactId: string, task: ClientTask) => void;
}

const LenderMatch: React.FC<LenderMatchProps> = ({ contact, onAssignTask }) => {
  // Use Credit Analysis score if available, otherwise default/guess
  const creditScore = contact.creditAnalysis?.score || 680; // Default to decent score if unknown
  const revenue = contact.revenue || 0;
  const age = contact.timeInBusiness || 0;

  const checkEligibility = (lender: Lender) => {
    const reasons: string[] = [];
    if (creditScore < lender.minScore) reasons.push(`Score ${creditScore} < ${lender.minScore}`);
    if (revenue < lender.minRevenue) reasons.push(`Rev $${revenue.toLocaleString()} < $${lender.minRevenue.toLocaleString()}`);
    if (age < lender.minTimeInBusinessMonths) reasons.push(`Age ${age}mo < ${lender.minTimeInBusinessMonths}mo`);
    
    return {
      isEligible: reasons.length === 0,
      reasons
    };
  };

  const matches = LENDERS.map(lender => ({
    ...lender,
    ...checkEligibility(lender)
  }));

  const eligible = matches.filter(m => m.isEligible);
  const ineligible = matches.filter(m => !m.isEligible);

  const handlePushToPortal = (lender: Lender) => {
    const newTask: ClientTask = {
      id: `app_${lender.id}_${Date.now()}`,
      title: `Apply for Funding: ${lender.name}`,
      description: `Congratulations! You matched our underwriting criteria for ${lender.name}. ${lender.description}`,
      type: 'action',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      link: lender.applicationLink,
      linkedToGoal: true
    };
    onAssignTask(contact.id, newTask);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Client Snapshot */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-md">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Credit Score</p>
            <p className={`text-xl font-bold ${creditScore >= 700 ? 'text-green-400' : 'text-amber-400'}`}>
              {creditScore}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Mo. Revenue</p>
            <p className="text-xl font-bold">${revenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Biz Age</p>
            <p className="text-xl font-bold">{age} Months</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Match Rate</p>
          <p className="text-2xl font-bold text-blue-400">{eligible.length} / {LENDERS.length}</p>
        </div>
      </div>

      {/* Eligible Lenders */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase mb-3 flex items-center gap-2">
          <CheckCircle className="text-green-600" size={16} /> Qualified Matches
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {eligible.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
              No lenders match current profile. Improve Credit Score or Revenue.
            </div>
          ) : (
            eligible.map(lender => (
              <div key={lender.id} className="bg-white border border-green-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="text-2xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-lg">{lender.logo}</div>
                  <div>
                    <h4 className="font-bold text-slate-900">{lender.name}</h4>
                    <p className="text-xs text-slate-500">{lender.description}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                         Max ${lender.maxAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                         {lender.type}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handlePushToPortal(lender)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  Apply Now <ArrowRight size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ineligible Lenders */}
      {ineligible.length > 0 && (
        <div className="opacity-75">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2 pt-4 border-t border-slate-200">
            <Lock className="text-slate-400" size={16} /> Locked / Ineligible
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {ineligible.map(lender => (
              <div key={lender.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                <div className="flex gap-4 items-center opacity-60">
                   <div className="text-2xl bg-white w-12 h-12 flex items-center justify-center rounded-lg grayscale">{lender.logo}</div>
                   <div>
                    <h4 className="font-bold text-slate-700">{lender.name}</h4>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {lender.reasons.map((reason, idx) => (
                        <span key={idx} className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                          <XCircle size={10} /> {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button disabled className="bg-slate-200 text-slate-400 px-4 py-2 rounded-lg text-xs font-bold cursor-not-allowed">
                  Locked
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LenderMatch;