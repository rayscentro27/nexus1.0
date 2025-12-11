
import React, { useState } from 'react';
import { LeadForm, Contact } from '../types';
import { LayoutTemplate, Sparkles, Eye, Save, Code, CheckCircle, RefreshCw, Palette, Type, MousePointerClick, ExternalLink } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface FormBuilderProps {
  onAddLead?: (lead: Partial<Contact>) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ onAddLead }) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [form, setForm] = useState<LeadForm>({
    id: `form_${Date.now()}`,
    name: 'New Campaign',
    industry: '',
    themeColor: '#2563eb',
    headline: 'Get the Capital Your Business Needs',
    subhead: 'Fast, flexible funding options tailored to your industry.',
    benefits: ['Approval in 24 hours', 'Rates as low as 6%', 'No hard credit check'],
    fields: ['name', 'email', 'phone', 'company', 'revenue'],
    buttonText: 'Check Eligibility',
    totalSubmissions: 0
  });

  const [aiInput, setAiInput] = useState({ industry: '', offer: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>({});

  const handleAiGenerate = async () => {
    if (!aiInput.industry || !aiInput.offer) return;
    setIsGenerating(true);
    const copy = await geminiService.generateLandingPageCopy(aiInput.industry, aiInput.offer);
    
    setForm(prev => ({
        ...prev,
        industry: aiInput.industry,
        headline: copy.headline,
        subhead: copy.subhead,
        benefits: copy.benefits || prev.benefits,
        buttonText: copy.buttonText
    }));
    setIsGenerating(false);
  };

  const toggleField = (field: any) => {
    const newFields = form.fields.includes(field) 
        ? form.fields.filter(f => f !== field)
        : [...form.fields, field];
    setForm({ ...form, fields: newFields as any });
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddLead) {
        onAddLead({
            name: submissionData.name || 'Unknown',
            company: submissionData.company || 'Unknown',
            email: submissionData.email || '',
            phone: submissionData.phone || '',
            revenue: Number(submissionData.revenue) || 0,
            status: 'Lead',
            source: `Landing Page: ${form.name}`,
            notes: `Submitted via Form Builder Preview.\nIndustry: ${form.industry}`
        });
        alert("Lead submitted successfully!");
        setShowLiveModal(false);
        setSubmissionData({});
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <LayoutTemplate className="text-blue-600" size={32} /> Lead Gen Builder
            </h1>
            <p className="text-slate-500 mt-2">Create high-converting landing pages with AI copy.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={() => setShowLiveModal(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 shadow-sm transition-colors">
                <Eye size={18} /> Test Live
            </button>
            <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 shadow-lg transition-colors">
                <Save size={18} /> Publish
            </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
          
          {/* LEFT: Editor Panel */}
          <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 font-bold text-slate-700">
                  <Sparkles size={18} className="text-indigo-500" /> AI Content Wizard
              </div>
              <div className="p-6 space-y-4 border-b border-slate-100">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Industry</label>
                      <input 
                        type="text" 
                        value={aiInput.industry} 
                        onChange={e => setAiInput({...aiInput, industry: e.target.value})}
                        placeholder="e.g. Restaurants, Trucking"
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Offer / Hook</label>
                      <input 
                        type="text" 
                        value={aiInput.offer} 
                        onChange={e => setAiInput({...aiInput, offer: e.target.value})}
                        placeholder="e.g. Equipment Financing"
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                      />
                  </div>
                  <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiInput.industry}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                      {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                      Generate Copy
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                      <div className="flex items-center gap-2 font-bold text-slate-700 mb-3 text-sm">
                          <Palette size={16} /> Branding
                      </div>
                      <div className="flex gap-2">
                          {['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#0f172a'].map(color => (
                              <button 
                                key={color}
                                onClick={() => setForm({...form, themeColor: color})}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${form.themeColor === color ? 'border-slate-400 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                              />
                          ))}
                      </div>
                  </div>

                  <div>
                      <div className="flex items-center gap-2 font-bold text-slate-700 mb-3 text-sm">
                          <Type size={16} /> Content
                      </div>
                      <div className="space-y-3">
                          <input className="w-full p-2 border border-slate-200 rounded text-sm" value={form.headline} onChange={e => setForm({...form, headline: e.target.value})} placeholder="Headline" />
                          <textarea className="w-full p-2 border border-slate-200 rounded text-sm h-20 resize-none" value={form.subhead} onChange={e => setForm({...form, subhead: e.target.value})} placeholder="Subheader" />
                          <input className="w-full p-2 border border-slate-200 rounded text-sm" value={form.buttonText} onChange={e => setForm({...form, buttonText: e.target.value})} placeholder="Button Text" />
                      </div>
                  </div>

                  <div>
                      <div className="flex items-center gap-2 font-bold text-slate-700 mb-3 text-sm">
                          <MousePointerClick size={16} /> Form Fields
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          {['name', 'email', 'phone', 'company', 'revenue', 'timeInBusiness'].map(field => (
                              <button 
                                key={field}
                                onClick={() => toggleField(field)}
                                className={`text-xs py-2 px-3 rounded border transition-all text-left capitalize ${
                                    form.fields.includes(field as any) 
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' 
                                    : 'bg-white border-slate-200 text-slate-500'
                                }`}
                              >
                                  {field.replace(/([A-Z])/g, ' $1').trim()}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="w-full md:w-2/3 bg-slate-100 rounded-xl border border-slate-300 shadow-inner flex flex-col overflow-hidden relative">
              <div className="bg-slate-200 p-2 flex items-center gap-2 border-b border-slate-300">
                  <div className="flex gap-1.5 ml-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="bg-white px-4 py-1 rounded text-xs text-slate-400 flex-1 text-center font-mono mx-4">nexus.funding/apply/{form.id}</div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-white relative">
                  {/* Landing Page Preview */}
                  <div className="max-w-4xl mx-auto">
                      <header className="py-6 px-8 flex justify-between items-center border-b border-slate-50">
                          <div className="font-bold text-xl flex items-center gap-2" style={{ color: form.themeColor }}>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: form.themeColor }}>N</div>
                              Nexus
                          </div>
                          <button className="text-sm font-medium hover:underline">Contact Us</button>
                      </header>

                      <main className="flex flex-col md:flex-row">
                          <div className="flex-1 p-12 flex flex-col justify-center">
                              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                                  {form.headline}
                              </h1>
                              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                  {form.subhead}
                              </p>
                              <div className="space-y-3 mb-8">
                                  {form.benefits?.map((benefit, i) => (
                                      <div key={i} className="flex items-center gap-3 text-slate-700">
                                          <CheckCircle size={20} style={{ color: form.themeColor }} />
                                          {benefit}
                                      </div>
                                  ))}
                              </div>
                          </div>

                          <div className="md:w-[400px] bg-slate-50 p-8 border-l border-slate-100 flex flex-col justify-center min-h-[600px]">
                              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                                  <h3 className="font-bold text-xl text-slate-800 mb-4">Get Started</h3>
                                  <div className="space-y-4">
                                      {form.fields.map(field => (
                                          <div key={field}>
                                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                                              <input disabled className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="..." />
                                          </div>
                                      ))}
                                      <button 
                                        className="w-full py-3 text-white font-bold rounded-lg shadow-md mt-2"
                                        style={{ backgroundColor: form.themeColor }}
                                      >
                                          {form.buttonText}
                                      </button>
                                      <p className="text-[10px] text-center text-slate-400 mt-2">Secure 256-bit Encryption. No credit impact.</p>
                                  </div>
                              </div>
                          </div>
                      </main>
                  </div>
              </div>
          </div>
      </div>

      {/* Live Modal for Test Submission */}
      {showLiveModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-fade-in relative">
                  <button onClick={() => setShowLiveModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><ExternalLink size={20} className="rotate-180" /></button>
                  <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-900">{form.headline}</h2>
                      <p className="text-sm text-slate-500 mt-1">Live Preview Mode</p>
                  </div>
                  <form onSubmit={handleSimulateSubmit} className="space-y-4">
                      {form.fields.map(field => (
                          <div key={field}>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{field}</label>
                              <input 
                                required
                                type={field === 'email' ? 'email' : field === 'revenue' ? 'number' : 'text'}
                                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={e => setSubmissionData({...submissionData, [field]: e.target.value})}
                              />
                          </div>
                      ))}
                      <button 
                        type="submit"
                        className="w-full py-3 text-white font-bold rounded-lg shadow-lg mt-4 hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: form.themeColor }}
                      >
                          {form.buttonText}
                      </button>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

export default FormBuilder;
