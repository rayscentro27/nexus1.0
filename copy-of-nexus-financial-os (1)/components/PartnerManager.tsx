import React, { useState } from 'react';
import { Contact, Notification } from '../types';
import { Users, DollarSign, TrendingUp, Search, CheckCircle, Clock, ExternalLink, Briefcase, Award } from 'lucide-react';

interface PartnerManagerProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
}

const PartnerManager: React.FC<PartnerManagerProps> = ({ contacts, onUpdateContact }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate Global Partner Stats
  const totalPartnerRevenue = contacts.reduce((acc, c) => acc + (c.referralData?.leads.filter(l => l.status === 'Funded').length || 0) * 5000, 0); // Assuming $5k rev per funded lead
  const totalCommissionsPaid = contacts.reduce((acc, c) => acc + (c.referralData?.commissionPaid || 0), 0);
  const totalCommissionsPending = contacts.reduce((acc, c) => acc + (c.referralData?.commissionPending || 0), 0);
  const activePartners = contacts.filter(c => c.referralData && c.referralData.totalSignups > 0).length;

  // Get partners with pending commissions
  const pendingPayouts = contacts.filter(c => c.referralData && c.referralData.commissionPending > 0);

  // Get top partners for leaderboard
  const topPartners = contacts
    .filter(c => c.referralData && c.referralData.totalSignups > 0)
    .sort((a, b) => (b.referralData?.totalSignups || 0) - (a.referralData?.totalSignups || 0));

  const handleApprovePayout = (contact: Contact) => {
    if (!contact.referralData) return;

    const amount = contact.referralData.commissionPending;
    
    // Update Referral Data
    const updatedReferralData = {
      ...contact.referralData,
      commissionPending: 0,
      commissionPaid: contact.referralData.commissionPaid + amount
    };

    // Add Notification
    const newNotification: Notification = {
      id: `notif_pay_${Date.now()}`,
      title: 'Commission Payout Processed',
      message: `Great news! We've sent your payout of $${amount.toLocaleString()}.`,
      date: 'Just now',
      read: false,
      type: 'success'
    };

    // Log Activity
    const newActivity = {
      id: `sys_pay_${Date.now()}`,
      type: 'system' as const,
      description: `Processed commission payout of $${amount.toLocaleString()}`,
      date: new Date().toLocaleString(),
      user: 'Admin'
    };

    onUpdateContact({
      ...contact,
      referralData: updatedReferralData,
      notifications: [...(contact.notifications || []), newNotification],
      activities: [...(contact.activities || []), newActivity]
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Partner Program Manager</h1>
          <p className="text-slate-500 mt-2">Manage affiliate partners, track referrals, and approve commission payouts.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
            <ExternalLink size={16} /> Program Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Partner Revenue</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">${totalPartnerRevenue.toLocaleString()}</h3>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp size={12} /> +12% this month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Active Partners</p>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={20} /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{activePartners}</h3>
          <p className="text-xs text-slate-500 mt-1">Generating leads</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Pending Payouts</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">${totalCommissionsPending.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">{pendingPayouts.length} partners waiting</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Paid</p>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">${totalCommissionsPaid.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Lifetime commissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Payout Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <DollarSign size={18} className="text-amber-500" /> Commission Payout Queue
            </h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">{pendingPayouts.length} Pending</span>
          </div>
          
          {pendingPayouts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle size={48} className="mx-auto mb-4 text-emerald-100" />
              <p>All caught up! No commissions pending.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Partner</th>
                  <th className="px-6 py-4">Pending Amount</th>
                  <th className="px-6 py-4">Leads Funded</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingPayouts.map(partner => (
                  <tr key={partner.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{partner.name}</div>
                      <div className="text-xs text-slate-500">{partner.company}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-600">
                      ${partner.referralData?.commissionPending.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {partner.referralData?.leads.filter(l => l.status === 'Funded').length}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleApprovePayout(partner)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        Approve Payout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Partners Leaderboard */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Award size={18} className="text-indigo-500" /> Top Performers
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {topPartners.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No data yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topPartners.map((partner, index) => (
                  <div key={partner.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-slate-100 text-slate-600' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-white border border-slate-200 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{partner.name}</p>
                        <p className="text-xs text-slate-500">{partner.referralData?.totalSignups} referrals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">${partner.referralData?.commissionPaid.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">Earned</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PartnerManager;