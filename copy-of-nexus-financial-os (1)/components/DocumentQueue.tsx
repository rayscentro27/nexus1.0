import React, { useState } from 'react';
import { Contact, ClientDocument } from '../types';
import { FileText, CheckCircle, XCircle, Eye, Clock, AlertCircle, Search, Filter, Shield, Download } from 'lucide-react';

interface DocumentQueueProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
}

const DocumentQueue: React.FC<DocumentQueueProps> = ({ contacts, onUpdateContact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<{ contact: Contact; doc: ClientDocument } | null>(null);

  // Flatten all documents from all contacts into a single queue
  const pendingDocuments = contacts.flatMap(contact => 
    (contact.documents || [])
      .filter(doc => doc.status === 'Pending Review')
      .map(doc => ({ contact, doc }))
  );

  const filteredQueue = pendingDocuments.filter(item => 
    item.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (item: { contact: Contact; doc: ClientDocument }, action: 'Verified' | 'Rejected') => {
    const updatedDocs = item.contact.documents?.map(d => 
      d.id === item.doc.id ? { ...d, status: action } : d
    ) || [];

    // Add activity log
    const newActivity = {
      id: `sys_${Date.now()}`,
      type: 'system' as const,
      description: `Document "${item.doc.name}" was ${action.toLowerCase()} by Admin.`,
      date: new Date().toLocaleString(),
      user: 'Admin'
    };

    onUpdateContact({
      ...item.contact,
      documents: updatedDocs,
      activities: [...(item.contact.activities || []), newActivity]
    });

    if (selectedDoc?.doc.id === item.doc.id) {
      setSelectedDoc(null);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Shield className="text-amber-500" /> Compliance Review Queue
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            You have <strong className="text-amber-600">{pendingDocuments.length} documents</strong> waiting for verification.
          </p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search queue..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Queue List */}
        <div className="flex-1 overflow-y-auto">
          {filteredQueue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
              <CheckCircle size={48} className="mb-4 text-emerald-100" />
              <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
              <p className="text-sm">No documents pending review.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Document Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Upload Date</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((item) => (
                  <tr key={item.doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.contact.name}</div>
                      <div className="text-xs text-slate-500">{item.contact.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-500" />
                        <span className="text-sm text-slate-700 font-medium">{item.doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {item.doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {item.doc.uploadDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedDoc(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(item, 'Verified')}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(item, 'Rejected')}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedDoc(null)}>
          <div className="bg-white w-full max-w-3xl h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  {selectedDoc.doc.name}
                </h3>
                <p className="text-xs text-slate-500">Uploaded by {selectedDoc.contact.name} on {selectedDoc.doc.uploadDate}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Content (Placeholder for PDF Viewer) */}
            <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center relative p-8">
               <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center max-w-md">
                 <FileText size={64} className="mx-auto mb-4 text-slate-300" />
                 <h4 className="text-slate-900 font-bold mb-2">Document Preview</h4>
                 <p className="text-sm text-slate-500 mb-6">
                   This is a simulated preview for <strong>{selectedDoc.doc.name}</strong>. 
                   In a production environment, the PDF or Image would render here.
                 </p>
                 <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 w-full">
                    <Download size={16} /> Download Original
                 </button>
               </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white">
              <div className="text-xs text-slate-400">
                Type: <span className="font-medium text-slate-600">{selectedDoc.doc.type}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(selectedDoc, 'Rejected')}
                  className="px-4 py-2 border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button 
                  onClick={() => handleAction(selectedDoc, 'Verified')}
                  className="px-6 py-2 bg-emerald-600 rounded-lg text-sm font-bold text-white hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-colors"
                >
                  <CheckCircle size={16} /> Approve & Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentQueue;