
import React, { useState, useRef } from 'react';
import { Smartphone, Upload, Save, CheckCircle, Share2, FileCode, AlertTriangle, RefreshCw, Sparkles, Download, Apple, Globe, Copy, MessageSquare, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import * as geminiService from '../services/geminiService';

interface MobileAppManagerProps {
  appName?: string;
}

const MobileAppManager: React.FC<MobileAppManagerProps> = ({ appName = "Nexus Financial" }) => {
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  
  // Android State
  const [version, setVersion] = useState('1.0.0');
  const [releaseNotes, setReleaseNotes] = useState('Initial release with dashboard and document upload.');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [installInstructions, setInstallInstructions] = useState('');
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // iOS State
  const [iosGuide, setIosGuide] = useState('');
  const [isGeneratingIos, setIsGeneratingIos] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Simulate upload delay or use Supabase
      // In production: await supabase.storage.from('apps').upload(`apk/${version}/${file.name}`, file);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock URL
      const mockUrl = `https://cdn.nexus.funding/apps/${file.name}`;
      setUploadUrl(mockUrl);
      
      // Auto-generate instructions once uploaded
      handleGenerateInstructions();
      
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateInstructions = async () => {
    setIsGeneratingDocs(true);
    try {
        // Mock prompt behavior for Android
        const instructions = `1. Download the File: Tap the "Download App" button below. You may see a warning that the file might be harmful—this is standard for business apps not on the Play Store. Tap "Download Anyway".\n\n2. Open & Install: Once downloaded, tap "Open". If prompted, go to Settings and toggle "Allow from this source" for your browser.\n\n3. Login: The app will install. Open "Nexus Financial" and log in with your portal credentials.`;
        setInstallInstructions(instructions);
    } catch (e) {
        setInstallInstructions("1. Download APK.\n2. Allow installation from browser.\n3. Install and Login.");
    } finally {
        setIsGeneratingDocs(false);
    }
  };

  const handleGenerateIosGuide = async () => {
    setIsGeneratingIos(true);
    // Use Gemini to write a PWA guide
    try {
        const prompt = `Write a short, friendly text message to a client explaining how to add the "${appName}" portal to their iPhone Home Screen so it looks like an app. Mention the "Share" button and "Add to Home Screen".`;
        const generated = await geminiService.generateSocialCaption('SMS', prompt); // Reusing generic text gen
        setIosGuide(generated || `Hi! To get the ${appName} app on your iPhone:\n1. Open our portal in Safari\n2. Tap the 'Share' button (square with arrow)\n3. Scroll down and tap 'Add to Home Screen'\n\nThis installs it just like a regular app!`);
    } catch(e) {
        setIosGuide(`To install on iPhone:\n1. Open in Safari\n2. Tap Share button\n3. Select "Add to Home Screen"`);
    } finally {
        setIsGeneratingIos(false);
    }
  };

  const handleCopyLink = () => {
    if (uploadUrl) {
      navigator.clipboard.writeText(uploadUrl);
      alert("Download link copied to clipboard!");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Smartphone className="text-blue-400" /> Mobile App Distribution
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage client mobile access for Android and iOS.</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-lg">
            <button 
                onClick={() => setPlatform('android')}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${platform === 'android' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                <Smartphone size={14} /> Android (APK)
            </button>
            <button 
                onClick={() => setPlatform('ios')}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${platform === 'ios' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                <Apple size={14} /> iPhone (Web App)
            </button>
        </div>
      </div>

      <div className="p-8">
        
        {/* ANDROID VIEW */}
        {platform === 'android' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">App Version</label>
                        <input 
                            type="text" 
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 1.0.2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Release Notes</label>
                        <textarea 
                            value={releaseNotes}
                            onChange={(e) => setReleaseNotes(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="What's new in this version?"
                        />
                    </div>

                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${uploadUrl ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50 hover:border-blue-400'}`}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" accept=".apk" onChange={handleUpload} />
                        
                        {isUploading ? (
                            <div className="flex flex-col items-center text-blue-600">
                                <RefreshCw className="animate-spin mb-2" size={32} />
                                <p className="font-bold">Uploading APK...</p>
                            </div>
                        ) : uploadUrl ? (
                            <div className="flex flex-col items-center text-emerald-600">
                                <CheckCircle className="mb-2" size={48} />
                                <p className="font-bold text-lg">Upload Complete</p>
                                <p className="text-xs mt-1 text-emerald-700 break-all">{uploadUrl}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-500">
                                <FileCode className="mb-2" size={48} />
                                <p className="font-bold">Click to Upload .APK</p>
                                <p className="text-xs mt-1">Max size 100MB</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col h-full">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Share2 size={18} className="text-indigo-500" /> Client Distribution
                    </h3>

                    <div className="flex-1 space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${uploadUrl ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {uploadUrl ? 'Ready to Deploy' : 'Waiting for Upload'}
                                </span>
                            </div>
                            {uploadUrl && (
                                <div className="flex gap-2 mt-4">
                                    <button onClick={handleCopyLink} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">
                                        Copy Link
                                    </button>
                                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                                        Notify Clients
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200 flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-sm text-slate-700">Installation Guide</h4>
                                <button onClick={handleGenerateInstructions} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                    {isGeneratingDocs ? <RefreshCw className="animate-spin" size={14}/> : <Sparkles size={14} />}
                                </button>
                            </div>
                            <textarea 
                                className="w-full h-40 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg resize-none border-none focus:ring-0"
                                value={installInstructions}
                                onChange={(e) => setInstallInstructions(e.target.value)}
                                placeholder="AI will generate installation steps here..."
                            />
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-xs">
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                        <p>Clients will need to enable "Install from Unknown Sources" since this is an enterprise build not on the Play Store.</p>
                    </div>
                </div>
            </div>
        )}

        {/* iOS VIEW */}
        {platform === 'ios' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <Globe size={20} /> Progressive Web App (PWA)
                        </h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            iOS does not allow sideloading APK files. Instead, users can <strong>"Install"</strong> your portal directly from Safari. 
                            This creates an app icon on their home screen, removes the browser bar, and enables a full-screen app experience.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Client Instructions (SMS/Email)</label>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                            <textarea 
                                value={iosGuide}
                                onChange={(e) => setIosGuide(e.target.value)}
                                className="w-full h-40 text-sm text-slate-600 bg-transparent border-none focus:ring-0 resize-none"
                                placeholder="Click generate to create an instruction guide for clients..."
                            />
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                <button 
                                    onClick={() => { navigator.clipboard.writeText(iosGuide); alert('Copied!'); }}
                                    className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                                >
                                    <Copy size={12} /> Copy to Clipboard
                                </button>
                                <button 
                                    onClick={handleGenerateIosGuide}
                                    disabled={isGeneratingIos}
                                    className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-200 flex items-center gap-1"
                                >
                                    {isGeneratingIos ? <RefreshCw className="animate-spin" size={12}/> : <Sparkles size={12} />} 
                                    Generate with AI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="mb-6 relative w-64 h-[500px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                        {/* iPhone Mockup Screen */}
                        <div className="bg-white flex-1 relative flex flex-col">
                            {/* Browser Bar */}
                            <div className="h-14 bg-slate-100 border-b border-slate-200 flex items-end justify-center pb-2">
                                <div className="text-[10px] text-slate-500 font-bold">nexus.funding</div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 p-4 bg-slate-50">
                                <div className="bg-white p-2 rounded shadow-sm mb-2 h-20"></div>
                                <div className="bg-white p-2 rounded shadow-sm mb-2 h-20"></div>
                                
                                {/* Share Sheet Overlay */}
                                <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-4 animate-slide-in-right">
                                    <div className="flex justify-between mb-4">
                                        <div className="text-xs font-bold text-slate-700">Add to Home Screen</div>
                                        <X size={14} className="text-slate-400" />
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0"></div>
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 border-2 border-blue-500">
                                            <div className="text-[8px] text-center mt-14 font-bold text-blue-600">Add</div>
                                        </div>
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-xl"></div>
                    </div>
                    <p className="text-sm font-bold text-slate-700">Visual Guide for Clients</p>
                    <p className="text-xs text-slate-500 mt-1">Clients simply tap "Share" then "Add to Home Screen".</p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default MobileAppManager;
