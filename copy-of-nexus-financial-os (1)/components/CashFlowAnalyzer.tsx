import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Contact, FinancialMonth, FinancialSpreading } from '../types';
import { Activity, Save, Calculator, AlertOctagon } from 'lucide-react';

interface CashFlowAnalyzerProps {
  contact: Contact;
  onUpdateContact?: (contact: Contact) => void;
}

const CashFlowAnalyzer: React.FC<CashFlowAnalyzerProps> = ({ contact, onUpdateContact }) => {
  // Initialize with existing data or default 3 months
  const defaultMonths: FinancialMonth[] = [
    { month: 'Month 1', revenue: 0, expenses: 0, endingBalance: 0, nsfCount: 0, negativeDays: 0 },
    { month: 'Month 2', revenue: 0, expenses: 0, endingBalance: 0, nsfCount: 0, negativeDays: 0 },
    { month: 'Month 3', revenue: 0, expenses: 0, endingBalance: 0, nsfCount: 0, negativeDays: 0 },
  ];

  const [months, setMonths] = useState<FinancialMonth[]>(contact.financialSpreading?.months || defaultMonths);
  const [isEditing, setIsEditing] = useState(false);

  // Calculations
  const totalRevenue = months.reduce((acc, m) => acc + m.revenue, 0);
  const avgRevenue = months.length > 0 ? totalRevenue / months.length : 0;
  const totalNSFs = months.reduce((acc, m) => acc + m.nsfCount, 0);
  const avgBalance = months.length > 0 ? months.reduce((acc, m) => acc + m.endingBalance, 0) / months.length : 0;
  
  // Simple "Bankability" Logic
  const getLenderTier = () => {
    if (totalNSFs > 5 || avgBalance < 500) return { tier: 'D', label: 'High Risk (MCA Only)', color: 'bg-red-100 text-red-700' };
    if (totalNSFs > 2) return { tier: 'C', label: 'Sub-Prime', color: 'bg-orange-100 text-orange-700' };
    if (avgRevenue < 5000) return { tier: 'B-', label: 'Micro-Funding', color: 'bg-blue-100 text-blue-700' };
    if (avgRevenue > 10000 && avgBalance > 2000) return { tier: 'A', label: 'Prime / Bankable', color: 'bg-emerald-100 text-emerald-700' };
    return { tier: 'B', label: 'Standard', color: 'bg-blue-50 text-blue-600' };
  };

  const lenderTier = getLenderTier();

  const handleInputChange = (index: number, field: keyof FinancialMonth, value: string) => {
    const newMonths = [...months];
    if (field === 'month') {
      newMonths[index].month = value;
    } else {
      // @ts-ignore - dynamic assignment for numeric fields
      newMonths[index][field] = Number(value);
    }
    setMonths(newMonths);
  };

  const handleSave = () => {
    if (onUpdateContact) {
      const spreadingData: FinancialSpreading = {
        months,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      // Update revenue field on parent contact as well for quick access
      onUpdateContact({
        ...contact,
        revenue: avgRevenue,
        financialSpreading: spreadingData
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold">Avg Monthly Revenue</p>
          <p className="text-xl font-bold text-slate-900 mt-1">${avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold">Avg Daily Balance</p>
          <p className={`text-xl font-bold mt-1 ${avgBalance < 1000 ? 'text-amber-600' : 'text-slate-900'}`}>
            ${avgBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-bold">Total NSFs</p>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-xl font-bold ${totalNSFs > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{totalNSFs}</p>
            {totalNSFs > 0 && <AlertOctagon size={16} className="text-red-500" />}
          </div>
        </div>
        <div className={`p-4 rounded-xl border flex flex-col justify-center ${lenderTier.color} border-transparent`}>
          <p className="text-xs uppercase font-bold opacity-70">Lender Tier</p>
          <p className="text-xl font-bold">{lenderTier.tier} - {lenderTier.label}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-64">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Activity size={16} className="text-blue-500"/> Revenue vs Expenses Trend
        </h3>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <BarChart data={months}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
            <Tooltip 
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Calculator size={18} className="text-slate-500" /> Bank Statement Spreading
          </h3>
          {isEditing ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-1"
              >
                <Save size={14} /> Save Analysis
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
            >
              Edit Financials
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Deposits ($)</th>
                <th className="px-4 py-3">Withdrawals ($)</th>
                <th className="px-4 py-3">Ending Bal ($)</th>
                <th className="px-4 py-3 text-red-500">NSF Count</th>
                <th className="px-4 py-3 text-amber-600">Neg Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {months.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={m.month}
                        onChange={(e) => handleInputChange(idx, 'month', e.target.value)}
                        className="w-24 border rounded px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{m.month}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={m.revenue}
                        onChange={(e) => handleInputChange(idx, 'revenue', e.target.value)}
                        className="w-28 border rounded px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="text-emerald-700 font-medium">${m.revenue.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={m.expenses}
                        onChange={(e) => handleInputChange(idx, 'expenses', e.target.value)}
                        className="w-28 border rounded px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="text-slate-600">${m.expenses.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={m.endingBalance}
                        onChange={(e) => handleInputChange(idx, 'endingBalance', e.target.value)}
                        className="w-28 border rounded px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">${m.endingBalance.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={m.nsfCount}
                        onChange={(e) => handleInputChange(idx, 'nsfCount', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className={`${m.nsfCount > 0 ? 'bg-red-100 text-red-700' : 'text-slate-400'} px-2 py-0.5 rounded text-xs font-bold`}>
                        {m.nsfCount}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={m.negativeDays}
                        onChange={(e) => handleInputChange(idx, 'negativeDays', e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="text-slate-600">{m.negativeDays}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashFlowAnalyzer;