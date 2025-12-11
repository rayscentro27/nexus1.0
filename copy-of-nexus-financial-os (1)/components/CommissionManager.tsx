
import React, { useState } from 'react';
import { Contact, CommissionProfile, PayoutRecord } from '../types';
import { DollarSign, User, TrendingUp, Download, Plus, CheckCircle, Calculator, Wallet, ArrowRight } from 'lucide-react';

interface CommissionManagerProps {
  contacts: Contact[];
}

const CommissionManager: React.FC<CommissionManagerProps> = ({ contacts }) => {
  const [activeTab, setActiveTab] = useState<'payouts' | 'agents'>('payouts');
  
  // Mock Agents
  const [agents, setAgents] = useState<CommissionProfile[]>([
    { id: 'agt_1', agentName: 'John Doe', splitPercentage: 50, totalFunded: 250000, totalCommissionEarned: 25000, currentDrawBalance: 2000 },
    { id: 'agt_2', agentName: 'Sarah Sales', splitPercentage: 40, totalFunded: 120000, totalCommissionEarned: 9600, currentDrawBalance: 0 },
  ]);

  // Mock Payouts (In real app, this is derived from Closed deals)
  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    { id: 'pay_1', agentId: 'agt_1', dealId: 'deal_101', dealValue: 50000, grossCommission: 5000, splitAmount: 2500, drawDeduction: 0, netPayout: 2500, status: 'Paid', date: '2023-10-01' },
    { id: 'pay_2', agentId: 'agt_2', dealId: 'deal_102', dealValue: 20000, grossCommission: 2000, splitAmount: 800, drawDeduction: 0, netPayout: 800, status: 'Paid', date: '2023-10-05' },
  ]);

  // Find closed deals that haven't been paid out yet (Simulated)
  const closedDeals = contacts.filter(c => c.status === 'Closed' && c.value > 0);
  const pendingDeals = closedDeals.filter(d => !payouts.some(p => p.dealId === d.id));

  const handleProcessPayout = (deal: Contact, agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    // Logic: House takes gross (e.g. 10% of funding), Agent takes Split % of House Gross
    const houseGross = deal.value * 0.10; // Assuming 10% success fee
    const agentCut = houseGross * (agent.splitPercentage / 100);
    
    // Deduct Draw if exists
    const deduction = Math.min(agentCut, agent.currentDrawBalance);
    const net = agentCut - deduction;

    const newPayout: PayoutRecord = {
        id: `pay_${Date.now()}`,
        agentId: agent.id,
        dealId: deal.id,
        dealValue: deal.value,
        grossCommission: houseGross,
        splitAmount: agentCut,
        drawDeduction: deduction,
        netPayout: net,
        status: 'Pending',
        date: new Date().toLocaleDateString()
    };

    setPayouts([newPayout, ...payouts]);
    
    // Update Agent Balance
    const updatedAgents = agents.map(a => 
        a.id === agent.id ? { 
            ...a, 
            currentDrawBalance: a.currentDrawBalance - deduction,
            totalFunded: a.totalFunded + deal.value,
            totalCommissionEarned: a.totalCommissionEarned + agentCut
        } : a
    );
    setAgents(updatedAgents);
    
    alert(`Payout processed for ${agent.agentName}. Net: $${net.toLocaleString()}`);
  };

  const handleAddDraw = (agentId: string) => {
    const amount = prompt("Enter draw amount:");
    if (amount) {
        setAgents(agents.map(a => a.id === agentId ? { ...a, currentDrawBalance: a.currentDrawBalance + Number(amount) } : a));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Wallet className="text-blue-600" size={32} /> Commission Manager
          </h1>
          <p className="text-slate-500 mt-2">Track splits, draws, and agent payouts.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
           <button onClick={() => setActiveTab('payouts')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'payouts' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Payouts</button>
           <button onClick={() => setActiveTab('agents')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'agents' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Agents & Splits</button>
        </div>
      </div>

      {activeTab === 'payouts' && (
        <div className="space-y-8">
            
            {/* New Deals Queue */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><DollarSign size={18} className="text-emerald-500"/> Ready for Payout</h3>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">{pendingDeals.length} Deals</span>
                </div>
                
                {pendingDeals.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">No closed deals pending payout.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Deal</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">House Gross (10%)</th>
                                <th className="px-6 py-4 text-right">Assign Agent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pendingDeals.map(deal => (
                                <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{deal.company}</td>
                                    <td className="px-6 py-4 text-slate-600">${deal.value.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-mono text-emerald-600 font-bold">${(deal.value * 0.10).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {agents.map(agent => (
                                                <button 
                                                    key={agent.id}
                                                    onClick={() => handleProcessPayout(deal, agent.id)}
                                                    className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
                                                >
                                                    Pay {agent.agentName}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Payout History */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Payout History</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Agent</th>
                            <th className="px-6 py-4">Gross Comm</th>
                            <th className="px-6 py-4">Split</th>
                            <th className="px-6 py-4">Draw Ded.</th>
                            <th className="px-6 py-4 text-right">Net Paid</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {payouts.map(pay => {
                            const agentName = agents.find(a => a.id === pay.agentId)?.agentName || 'Unknown';
                            return (
                                <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 text-xs">{pay.date}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{agentName}</td>
                                    <td className="px-6 py-4 text-slate-600">${pay.grossCommission.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-slate-600">${pay.splitAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-red-500">-${pay.drawDeduction.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">${pay.netPayout.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map(agent => (
                <div key={agent.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                                {agent.agentName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{agent.agentName}</h3>
                                <p className="text-xs text-slate-500">Standard Agent</p>
                            </div>
                        </div>
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                            {agent.splitPercentage}% Split
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Total Funded</p>
                            <p className="font-bold text-slate-800">${(agent.totalFunded/1000).toFixed(0)}k</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Earned</p>
                            <p className="font-bold text-emerald-600">${agent.totalCommissionEarned.toLocaleString()}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <p className="text-[10px] text-red-400 uppercase font-bold">Draw Bal</p>
                            <p className="font-bold text-red-600">${agent.currentDrawBalance.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleAddDraw(agent.id)}
                            className="flex-1 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 text-xs"
                        >
                            + Add Draw
                        </button>
                        <button className="flex-1 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-xs flex items-center justify-center gap-2">
                            <Download size={14}/> Statement
                        </button>
                    </div>
                </div>
            ))}
            
            {/* Add Agent Card */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors">
                <Plus size={48} className="mb-2 opacity-20" />
                <p className="font-bold">Add New Agent</p>
            </div>
        </div>
      )}

    </div>
  );
};

export default CommissionManager;
