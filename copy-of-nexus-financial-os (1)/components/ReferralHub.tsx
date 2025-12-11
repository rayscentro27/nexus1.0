import React, { useState } from 'react';
import { Contact } from '../types';
import { Share2, Copy, Users, DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface ReferralHubProps {
  contact: Contact;
}

const ReferralHub: React.FC<ReferralHubProps> = ({ contact }) => {
  const [copied, setCopied] = useState(false);
  const stats = contact.referralData || {
    totalClicks: 0,
    totalSignups: 0,
    commissionPending: 0,
    commissionPaid: 0,
    referralLink: `https://nexus.funding/ref/${contact.id}`,
    leads: []
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Partner Program</h2>
          <p className="text-purple-100 max-w-xl mb-6">
            Earn <span className="font-bold text-white">$500</span> for every business owner you refer who gets funded. 
            Track your commissions and payouts in real-time.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 flex items-center gap-4 max-w-md">
            <div className="flex-1 truncate font-mono text-sm text-purple-100">
              {stats.referralLink}
            </div>
            <button 
              onClick={handleCopy}
              className="bg-white text-purple-600 px-4 py-2 rounded-md font-bold text-sm hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 transform translate-x-12">
          <Share2 size={200} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Earnings</p>
              <h3 className="text-2xl font-bold text-slate-900">${(stats.commissionPaid + stats.commissionPending).toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">${stats.commissionPaid.toLocaleString()} Paid Out</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Pending</p>
              <h3 className="text-2xl font-bold text-amber-500">${stats.commissionPending.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500">Available for payout in 14 days</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Referrals</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.totalSignups}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500">From {stats.totalClicks} link clicks</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Conversion</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats.totalClicks > 0 ? ((stats.totalSignups / stats.totalClicks) * 100).toFixed(1) : 0}%
              </h3>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500">Top 10% of partners</p>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Referral History</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline">Download Report</button>
        </div>
        
        {stats.leads.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p>No referrals yet. Share your link to get started!</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Referred Business</th>
                <th className="px-6 py-4">Date Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{lead.name}</td>
                  <td className="px-6 py-4 text-slate-500">{lead.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === 'Funded' ? 'bg-green-100 text-green-800' :
                      lead.status === 'Signed Up' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    {lead.commission > 0 ? `$${lead.commission}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default ReferralHub;