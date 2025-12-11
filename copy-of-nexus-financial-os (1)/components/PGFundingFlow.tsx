
import React, { useState } from 'react';
import { FundingFlowStep } from '../types';
import { CheckCircle, Circle, ArrowRight, Video, DollarSign, FileText, ShieldCheck, Loader, CreditCard, Play, Plus, Trash2 } from 'lucide-react';

interface InvoiceItem {
    id: string;
    description: string;
    amount: number;
}

const PGFundingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [creditScore, setCreditScore] = useState('');
  const [isQualified, setIsQualified] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  
  // Invoice State
  const [items, setItems] = useState<InvoiceItem[]>([
      { id: '1', description: 'Success Fee (10%)', amount: 5000 }
  ]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const steps = [
    { id: 1, title: 'Qualification', desc: 'Credit Check' },
    { id: 2, title: 'Entity Setup', desc: 'LLC Validation' },
    { id: 3, title: 'Application', desc: 'Guided Apply' },
    { id: 4, title: 'Success', desc: 'Invoicing' },
  ];

  const handleQualify = () => {
    if (Number(creditScore) >= 680) {
      setIsQualified(true);
      setTimeout(() => setCurrentStep(2), 1000);
    } else {
      alert("Credit Score must be 680+ for PG Funding. Please visit the Credit Repair tab.");
    }
  };

  const handleStartApplication = () => {
    // Simulate opening Google Meet
    window.open('https://meet.google.com/new', '_blank');
    alert("Starting Guided Application Session. Please share your screen with the advisor.");
  };

  const handleAddItem = () => {
      if (newItemDesc && newItemAmount) {
          setItems([...items, { id: Date.now().toString(), description: newItemDesc, amount: Number(newItemAmount) }]);
          setNewItemDesc('');
          setNewItemAmount('');
      }
  };

  const handleRemoveItem = (id: string) => {
      setItems(items.filter(i => i.id !== id));
  };

  const handleGenerateInvoice = () => {
    setShowInvoice(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CreditCard className="text-blue-600" size={32} /> PG Funding Flow
          </h1>
          <p className="text-slate-500 mt-2">Personal Guarantee 0% Interest Funding Program.</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between relative overflow-hidden">
         <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-0 -translate-y-1/2"></div>
         <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-0 -translate-y-1/2 transition-all duration-500" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
         
         {steps.map((step) => {
           const isActive = step.id === currentStep;
           const isDone = step.id < currentStep;
           return (
             <div key={step.id} className="relative z-10 flex flex-col items-center bg-white px-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${isActive ? 'border-blue-600 bg-blue-600 text-white' : isDone ? 'border-blue-600 bg-white text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                   {isDone ? <CheckCircle size={20} /> : step.id}
                </div>
                <div className="mt-2 text-center">
                   <p className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{step.title}</p>
                   <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
             </div>
           );
         })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Workflow Area */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Step 1: Qualification */}
           {currentStep === 1 && (
             <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><ShieldCheck size={24} className="text-blue-600" /> Pre-Qualification</h3>
                <div className="space-y-6">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Personal Credit Score (FICO 8)</label>
                      <input 
                        type="number" 
                        value={creditScore}
                        onChange={(e) => setCreditScore(e.target.value)}
                        className="w-full text-3xl font-bold p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="000"
                      />
                      <p className="text-xs text-slate-500 mt-2">Must be 680+ across all 3 bureaus.</p>
                   </div>
                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                      <strong>Requirements:</strong>
                      <ul className="list-disc pl-4 mt-2 space-y-1">
                         <li>Under 30% Credit Utilization</li>
                         <li>No recent late payments (24 months)</li>
                         <li>Less than 4 inquiries in last 6 months</li>
                      </ul>
                   </div>
                   <button 
                     onClick={handleQualify}
                     className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
                   >
                     Check Eligibility <ArrowRight size={20} />
                   </button>
                </div>
             </div>
           )}

           {/* Step 2: Entity Check */}
           {currentStep === 2 && (
             <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FileText size={24} className="text-indigo-600" /> Entity Validation</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <CheckCircle className="text-emerald-500" />
                      <div className="flex-1">
                         <h4 className="font-bold text-slate-800">LLC Formation</h4>
                         <p className="text-sm text-slate-500">Articles of Organization filed</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <CheckCircle className="text-emerald-500" />
                      <div className="flex-1">
                         <h4 className="font-bold text-slate-800">EIN Active</h4>
                         <p className="text-sm text-slate-500">IRS Tax ID Letter (CP575)</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <CheckCircle className="text-emerald-500" />
                      <div className="flex-1">
                         <h4 className="font-bold text-slate-800">Good Standing</h4>
                         <p className="text-sm text-slate-500">Certificate from Secretary of State</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setCurrentStep(3)}
                     className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2 mt-6"
                   >
                     Confirm & Proceed <ArrowRight size={20} />
                   </button>
                </div>
             </div>
           )}

           {/* Step 3: Application */}
           {currentStep === 3 && (
             <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Video size={24} className="text-red-600" /> Guided Application</h3>
                <p className="text-slate-600 mb-6">
                   We will guide you through the application process live. Please ensure you are on a desktop computer and ready to share your screen.
                </p>
                
                <div className="space-y-4 mb-8">
                   <h4 className="text-sm font-bold text-slate-500 uppercase">Target Cards (0% Interest)</h4>
                   <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">C</div>
                         <div><p className="font-bold text-slate-900">Chase Ink Business</p><p className="text-xs text-slate-500">0% for 12 Months</p></div>
                      </div>
                      <span className="text-emerald-600 font-bold text-sm">High Approval Odds</span>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-400 rounded flex items-center justify-center text-white font-bold">A</div>
                         <div><p className="font-bold text-slate-900">Amex Blue Business</p><p className="text-xs text-slate-500">0% for 12 Months</p></div>
                      </div>
                      <span className="text-emerald-600 font-bold text-sm">High Approval Odds</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={handleStartApplication}
                     className="bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 shadow-lg flex items-center justify-center gap-2"
                   >
                     <Video size={20} /> Start Google Meet
                   </button>
                   <button 
                     onClick={() => setCurrentStep(4)}
                     className="bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2"
                   >
                     Mark Complete <CheckCircle size={20} />
                   </button>
                </div>
             </div>
           )}

           {/* Step 4: Smart Invoice Builder */}
           {currentStep === 4 && (
             <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign size={40} className="text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">Funding Successful!</h3>
                    <p className="text-slate-500">Create your invoice to finalize the deal.</p>
                </div>
                
                {!showInvoice ? (
                   <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-sm font-bold text-slate-700 mb-3">Line Items</h4>
                          <div className="space-y-2">
                              {items.map(item => (
                                  <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                                      <span className="text-sm text-slate-700">{item.description}</span>
                                      <div className="flex items-center gap-3">
                                          <span className="font-bold text-slate-900">${item.amount.toLocaleString()}</span>
                                          <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                              <input 
                                className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" 
                                placeholder="Description (e.g. Consulting Fee)"
                                value={newItemDesc}
                                onChange={(e) => setNewItemDesc(e.target.value)}
                              />
                              <input 
                                className="w-24 p-2 border border-slate-300 rounded-lg text-sm" 
                                type="number" 
                                placeholder="$ Amount"
                                value={newItemAmount}
                                onChange={(e) => setNewItemAmount(e.target.value)}
                              />
                              <button onClick={handleAddItem} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Plus size={18}/></button>
                          </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                          <span className="text-lg font-bold text-slate-700">Total Invoice</span>
                          <span className="text-2xl font-black text-emerald-600">${totalAmount.toLocaleString()}</span>
                      </div>

                      <button 
                        onClick={handleGenerateInvoice}
                        disabled={items.length === 0}
                        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 shadow-lg disabled:opacity-50"
                      >
                        Generate & Send Invoice
                      </button>
                   </div>
                ) : (
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left max-w-sm mx-auto animate-fade-in">
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                         <span className="font-bold text-slate-700">Invoice #1024</span>
                         <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">PENDING</span>
                      </div>
                      <div className="space-y-2 mb-6">
                         {items.map(item => (
                             <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-slate-500">{item.description}</span>
                                <span className="font-bold">${item.amount.toLocaleString()}</span>
                             </div>
                         ))}
                         <div className="pt-2 border-t border-slate-200 flex justify-between text-base">
                            <span className="font-bold text-slate-800">Total Due</span>
                            <span className="font-black text-emerald-600">${totalAmount.toLocaleString()}</span>
                         </div>
                      </div>
                      <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 flex items-center justify-center gap-2">
                         Pay via Stripe <ArrowRight size={16} />
                      </button>
                   </div>
                )}
             </div>
           )}

        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Play className="text-yellow-400 fill-yellow-400" size={20} /> Video Guide</h3>
              <p className="text-slate-300 text-sm mb-4">Watch how the PG Funding process works step-by-step.</p>
              <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors border border-white/10">
                 <Play size={40} className="text-white opacity-80" />
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4">Why PG Funding?</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                 <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 flex-shrink-0" /> 0% Interest for 12-18 Months</li>
                 <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 flex-shrink-0" /> Does not report to personal credit</li>
                 <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 flex-shrink-0" /> Build business credit fast</li>
                 <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 flex-shrink-0" /> High limits ($50k - $250k)</li>
              </ul>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PGFundingFlow;
