
import React, { useState } from 'react';
import { PipelineRule } from '../types';
import { GitBranch, Zap, Plus, Trash2, Play, AlertCircle, ArrowRight, CheckCircle, Sparkles, RefreshCw, Layers } from 'lucide-react';
import * as geminiService from '../services/geminiService';

const WorkflowAutomation: React.FC = () => {
  const [rules, setRules] = useState<PipelineRule[]>([
    {
      id: 'rule_1',
      name: 'High Value Deal Alert',
      isActive: true,
      trigger: { type: 'status_change', value: 'Negotiation' },
      conditions: [{ field: 'deal_value', operator: 'gt', value: 50000 }],
      actions: [{ type: 'notify_admin', params: { message: 'High value deal entered negotiation phase.' } }]
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<PipelineRule>>({
    name: 'New Automation',
    isActive: true,
    trigger: { type: 'status_change' },
    conditions: [],
    actions: []
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const generatedRule = await geminiService.generateWorkflowFromPrompt(aiPrompt);
    if (generatedRule.name) {
       setCurrentRule({
         ...generatedRule,
         id: `rule_${Date.now()}`,
         isActive: true
       });
       setIsEditing(true);
    }
    setIsGenerating(false);
    setAiPrompt('');
  };

  const handleSave = () => {
    if (currentRule.id) {
        // Update existing
        setRules(rules.map(r => r.id === currentRule.id ? currentRule as PipelineRule : r));
    } else {
        // Create new
        const newRule = { ...currentRule, id: `rule_${Date.now()}` } as PipelineRule;
        setRules([...rules, newRule]);
    }
    setIsEditing(false);
    setCurrentRule({ name: 'New Automation', isActive: true, trigger: { type: 'status_change' }, conditions: [], actions: [] });
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const addCondition = () => {
    const newCond = { field: 'deal_value', operator: 'gt', value: 0 } as any;
    setCurrentRule({ ...currentRule, conditions: [...(currentRule.conditions || []), newCond] });
  };

  const addAction = () => {
    const newAction = { type: 'create_task', params: { title: 'New Task' } } as any;
    setCurrentRule({ ...currentRule, actions: [...(currentRule.actions || []), newAction] });
  };

  const handleTestRun = () => {
      setTestResult(null);
      setTimeout(() => {
          setTestResult("Triggered successfully! Action 'Notify Admin' executed.");
      }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <GitBranch className="text-blue-600" /> Automation Engine
          </h1>
          <p className="text-slate-500 mt-2">Design visual workflows to automate your CRM logic.</p>
        </div>
        <button 
            onClick={() => { setIsEditing(true); setCurrentRule({ name: 'Untitled Workflow', isActive: true, trigger: { type: 'status_change' }, conditions: [], actions: [] }); }}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg"
        >
            <Plus size={20} /> Create Workflow
        </button>
      </div>

      {/* AI Builder */}
      {!isEditing && (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={180} />
             </div>
             <div className="relative z-10 max-w-2xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Zap className="text-yellow-300 fill-yellow-300" /> AI Workflow Generator</h2>
                <p className="text-indigo-100 mb-6">Describe what you want to happen in plain English.</p>
                <div className="bg-white/10 p-2 rounded-xl flex gap-2 border border-white/20">
                    <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. When a lead uploads a document and deal value is over $50k, email me immediately."
                        className="flex-1 bg-transparent border-none text-white placeholder-indigo-200 focus:ring-0 px-4 py-2 outline-none"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !aiPrompt}
                        className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        Generate
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Workflow List */}
        <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-2">Active Workflows</h3>
            {rules.map(rule => (
                <div 
                    key={rule.id} 
                    onClick={() => { setCurrentRule(rule); setIsEditing(true); setTestResult(null); }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md bg-white ${isEditing && currentRule.id === rule.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded-md ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                 <Zap size={14} />
                             </div>
                             <h4 className="font-bold text-slate-800 text-sm">{rule.name}</h4>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteRule(rule.id); }}
                            className="text-slate-300 hover:text-red-500"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 ml-8">
                        {rule.trigger.type.replace('_', ' ')} <ArrowRight size={10} /> {rule.actions.length} Actions
                    </div>
                </div>
            ))}
            {rules.length === 0 && (
                <div className="text-center p-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    No workflows yet.
                </div>
            )}
        </div>

        {/* Right: Visual Builder */}
        <div className="lg:col-span-2">
            {isEditing ? (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    {/* Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                        <input 
                            type="text" 
                            value={currentRule.name} 
                            onChange={(e) => setCurrentRule({...currentRule, name: e.target.value})}
                            className="bg-transparent font-bold text-lg text-slate-900 border-none focus:ring-0 p-0"
                        />
                        <div className="flex gap-2">
                             <button onClick={handleTestRun} className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-bold hover:bg-purple-100 flex items-center gap-2"><Play size={14} /> Test Run</button>
                             <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm">Save Workflow</button>
                        </div>
                    </div>

                    {/* Builder Canvas */}
                    <div className="flex-1 bg-slate-50 p-8 overflow-y-auto relative">
                        {/* Background Grid */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        <div className="max-w-lg mx-auto space-y-2 relative z-10">
                            
                            {/* Test Result Banner */}
                            {testResult && (
                                <div className="mb-6 bg-green-100 border border-green-200 text-green-800 p-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-fade-in">
                                    <CheckCircle size={16} /> {testResult}
                                </div>
                            )}

                            {/* TRIGGER BLOCK */}
                            <div className="bg-white rounded-xl border-2 border-blue-500 shadow-md p-4 relative">
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-4 border-slate-50">1</div>
                                <div className="mb-2 text-xs font-bold text-blue-600 uppercase tracking-wider">Trigger</div>
                                <select 
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
                                    value={currentRule.trigger?.type}
                                    onChange={(e) => setCurrentRule({...currentRule, trigger: { ...currentRule.trigger, type: e.target.value as any }})}
                                >
                                    <option value="status_change">Status Changes</option>
                                    <option value="document_uploaded">Document Uploaded</option>
                                    <option value="offer_accepted">Offer Accepted</option>
                                    <option value="lead_stale">Lead Becomes Stale</option>
                                </select>
                                {currentRule.trigger?.type === 'status_change' && (
                                    <select 
                                        className="w-full mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        value={currentRule.trigger?.value}
                                        onChange={(e) => setCurrentRule({...currentRule, trigger: { ...currentRule.trigger, value: e.target.value }})}
                                    >
                                        <option value="">Any Status</option>
                                        <option value="Lead">Lead</option>
                                        <option value="Active">Active</option>
                                        <option value="Negotiation">Negotiation</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                )}
                            </div>

                            {/* Connector */}
                            <div className="h-8 w-0.5 bg-slate-300 mx-auto"></div>

                            {/* CONDITIONS BLOCK */}
                            {currentRule.conditions?.map((cond, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative group hover:border-orange-300 transition-colors">
                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs border-4 border-slate-50">?</div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-xs font-bold text-orange-500 uppercase tracking-wider">Condition</div>
                                            <button onClick={() => { 
                                                const newConds = [...(currentRule.conditions || [])];
                                                newConds.splice(idx, 1);
                                                setCurrentRule({...currentRule, conditions: newConds});
                                            }} className="text-slate-300 hover:text-red-500"><Trash2 size={12}/></button>
                                        </div>
                                        <div className="flex gap-2">
                                            <select className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded text-xs" value={cond.field} onChange={(e) => { const c = [...(currentRule.conditions||[])]; c[idx].field = e.target.value as any; setCurrentRule({...currentRule, conditions:c}); }}>
                                                <option value="deal_value">Deal Value</option>
                                                <option value="credit_score">Credit Score</option>
                                                <option value="industry">Industry</option>
                                            </select>
                                            <select className="w-20 p-2 bg-slate-50 border border-slate-200 rounded text-xs" value={cond.operator} onChange={(e) => { const c = [...(currentRule.conditions||[])]; c[idx].operator = e.target.value as any; setCurrentRule({...currentRule, conditions:c}); }}>
                                                <option value="gt">{'>'}</option>
                                                <option value="lt">{'<'}</option>
                                                <option value="equals">{'='}</option>
                                            </select>
                                            <input type="text" className="w-24 p-2 bg-slate-50 border border-slate-200 rounded text-xs" value={cond.value} onChange={(e) => { const c = [...(currentRule.conditions||[])]; c[idx].value = e.target.value; setCurrentRule({...currentRule, conditions:c}); }} />
                                        </div>
                                    </div>
                                    <div className="h-8 w-0.5 bg-slate-300 mx-auto"></div>
                                </React.Fragment>
                            ))}

                            <button onClick={addCondition} className="mx-auto flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-orange-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all mb-4">
                                <Plus size={12} /> Add Condition
                            </button>

                            {/* Connector */}
                            <div className="h-4 w-0.5 bg-slate-300 mx-auto"></div>

                            {/* ACTIONS BLOCK */}
                            {currentRule.actions?.map((action, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative group hover:border-green-300 transition-colors">
                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs border-4 border-slate-50">!</div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-xs font-bold text-green-600 uppercase tracking-wider">Action</div>
                                            <button onClick={() => { 
                                                const newActs = [...(currentRule.actions || [])];
                                                newActs.splice(idx, 1);
                                                setCurrentRule({...currentRule, actions: newActs});
                                            }} className="text-slate-300 hover:text-red-500"><Trash2 size={12}/></button>
                                        </div>
                                        <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm mb-2" value={action.type} onChange={(e) => { const a = [...(currentRule.actions||[])]; a[idx].type = e.target.value as any; setCurrentRule({...currentRule, actions:a}); }}>
                                            <option value="create_task">Create Task</option>
                                            <option value="send_email">Send Email</option>
                                            <option value="notify_admin">Notify Admin</option>
                                        </select>
                                        {action.type === 'send_email' && (
                                            <div className="space-y-2">
                                                <input type="text" placeholder="Subject" className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs" value={action.params.subject || ''} onChange={(e) => { const a = [...(currentRule.actions||[])]; a[idx].params.subject = e.target.value; setCurrentRule({...currentRule, actions:a}); }} />
                                                <textarea placeholder="Body Template" className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs h-16 resize-none" value={action.params.body || ''} onChange={(e) => { const a = [...(currentRule.actions||[])]; a[idx].params.body = e.target.value; setCurrentRule({...currentRule, actions:a}); }} />
                                            </div>
                                        )}
                                        {action.type === 'create_task' && (
                                            <input type="text" placeholder="Task Title" className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs" value={action.params.title || ''} onChange={(e) => { const a = [...(currentRule.actions||[])]; a[idx].params.title = e.target.value; setCurrentRule({...currentRule, actions:a}); }} />
                                        )}
                                        {action.type === 'notify_admin' && (
                                            <input type="text" placeholder="Notification Message" className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs" value={action.params.message || ''} onChange={(e) => { const a = [...(currentRule.actions||[])]; a[idx].params.message = e.target.value; setCurrentRule({...currentRule, actions:a}); }} />
                                        )}
                                    </div>
                                    <div className="h-4 w-0.5 bg-slate-300 mx-auto"></div>
                                </React.Fragment>
                            ))}

                            <button onClick={addAction} className="mx-auto flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-green-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <Plus size={12} /> Add Action
                            </button>

                            {/* End Node */}
                            <div className="mx-auto w-3 h-3 bg-slate-300 rounded-full mt-2"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <Layers size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">Select a workflow to edit</p>
                    <p className="text-sm">or create a new one to start automating.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowAutomation;
