
import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, Shield, RefreshCw, Send, Code, AlertTriangle, CheckCircle, Sparkles, Globe, Link, X, Loader } from 'lucide-react';
import { Review } from '../types';
import * as geminiService from '../services/geminiService';

const MOCK_REVIEWS: Review[] = [
  { id: 'rev_1', contactName: 'Alice Freeman', company: 'TechCorp', rating: 5, comment: 'Nexus got us funded in 24 hours. Incredible service!', date: '2 days ago', source: 'Google', status: 'Pending' },
  { id: 'rev_2', contactName: 'Bob Builder', company: 'BuildIt', rating: 4, comment: 'Good rates, but the paperwork took a bit longer than expected.', date: '1 week ago', source: 'Trustpilot', status: 'Replied', reply: 'Thanks Bob! We are working on speeding up our doc review process.' },
  { id: 'rev_3', contactName: 'Charlie Davis', company: 'Retail Co', rating: 5, comment: 'Lifesavers. Best broker in the game.', date: '2 weeks ago', source: 'Google', status: 'Pending' },
  { id: 'rev_4', contactName: 'Dave Smith', company: 'Logistics LLC', rating: 2, comment: 'Rates were higher than quoted. Not happy.', date: '3 weeks ago', source: 'Internal', status: 'Pending' }
];

