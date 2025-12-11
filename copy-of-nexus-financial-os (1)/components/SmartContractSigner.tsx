
import React, { useRef, useState, useEffect } from 'react';
import { FundingOffer } from '../types';
import { PenTool, X, Shield, CheckCircle, AlertTriangle, Eraser, Type, MousePointer2 } from 'lucide-react';

interface SmartContractSignerProps {
  offer: FundingOffer;
  onClose: () => void;
  onSign: (signature: string) => void;
}

const SmartContractSigner: React.FC<SmartContractSignerProps> = ({ offer, onClose, onSign }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setIsCanvasEmpty(false);
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas && isDrawing) {
       const ctx = canvas.getContext('2d');
       ctx?.closePath();
    }
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        offsetX: (e as React.MouseEvent).nativeEvent.offsetX,
        offsetY: (e as React.MouseEvent).nativeEvent.offsetY
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setIsCanvasEmpty(true);
    }
  };

  const handleFinish = () => {
    let signatureData = '';
    if (activeTab === 'draw') {
      if (isCanvasEmpty) return;
      signatureData = canvasRef.current?.toDataURL() || '';
    } else {
      if (!typedName.trim()) return;
      // Convert typed name to image (simulation)
      signatureData = `typed:${typedName}`; 
    }
    onSign(signatureData);
  };

  // Initialize Canvas
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      // Set resolution
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, [activeTab]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] animate-fade-in">
        
        {/* LEFT: Smart Contract View */}
        <div className="w-full md:w-1/2 bg-slate-50 p-8 border-r border-slate-200 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="text-emerald-500" /> Secure Contract
            </h2>
            <p className="text-sm text-slate-500">Review terms before signing.</p>
          </div>

          <div className="space-y-6">
            {/* Deal Terms */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Deal Terms</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-xs text-slate-500">Loan Amount</p>
                  <p className="text-xl font-bold text-slate-900">${offer.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Lender</p>
                  <p className="text-lg font-medium text-slate-900">{offer.lenderName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Term Length</p>
                  <p className="font-medium text-slate-800">{offer.term}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Payment Frequency</p>
                  <p className="font-medium text-slate-800">{offer.payment}</p>
                </div>
                <div className="col-span-2 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Estimated Payment</p>
                  <p className="text-lg font-bold text-blue-600">${offer.paymentAmount?.toLocaleString() || '---'}</p>
                </div>
              </div>
            </div>

            {/* AI Analysis Integration */}
            {offer.aiAnalysis && (
              <div className="bg-slate-900 text-white p-6 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Shield size={16} /> AI Sentinel Verified
                    </h3>
                    <div className="bg-white/10 px-2 py-1 rounded text-xs font-bold">
                      Score: {offer.aiAnalysis.safetyScore}/100
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm opacity-90">
                    <div className="flex justify-between">
                      <span className="text-slate-400">True APR (Est.)</span>
                      <span className="font-bold">{offer.aiAnalysis.trueApr}%</span>
                    </div>
                    
                    {offer.aiAnalysis.risks.length > 0 && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1">
                          <AlertTriangle size={12} /> Key Risk Factors:
                        </p>
                        <ul className="text-xs text-slate-300 list-disc pl-4 space-y-1">
                          {offer.aiAnalysis.risks.slice(0, 2).map((r, i) => (
                            <li key={i}>{r.clause}: {r.description}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-400 leading-relaxed">
              By signing, you agree to the Terms of Service and acknowledge that this digital signature is legally binding under the ESIGN Act. The AI analysis provided is for informational purposes only and does not constitute legal advice.
            </div>
          </div>
        </div>

        {/* RIGHT: Signature Pad */}
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <PenTool size={20} className="text-blue-600" /> Sign Here
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-slate-200 mb-6">
            <button 
              onClick={() => setActiveTab('draw')}
              className={`pb-2 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'draw' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <PenTool size={16} /> Draw
            </button>
            <button 
              onClick={() => setActiveTab('type')}
              className={`pb-2 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'type' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Type size={16} /> Type
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {activeTab === 'draw' ? (
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 h-64 touch-none">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full cursor-crosshair rounded-xl"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {isCanvasEmpty && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <p className="text-slate-400 text-lg font-handwriting">Sign Here</p>
                  </div>
                )}
                <button 
                  onClick={clearCanvas} 
                  className="absolute bottom-4 right-4 p-2 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                  title="Clear"
                >
                  <Eraser size={16} />
                </button>
              </div>
            ) : (
              <div className="h-64 flex flex-col justify-center gap-4">
                <label className="text-sm font-bold text-slate-700">Type your full legal name</label>
                <input 
                  type="text" 
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full p-4 text-3xl font-handwriting border-b-2 border-slate-300 focus:border-blue-500 outline-none text-center bg-transparent"
                />
                <p className="text-center text-xs text-slate-400">Nexus generated signature</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleFinish}
              disabled={(activeTab === 'draw' && isCanvasEmpty) || (activeTab === 'type' && !typedName.trim())}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              <CheckCircle size={20} /> Adopt & Sign
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmartContractSigner;
