
import React, { useState } from 'react';
import { Search, MapPin, Plus, Loader, Globe, Star, Navigation, Building, Users, Sparkles } from 'lucide-react';
import * as geminiService from '../services/geminiService';
import { Contact } from '../types';

interface LeadDiscoveryMapProps {
  onAddLead?: (lead: Partial<Contact>) => void;
}

const LeadDiscoveryMap: React.FC<LeadDiscoveryMapProps> = ({ onAddLead }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ title: string; url: string; address?: string; rating?: number }[]>([]);
  const [summary, setSummary] = useState('');

  const handleSearch = async () => {
    if (!query) return;
    setIsSearching(true);
    setResults([]);
    setSummary('');

    try {
      const data = await geminiService.searchPlaces(query);
      setResults(data.places);
      setSummary(data.text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = (place: any) => {
    if (onAddLead) {
        const newLead: Partial<Contact> = {
            company: place.title,
            name: 'Manager', // Placeholder
            status: 'Lead',
            source: 'Map Discovery',
            lastContact: 'Just now',
            value: 0,
            notes: `Discovered via Maps Search: "${query}"\nAddress: ${place.address}\nRating: ${place.rating || 'N/A'}\nMap Link: ${place.url}`
        };
        onAddLead(newLead);
        alert(`Imported ${place.title} to CRM!`);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Globe className="text-blue-600" size={32} /> Geo-Intelligence Scout
        </h1>
        <p className="text-slate-500 mt-2">Find local business leads using Google Maps data.</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Left: Search & Results */}
        <div className="w-full md:w-1/3 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-200 bg-slate-50">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Search Territory</label>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   type="text" 
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                   placeholder="e.g. Dentists in Miami, FL"
                   className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
              </div>
              <button 
                onClick={handleSearch}
                disabled={isSearching || !query}
                className="w-full mt-3 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSearching ? <Loader className="animate-spin" size={16} /> : <Navigation size={16} />}
                {isSearching ? 'Scouting...' : 'Scout Area'}
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {results.length === 0 && !isSearching && (
                 <div className="text-center py-10 text-slate-400">
                    <MapPin size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Enter a location to find leads.</p>
                 </div>
              )}

              {results.map((place, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-slate-800 text-sm">{place.title}</h3>
                       {place.rating && (
                         <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                            {place.rating} <Star size={10} fill="currentColor" />
                         </span>
                       )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{place.address}</p>
                    
                    <div className="flex gap-2">
                       <a href={place.url} target="_blank" rel="noreferrer" className="flex-1 text-center py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">
                          View Map
                       </a>
                       <button 
                         onClick={() => handleImport(place)}
                         className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1"
                       >
                          <Plus size={12} /> Add Lead
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Right: Visualization (Radar) */}
        <div className="flex-1 bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center">
           {/* Radar Grid */}
           <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ 
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', 
                  backgroundSize: '30px 30px' 
                }}>
           </div>
           
           {/* Radar Circles */}
           <div className="absolute w-[600px] h-[600px] border border-blue-500/20 rounded-full"></div>
           <div className="absolute w-[400px] h-[400px] border border-blue-500/30 rounded-full"></div>
           <div className="absolute w-[200px] h-[200px] border border-blue-500/40 rounded-full"></div>
           
           {/* Scanning Line */}
           {isSearching && (
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent w-full h-full animate-[spin_3s_linear_infinite]" style={{ transformOrigin: 'center' }}></div>
           )}

           {/* Blips */}
           {results.map((place, idx) => {
              // Random positioning for demo visuals
              const angle = (idx / results.length) * 2 * Math.PI;
              const radius = 100 + Math.random() * 150;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                 <div 
                   key={idx}
                   className="absolute group cursor-pointer"
                   style={{ transform: `translate(${x}px, ${y}px)` }}
                 >
                    <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></div>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       {place.title}
                    </div>
                 </div>
              );
           })}

           {/* Center Point */}
           <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10 relative">
              <div className="absolute -inset-4 bg-blue-500/30 rounded-full animate-ping"></div>
           </div>

           {/* Results Overlay */}
           {summary && (
             <div className="absolute bottom-6 left-6 right-6 bg-slate-800/90 backdrop-blur border border-slate-700 p-4 rounded-xl text-slate-300 text-sm shadow-xl">
                <h4 className="text-white font-bold mb-1 flex items-center gap-2"><Sparkles size={14} className="text-yellow-400" /> AI Scout Report</h4>
                <p className="line-clamp-2">{summary}</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default LeadDiscoveryMap;
