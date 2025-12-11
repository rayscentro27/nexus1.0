
import React, { useState } from 'react';
import { Contact, ClientDocument } from '../types';
import { Shield, Link, Copy, Calendar, Lock, CheckCircle, FileText, X, Eye, Clock } from 'lucide-react';

interface SecureShareModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onShare: (link: string, config: any) => void;
}

const SecureShareModal: React.FC<SecureShareModalProps> = ({ contact, isOpen, onClose, onShare }) => {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [expiry, setExpiry] = useState('72 hours');
  const [password, setPassword] = useState('');
  const [requireEmail, setRequireEmail] = useState(true);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const documents = contact.documents || [];
  const verifiedDocs = documents.filter(d => d.status === 'Verified' || d.status === 'Pending Review' || d.status === 'Signed');

  const toggleDoc = (id: string) => {
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds(selectedDocIds.filter(d => d !== id));
    } else {
      setSelectedDocIds([...selectedDocIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDocIds.length === verifiedDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(verifiedDocs.map(d => d.id));
    }
  };

  const generateLink = () => {
    // Simulate link generation
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const link = `https://portal.nexus.funding/room/${uniqueId}`;
    setGeneratedLink(link);
    
    // Notify parent
    onShare(link, {
        documents: selectedDocIds.length,
        expiry,
        password: !!password
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="text-emerald-400" /> Secure Deal Room
            </h2>
            <p className="text-slate-400 text-sm mt-1">Create a secure, trackable link for lenders.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {!generatedLink ? (
            <div className="space-y-6">
              
              {/* Document Selection */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" /> Select Documents
                  </h3>
                  <button onClick={handleSelectAll} className="text-xs text-blue-600 font-bold hover:underline">
                    {selectedDocIds.length === verifiedDocs.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {verifiedDocs.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-4">No verified documents available.</p>
                  ) : (
                    verifiedDocs.map(doc => (
                      <div 
                        key={doc.id}
                        onClick={() => toggleDoc(doc.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedDocIds.includes(doc.id) 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'bg-slate-50 border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                          selectedDocIds.includes(doc.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                        }`}>
                          {selectedDocIds.includes(doc.id) && <CheckCircle size={14} />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className={`text-sm truncate ${selectedDocIds.includes(doc.id) ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{doc.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{doc.type}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Lock size={18} className="text-amber-500" /> Access Control
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link Expiration</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select 
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>24 hours</option>
                        <option>72 hours</option>
                        <option>7 days</option>
                        <option>Never</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Access Password</label>
                    <input 
                      type="text" 
                      placeholder="(Optional)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-slate-600">Require Lender Email (for tracking)</span>
                  <div 
                    onClick={() => setRequireEmail(!requireEmail)}
                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${requireEmail ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${requireEmail ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center animate-fade-in">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Link size={40} className="text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Deal Room Created!</h3>
              <p className="text-slate-500 max-w-sm mb-8">
                Your secure link is ready. Lenders will see the {selectedDocIds.length} documents you selected.
              </p>
              
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm mb-6">
                <div className="flex-1 truncate text-slate-600 font-mono text-sm bg-slate-50 p-2 rounded border border-slate-100">
                  {generatedLink}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-2 font-bold text-sm ${isCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {isCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock size={12}/> Expires in {expiry}</span>
                {password && <span className="flex items-center gap-1"><Lock size={12}/> Password Protected</span>}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {!generatedLink && (
          <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center">
            <div className="text-xs text-slate-500">
              Selected: <span className="font-bold text-slate-900">{selectedDocIds.length} files</span>
            </div>
            <button 
              onClick={generateLink}
              disabled={selectedDocIds.length === 0}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center gap-2"
            >
              <Link size={18} /> Create Secure Link
            </button>
          </div>
        )}
        
        {generatedLink && (
           <div className="p-6 border-t border-slate-200 bg-white flex justify-center">
              <button onClick={onClose} className="text-slate-500 hover:text-slate-800 font-bold">Done</button>
           </div>
        )}

      </div>
    </div>
  );
};

export default SecureShareModal;
