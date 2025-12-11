
import React, { useState } from 'react';
import { Expense } from '../types';
import { CreditCard, DollarSign, TrendingUp, Plus, Trash2, PieChart, Filter, Tag, Briefcase, Megaphone, Smartphone, Server, Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MOCK_EXPENSES: Expense[] = [
  { id: 'exp_1', vendor: 'Twilio', amount: 45.50, category: 'Software', frequency: 'Monthly', date: '2023-10-01', status: 'Paid', description: 'Power Dialer Usage' },
  { id: 'exp_2', vendor: 'Facebook Ads', amount: 500.00, category: 'Marketing', frequency: 'Monthly', date: '2023-10-02', status: 'Paid', description: 'Lead Gen Campaign Q4' },
  { id: 'exp_3', vendor: 'IdentityIQ', amount: 29.99, category: 'Software', frequency: 'Monthly', date: '2023-10-05', status: 'Paid', description: 'Credit Monitoring' },
  { id: 'exp_4', vendor: 'Vercel', amount: 20.00, category: 'Software', frequency: 'Monthly', date: '2023-10-01', status: 'Paid', description: 'Hosting' },
  { id: 'exp_5', vendor: 'Sales Commission', amount: 1250.00, category: 'Personnel', frequency: 'One-time', date: '2023-10-15', status: 'Pending', description: 'Deal #1042 Payout' },
  { id: 'exp_6', vendor: 'Google Workspace', amount: 12.00, category: 'Software', frequency: 'Monthly', date: '2023-10-01', status: 'Paid', description: 'Email Hosting' },
  { id: 'exp_7', vendor: 'WeWork', amount: 450.00, category: 'Office', frequency: 'Monthly', date: '2023-10-01', status: 'Paid', description: 'Hot Desk' },
  { id: 'exp_8', vendor: 'OpenAI API', amount: 15.00, category: 'Software', frequency: 'Monthly', date: '2023-10-10', status: 'Paid', description: 'Gemini/GPT Credits' },
];

const ExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<string>('All');
  
  // New Expense State
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    vendor: '', amount: 0, category: 'Software', frequency: 'Monthly', date: new Date().toISOString().split('T')[0], status: 'Paid'
  });

  // Calculations
  const totalMonthlyRecurring = expenses
    .filter(e => e.frequency === 'Monthly')
    .reduce((sum, e) => sum + e.amount, 0);
    
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const marketingSpend = expenses
    .filter(e => e.category === 'Marketing')
    .reduce((sum, e) => sum + e.amount, 0);

  // Chart Data
  const categoryData = [
    { name: 'Software', value: expenses.filter(e => e.category === 'Software').reduce((sum, e) => sum + e.amount, 0), color: '#3b82f6' },
    { name: 'Marketing', value: marketingSpend, color: '#f59e0b' },
    { name: 'Personnel', value: expenses.filter(e => e.category === 'Personnel').reduce((sum, e) => sum + e.amount, 0), color: '#10b981' },
    { name: 'Office', value: expenses.filter(e => e.category === 'Office').reduce((sum, e) => sum + e.amount, 0), color: '#6366f1' },
  ];

  const handleAddExpense = () => {
    if (!newExpense.vendor || !newExpense.amount) return;
    const expense: Expense = {
        ...newExpense,
        id: `exp_${Date.now()}`,
        amount: Number(newExpense.amount),
    } as Expense;
    
    setExpenses([expense, ...expenses]);
    setIsAdding(false);
    setNewExpense({ vendor: '', amount: 0, category: 'Software', frequency: 'Monthly', date: new Date().toISOString().split('T')[0], status: 'Paid' });
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Date,Vendor,Category,Amount,Frequency,Status,Description\n"
        + expenses.map(e => `${e.date},"${e.vendor}",${e.category},${e.amount},${e.frequency},${e.status},"${e.description || ''}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredExpenses = filter === 'All' ? expenses : expenses.filter(e => e.category === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CreditCard className="text-blue-600" size={32} /> Expense & Burn Rate
          </h1>
          <p className="text-slate-500 mt-2">Track subscriptions, marketing ROI, and operational costs.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleExport}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-colors text-sm"
            >
                <Download size={18} /> Export CSV
            </button>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg transition-colors text-sm"
            >
                <Plus size={18} /> Log Expense
            </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-slide-in-right">
            <h3 className="font-bold text-slate-800 mb-4">Add New Expense</h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vendor / Description</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Google Ads" value={newExpense.vendor} onChange={e => setNewExpense({...newExpense, vendor: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ($)</label>
                    <input type="number" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="0.00" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}>
                        <option>Software</option>
                        <option>Marketing</option>
                        <option>Personnel</option>
                        <option>Office</option>
                        <option>Legal</option>
                        <option>Other</option>
                    </select>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frequency</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm" value={newExpense.frequency} onChange={e => setNewExpense({...newExpense, frequency: e.target.value as any})}>
                        <option>Monthly</option>
                        <option>Yearly</option>
                        <option>One-time</option>
                    </select>
                </div>
                <div className="md:col-span-1">
                    <button onClick={handleAddExpense} className="w-full bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700 shadow-md text-sm">Add Entry</button>
                </div>
            </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Monthly Recurring (Burn)</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">${totalMonthlyRecurring.toLocaleString()}</h3>
                <p className="text-xs text-slate-500 mt-2">Fixed SaaS & Overhead</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <TrendingUp size={24} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Marketing Spend</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">${marketingSpend.toLocaleString()}</h3>
                <p className="text-xs text-slate-500 mt-2">Customer Acquisition Cost</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Megaphone size={24} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Total Expenses (Mo)</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">${totalSpend.toLocaleString()}</h3>
                <p className="text-xs text-slate-500 mt-2">Includes One-time costs</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <DollarSign size={24} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Spend List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Tag size={18} className="text-slate-500" /> Recent Transactions
                </h3>
                <div className="flex gap-2">
                    {['All', 'Software', 'Marketing', 'Personnel'].map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setFilter(cat)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${filter === cat ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[500px]">
                <table className="w-full text-left">
                    <thead className="bg-white text-xs font-bold text-slate-500 uppercase border-b border-slate-100 sticky top-0">
                        <tr>
                            <th className="px-6 py-3">Vendor</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Freq</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredExpenses.map(expense => (
                            <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{expense.vendor}</div>
                                    <div className="text-xs text-slate-500">{expense.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                        expense.category === 'Software' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        expense.category === 'Marketing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-600">{expense.frequency}</td>
                                <td className="px-6 py-4 text-xs text-slate-500 font-mono">{expense.date}</td>
                                <td className="px-6 py-4 text-right font-bold text-slate-800">${expense.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(expense.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredExpenses.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                        <FileText size={48} className="mx-auto mb-2 opacity-20" />
                        <p>No expenses found in this category.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right: Charts & Breakdown */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[300px]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChart size={18} className="text-purple-500"/> Spend by Category</h3>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                            <Tooltip cursor={{fill: 'transparent'}} formatter={(val) => `$${val.toLocaleString()}`} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-xl p-6 text-white shadow-lg">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Briefcase size={18} className="text-yellow-400"/> Recommended Stack</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/10">
                        <Smartphone size={18} className="text-blue-400" />
                        <div>
                            <p className="text-xs font-bold text-blue-200">Communication</p>
                            <p className="text-sm font-bold">Twilio / RingCentral</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/10">
                        <Server size={18} className="text-purple-400" />
                        <div>
                            <p className="text-xs font-bold text-purple-200">Hosting & DB</p>
                            <p className="text-sm font-bold">Vercel + Supabase</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/10">
                        <Megaphone size={18} className="text-amber-400" />
                        <div>
                            <p className="text-xs font-bold text-amber-200">Marketing</p>
                            <p className="text-sm font-bold">Meta Ads Manager</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default ExpenseTracker;
