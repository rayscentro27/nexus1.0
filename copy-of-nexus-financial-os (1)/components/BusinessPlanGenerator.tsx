
import React, { useState } from 'react';
import { Contact, BusinessPlan } from '../types';
import { BookOpen, Sparkles, Download, ArrowRight, Printer, RefreshCw, CheckCircle, Lightbulb } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface BusinessPlanGeneratorProps {
  contact?: Contact; // Optional, can be used standalone
}

const BusinessPlanGenerator: React.FC<BusinessPlanGeneratorProps> = ({ contact }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<BusinessPlan | null>(contact?.businessPlan || null);

  const [formData, setFormData] = useState({
    companyName: contact?.company || '',
    industry: contact?.businessProfile?.industry || '',
    targetMarket: '',
    revenueModel: '',
    usp: '' // Unique Selling Proposition
  });

  const steps = [
    { id: 1, title: 'Identity', desc: 'Company basics' },
    { id: 2, title: 'Market', desc: 'Who you serve' },
    { id: 3, title: 'Strategy', desc: 'How you win' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const execSum = await geminiService.generateBusinessPlanSection('Executive Summary', formData);
      const companyOverview = await geminiService.generateBusinessPlanSection('Company Overview', formData);
      const marketAnalysis = await geminiService.generateBusinessPlanSection('Market Analysis', formData);
      const marketing = await geminiService.generateBusinessPlanSection('Marketing Strategy', formData);
      const financials = await geminiService.generateBusinessPlanSection('Financial Projections', formData);

      const plan: BusinessPlan = {
        id: `bp_${Date.now()}`,
        companyName: formData.companyName,
        lastUpdated: new Date().toLocaleDateString(),
        sections: {
          executiveSummary: execSum,
          companyOverview: companyOverview,
          marketAnalysis: marketAnalysis,
          productsServices: 'Generated based on USP...', // Placeholder or generate more
          marketingStrategy: marketing,
          financialPlan: financials
        }
      };
      setGeneratedPlan(plan);
    } catch (e) {
      alert("Error generating plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (generatedPlan && !isGenerating) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in pb-10">
        <div className="flex justify-between items-center mb-8 no-print">
           <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <BookOpen size={32} className="text-indigo-600" /> Business Plan
           </h1>
           <div className="flex gap-3">
             <button onClick={() => setGeneratedPlan(null)} className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50">Edit Inputs</button>
             <button onClick={handlePrint} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"><Printer size={18}/> Print / PDF</button>
           </div>
        </div>

        <div className="bg-white shadow-2xl rounded-none md:rounded-xl overflow-hidden print:shadow-none print:w-full">
           {/* Cover Page */}
           <div className="bg-slate-900 text-white p-20 text-center print:break-after-page relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-5xl font-serif font-bold mb-4">{generatedPlan.companyName}</h1>
                <p className="text-xl text-slate-300 tracking-widest uppercase">Business Plan</p>
                <p className="mt-12 text-sm text-slate-400">Prepared on {generatedPlan.lastUpdated}</p>
              </div>
              <div className="absolute top-0 right-0 p-10 opacity-10"><Sparkles size={300} /></div>
           </div>

           <div className="p-12 md:p-20 space-y-16 max-w-4xl mx-auto">
              <section>
                 <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-600 pb-2 mb-6 uppercase tracking-wide">Executive Summary</h2>
                 <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">
                    {generatedPlan.sections.executiveSummary}
                 </div>
              </section>

              <section>
                 <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-600 pb-2 mb-6 uppercase tracking-wide">Company Overview</h2>
                 <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">
                    {generatedPlan.sections.companyOverview}
                 </div>
              </section>

              <section>
                 <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-600 pb-2 mb-6 uppercase tracking-wide">Market Analysis</h2>
                 <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">
                    {generatedPlan.sections.marketAnalysis}
                 </div>
              </section>

              <section className="print:break-before-page">
                 <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-600 pb-2 mb-6 uppercase tracking-wide">Strategy & Implementation</h2>
                 <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">
                    {generatedPlan.sections.marketingStrategy}
                 </div>
              </section>

              <section>
                 <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-600 pb-2 mb-6 uppercase tracking-wide">Financial Plan</h2>
                 <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">
                    {generatedPlan.sections.financialPlan}
                 </div>
              </section>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
           <div className="relative z-10">
             <h2 className="text-3xl font-bold mb-2">Plan Wizard</h2>
             <p className="text-slate-400">Create a lender-ready business plan in minutes.</p>
           </div>
           <div className="absolute right-6 top-6 opacity-20"><BookOpen size={100} /></div>
        </div>

        {/* Wizard Progress */}
        <div className="bg-slate-100 p-1 flex">
           {steps.map((s, i) => (
             <div key={s.id} className={`flex-1 text-center py-3 text-xs font-bold uppercase tracking-wider ${step === s.id ? 'bg-white shadow-sm text-indigo-600 rounded-lg' : 'text-slate-400'}`}>
                {s.title}
             </div>
           ))}
        </div>

        {/* Content */}
        <div className="p-8 flex-1">
           {isGenerating ? (
             <div className="text-center py-20">
                <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-6" size={64} />
                <h3 className="text-xl font-bold text-slate-800">Drafting your plan...</h3>
                <p className="text-slate-500 mt-2">Writing Executive Summary...</p>
             </div>
           ) : (
             <>
               {step === 1 && (
                 <div className="space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                      <input type="text" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Acme Inc." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                      <input type="text" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="e.g. Construction, SaaS" />
                    </div>
                 </div>
               )}

               {step === 2 && (
                 <div className="space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Target Market</label>
                      <textarea className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none" value={formData.targetMarket} onChange={e => setFormData({...formData, targetMarket: e.target.value})} placeholder="Who are your customers? e.g. Homeowners in Florida aged 30-50..." />
                    </div>
                 </div>
               )}

               {step === 3 && (
                 <div className="space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Revenue Model</label>
                      <input type="text" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.revenueModel} onChange={e => setFormData({...formData, revenueModel: e.target.value})} placeholder="e.g. Subscription, Hourly Service, Retail Sales" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Unique Selling Proposition (USP)</label>
                      <textarea className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none" value={formData.usp} onChange={e => setFormData({...formData, usp: e.target.value})} placeholder="Why do customers choose you over competitors?" />
                    </div>
                 </div>
               )}
             </>
           )}
        </div>

        {/* Footer */}
        {!isGenerating && (
          <div className="p-6 border-t border-slate-100 flex justify-between bg-slate-50">
             {step > 1 ? (
               <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200">Back</button>
             ) : (<div></div>)}
             
             {step < 3 ? (
               <button onClick={() => setStep(step + 1)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2">Next <ArrowRight size={18}/></button>
             ) : (
               <button onClick={handleGenerate} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200"><Sparkles size={18}/> Generate Plan</button>
             )}
          </div>
        )}

      </div>
    </div>
  );
};

export default BusinessPlanGenerator;
