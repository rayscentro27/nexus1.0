
import React, { useState } from 'react';
import { Contact, BusinessProfile } from '../types';
import { Building2, MapPin, Globe, Calendar, Percent, Save, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface BusinessProfileProps {
  contact: Contact;
  onUpdateContact?: (contact: Contact) => void;
}

const BusinessProfile: React.FC<BusinessProfileProps> = ({ contact, onUpdateContact }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [naicsSuggestion, setNaicsSuggestion] = useState<string | null>(null);

  const defaultProfile: BusinessProfile = {
    legalName: contact.company,
    taxId: '',
    structure: 'LLC',
    industry: '',
    ownershipPercentage: 100,
    establishedDate: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    website: '',
    riskLevel: 'Low'
  };

  const [formData, setFormData] = useState<BusinessProfile>(contact.businessProfile || defaultProfile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // NAICS Optimizer Logic (Mock)
    if (name === 'industry') {
       const highRiskKeywords = ['Real Estate', 'Trucking', 'Transport', 'Cannabis', 'Adult', 'Gambling', 'Restaurant'];
       const isHighRisk = highRiskKeywords.some(k => value.toLowerCase().includes(k.toLowerCase()));
       
       if (isHighRisk) {
         setFormData(prev => ({ ...prev, riskLevel: 'High' }));
         setNaicsSuggestion("Consider 'Management Consulting' or 'Business Services' to lower risk profile.");
       } else {
         setFormData(prev => ({ ...prev, riskLevel: 'Low' }));
         setNaicsSuggestion(null);
       }
    }
  };

  const handleSave = () => {
    if (onUpdateContact) {
      let timeInBusiness = contact.timeInBusiness;
      if (formData.establishedDate) {
        const start = new Date(formData.establishedDate);
        const now = new Date();
        timeInBusiness = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      }

      onUpdateContact({
        ...contact,
        company: formData.legalName,
        timeInBusiness: timeInBusiness,
        businessProfile: formData
      });
      
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsEditing(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="text-blue-600" /> Business Profile (Universal App)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Complete this profile once to apply for multiple lenders instantly.
            </p>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 text-sm shadow-sm"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="p-8">
          {successMsg && (
            <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold border border-green-200">
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Identity */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                Corporate Identity
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Legal Business Name</label>
                <input 
                  type="text" 
                  name="legalName"
                  disabled={!isEditing}
                  value={formData.legalName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">DBA (Doing Business As)</label>
                <input 
                  type="text" 
                  name="dba"
                  disabled={!isEditing}
                  value={formData.dba || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID (EIN)</label>
                  <input 
                    type="text" 
                    name="taxId"
                    disabled={!isEditing}
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="00-0000000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Entity Type</label>
                  <select 
                    name="structure"
                    disabled={!isEditing}
                    value={formData.structure}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 bg-white"
                  >
                    <option>LLC</option>
                    <option>C-Corp</option>
                    <option>S-Corp</option>
                    <option>Sole Prop</option>
                    <option>Partnership</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                   Industry (NAICS)
                   {formData.riskLevel === 'High' && <span className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={10}/> High Risk Detected</span>}
                   {formData.riskLevel === 'Low' && formData.industry && <span className="text-xs text-emerald-500 font-bold flex items-center gap-1"><ShieldCheck size={10}/> Optimized</span>}
                </label>
                <input 
                  type="text" 
                  name="industry"
                  disabled={!isEditing}
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Consulting, E-Commerce"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 ${
                    formData.riskLevel === 'High' ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {naicsSuggestion && isEditing && (
                   <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 flex items-start gap-2">
                     <RefreshCw size={12} className="mt-0.5 flex-shrink-0" />
                     <div><strong>Optimization Tip:</strong> {naicsSuggestion}</div>
                   </div>
                )}
              </div>
            </div>

            {/* Column 2: Location & Details */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                Location & Ownership
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    name="address"
                    disabled={!isEditing}
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input 
                    type="text" 
                    name="city"
                    disabled={!isEditing}
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input 
                    type="text" 
                    name="state"
                    disabled={!isEditing}
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zip</label>
                  <input 
                    type="text" 
                    name="zip"
                    disabled={!isEditing}
                    value={formData.zip}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date Established</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date" 
                      name="establishedDate"
                      disabled={!isEditing}
                      value={formData.establishedDate}
                      onChange={handleChange}
                      className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ownership %</label>
                  <div className="relative">
                    <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      name="ownershipPercentage"
                      disabled={!isEditing}
                      value={formData.ownershipPercentage}
                      onChange={handleChange}
                      className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Website</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="url" 
                    name="website"
                    disabled={!isEditing}
                    value={formData.website || ''}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

            </div>
          </div>

          {isEditing && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setFormData(contact.businessProfile || defaultProfile);
                  setIsEditing(false);
                  setNaicsSuggestion(null);
                }}
                className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                <Save size={18} /> Save Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
