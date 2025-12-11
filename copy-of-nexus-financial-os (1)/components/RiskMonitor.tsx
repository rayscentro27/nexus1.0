
import React, { useState, useEffect } from 'react';
import { RiskAlert } from '../types';
import { ShieldAlert, AlertTriangle, Search, Activity, Lock, Scale, FileWarning, RefreshCw, Eye, CheckCircle } from 'lucide-react';
import * as geminiService from '../services/geminiService';

const MOCK_ALERTS: RiskAlert[] = [
  { id: 'alert_1', contactId: '1', contactName: 'TechCorp Solutions', type: 'UCC Filing', severity: 'Critical', description: 'UCC-1 Filed by QuickCapital LLC. Potential Stacking.', date: 'Today, 9:00 AM', status: 'Active', source: 'State SOS' },
  { id: 'alert_2', contactId: '2', contactName: 'BuildIt Construction', type: 'Inquiry', severity: 'Medium', description: 'Hard Inquiry from OnDeck Capital.', date: 'Yesterday', status: 'Active', source: 'Experian' },
  { id: 'alert_3', contactId: '3', contactName: 'Downtown Retail', type: 'Lien', severity: 'High', description: 'Tax Lien Filed by IRS.', date: '2 days ago', status: 'Resolved', source: 'Public Records' },
];

const RiskMonitor: React.FC = () => {
  const [alerts, setAlerts] = useState<RiskAlert[]>(MOCK_ALERTS);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
        // Simulate finding a new risk
        const newAlert: RiskAlert = {
            id: `alert_${Date.now()}`,
            contactId: 'new_risk',
            contactName: 'Fresh Foods Market',
            type: 'Lawsuit',
            severity: 'High',
            description: 'Breach of Contract suit filed in NY Supreme Court.',
            date: 'Just now',
            status: 'Active',
            source: 'Court Records'
        };
        setAlerts([newAlert, ...alerts]);
        setIsScanning(false);
    }, 2000);
  };

  const handleAnalyzeAlert = async (alert: RiskAlert) => {
    setSelectedAlert(alert);
    setAiAnalysis(null);
    const analysis = await geminiService.analyzeRiskEvent(alert);
    setAiAnalysis(analysis);
  };

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    if (selectedAlert?.id === id) setSelectedAlert(null);
  };

  const criticalCount = alerts.filter(a => a.severity === 'Critical' && a.status === 'Active').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-red-600" size={32} /> AI Risk & Stacking Monitor
          </h1>
          <p className="text-slate-500 mt-2">Protect your portfolio from stacking, liens, and legal threats.</p>
        </div>
        <button 
            onClick={handleScan}
            disabled={isScanning}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
            {isScanning ? <RefreshCw className="animate-spin" size={20} /> : <Activity size={20} />}
            {isScanning ? 'Scanning Records...' : 'Run Portfolio Scan'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className={`p-6 rounded-xl border shadow-sm ${criticalCount > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <p className="text-xs font-bold uppercase mb-2 tracking-wider opacity-70">Portfolio Status</p>
            <h3 className={`text-2xl font-black ${criticalCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {criticalCount > 0 ? `${criticalCount} THREATS DETECTED` : 'SECURE'}
            </h3>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Active Alerts</p>
            <h3 className="text-3xl font-bold text-slate-900">{alerts.filter(a => a.status === 'Active').length}</h3>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">UCC Filings (30d)</p>
            <h3 className="text-3xl font-bold text-slate-900">4</h3>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Clients Monitored</p>
            <h3 className="text-3xl font-bold text-blue-600">142</h3>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Alert Feed */}
         <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500"/> Risk Events Feed</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {alerts.map(alert => (
                    <div 
                        key={alert.id} 
                        onClick={() => handleAnalyzeAlert(alert)}
                        className={`p-4 flex items-start gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedAlert?.id === alert.id ? 'bg-blue-50' : ''}`}
                    >
                        <div className={`p-2 rounded-lg shrink-0 ${
                            alert.severity === 'Critical' ? 'bg-red-100 text-red-600' : 
                            alert.severity === 'High' ? 'bg-orange-100 text-orange-600' :
                            'bg-yellow-100 text-yellow-600'
                        }`}>
                            {alert.type === 'UCC Filing' ? <FileWarning size={20}/> : 
                             alert.type === 'Lawsuit' ? <Scale size={20}/> : <Activity size={20}/>}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-900 text-sm">{alert.contactName}</h4>
                                <span className="text-[10px] text-slate-400">{alert.date}</span>
                            </div>
                            <div className="flex gap-2 items-center mb-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                    alert.severity === 'Critical' ? 'bg-red-600 text-white' : 
                                    alert.severity === 'High' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'
                                }`}>
                                    {alert.severity}
                                </span>
                                <span className="text-xs font-medium text-slate-500 border border-slate-200 px-1.5 rounded">{alert.type}</span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-1">{alert.description}</p>
                        </div>
                        <div className="flex items-center">
                            {alert.status === 'Active' ? <div className="w-2 h-2 bg-red-500 rounded-full"></div> : <CheckCircle size={16} className="text-green-500"/>}
                        </div>
                    </div>
                ))}
            </div>
         </div>

         {/* Analysis Panel */}
         <div className="lg:col-span-1 bg-slate-900 text-white rounded-xl p-6 shadow-xl flex flex-col relative overflow-hidden">
            {selectedAlert ? (
                <>
                    <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-4">Incident Report</h3>
                    <div className="flex-1 space-y-6">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Client</p>
                            <p className="font-bold text-lg">{selectedAlert.contactName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Alert Details</p>
                            <p className="text-sm text-slate-300 leading-relaxed bg-slate-800 p-3 rounded-lg border border-slate-700">
                                {selectedAlert.description}
                            </p>
                        </div>
                        
                        {aiAnalysis ? (
                            <div className="bg-indigo-900/50 p-4 rounded-xl border border-indigo-500/30 animate-fade-in">
                                <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2"><Eye size={16}/> AI Recommendation</h4>
                                <p className="text-sm text-indigo-100 mb-3">{aiAnalysis.recommendation}</p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] bg-indigo-800 px-2 py-1 rounded text-white">Impact: {aiAnalysis.severity}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-500 flex flex-col items-center">
                                <RefreshCw className="animate-spin mb-2" />
                                <span className="text-xs">AI Analyzing Threat...</span>
                            </div>
                        )}
                        
                        {selectedAlert.status === 'Active' && (
                            <div className="grid grid-cols-2 gap-3 mt-auto pt-6">
                                <button className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1">
                                    <Lock size={12} /> Freeze Funding
                                </button>
                                <button onClick={() => handleResolve(selectedAlert.id)} className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-bold text-xs">
                                    Mark Resolved
                                </button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                    <ShieldAlert size={64} className="mb-4 opacity-20" />
                    <p className="text-sm text-center">Select an alert to view AI analysis and response options.</p>
                </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default RiskMonitor;