const ReputationManager: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reviews' | 'settings'>('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // Integration State
  const [googleConnected, setGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [businessNameInput, setBusinessNameInput] = useState('');
  
  // Analytics State
  const [sentimentData, setSentimentData] = useState<any>(null);

  // Metrics
  const totalReviews = reviews.length;
  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1);
  const nps = 72; // Mock NPS

  const handleGenerateReply = async (review: Review) => {
    setIsGenerating(true);
    const draft = await geminiService.generateReviewReply(review);
    setReplyDrafts({ ...replyDrafts, [review.id]: draft });
    setIsGenerating(false);
  };

  const handlePostReply = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: 'Replied', reply: replyDrafts[id] } : r));
    const newDrafts = { ...replyDrafts };
    delete newDrafts[id];
    setReplyDrafts(newDrafts);
  };

  const handleConnectGoogle = async () => {
    if (!businessNameInput) return;
    setIsConnecting(true);
    
    try {
        // Fetch mock reviews via AI
        const newMockReviews = await geminiService.generateMockGoogleReviews(businessNameInput);
        if (newMockReviews.length > 0) {
            setReviews(prev => [...newMockReviews, ...prev]);
            
            // Analyze the new batch
            const analysis = await geminiService.analyzeReviewSentiment(newMockReviews);
            setSentimentData(analysis);
            
            setGoogleConnected(true);
            setIsConnectModalOpen(false);
            alert("Google Business Profile connected! Reviews imported successfully.");
        } else {
            alert("Failed to fetch reviews. Please try again.");
        }
    } catch (e) {
        console.error(e);
        alert("Connection failed.");
    } finally {
        setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Star className="text-yellow-400 fill-yellow-400" size={32} /> Reputation Manager
          </h1>
          <p className="text-slate-500 mt-2">Automate review collection and manage your online presence.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
           <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Dashboard</button>
           <button onClick={() => setActiveTab('reviews')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'reviews' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Reviews</button>
           <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Widget & Settings</button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Average Rating</p>
                        <div className="flex items-end gap-3 mt-1">
                            <h3 className="text-4xl font-bold text-white">{avgRating}</h3>
                            <div className="flex mb-2">
                                {[1,2,3,4,5].map(i => <Star key={i} size={16} className={`${i <= Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />)}
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-4">Based on {totalReviews} reviews</p>
                    </div>
                    <Star size={120} className="absolute -right-4 -bottom-4 text-slate-800 opacity-50" />
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Net Promoter Score</p>
                            <h3 className="text-3xl font-bold text-emerald-600 mt-1">{nps}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ThumbsUp size={20}/></div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${nps}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Top 5% of industry</p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Sentiment Shield</p>
                            <h3 className="text-3xl font-bold text-blue-600 mt-1">Active</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Shield size={20}/></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                        Redirecting <strong className="text-slate-700">100%</strong> of 4-5 star reviews to Google.<br/>
                        Intercepting <strong className="text-slate-700">100%</strong> of 1-3 star reviews internally.
                    </p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-purple-500"/> 
                    AI Sentiment Analysis
                    {sentimentData && <span className="text-xs font-normal text-slate-400 ml-2">(Last updated just now)</span>}
                </h3>
                
                {sentimentData ? (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 italic border-l-4 border-purple-200 pl-3 py-1">"{sentimentData.summary}"</p>
                        <div className="flex gap-4">
                            <div className="flex-1 p-4 bg-green-50 border border-green-100 rounded-lg">
                                <p className="text-xs font-bold text-green-700 uppercase mb-2">Positive Themes</p>
                                <div className="flex flex-wrap gap-2">
                                    {sentimentData.positiveKeywords?.map((k: string) => (
                                        <span key={k} className="text-xs bg-white px-2 py-1 rounded border border-green-200 text-green-800">{k}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 p-4 bg-red-50 border border-red-100 rounded-lg">
                                <p className="text-xs font-bold text-red-700 uppercase mb-2">Areas to Improve</p>
                                <div className="flex flex-wrap gap-2">
                                    {sentimentData.negativeKeywords?.map((k: string) => (
                                        <span key={k} className="text-xs bg-white px-2 py-1 rounded border border-red-200 text-red-800">{k}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800">
                            <strong>Recommended Action:</strong> {sentimentData.recommendedAction}
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <div className="flex-1 p-4 bg-green-50 border border-green-100 rounded-lg">
                            <p className="text-xs font-bold text-green-700 uppercase mb-2">Positive Keywords</p>
                            <div className="flex flex-wrap gap-2">
                                {['Fast Funding', 'Professional', 'Easy Process', 'Great Rates'].map(k => (
                                    <span key={k} className="text-xs bg-white px-2 py-1 rounded border border-green-200 text-green-800">{k}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 p-4 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-xs font-bold text-red-700 uppercase mb-2">Negative Keywords</p>
                            <div className="flex flex-wrap gap-2">
                                {['Paperwork', 'High Fees', 'Communication'].map(k => (
                                    <span key={k} className="text-xs bg-white px-2 py-1 rounded border border-red-200 text-red-800">{k}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 gap-4">
            {reviews.map(review => (
                <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                                {review.contactName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">{review.contactName}</h4>
                                <p className="text-xs text-slate-500">{review.company} • via {review.source} • {review.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={14} className={`${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />)}
                        </div>
                    </div>
                    
                    <p className="text-slate-700 text-sm mb-4 leading-relaxed">"{review.comment}"</p>
                    
                    {review.status === 'Pending' && !replyDrafts[review.id] && (
                        <button 
                            onClick={() => handleGenerateReply(review)}
                            disabled={isGenerating}
                            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={12}/> : <Sparkles size={12}/>} Generate AI Reply
                        </button>
                    )}

                    {replyDrafts[review.id] && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2 animate-fade-in">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Draft Reply</p>
                            <textarea 
                                className="w-full text-sm bg-white border border-slate-200 rounded p-2 text-slate-600 h-24 mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={replyDrafts[review.id]}
                                onChange={(e) => setReplyDrafts({...replyDrafts, [review.id]: e.target.value})}
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => { const d = {...replyDrafts}; delete d[review.id]; setReplyDrafts(d); }} className="text-xs text-slate-500 font-bold px-3 py-1.5">Discard</button>
                                <button onClick={() => handlePostReply(review.id)} className="text-xs bg-blue-600 text-white font-bold px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-1"><Send size={12}/> Post Reply</button>
                            </div>
                        </div>
                    )}

                    {review.status === 'Replied' && (
                        <div className="bg-slate-50 border-l-2 border-blue-500 pl-3 py-2 mt-2">
                            <p className="text-xs font-bold text-slate-500 mb-1">Your Reply</p>
                            <p className="text-xs text-slate-600 italic">{review.reply}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8 animate-fade-in">
            {/* Review Sources */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Globe size={18} className="text-blue-500"/> Review Sources
                </h3>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">Google Business Profile</h4>
                            <p className="text-sm text-slate-500">
                                {googleConnected ? `Connected to ${businessNameInput}` : 'Sync reviews and reply directly.'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={googleConnected ? () => { setGoogleConnected(false); setBusinessNameInput(''); } : () => setIsConnectModalOpen(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                            googleConnected 
                            ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        }`}
                    >
                        {googleConnected ? <CheckCircle size={16} /> : <Link size={16} />}
                        {googleConnected ? 'Connected' : 'Connect'}
                    </button>
                </div>
            </div>

            {/* Other settings... */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield size={18} className="text-blue-500"/> Sentiment Shield Logic</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <p className="text-sm font-bold text-slate-700">Positive Threshold</p>
                                <p className="text-xs text-slate-500">Redirects to public review sites</p>
                            </div>
                            <select className="bg-white border border-slate-200 rounded text-sm px-2 py-1 font-bold">
                                <option>4 Stars & Up</option>
                                <option>5 Stars Only</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <p className="text-sm font-bold text-slate-700">Auto-Request Timing</p>
                                <p className="text-xs text-slate-500">Trigger after "Closed" status</p>
                            </div>
                            <select className="bg-white border border-slate-200 rounded text-sm px-2 py-1 font-bold">
                                <option>Immediately</option>
                                <option>24 Hours</option>
                                <option>7 Days</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                            <AlertTriangle size={14} /> Negative reviews (1-3 stars) are routed to an internal feedback form automatically.
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Code size={18} className="text-purple-500"/> Website Widget</h3>
                    <p className="text-sm text-slate-500 mb-4">Embed this code on your landing page to display your 5-star reviews.</p>
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto relative group">
                        {`<div id="nexus-reviews" data-id="12345"></div>
<script src="https://cdn.nexus.funding/widget.js"></script>`}
                        <button className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Preview</p>
                        <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg bg-white shadow-sm">
                            <div className="flex text-yellow-400"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                            <span className="text-xs font-bold text-slate-700">4.9/5</span>
                            <span className="text-xs text-slate-400">from 120+ happy clients</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Connect Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Globe size={18} className="text-blue-500"/> Connect Google Business
                    </h3>
                    <button onClick={() => setIsConnectModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600">Enter your business name to sync reviews. We'll use AI to fetch and analyze your public reputation.</p>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Name / Place ID</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Nexus Funding Inc."
                            value={businessNameInput}
                            onChange={(e) => setBusinessNameInput(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button 
                        onClick={handleConnectGoogle}
                        disabled={isConnecting || !businessNameInput}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isConnecting ? <Loader className="animate-spin" size={18}/> : <Link size={18}/>}
                        {isConnecting ? 'Connecting & Fetching...' : 'Sync Reviews'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ReputationManager;
