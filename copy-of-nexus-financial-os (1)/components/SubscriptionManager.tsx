
import React, { useState } from 'react';
import { Contact, Subscription } from '../types';
import { CheckCircle, Star, Zap, Crown, CreditCard } from 'lucide-react';

interface SubscriptionManagerProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ contact, onUpdateContact }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Default if no sub
  const currentPlan = contact.subscription || {
    plan: 'Free',
    status: 'Active',
    renewalDate: 'N/A',
    price: 0,
    features: ['Basic Checklist', '1 Credit Scan']
  };

  const handleUpgrade = (plan: 'Pro' | 'Enterprise') => {
    setIsProcessing(true);
    setTimeout(() => {
      const newSub: Subscription = {
        plan,
        status: 'Active',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: plan === 'Pro' ? 97 : 297,
        features: plan === 'Pro' 
          ? ['Unlimited AI Credit Repair', 'Priority Support', 'Daily Monitoring'] 
          : ['Dedicated Funding Advisor', 'White Glove Service', '0% Success Fee']
      };
      
      onUpdateContact({
        ...contact,
        subscription: newSub,
        notifications: [...(contact.notifications || []), {
          id: `sub_${Date.now()}`,
          title: `Welcome to ${plan}!`,
          message: 'Your subscription is now active.',
          date: 'Just now',
          read: false,
          type: 'success'
        }]
      });
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Current Plan Header */}
      <div className="bg-slate-900 rounded-xl p-6 text-white flex justify-between items-center shadow-lg">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Membership</p>
          <h2 className="text-3xl font-bold flex items-center gap-3">
             {currentPlan.plan} Tier
             {currentPlan.plan === 'Pro' && <Star className="text-yellow-400 fill-yellow-400" size={24} />}
          </h2>
          <p className="text-sm text-slate-400 mt-2">Status: <span className="text-emerald-400 font-bold">{currentPlan.status}</span> • Renews: {currentPlan.renewalDate}</p>
        </div>
        {currentPlan.plan !== 'Free' && (
          <div className="text-right">
             <p className="text-2xl font-bold">${currentPlan.price}<span className="text-sm text-slate-500 font-normal">/mo</span></p>
             <button className="text-xs text-blue-400 hover:text-blue-300 underline mt-1">Manage Payment Method</button>
          </div>
        )}
      </div>

      {/* Pricing Table */}
      {currentPlan.plan === 'Free' && (
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Upgrade to Accelerate Your Funding</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Free Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col opacity-75">
               <div className="mb-4">
                 <h4 className="font-bold text-slate-700 text-lg">Starter</h4>
                 <p className="text-2xl font-bold text-slate-900">$0<span className="text-sm font-normal text-slate-500">/mo</span></p>
               </div>
               <ul className="space-y-3 mb-8 flex-1">
                 <li className="text-sm text-slate-600 flex gap-2"><CheckCircle size={16} className="text-slate-400"/> Basic Funding Checklist</li>
                 <li className="text-sm text-slate-600 flex gap-2"><CheckCircle size={16} className="text-slate-400"/> 1 Credit Report Scan</li>
               </ul>
               <button disabled className="w-full py-2 bg-slate-100 text-slate-400 rounded-lg font-bold text-sm">Current Plan</button>
            </div>

            {/* Pro Card (Highlighted) */}
            <div className="bg-white border-2 border-blue-600 rounded-xl p-6 flex flex-col shadow-xl relative scale-105">
               <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">Most Popular</div>
               <div className="mb-4">
                 <h4 className="font-bold text-blue-600 text-lg flex items-center gap-2"><Zap size={18} /> Professional</h4>
                 <p className="text-3xl font-bold text-slate-900">$97<span className="text-sm font-normal text-slate-500">/mo</span></p>
               </div>
               <ul className="space-y-3 mb-8 flex-1">
                 <li className="text-sm text-slate-800 flex gap-2"><CheckCircle size={16} className="text-emerald-500"/> <strong>Unlimited</strong> AI Credit Repair</li>
                 <li className="text-sm text-slate-800 flex gap-2"><CheckCircle size={16} className="text-emerald-500"/> Daily Credit Monitoring</li>
                 <li className="text-sm text-slate-800 flex gap-2"><CheckCircle size={16} className="text-emerald-500"/> Smart Lender Matching</li>
               </ul>
               <button 
                 onClick={() => handleUpgrade('Pro')}
                 disabled={isProcessing}
                 className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
               >
                 {isProcessing ? 'Processing...' : 'Upgrade Now'}
               </button>
            </div>

            {/* Enterprise Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col">
               <div className="mb-4">
                 <h4 className="font-bold text-slate-700 text-lg flex items-center gap-2"><Crown size={18} /> Elite</h4>
                 <p className="text-2xl font-bold text-slate-900">$297<span className="text-sm font-normal text-slate-500">/mo</span></p>
               </div>
               <ul className="space-y-3 mb-8 flex-1">
                 <li className="text-sm text-slate-600 flex gap-2"><CheckCircle size={16} className="text-slate-400"/> Everything in Pro</li>
                 <li className="text-sm text-slate-600 flex gap-2"><CheckCircle size={16} className="text-slate-400"/> Dedicated Funding Advisor</li>
                 <li className="text-sm text-slate-600 flex gap-2"><CheckCircle size={16} className="text-slate-400"/> White Glove Application Service</li>
               </ul>
               <button 
                 onClick={() => handleUpgrade('Enterprise')}
                 disabled={isProcessing}
                 className="w-full py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50"
               >
                 Select Elite
               </button>
            </div>

          </div>
        </div>
      )}

      {/* Billing History */}
      {currentPlan.plan !== 'Free' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center gap-2">
            <CreditCard size={18} /> Billing History
          </div>
          <div className="p-8 text-center text-slate-400 text-sm italic">
            No invoices found for this subscription period.
          </div>
        </div>
      )}

    </div>
  );
};

export default SubscriptionManager;
