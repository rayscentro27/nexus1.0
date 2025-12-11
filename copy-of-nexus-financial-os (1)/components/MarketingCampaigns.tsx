
import React, { useState } from 'react';
import { Contact, Campaign, CampaignStep, SocialPost } from '../types';
import { Mail, Sparkles, Play, Pause, Plus, Calendar, Users, ArrowRight, MessageSquare, Clock, Trash2, CheckCircle, RefreshCw, Send, Video, Smartphone, Monitor, Youtube, Facebook, Linkedin, Instagram, Share2, AlertCircle, Copy, Edit2 } from 'lucide-react';
import * as geminiService from '../services/geminiService';

interface MarketingCampaignsProps {
  contacts: Contact[];
  onUpdateContact?: (contact: Contact) => void;
}

const MarketingCampaigns: React.FC<MarketingCampaignsProps> = ({ contacts, onUpdateContact }) => {
  const [activeTab, setActiveTab] = useState<'email' | 'social'>('email');
  
  // EMAIL STATE
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'cmp_1',
      name: 'Cold Lead Reactivation',
      status: 'Active',
      trigger: 'Status: Stale',
      enrolledCount: 12,
      steps: [
        { id: 's1', type: 'email', delayDays: 0, order: 1, subject: 'Are you still looking for capital?', content: 'Hi {{Name}},\n\nI am cleaning up my pipeline and wanted to see if you are still in the market for funding, or if you found what you needed?\n\nLet me know,\nAdmin' },
        { id: 's2', type: 'wait', delayDays: 3, order: 2 },
        { id: 's3', type: 'email', delayDays: 0, order: 3, subject: 'Rates have dropped', content: 'Hi {{Name}},\n\nJust a heads up that rates have dropped slightly for your industry. Might be a good time to revisit your application.\n\nBest,\nNexus' }
      ]
    },
    {
      id: 'cmp_2',
      name: 'New Application Welcome',
      status: 'Paused',
      trigger: 'Lead Created',
      enrolledCount: 45,
      steps: [
        { id: 's4', type: 'email', delayDays: 0, order: 1, subject: 'Welcome to Nexus Funding', content: 'Hi {{Name}},\n\nThanks for applying. To speed up your approval, please upload your last 3 months of bank statements in the portal.\n\nLogin here: [Link]' }
      ]
    },
    {
      id: 'cmp_3',
      name: 'Q3 Follow-Up Sequence',
      status: 'Active',
      trigger: 'Lead Created',
      enrolledCount: 5,
      steps: [
        { 
          id: 'q3_1', 
          type: 'email', 
          delayDays: 0, 
          order: 1, 
          subject: 'Checking in on your Q3 goals', 
          content: 'Hi {{Name}},\n\nAs we move deeper into Q3, I wanted to check in on your capital needs. Are you planning any inventory purchases or expansion projects this quarter?\n\nLet\'s chat,\nNexus Team' 
        },
        { id: 'q3_w1', type: 'wait', delayDays: 3, order: 2 },
        { 
          id: 'q3_2', 
          type: 'email', 
          delayDays: 0, 
          order: 3, 
          subject: '3 Tips for Faster Funding', 
          content: 'Hi {{Name}},\n\nHere are 3 things our underwriters look for to approve deals fast:\n1. Consistent daily balances\n2. Low NSF count\n3. Recent business activity\n\nUpload your latest statements to see where you stand.' 
        },
        { id: 'q3_w2', type: 'wait', delayDays: 5, order: 4 },
        { 
          id: 'q3_3', 
          type: 'email', 
          delayDays: 0, 
          order: 5, 
          subject: 'Recent Success Stories', 
          content: 'Hi {{Name}},\n\nWe just funded a business in your industry for $75k in 24 hours. They used the capital to bulk buy inventory at a discount.\n\nReady to write your own success story? Click below to resume your application.' 
        }
      ]
    },
    {
      id: 'cmp_4',
      name: 'Referral Partner Recruitment',
      status: 'Active',
      trigger: 'Manual',
      enrolledCount: 8,
      steps: [
        {
          id: 'ref_1',
          type: 'email',
          delayDays: 0,
          order: 1,
          subject: 'Partnering with Nexus?',
          content: 'Hi {{Name}},\n\nWe are expanding our referral partner network and I thought of you.\n\nWe offer industry-leading commissions ($500+ per deal) and a white-label portal for your clients.\n\nInterested in a quick chat?\n\nBest,\nNexus Team'
        },
        { id: 'ref_w1', type: 'wait', delayDays: 2, order: 2 },
        {
          id: 'ref_2',
          type: 'email',
          delayDays: 0,
          order: 3,
          subject: 'Earn passive income with your network',
          content: 'Hi {{Name}},\n\nJust wanted to share our commission structure:\n- Tier 1: $500 per funded deal\n- Tier 2: 20% revenue share\n\nSee how much you could earn here: [Link]'
        }
      ]
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [generatedSteps, setGeneratedSteps] = useState<CampaignStep[]>([]);

  // SOCIAL STATE
  const [videoPrompt, setVideoPrompt] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);

  const handleGenerateEmail = async () => {
    if (!targetAudience || !campaignGoal) return;
    setIsGeneratingEmail(true);
    
    try {
      const sequence = await geminiService.generateCampaignSequence(targetAudience, campaignGoal);
      
      const newSteps: CampaignStep[] = [];
      sequence.forEach((item: {subject: string, body: string}, index: number) => {
        // Add a wait step between emails
        if (index > 0) {
           newSteps.push({
             id: `step_wait_${index}`,
             type: 'wait',
             delayDays: 3,
             order: newSteps.length + 1
           });
        }
        newSteps.push({
          id: `step_email_${index}`,
          type: 'email',
          subject: item.subject,
          content: item.body,
          order: newSteps.length + 1,
          delayDays: 0
        });
      });

      setGeneratedSteps(newSteps);
    } catch (e) {
      console.error("Failed to generate campaign", e);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleSaveCampaign = () => {
    if (!newCampaignName || generatedSteps.length === 0) return;
    
    const newCampaign: Campaign = {
      id: `cmp_${Date.now()}`,
      name: newCampaignName,
      status: 'Draft',
      trigger: 'Manual',
      enrolledCount: 0,
      steps: generatedSteps
    };

    setCampaigns([...campaigns, newCampaign]);
    setIsCreating(false);
    setNewCampaignName('');
    setTargetAudience('');
    setCampaignGoal('');
    setGeneratedSteps([]);
  };

  const handleDelete = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  const toggleStatus = (id: string) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status: c.status === 'Active' ? 'Paused' : 'Active' } : c
    ));
  };

  // --- SOCIAL CONTENT GENERATION ---
  const handleGenerateSocial = async () => {
    if (!videoPrompt) return;
    setIsGeneratingSocial(true);
    setGeneratedVideoUrl(null);
    setGeneratedCaption('');

    try {
      // Run video and caption generation in parallel
      const [videoUrl, caption] = await Promise.all([
        geminiService.generateSocialVideo(videoPrompt, aspectRatio),
        geminiService.generateSocialCaption(selectedPlatform, videoPrompt)
      ]);

      if (videoUrl) {
        setGeneratedVideoUrl(videoUrl);
      } else {
        alert("Video generation failed. Please check your API key permissions.");
      }
      
      setGeneratedCaption(caption);

    } catch (e) {
      console.error(e);
      alert("Error generating content");
    } finally {
      setIsGeneratingSocial(false);
    }
  };

  const handlePostVideo = () => {
    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      platform: selectedPlatform as any,
      prompt: videoPrompt,
      videoUrl: generatedVideoUrl || '',
      aspectRatio,
      status: 'Scheduled',
      dateCreated: new Date().toLocaleDateString(),
      caption: generatedCaption
    };
    setSocialPosts([newPost, ...socialPosts]);
    alert(`Scheduled post for ${selectedPlatform}!`);
  };

  const handlePlatformChange = (platform: string) => {
      setSelectedPlatform(platform);
      // Auto-set aspect ratio based on platform best practices
      if (['TikTok', 'Instagram', 'YouTube Shorts'].includes(platform)) {
          setAspectRatio('9:16');
      } else {
          setAspectRatio('16:9');
      }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MessageSquare className="text-blue-600" size={32} /> Marketing Hub
          </h1>
          <p className="text-slate-500 mt-2">Manage email drips and social media content creation.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('email')}
             className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'email' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
           >
             <Mail size={16} /> Email Automation
           </button>
           <button 
             onClick={() => setActiveTab('social')}
             className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'social' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-500'}`}
           >
             <Video size={16} /> Social Studio
           </button>
        </div>
      </div>

      {/* --- EMAIL TAB --- */}
      {activeTab === 'email' && (
        <>
          <div className="flex justify-end mb-6">
            {!isCreating && (
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Plus size={20} /> New AI Campaign
              </button>
            )}
          </div>

          {isCreating ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-slide-in-right">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Campaign Generator</h2>
                      <p className="text-slate-400 text-sm">Describe your goal, and our AI will build the sequence.</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white transition-colors">
                    <Trash2 size={20} />
                  </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: Inputs */}
                  <div className="p-8 space-y-6 border-r border-slate-100">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Name</label>
                        <input 
                          type="text" 
                          value={newCampaignName}
                          onChange={(e) => setNewCampaignName(e.target.value)}
                          placeholder="e.g., Restaurant Owner Outreach"
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Target Audience</label>
                        <input 
                          type="text" 
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="e.g., Construction companies with >$500k revenue"
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Goal</label>
                        <textarea 
                          value={campaignGoal}
                          onChange={(e) => setCampaignGoal(e.target.value)}
                          placeholder="e.g., Convince them to apply for equipment financing to save on taxes before year-end."
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 resize-none transition-all"
                        />
                    </div>
                    <button 
                      onClick={handleGenerateEmail}
                      disabled={isGeneratingEmail || !targetAudience || !campaignGoal}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isGeneratingEmail ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                      {isGeneratingEmail ? 'AI is Writing...' : 'Generate Sequence'}
                    </button>
                  </div>

                  {/* Right: Preview */}
                  <div className="p-8 bg-slate-50 flex flex-col h-full">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                      <Play size={18} className="text-blue-600" /> Sequence Preview
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                        {generatedSteps.length === 0 ? (
                          <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                            <Sparkles size={48} className="mb-4 opacity-20" />
                            <p>Enter details and click generate to see magic.</p>
                          </div>
                        ) : (
                          generatedSteps.map((step, idx) => (
                            <div key={idx} className="relative pl-8 pb-8 last:pb-0">
                              {/* Timeline Line */}
                              {idx !== generatedSteps.length - 1 && (
                                <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200"></div>
                              )}
                              
                              {/* Icon */}
                              <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${
                                step.type === 'email' ? 'bg-white border-blue-500 text-blue-500' : 'bg-slate-100 border-slate-300 text-slate-400'
                              }`}>
                                {step.type === 'email' ? <Mail size={14} /> : <Clock size={14} />}
                              </div>

                              {step.type === 'email' ? (
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-blue-300 transition-colors">
                                    <div className="text-xs font-bold text-blue-600 uppercase mb-1">Email {Math.ceil((idx + 1)/2)}</div>
                                    <div className="font-bold text-slate-800 mb-2">{step.subject}</div>
                                    <div className="text-sm text-slate-500 line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100">{step.content}</div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium py-2">
                                  <Clock size={16} /> Wait {step.delayDays} Days
                                </div>
                              )}
                            </div>
                          ))
                        )}
                    </div>
                    
                    {generatedSteps.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-3">
                          <button onClick={() => setIsCreating(false)} className="px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
                          <button 
                            onClick={handleSaveCampaign}
                            disabled={!newCampaignName}
                            className="px-6 py-2 rounded-lg font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-colors disabled:opacity-50"
                          >
                            Save Campaign
                          </button>
                      </div>
                    )}
                  </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl ${campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {campaign.status === 'Active' ? <Play size={24} /> : <Pause size={24} />}
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${campaign.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                              {campaign.status}
                            </span>
                            <button onClick={() => handleDelete(campaign.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{campaign.name}</h3>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                          <div className="flex items-center gap-1"><Users size={14} /> {campaign.enrolledCount} Enrolled</div>
                          <div className="flex items-center gap-1"><Send size={14} /> {campaign.steps.filter(s => s.type === 'email').length} Emails</div>
                      </div>

                      <div className="space-y-3">
                          {campaign.steps.slice(0, 3).map((step, i) => (
                            step.type === 'email' && (
                              <div key={i} className="flex items-center gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{Math.ceil((i+1)/2)}</div>
                                <span className="truncate text-slate-600">{step.subject || 'No Subject'}</span>
                              </div>
                            )
                          ))}
                          {campaign.steps.length > 5 && (
                            <div className="text-xs text-slate-400 pl-9">+ {campaign.steps.length - 3} more steps</div>
                          )}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="text-xs font-bold text-slate-500 uppercase">Trigger: {campaign.trigger}</div>
                      <button 
                        onClick={() => toggleStatus(campaign.id)}
                        className={`text-sm font-bold flex items-center gap-1 ${campaign.status === 'Active' ? 'text-slate-500 hover:text-slate-700' : 'text-green-600 hover:text-green-700'}`}
                      >
                        {campaign.status === 'Active' ? 'Pause Campaign' : 'Activate Campaign'} <ArrowRight size={14} />
                      </button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* --- SOCIAL TAB --- */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
           
           {/* LEFT: Generation Controls */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col h-full">
              <div className="mb-6">
                 <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <Sparkles className="text-pink-500" /> Post Generator
                 </h2>
                 <p className="text-sm text-slate-500 mt-2">
                    Create viral-ready posts, videos, and captions for any platform.
                 </p>
              </div>

              <div className="space-y-6 flex-1">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['TikTok', 'Instagram', 'LinkedIn', 'YouTube Shorts', 'Facebook', 'Twitter'].map(p => (
                            <button
                                key={p}
                                onClick={() => handlePlatformChange(p)}
                                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${selectedPlatform === p ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Content Topic / Prompt</label>
                    <textarea 
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder={`Describe your post idea for ${selectedPlatform}...`}
                      className="w-full border rounded-xl p-4 h-24 resize-none text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Aspect Ratio</label>
                    <div className="flex gap-3">
                       <button 
                         onClick={() => setAspectRatio('9:16')}
                         className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${aspectRatio === '9:16' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}
                       >
                          <Smartphone size={24} />
                          <span className="text-xs font-bold">Vertical (9:16)</span>
                       </button>
                       <button 
                         onClick={() => setAspectRatio('16:9')}
                         className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${aspectRatio === '16:9' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}
                       >
                          <Monitor size={24} />
                          <span className="text-xs font-bold">Horizontal (16:9)</span>
                       </button>
                    </div>
                 </div>

                 <button 
                   onClick={handleGenerateSocial}
                   disabled={isGeneratingSocial || !videoPrompt}
                   className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                 >
                    {isGeneratingSocial ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                    {isGeneratingSocial ? 'Creating Magic...' : 'Generate Post & Caption'}
                 </button>
              </div>
           </div>

           {/* RIGHT: Preview & Posting */}
           <div className="flex flex-col gap-6 h-full">
              
              {/* Preview Player */}
              <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden shadow-xl min-h-[300px]">
                 {isGeneratingSocial ? (
                    <div className="text-center text-pink-400 animate-pulse">
                       <Sparkles size={48} className="mx-auto mb-4" />
                       <p className="font-bold text-lg">AI Generating Content...</p>
                       <p className="text-xs opacity-70 mt-1">Creating video & writing caption</p>
                    </div>
                 ) : generatedVideoUrl ? (
                    <div className="w-full h-full flex flex-col">
                       <div className="flex-1 bg-black flex items-center justify-center">
                          {generatedVideoUrl.startsWith('http') ? (
                             <div className="text-white text-center">
                                <p className="mb-4">Video Ready</p>
                                <a href={generatedVideoUrl} target="_blank" rel="noreferrer" className="underline text-pink-400">Download / View</a>
                             </div>
                          ) : (
                             <div className="text-white">Video Generated</div>
                          )}
                       </div>
                       
                       {/* Generated Caption Area */}
                       <div className="p-4 bg-slate-800 border-t border-slate-700">
                          <div className="flex justify-between items-center mb-2">
                              <p className="text-xs font-bold text-slate-400 uppercase">Generated Caption</p>
                              <button onClick={() => navigator.clipboard.writeText(generatedCaption)} className="text-xs text-blue-400 hover:text-white flex items-center gap-1"><Copy size={12}/> Copy</button>
                          </div>
                          <textarea 
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-2 text-xs text-slate-300 h-20 resize-none focus:ring-1 focus:ring-pink-500 outline-none"
                            value={generatedCaption}
                            onChange={(e) => setGeneratedCaption(e.target.value)}
                          />
                          <button onClick={handlePostVideo} className="w-full mt-3 bg-pink-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-pink-700 transition-colors">
                             Schedule Post to {selectedPlatform}
                          </button>
                       </div>
                    </div>
                 ) : (
                    <div className="text-slate-600 text-center">
                       <Video size={64} className="mx-auto mb-4 opacity-20" />
                       <p className="text-sm">Video preview will appear here.</p>
                    </div>
                 )}
              </div>

              {/* Recent Posts Queue */}
              <div className="h-64 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                 <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
                    <Share2 size={16} /> Scheduled Content
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {socialPosts.length === 0 ? (
                       <p className="text-center text-slate-400 text-sm mt-8">No posts generated yet.</p>
                    ) : (
                       socialPosts.map(post => (
                          <div key={post.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${post.platform === 'YouTube' ? 'bg-red-600' : post.platform === 'LinkedIn' ? 'bg-blue-700' : post.platform === 'TikTok' ? 'bg-black' : post.platform === 'Facebook' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                                   {post.platform === 'YouTube' && <Youtube size={14} />}
                                   {post.platform === 'LinkedIn' && <Linkedin size={14} />}
                                   {post.platform === 'TikTok' && <Share2 size={14} />}
                                   {post.platform === 'Instagram' && <Instagram size={14} />}
                                   {post.platform === 'Facebook' && <Facebook size={14} />}
                                   {post.platform === 'Twitter' && <span className="font-bold text-xs">X</span>}
                                </div>
                                <div>
                                   <p className="text-xs font-bold text-slate-800">{post.platform}</p>
                                   <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{post.prompt}</p>
                                </div>
                             </div>
                             <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{post.status}</span>
                          </div>
                       ))
                    )}
                 </div>
              </div>

           </div>
        </div>
      )}

    </div>
  );
};

export default MarketingCampaigns;