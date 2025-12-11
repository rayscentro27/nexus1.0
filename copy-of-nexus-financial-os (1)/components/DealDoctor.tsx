
import React, { useState } from 'react';
import { Contact, RescuePlan } from '../types';
import { Stethoscope, AlertTriangle, CheckCircle, Clock, Activity, RefreshCw, ArrowRight } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface DealDoctorProps {
  contact: Contact;
  onUpdateContact?: (contact: Contact) => void;
}

const DealDoctor: React.FC<DealDoctorProps> = ({ contact, onUpdateContact }) => {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [plan, setPlan] = useState<RescuePlan | null>(contact.rescuePlan || null);

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    const rescuePlan = await geminiService.generateRescuePlan(contact);
    setPlan(rescuePlan);
    if (onUpdateContact && rescuePlan) {
        onUpdateContact({ ...contact, rescuePlan });
    }
    setIsDiagnosing(false);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
               <Stethoscope className="text-red-500" size={24} /> Deal Doctor
            </h2>
            <p className="text-slate-500 text-sm mt-1">Diagnose declined deals and generate a recovery roadmap.</p>
         </div>
         <button 
           onClick={handleDiagnose}
           disabled={isDiagnosing}
           className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-red-200 flex items-center gap-2 transition-all disabled:opacity-50"
         >
            {isDiagnosing ? <RefreshCw className="animate-spin" size={18}/> : <Activity size={18}/>}
            {isDiagnosing ? 'Running Diagnostics...' : 'Diagnose Deal'}
         </button>
      </div>

      {plan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Left: Vitals */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Approval Probability</p>
                    <div className="flex items-end gap-2">
                       <h3 className={`text-4xl font-bold ${plan.approvalProbability > 70 ? 'text-emerald-400' : plan.approvalProbability > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {plan.approvalProbability}%
                       </h3>
                       <span className="text-slate-400 text-sm mb-1">after fix</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Est. Recovery Time</p>
                       <p className="text-white font-bold flex items-center gap-2 mt-1"><Clock size={16} className="text-blue-400"/> {plan.estimatedRecoveryTime}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={18} /> Deal Killers
                 </h4>
                 <div className="space-y-3">
                    {plan.dealKillers.map((killer, idx) => (
                       <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${killer.impact === 'High' ? 'bg-red-600' : 'bg-orange-500'}`}></div>
                          <div>
                             <p className="text-sm font-bold text-slate-800">{killer.issue}</p>
                             <p className="text-xs text-red-600 font-bold uppercase mt-0.5">{killer.impact} Impact</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right: Treatment Plan */}
           <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 text-lg mb-2">Diagnosis</h3>
              <p className="text-slate-600 mb-8 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
                 "{plan.diagnosis}"
              </p>

              <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                 <CheckCircle className="text-emerald-500" size={20} /> Treatment Plan
              </h3>
              
              <div className="flex-1 space-y-4">
                 {plan.prescription.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start group">
                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {idx + 1}
                       </div>
                       <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                          <p className="text-slate-800 font-medium">{step.step}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={10}/> ETA: {step.timeframe}</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-8 flex justify-end">
                 <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-md flex items-center gap-2 transition-transform hover:scale-105">
                    Start Recovery Protocol <ArrowRight size={16} />
                 </button>
              </div>
           </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
           <Stethoscope size={64} className="text-slate-300 mb-4" />
           <p className="text-slate-500 font-medium">No diagnosis yet.</p>
           <p className="text-slate-400 text-sm">Run diagnostics to uncover why this deal stalled.</p>
        </div>
      )}

    </div>
  );
};

export default DealDoctor;
