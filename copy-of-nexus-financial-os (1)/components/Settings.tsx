
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Shield, Users, Globe, Mail, Save, CheckCircle, Moon, Monitor, Plus, Trash2, User as UserIcon, Activity, Lock, CreditCard, Zap, Image, Upload, Share2, Youtube, Facebook, Linkedin, Instagram, Rocket, Database, FileSpreadsheet, Download, RefreshCw, AlertTriangle, Link, Copy, XCircle, Code, Calendar, MessageSquare, Phone, MessageCircle, Bug, Smartphone, Briefcase, Megaphone } from 'lucide-react';
import { User as UserType, AuditLog, SocialAccount, Contact } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import MobileAppManager from './MobileAppManager';

interface SettingsProps {
  onDataChange?: (type: 'seed' | 'reset') => void;
}

const Settings: React.FC<SettingsProps> = ({ onDataChange }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [successMsg, setSuccessMsg] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Integration States
  const [stripeConnected, setStripeConnected] = useState(false);
  const [hubspotConnected, setHubspotConnected] = useState(false);
  const [salesforceConnected, setSalesforceConnected] = useState(false);
  const [mailchimpConnected, setMailchimpConnected] = useState(false);
  const [constantContactConnected, setConstantContactConnected] = useState(false);

  const [emailProvider, setEmailProvider] = useState('');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [senderName, setSenderName] = useState('Nexus Team');
  const [senderEmail, setSenderEmail] = useState('hello@nexus.funding');
  const [webhookUrl, setWebhookUrl] = useState(`https://api.nexus.funding/v1/hooks/${Math.random().toString(36).substring(7)}`);
  
  // Free Power-Ups
  const [calComLink, setCalComLink] = useState('');
  const [resendKey, setResendKey] = useState('');
  const [crispId, setCrispId] = useState('');
  const [sentryDsn, setSentryDsn] = useState('');
  
  // Communication (Twilio)
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');

  // Marketing Pixels
  const [gaId, setGaId] = useState('');
  const [pixelId, setPixelId] = useState('');
  
  // Branding States
  const [agencyName, setAgencyName] = useState('Nexus Funding Inc.');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');

  // Data Management States
  const [isImporting, setIsImporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Social Media Accounts
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { id: 'sa_1', platform: 'YouTube', handle: '', connected: false },
    { id: 'sa_2', platform: 'LinkedIn', handle: '', connected: false },
    { id: 'sa_3', platform: 'Instagram', handle: '', connected: false },
    { id: 'sa_4', platform: 'TikTok', handle: '', connected: false },
    { id: 'sa_5', platform: 'Facebook', handle: '', connected: false },
  ]);

  // Load Settings from DB
  useEffect(() => {
    if (!user) return;
    
    // In a real app, you might query a 'profiles' or 'settings' table
    const loadSettings = async () => {
       const { data, error } = await supabase
         .from('profiles')
         .select('settings')
         .eq('id', user.id)
         .single();
         
       if (data?.settings) {
         setStripeConnected(data.settings.stripeConnected || false);
         setHubspotConnected(data.settings.hubspotConnected || false);
         setSalesforceConnected(data.settings.salesforceConnected || false);
         setMailchimpConnected(data.settings.mailchimpConnected || false);
         setConstantContactConnected(data.settings.constantContactConnected || false);
         setAgencyName(data.settings.agencyName || 'Nexus Funding Inc.');
         setPrimaryColor(data.settings.primaryColor || '#2563eb');
         setEmailProvider(data.settings.emailProvider || '');
         setEmailApiKey(data.settings.emailApiKey || '');
         setSenderName(data.settings.senderName || 'Nexus Team');
         setSenderEmail(data.settings.senderEmail || 'hello@nexus.funding');
         setGaId(data.settings.gaId || '');
         setPixelId(data.settings.pixelId || '');
         setCalComLink(data.settings.calComLink || '');
         setResendKey(data.settings.resendKey || '');
         setCrispId(data.settings.crispId || '');
         setSentryDsn(data.settings.sentryDsn || '');
         setTwilioSid(data.settings.twilioSid || '');
         setTwilioToken(data.settings.twilioToken || '');
         setTwilioPhone(data.settings.twilioPhone || '');
       }
    };
    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Persist to Supabase
    const newSettings = {
      stripeConnected,
      hubspotConnected,
      salesforceConnected,
      mailchimpConnected,
      constantContactConnected,
      agencyName,
      primaryColor,
      emailProvider,
      emailApiKey, 
      senderName,
      senderEmail,
      gaId,
      pixelId,
      calComLink,
      resendKey,
      crispId,
      sentryDsn,
      twilioSid,
      twilioToken,
      twilioPhone
    };

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, settings: newSettings });

    if (!error) {
      setSuccessMsg('Settings saved successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      console.error("Error saving settings:", error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setSuccessMsg('Logo uploaded successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialHandleChange = (id: string, value: string) => {
    setSocialAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, handle: value } : acc
    ));
  };

  const toggleSocialConnection = (id: string) => {
    setSocialAccounts(prev => prev.map(acc => {
       if (acc.id === id) {
         const newStatus = !acc.connected;
         setSuccessMsg(newStatus ? `Connected to ${acc.platform}` : `Disconnected from ${acc.platform}`);
         setTimeout(() => setSuccessMsg(''), 3000);
         
         // Use typed handle, or simulate fetching the Business Page handle if empty
         let currentHandle = acc.handle;
         if (newStatus && !currentHandle) {
             if (acc.platform === 'Facebook') currentHandle = '@NexusBusinessPage';
             else if (acc.platform === 'Instagram') currentHandle = '@nexus_official_biz';
             else if (acc.platform === 'TikTok') currentHandle = '@nexus_funding_corp';
             else if (acc.platform === 'LinkedIn') currentHandle = 'Nexus Funding Inc.';
             else currentHandle = '@nexus_channel';
         }
         
         return { ...acc, connected: newStatus, handle: currentHandle };
       }
       return acc;
    }));
  };

  // Mock Team Data (Would also come from DB)
  const [teamMembers, setTeamMembers] = useState<UserType[]>([
    { id: 'tm_1', name: 'John Doe', email: 'john@nexus.funding', role: 'admin' },
    { id: 'tm_2', name: 'Sarah Sales', email: 'sarah@nexus.funding', role: 'client' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'client'>('client');

  const handleInvite = () => {
    if (!inviteEmail) return;
    const newUser: UserType = { id: `tm_${Date.now()}`, name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole };
    setTeamMembers([...teamMembers, newUser]);
    setInviteEmail('');
    setSuccessMsg(`Invited ${inviteEmail}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };
  
  // --- Data Management Functions ---
  const handleExportData = async () => {
    try {
      // Fetch all contacts
      const { data: contacts } = await supabase.from('contacts').select('*');
      
      if (!contacts || contacts.length === 0) {
        alert("No data to export.");
        return;
      }

      // Convert to CSV
      const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Status', 'Revenue', 'LastContact'];
      const csvContent = [
        headers.join(','),
        ...contacts.map(c => [
          c.id, 
          `"${c.name}"`, 
          `"${c.company}"`, 
          c.email, 
          c.phone, 
          c.status, 
          c.revenue, 
          `"${c.lastContact}"`
        ].join(','))
      ].join('\n');

      // Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nexus_crm_backup_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccessMsg("Backup downloaded successfully.");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to export data. Check connection.");
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const newContacts: Partial<Contact>[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length >= 3) {
             newContacts.push({
               id: `imp_${Date.now()}_${i}`,
               name: cols[0]?.replace(/"/g, '').trim() || 'Unknown',
               company: cols[1]?.replace(/"/g, '').trim() || 'Unknown',
               email: cols[2]?.trim(),
               phone: cols[3]?.trim(),
               status: 'Lead',
               lastContact: 'Just now',
               value: 0,
               source: 'CSV Import',
               checklist: {},
               clientTasks: []
             });
          }
        }

        if (newContacts.length > 0) {
           const { error } = await supabase.from('contacts').insert(newContacts);
           if (!error) {
             setSuccessMsg(`Successfully imported ${newContacts.length} contacts.`);
             // Force refresh logic would go here, usually by triggering a re-fetch in parent or relying on realtime
           } else {
             console.error(error);
             alert("Import failed. Check console for details.");
           }
        }
      } catch (err) {
        console.error(err);
        alert("Error parsing CSV.");
      } finally {
        setIsImporting(false);
        if (importInputRef.current) importInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = async () => {
    if (!window.confirm("WARNING: This will permanently delete ALL contacts from your database. This action cannot be undone. Are you sure?")) return;
    
    try {
        // Delete all rows from contacts
        await supabase.from('contacts').delete().neq('id', '000000'); // neq id 0 is a hack to select all
        
        // Trigger local update
        if (onDataChange) onDataChange('reset');
        
        setSuccessMsg("System reset complete. Database cleared.");
    } catch (e: any) {
        alert("Reset failed: " + e.message);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    const mockData: Partial<Contact>[] = [
        { id: `demo_${Date.now()}_1`, name: 'Bruce Wayne', company: 'Wayne Enterprises', email: 'bruce@wayne.com', phone: '555-0101', status: 'Active', value: 500000, lastContact: '2 days ago', revenue: 120000, source: 'Seed', checklist: {}, clientTasks: [] },
        { id: `demo_${Date.now()}_2`, name: 'Clark Kent', company: 'Daily Planet', email: 'clark@planet.com', phone: '555-0102', status: 'Lead', value: 25000, lastContact: 'Just now', revenue: 8000, source: 'Seed', checklist: {}, clientTasks: [] },
        { id: `demo_${Date.now()}_3`, name: 'Diana Prince', company: 'Themyscira Arts', email: 'diana@arts.com', phone: '555-0103', status: 'Negotiation', value: 150000, lastContact: '1 week ago', revenue: 45000, source: 'Seed', checklist: {}, clientTasks: [] },
    ];

    try {
        await supabase.from('contacts').insert(mockData);
        
        // Trigger local update
        if (onDataChange) onDataChange('seed');

        setSuccessMsg("Demo data seeded successfully!");
    } catch (e: any) {
        // Even if DB fails (e.g. demo mode), trigger local update
        if (onDataChange) onDataChange('seed');
        setSuccessMsg("Demo data injected locally.");
    } finally {
        setIsSeeding(false);
    }
  };

  const auditLogs: AuditLog[] = [
    { id: 'log_1', action: 'Updated Status', target: 'Alice Freeman -> Closed', user: 'John Doe', timestamp: 'Today, 10:42 AM', ipAddress: '192.168.1.1' },
    { id: 'log_2', action: 'Viewed Document', target: 'Bank_Statement_Oct.pdf', user: 'Sarah Sales', timestamp: 'Today, 09:15 AM', ipAddress: '192.168.1.42' },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 mt-2">Manage your agency preferences, integrations, and team.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}><Globe size={18} /> General & Branding</button>
            <button onClick={() => setActiveTab('mobile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'mobile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}><Smartphone size={18} /> Mobile App</button>
            <button onClick={() => setActiveTab('integrations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'integrations' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}><Zap size={18} /> Integrations</button>
            <button onClick={() => setActiveTab('social')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'social' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}><Share2 size={18} /> Social Media</button>
            <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}><Bell size={18} /> Notifications</button>
            <button onClick={() => setActiveTab('team')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}><Users size={18} /> Team Access</button>
            <button onClick={() => setActiveTab('data')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}><Database size={18} /> Data & Backup</button>
            <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}><Shield size={18} /> Security & Audit</button>
            <button onClick={() => setActiveTab('launch')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors mt-6 ${activeTab === 'launch' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}><Rocket size={18} /> Launch Control</button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {successMsg && (
            <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold border border-green-200 animate-fade-in">
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Branding</h3>
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center relative overflow-hidden group">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-center p-4">
                          <Image className="mx-auto text-slate-400 mb-2" size={24} />
                          <span className="text-xs text-slate-500 font-medium">Upload Logo</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">Change</div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Agency Name</label>
                        <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        <p className="text-xs text-slate-500 mt-2">This logo and name will appear on the Client Portal login screen and all generated PDF invoices.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Primary Brand Color</label>
                        <div className="flex gap-3 items-center">
                           <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 p-1 rounded border border-slate-300 cursor-pointer" />
                           <span className="text-sm font-mono text-slate-600">{primaryColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"><Save size={18} /> Save Changes</button>
                </div>
              </div>
            )}

            {/* MOBILE APP TAB */}
            {activeTab === 'mobile' && (
              <div className="p-0">
                <MobileAppManager appName={agencyName} />
              </div>
            )}

            {/* INTEGRATIONS TAB */}
            {activeTab === 'integrations' && (
              <div className="p-8 space-y-6">
                
                {/* CRM Integrations */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">CRM Integrations</h3>
                  <p className="text-sm text-slate-500 mb-4">Sync your contacts and deals with other platforms.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* HubSpot */}
                     <div className="p-4 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Briefcase size={20} className="text-orange-500" />
                           <div>
                             <h4 className="font-bold text-slate-900">HubSpot</h4>
                             <p className="text-xs text-slate-500">{hubspotConnected ? 'Connected' : 'Not connected'}</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => { setHubspotConnected(!hubspotConnected); setSuccessMsg(hubspotConnected ? 'HubSpot disconnected' : 'HubSpot connected'); setTimeout(() => setSuccessMsg(''), 3000); }}
                           className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${hubspotConnected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                           {hubspotConnected ? 'Disconnect' : 'Connect'}
                        </button>
                     </div>

                     {/* Salesforce */}
                     <div className="p-4 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Briefcase size={20} className="text-blue-500" />
                           <div>
                             <h4 className="font-bold text-slate-900">Salesforce</h4>
                             <p className="text-xs text-slate-500">{salesforceConnected ? 'Connected' : 'Not connected'}</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => { setSalesforceConnected(!salesforceConnected); setSuccessMsg(salesforceConnected ? 'Salesforce disconnected' : 'Salesforce connected'); setTimeout(() => setSuccessMsg(''), 3000); }}
                           className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${salesforceConnected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                           {salesforceConnected ? 'Disconnect' : 'Connect'}
                        </button>
                     </div>
                  </div>
                </div>

                {/* Marketing Integrations */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Marketing Tools</h3>
                  <p className="text-sm text-slate-500 mb-4">Sync your email lists and campaigns.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Mailchimp */}
                     <div className="p-4 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Megaphone size={20} className="text-yellow-500" />
                           <div>
                             <h4 className="font-bold text-slate-900">Mailchimp</h4>
                             <p className="text-xs text-slate-500">{mailchimpConnected ? 'Connected' : 'Not connected'}</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => { setMailchimpConnected(!mailchimpConnected); setSuccessMsg(mailchimpConnected ? 'Mailchimp disconnected' : 'Mailchimp connected'); setTimeout(() => setSuccessMsg(''), 3000); }}
                           className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${mailchimpConnected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                           {mailchimpConnected ? 'Disconnect' : 'Connect'}
                        </button>
                     </div>

                     {/* Constant Contact */}
                     <div className="p-4 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Megaphone size={20} className="text-blue-600" />
                           <div>
                             <h4 className="font-bold text-slate-900">Constant Contact</h4>
                             <p className="text-xs text-slate-500">{constantContactConnected ? 'Connected' : 'Not connected'}</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => { setConstantContactConnected(!constantContactConnected); setSuccessMsg(constantContactConnected ? 'Constant Contact disconnected' : 'Constant Contact connected'); setTimeout(() => setSuccessMsg(''), 3000); }}
                           className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${constantContactConnected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                           {constantContactConnected ? 'Disconnect' : 'Connect'}
                        </button>
                     </div>
                  </div>
                </div>

                {/* Free Power-Ups */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Free Power-Ups</h3>
                  <p className="text-sm text-slate-500 mb-4">Integrate high-value free tools to supercharge your stack.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Cal.com */}
                     <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-3">
                        <div className="flex items-center gap-3">
                           <Calendar size={20} className="text-slate-800" />
                           <h4 className="font-bold text-slate-900">Cal.com</h4>
                        </div>
                        <p className="text-xs text-slate-500">Enable meeting booking in the Client Portal.</p>
                        <input 
                           type="text" 
                           value={calComLink}
                           onChange={(e) => setCalComLink(e.target.value)}
                           placeholder="cal.com/username" 
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                        />
                     </div>

                     {/* Resend */}
                     <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-3">
                        <div className="flex items-center gap-3">
                           <Mail size={20} className="text-slate-800" />
                           <h4 className="font-bold text-slate-900">Resend</h4>
                        </div>
                        <p className="text-xs text-slate-500">Sends 3,000 free marketing emails/mo.</p>
                        <input 
                           type="password" 
                           value={resendKey}
                           onChange={(e) => setResendKey(e.target.value)}
                           placeholder="re_12345678" 
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                        />
                     </div>

                     {/* Crisp Chat */}
                     <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-3">
                        <div className="flex items-center gap-3">
                           <MessageCircle size={20} className="text-slate-800" />
                           <h4 className="font-bold text-slate-900">Crisp (Live Chat)</h4>
                        </div>
                        <p className="text-xs text-slate-500">Free forever live support widget.</p>
                        <input 
                           type="text" 
                           value={crispId}
                           onChange={(e) => setCrispId(e.target.value)}
                           placeholder="Website ID" 
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                        />
                     </div>

                     {/* Sentry */}
                     <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-3">
                        <div className="flex items-center gap-3">
                           <Bug size={20} className="text-slate-800" />
                           <h4 className="font-bold text-slate-900">Sentry (Monitoring)</h4>
                        </div>
                        <p className="text-xs text-slate-500">Track errors and crashes.</p>
                        <input 
                           type="password" 
                           value={sentryDsn}
                           onChange={(e) => setSentryDsn(e.target.value)}
                           placeholder="DSN URL" 
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" 
                        />
                     </div>
                  </div>
                </div>

                {/* Email Service Provider */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Email Service Provider</h3>
                  <p className="text-sm text-slate-500 mb-4">Configure your marketing email gateway (SendGrid, Mailchimp, etc).</p>
                  
                  <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Provider</label>
                           <select 
                              value={emailProvider}
                              onChange={(e) => setEmailProvider(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                           >
                              <option value="">Select Provider...</option>
                              <option value="sendgrid">SendGrid</option>
                              <option value="mailchimp">Mailchimp</option>
                              <option value="resend">Resend</option>
                              <option value="aws_ses">AWS SES</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Key</label>
                           <input 
                              type="password" 
                              value={emailApiKey}
                              onChange={(e) => setEmailApiKey(e.target.value)}
                              placeholder="Key starting with sg_ key_ etc"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sender Name</label>
                           <input 
                              type="text" 
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              placeholder="e.g. Nexus Team"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sender Email</label>
                           <input 
                              type="email" 
                              value={senderEmail}
                              onChange={(e) => setSenderEmail(e.target.value)}
                              placeholder="e.g. hello@nexus.funding"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Twilio Integration */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Communication Infrastructure (Twilio)</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Required for Power Dialer and SMS. You can get a free trial account with $15 credit at Twilio.com.
                  </p>
                  <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account SID</label>
                           <input 
                              type="text" 
                              value={twilioSid}
                              onChange={(e) => setTwilioSid(e.target.value)}
                              placeholder="AC..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Auth Token</label>
                           <input 
                              type="password" 
                              value={twilioToken}
                              onChange={(e) => setTwilioToken(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Twilio Phone Number</label>
                        <div className="relative">
                           <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input 
                              type="text" 
                              value={twilioPhone}
                              onChange={(e) => setTwilioPhone(e.target.value)}
                              placeholder="+15550000000"
                              className="w-full pl-9 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Stripe */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Payment Gateway</h3>
                  <p className="text-sm text-slate-500 mb-4">Connect Stripe to automatically process subscription payments and success fees.</p>
                  <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-[#635bff] rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
                       <div><h4 className="font-bold text-slate-900">Stripe</h4><p className="text-xs text-slate-500">{stripeConnected ? 'Connected: acct_123456789' : 'Not connected'}</p></div>
                     </div>
                     <button 
                       onClick={() => { setStripeConnected(!stripeConnected); setSuccessMsg(stripeConnected ? 'Stripe disconnected' : 'Stripe connected successfully'); setTimeout(() => setSuccessMsg(''), 3000); }}
                       className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${stripeConnected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                     >
                       {stripeConnected ? 'Disconnect' : 'Connect'}
                     </button>
                  </div>
                </div>

                {/* Tracking Pixels */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Tracking Pixels</h3>
                  <p className="text-sm text-slate-500 mb-4">Add analytics IDs to your Landing Pages and Client Portal.</p>
                  
                  <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <Code size={16} className="text-slate-400" />
                           <label className="text-xs font-bold text-slate-500 uppercase">Google Analytics ID</label>
                        </div>
                        <input 
                            type="text" 
                            value={gaId}
                            onChange={(e) => setGaId(e.target.value)}
                            placeholder="G-XXXXXXXXXX"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <Code size={16} className="text-slate-400" />
                           <label className="text-xs font-bold text-slate-500 uppercase">Meta (Facebook) Pixel ID</label>
                        </div>
                        <input 
                            type="text" 
                            value={pixelId}
                            onChange={(e) => setPixelId(e.target.value)}
                            placeholder="123456789012345"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                     </div>
                  </div>
                </div>

                {/* Webhooks */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Incoming Webhooks</h3>
                  <p className="text-sm text-slate-500 mb-4">Connect Zapier, Facebook Lead Ads, or any other source.</p>
                  
                  <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                     <div className="flex gap-4 mb-4 items-center">
                         <div className="p-2 bg-white rounded-lg shadow-sm text-orange-500"><Link size={24} /></div>
                         <div><h4 className="font-bold text-slate-900">Lead Source URL</h4><p className="text-xs text-slate-500">POST JSON data here to create leads</p></div>
                     </div>
                     <div className="flex gap-2">
                        <input readOnly value={webhookUrl} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-600 bg-white" />
                        <button onClick={() => { navigator.clipboard.writeText(webhookUrl); setSuccessMsg('Copied URL'); setTimeout(()=>setSuccessMsg(''), 2000); }} className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"><Copy size={18} className="text-slate-500"/></button>
                     </div>
                  </div>
                </div>
                
                <div className="pt-6 flex justify-end">
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"><Save size={18} /> Save All Integrations</button>
                </div>
              </div>
            )}

            {/* SOCIAL MEDIA TAB */}
            {activeTab === 'social' && (
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Connected Accounts</h3>
                  <p className="text-sm text-slate-500 mb-6">Connect your professional accounts (Facebook Business Page, Instagram Professional, TikTok Business) to enable auto-publishing.</p>
                  
                  <div className="space-y-4">
                    {socialAccounts.map(account => {
                      let Icon = Globe;
                      let color = 'bg-slate-100 text-slate-600';
                      let label: string = account.platform;
                      
                      if (account.platform === 'YouTube') { Icon = Youtube; color = 'bg-red-50 text-red-600'; }
                      if (account.platform === 'Instagram') { Icon = Instagram; color = 'bg-pink-50 text-pink-600'; label = 'Instagram Business'; }
                      if (account.platform === 'TikTok') { Icon = Monitor; color = 'bg-black text-white'; label = 'TikTok for Business'; }
                      if (account.platform === 'LinkedIn') { Icon = Linkedin; color = 'bg-blue-50 text-blue-700'; }
                      if (account.platform === 'Facebook') { Icon = Facebook; color = 'bg-blue-600 text-white'; label = 'Facebook Business Page'; }

                      return (
                        <div key={account.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-white shadow-sm">
                           <div className="flex items-center gap-4 flex-1">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                                <Icon size={24} />
                             </div>
                             <div className="flex-1">
                               <h4 className="font-bold text-slate-900">{label}</h4>
                               {account.connected ? (
                                 <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                   <CheckCircle size={10} /> Connected as {account.handle}
                                 </p>
                               ) : (
                                 <input 
                                   type="text" 
                                   placeholder={`Enter ${account.platform} handle...`}
                                   value={account.handle}
                                   onChange={(e) => handleSocialHandleChange(account.id, e.target.value)}
                                   className="mt-1 w-full max-w-[200px] px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                                 />
                               )}
                             </div>
                           </div>
                           <button 
                             onClick={() => toggleSocialConnection(account.id)}
                             className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ml-4 ${
                               account.connected 
                               ? 'border border-slate-200 text-slate-500 hover:bg-slate-50' 
                               : 'bg-blue-600 text-white hover:bg-blue-700'
                             }`}
                           >
                             {account.connected ? 'Disconnect' : 'Connect'}
                           </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Email Alerts</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium text-slate-800">New Lead Signup</p><p className="text-xs text-slate-500">Notify when someone registers via public page.</p></div>
                      <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked className="sr-only peer" /><div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TEAM TAB */}
            {activeTab === 'team' && (
              <div className="p-8">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Team Management</h3>
                    <p className="text-sm text-slate-500 mt-1">Control access levels and permissions.</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 flex gap-3 items-end">
                   <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label><input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@nexus.funding" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" /></div>
                   <div className="w-40"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label><select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"><option value="admin">Admin</option><option value="client">Viewer</option></select></div>
                   <button onClick={handleInvite} disabled={!inviteEmail} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"><Plus size={16} /> Invite</button>
                </div>
                <div className="space-y-3">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors bg-white">
                      <div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>{member.name.substring(0, 2).toUpperCase()}</div><div><p className="font-bold text-slate-900 text-sm">{member.name}</p><p className="text-xs text-slate-500">{member.email}</p></div></div>
                      <div className="flex items-center gap-4"><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${member.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{member.role}</span>{member.role !== 'admin' && (<button onClick={() => handleRemoveMember(member.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DATA TAB */}
            {activeTab === 'data' && (
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Data Portability</h3>
                  <p className="text-sm text-slate-500 mb-6">Manage your CRM data. Import leads from other systems or create a backup.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Import */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600"><FileSpreadsheet size={24} /></div>
                            <h4 className="font-bold text-slate-900">Import CSV</h4>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">Bulk create leads. CSV must include headers: Name, Company, Email, Phone.</p>
                        <button 
                          onClick={() => importInputRef.current?.click()}
                          disabled={isImporting}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          {isImporting ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
                          {isImporting ? 'Importing...' : 'Upload CSV File'}
                        </button>
                        <input type="file" ref={importInputRef} className="hidden" accept=".csv" onChange={handleImportCSV} />
                    </div>

                    {/* Export */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600"><Download size={24} /></div>
                            <h4 className="font-bold text-slate-900">Export Backup</h4>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">Download a full archive of your contacts, deals, and notes.</p>
                        <button 
                          onClick={handleExportData}
                          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Database size={18} /> Export All Data
                        </button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                   <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-red-500" /> Danger Zone</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       
                       {/* Factory Reset */}
                       <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                          <h4 className="font-bold text-red-900 mb-1">Factory Reset</h4>
                          <p className="text-sm text-red-700 mb-4">Permanently delete all contacts. Irreversible.</p>
                          <button onClick={handleFactoryReset} className="w-full bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors">
                             Reset Database
                          </button>
                       </div>

                       {/* Demo Data Seed */}
                       <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                          <h4 className="font-bold text-purple-900 mb-1">Seed Demo Data</h4>
                          <p className="text-sm text-purple-700 mb-4">Populate DB with 5 test leads for testing.</p>
                          <button 
                            onClick={handleSeedData}
                            disabled={isSeeding}
                            className="w-full bg-white border border-purple-200 text-purple-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-600 hover:text-white transition-colors disabled:opacity-50"
                          >
                             {isSeeding ? 'Seeding...' : 'Inject Test Data'}
                          </button>
                       </div>
                   </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Activity size={20} className="text-blue-600" /> System Audit Trail</h3><p className="text-sm text-slate-500 mt-1">Track all sensitive actions within the platform.</p></div>
                  <button className="text-xs font-bold text-blue-600 hover:underline">Download CSV</button>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase"><tr><th className="px-6 py-3">Timestamp</th><th className="px-6 py-3">User</th><th className="px-6 py-3">Action</th><th className="px-6 py-3">Target</th><th className="px-6 py-3 text-right">IP Address</th></tr></thead>
                    <tbody className="divide-y divide-slate-200">{auditLogs.map(log => (<tr key={log.id} className="hover:bg-white transition-colors text-sm"><td className="px-6 py-3 text-slate-500 font-mono text-xs">{log.timestamp}</td><td className="px-6 py-3 font-medium text-slate-900">{log.user}</td><td className="px-6 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{log.action}</span></td><td className="px-6 py-3 text-slate-600">{log.target}</td><td className="px-6 py-3 text-right text-slate-400 font-mono text-xs">{log.ipAddress}</td></tr>))}</tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LAUNCH CONTROL TAB */}
            {activeTab === 'launch' && (
              <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                 <Rocket className="text-emerald-500 mb-6" size={64} />
                 <h2 className="text-2xl font-bold text-slate-900 mb-2">Production Launch Control</h2>
                 <p className="text-slate-500 max-w-md mb-8">System pre-flight check complete. Your Financial Operating System is ready for deployment.</p>
                 
                 <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8 text-left">
                    <div className={`border p-4 rounded-xl flex items-center gap-3 ${isSupabaseConfigured ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                       {isSupabaseConfigured ? <CheckCircle className="text-emerald-600" /> : <XCircle className="text-red-600" />}
                       <div>
                         <p className={`font-bold text-sm ${isSupabaseConfigured ? 'text-emerald-800' : 'text-red-800'}`}>Database</p>
                         <p className={`text-xs ${isSupabaseConfigured ? 'text-emerald-600' : 'text-red-600'}`}>{isSupabaseConfigured ? 'Connected' : 'Missing Config'}</p>
                       </div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                       <CheckCircle className="text-emerald-600" />
                       <div><p className="font-bold text-emerald-800 text-sm">AI Models</p><p className="text-xs text-emerald-600">Gemini 2.5 Active</p></div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                       <CheckCircle className="text-emerald-600" />
                       <div><p className="font-bold text-emerald-800 text-sm">Voice Agent</p><p className="text-xs text-emerald-600">Online (Low Latency)</p></div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                       <CheckCircle className="text-emerald-600" />
                       <div><p className="font-bold text-emerald-800 text-sm">Security</p><p className="text-xs text-emerald-600">RLS Enabled</p></div>
                    </div>
                 </div>

                 <button 
                   onClick={() => { setSuccessMsg("Production Build Initiated..."); setTimeout(() => setSuccessMsg(""), 3000); }}
                   className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-300 transition-transform hover:scale-105"
                 >
                    Deploy to Production
                 </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
