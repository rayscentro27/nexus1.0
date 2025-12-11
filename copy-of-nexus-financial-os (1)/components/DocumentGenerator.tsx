
import React, { useState } from 'react';
import { Contact, DocumentTemplate } from '../types';
import { FileText, Sparkles, Save, Download, Copy, RefreshCw, ChevronRight, User } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface DocumentGeneratorProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
}

const TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl_nda',
    name: 'Mutual NDA',
    category: 'Legal',
    variables: ['Company', 'Contact_Name', 'Date', 'Address'],
    content: `NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is made effective as of {{Date}}, by and between Nexus Funding Inc. ("Disclosing Party") and {{Company}} ("Receiving Party").

1. PURPOSE
The parties wish to explore a business opportunity of mutual interest and in connection with this opportunity...

2. CONFIDENTIAL INFORMATION
Confidential Information means any data or information that is proprietary to the Disclosing Party...

IN WITNESS WHEREOF, the parties have executed this Agreement.

Signed: __________________________
{{Contact_Name}}
{{Company}}
{{Address}}`
  },
  {
    id: 'tpl_fee',
    name: 'Success Fee Agreement',
    category: 'Contract',
    variables: ['Company', 'Contact_Name', 'Date', 'Fee_Percentage'],
    content: `SUCCESS FEE AGREEMENT

This Agreement is made on {{Date}} between Nexus Funding Inc. ("Agency") and {{Company}} ("Client").

1. SERVICES
Agency agrees to use its best efforts to secure funding for Client.

2. COMPENSATION
Client agrees to pay a Success Fee of {{Fee_Percentage}}% of the total funded amount upon successful closing of any financing transaction...

Accepted by:
{{Contact_Name}}
{{Company}}`
  },
  {
    id: 'tpl_loe',
    name: 'Letter of Explanation (AI)',
    category: 'Other',
    variables: ['Company', 'Date', 'Lender_Name'],
    content: `To: Underwriting Department
{{Lender_Name}}

Re: Letter of Explanation for {{Company}}
Date: {{Date}}

To Whom It May Concern,

[Use the AI Assistant on the right to draft the body of this letter based on your specific situation, e.g., explaining a drop in revenue or a past NSF.]

Sincerely,
{{Company}}`
  }
];

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ contacts, onUpdateContact }) => {
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setDocumentContent(template.content);
    
    // Auto-fill variables if contact selected
    if (selectedContact) {
      const newVars: Record<string, string> = {};
      template.variables.forEach(v => {
        if (v === 'Company') newVars[v] = selectedContact.company;
        if (v === 'Contact_Name') newVars[v] = selectedContact.name;
        if (v === 'Address') newVars[v] = selectedContact.businessProfile?.address || '';
        if (v === 'Date') newVars[v] = new Date().toLocaleDateString();
        if (v === 'Fee_Percentage') newVars[v] = '10'; // Default
      });
      setVariables(newVars);
      updatePreview(template.content, newVars);
    } else {
        setVariables({});
    }
  };

  const updatePreview = (content: string, vars: Record<string, string>) => {
    let text = content;
    Object.entries(vars).forEach(([key, val]) => {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });
    setDocumentContent(text);
  };

  const handleVariableChange = (key: string, val: string) => {
    const newVars = { ...variables, [key]: val };
    setVariables(newVars);
    if (selectedTemplate) {
        // Re-inject all variables into the *original* template content to avoid double-replacing
        let text = selectedTemplate.content;
        Object.entries(newVars).forEach(([k, v]) => {
            text = text.replace(new RegExp(`{{${k}}}`, 'g'), v);
        });
        setDocumentContent(text);
    }
  };

  const handleAIDraft = async () => {
    if (!aiPrompt) return;
    setIsDrafting(true);
    
    const context = {
        companyName: selectedContact?.company || 'The Company',
        contactName: selectedContact?.name || 'The Client',
        address: selectedContact?.businessProfile?.address || ''
    };

    const draft = await geminiService.generateLegalDocumentContent(
        selectedTemplate?.name || 'Business Document', 
        context, 
        aiPrompt
    );

    // Append or Replace logic. For LOE, we replace the bracketed text or append.
    // Simple approach: Append to cursor or end.
    setDocumentContent(prev => prev + "\n\n" + draft);
    setIsDrafting(false);
    setAiPrompt('');
  };

  const handleSaveToVault = () => {
    if (!selectedContact) { alert("Please select a contact first."); return; }
    
    const blob = new Blob([documentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const newDoc = {
        id: `doc_gen_${Date.now()}`,
        name: `${selectedTemplate?.name || 'Document'} - ${new Date().toISOString().split('T')[0]}.txt`,
        type: 'Legal' as const,
        status: 'Verified' as const,
        uploadDate: new Date().toLocaleDateString(),
        fileUrl: url
    };

    onUpdateContact({
        ...selectedContact,
        documents: [...(selectedContact.documents || []), newDoc],
        activities: [...(selectedContact.activities || []), {
            id: `act_gen_${Date.now()}`,
            type: 'system',
            description: `Generated document: ${newDoc.name}`,
            date: new Date().toLocaleString(),
            user: 'Admin'
        }]
    });
    alert("Document saved to client vault!");
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-fade-in">
      
      {/* Left Panel: Controls */}
      <div className="w-full md:w-80 flex flex-col gap-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-y-auto">
         <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">1. Select Client</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                    value={selectedContactId} 
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">-- Choose Client --</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.company} ({c.name})</option>)}
                </select>
            </div>
         </div>

         <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">2. Choose Template</label>
            <div className="space-y-2">
                {TEMPLATES.map(tpl => (
                    <button 
                        key={tpl.id}
                        onClick={() => handleTemplateSelect(tpl)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium border transition-all flex justify-between items-center ${
                            selectedTemplate?.id === tpl.id 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                    >
                        {tpl.name}
                        {selectedTemplate?.id === tpl.id && <ChevronRight size={16} />}
                    </button>
                ))}
            </div>
         </div>

         {selectedTemplate && (
             <div className="animate-fade-in">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">3. Fill Variables</label>
                 <div className="space-y-3">
                     {selectedTemplate.variables.map(v => (
                         <div key={v}>
                             <label className="text-[10px] font-bold text-slate-400 uppercase">{v.replace('_', ' ')}</label>
                             <input 
                                type="text" 
                                value={variables[v] || ''}
                                onChange={(e) => handleVariableChange(v, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-blue-500 outline-none"
                             />
                         </div>
                     ))}
                 </div>
             </div>
         )}
      </div>

      {/* Center Panel: Editor */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
         <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
             <h2 className="font-bold text-slate-800 flex items-center gap-2">
                 <FileText size={20} className="text-blue-600" /> 
                 {selectedTemplate ? selectedTemplate.name : 'Document Editor'}
             </h2>
             <div className="flex gap-2">
                 <button onClick={() => navigator.clipboard.writeText(documentContent)} className="p-2 text-slate-500 hover:bg-slate-200 rounded"><Copy size={18}/></button>
                 <button className="p-2 text-slate-500 hover:bg-slate-200 rounded"><Download size={18}/></button>
             </div>
         </div>
         <textarea 
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            className="flex-1 p-8 text-sm font-mono leading-relaxed resize-none outline-none text-slate-800"
            placeholder="Select a template to start..."
         />
         <div className="p-4 border-t border-slate-200 flex justify-end">
             <button 
                onClick={handleSaveToVault}
                disabled={!selectedContact || !documentContent}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50"
             >
                 <Save size={18} /> Save to Vault
             </button>
         </div>
      </div>

      {/* Right Panel: AI Assistant */}
      <div className="w-full md:w-72 bg-gradient-to-br from-indigo-50 to-white border border-slate-200 rounded-xl p-6 flex flex-col shadow-sm">
          <div className="mb-4">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2"><Sparkles size={18} className="text-indigo-500"/> AI Drafter</h3>
              <p className="text-xs text-indigo-600 mt-1">Generate clauses or explanations instantly.</p>
          </div>
          
          <div className="flex-1 flex flex-col gap-2">
              <textarea 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Write a paragraph explaining that the NSF on 10/12 was due to a bank error..."
                className="flex-1 w-full p-3 border border-indigo-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white"
              />
              <button 
                onClick={handleAIDraft}
                disabled={isDrafting || !aiPrompt}
                className="bg-indigo-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70"
              >
                  {isDrafting ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {isDrafting ? 'Drafting...' : 'Insert Content'}
              </button>
          </div>

          <div className="mt-6 pt-6 border-t border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Quick Actions</p>
              <div className="space-y-2">
                  <button onClick={() => setAiPrompt("Rewrite the last paragraph to be more formal.")} className="w-full text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded transition-colors truncate">✨ Formalize Tone</button>
                  <button onClick={() => setAiPrompt("Add a clause regarding early repayment penalty of 3%.")} className="w-full text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded transition-colors truncate">📝 Add Penalty Clause</button>
                  <button onClick={() => setAiPrompt("Summarize the key terms of this agreement.")} className="w-full text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded transition-colors truncate">🔍 Summarize Terms</button>
              </div>
          </div>
      </div>

    </div>
  );
};

export default DocumentGenerator;
