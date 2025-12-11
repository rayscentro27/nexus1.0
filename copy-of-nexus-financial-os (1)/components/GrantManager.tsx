import React, { useState } from 'react';
import { Contact, Grant } from '../types';
import { Search, Loader, Plus, CheckCircle, ExternalLink, Edit2, Trash2, BookOpen, Sparkles, Filter } from 'lucide-react';
import * as geminiService from '../services/geminiService';
import GrantApplicationModal from './GrantApplicationModal';

interface GrantManagerProps {
  contacts: Contact[]; // To link grants to specific clients if needed, or use a "primary" profile
  onUpdateContact?: (contact: Contact) => void;
}

const MOCK_GRANTS: Grant[] = [
  {
    id: 'g1',
    name: 'Small Business Growth Fund',
    provider: 'Global Chamber of Commerce',
    amount: 5000,
    deadline: '2024-12-31',
    description: 'Supporting small businesses with operational costs.',
    status: 'Identified',
    matchScore: 90,
    requirements: ['In business > 1 year', '<$1M Revenue'],
    url: 'https://example.com/grant1'
  },
  {
    id: 'g2',
    name: 'Tech Innovation Grant',
    provider: 'Innovate America',
    amount: 25000,
    deadline: '2024-11-15',
    description: 'For startups developing novel technology solutions.',
    status: 'Submitted',
    matchScore: 75,
    requirements: ['Tech Focus', 'MVP Ready'],
    url: 'https://example.com/grant2'
  }
];

const GrantManager: React.FC<GrantManagerProps> = ({ contacts, onUpdateContact }) => {
  const [grants, setGrants] = useState<Grant[]>(MOCK_GRANTS);
  const [businessType, setBusinessType] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeGrant, setActiveGrant] = useState<Grant | null>(null);
  
  // Use the first contact for context in the demo, or undefined
  const primaryContact = contacts.length > 0 ? contacts[0] : undefined;

  const handleSearch = async () => {
    if (!businessType) return;
    setIsSearching(true);
    try {
      const results = await geminiService.findGrants(businessType);
      // Merge with existing
      setGrants(prev => [...results, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = (id: string) => {
    setGrants(grants.filter(g => g.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identified': return 'bg-blue-100 text-blue-700';
      case 'Drafting': return 'bg-amber-100 text-amber-700';
      case 'Submitted': return 'bg-purple-100 text-purple-700';
      case 'Won': return 'bg-emerald-100 text-emerald-700';
      case 'Lost': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="text-emerald-600" size={32} /> Grant Discovery & AI Writer
          </h1>
          <p className="text-slate-500 mt-2">Find free capital and let AI write the application for you.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search for Grants</label>
         <div className="flex gap-4">
            <input 
              type="text" 
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="Describe your business (e.g. Woman-owned tech startup in Texas)..."
              className="flex-1 p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching || !businessType}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
            >
               {isSearching ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
               {isSearching ? 'Scouting...' : 'Find Grants'}
            </button>
         </div>
      </div>

      {/* Grant Pipeline */}
      <div className="grid grid-cols-1 gap-6">
         {grants.map(grant => (
            <div key={grant.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{grant.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getStatusColor(grant.status)}`}>{grant.status}</span>
                     </div>
                     <p className="text-sm text-slate-500 flex items-center gap-2"><BuildingIcon size={14}/> {grant.provider}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-bold text-emerald-600">${grant.amount.toLocaleString()}</p>
                     <p className="text-xs text-slate-400">Deadline: {grant.deadline}</p>
                  </div>
               </div>

               <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {grant.description}
               </p>

               <div className="flex items-center gap-4 mb-4">
                  {grant.requirements.map((req, i) => (
                     <span key={i} className="text-xs flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">
                        <CheckCircle size={10} className="text-emerald-500"/> {req}
                     </span>
                  ))}
                  <span className="text-xs font-bold text-blue-600 ml-auto flex items-center gap-1">
                     <Sparkles size={12} /> {grant.matchScore}% Match
                  </span>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <a href={grant.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-600 p-2"><ExternalLink size={18}/></a>
                  <button onClick={() => handleDelete(grant.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                  <button 
                    onClick={() => setActiveGrant(grant)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
                  >
                     <Edit2 size={16} /> Draft Application
                  </button>
               </div>
            </div>
         ))}
         {grants.length === 0 && (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
               <Search size={48} className="mx-auto mb-4 opacity-20" />
               <p>No grants found. Start a search above.</p>
            </div>
         )}
      </div>

      {activeGrant && (
        <GrantApplicationModal 
           grant={activeGrant}
           contact={primaryContact} // Pass contact if available, or undefined
           onClose={() => setActiveGrant(null)}
           onUpdate={(updatedGrant) => {
              setGrants(grants.map(g => g.id === updatedGrant.id ? updatedGrant : g));
           }}
        />
      )}

    </div>
  );
};

const BuildingIcon = (props: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
);

export default GrantManager;