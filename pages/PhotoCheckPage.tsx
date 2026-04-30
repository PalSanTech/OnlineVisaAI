
import React, { useState } from 'react';
import { validateVisaPhoto } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, XCircle, Check, X, Eye, Sun, Ruler } from 'lucide-react';

const PhotoCheckPage: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setAnalysis(null); // Reset previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    // Remove data:image/...;base64, prefix
    const base64 = imagePreview.split(',')[1];
    const result = await validateVisaPhoto(base64);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Visa Photo Validator</h1>
        <p className="text-slate-500 mt-2">
          Ensure your photo meets strict ICAO & Schengen biometric standards before applying.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Upload Photo</h3>
            
            {!imagePreview ? (
              <label className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all">
                <Upload className="text-slate-400 mb-4" size={48} />
                <span className="text-slate-700 font-medium">Click to upload or drag photo</span>
                <span className="text-slate-500 text-xs mt-2">JPG/PNG, Max 5MB</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-slate-900 flex justify-center">
                 <img src={imagePreview} alt="Preview" className="max-h-80 object-contain" />
                 <button 
                    onClick={() => { setImagePreview(null); setAnalysis(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                 >
                    <AlertCircle size={16} />
                 </button>
              </div>
            )}

            <div className="mt-6">
               <button
                  onClick={handleAnalyze}
                  disabled={!imagePreview || isAnalyzing}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
               >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                  Check Compliance
               </button>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div>
           {analysis ? (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                   <h3 className="font-semibold text-slate-800">Analysis Report</h3>
                </div>
                <div className="p-6 overflow-y-auto max-h-[600px] custom-scrollbar">
                   <MarkdownRenderer content={analysis} />
                </div>
             </div>
           ) : (
             <div className="h-full min-h-[400px] bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Camera size={48} className="mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-slate-500">Ready to Analyze</h3>
                <p className="max-w-xs mt-2">Upload your photo to get an instant AI verdict on visa compliance.</p>
             </div>
           )}
        </div>
      </div>

      {/* Reference Guide Section */}
      <div className="border-t border-slate-200 pt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Reference Guide</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Examples Gallery */}
            <div className="lg:col-span-2">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-600" size={20} /> 
                    Examples: Do's & Don'ts
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Compliant */}
                    <div className="space-y-2">
                        <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border-2 border-emerald-500 relative flex items-end justify-center">
                             {/* Simulated Face */}
                             <div className="w-20 h-24 bg-slate-300 rounded-t-full mb-0 relative">
                                <div className="absolute top-8 left-4 w-2 h-2 bg-slate-400 rounded-full"></div>
                                <div className="absolute top-8 right-4 w-2 h-2 bg-slate-400 rounded-full"></div>
                                <div className="absolute bottom-6 left-7 w-6 h-1 bg-slate-400 rounded-full"></div>
                             </div>
                             <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5">
                                <Check size={12} />
                             </div>
                        </div>
                        <p className="text-xs font-medium text-center text-emerald-700">Compliant</p>
                    </div>

                    {/* Bad Background */}
                    <div className="space-y-2">
                         <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border-2 border-rose-400 relative flex items-end justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 to-slate-300">
                             <div className="w-20 h-24 bg-slate-300 rounded-t-full mb-0 shadow-xl"></div>
                             <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-0.5">
                                <X size={12} />
                             </div>
                        </div>
                        <p className="text-xs font-medium text-center text-rose-600">Bad Background</p>
                    </div>

                    {/* Expression */}
                    <div className="space-y-2">
                        <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border-2 border-rose-400 relative flex items-end justify-center">
                             <div className="w-20 h-24 bg-slate-300 rounded-t-full mb-0 relative">
                                {/* Smiling mouth */}
                                <div className="absolute bottom-6 left-6 w-8 h-4 border-b-4 border-slate-400 rounded-full"></div>
                             </div>
                             <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-0.5">
                                <X size={12} />
                             </div>
                        </div>
                        <p className="text-xs font-medium text-center text-rose-600">Smiling/Teeth</p>
                    </div>

                    {/* Shadows/Hair */}
                    <div className="space-y-2">
                        <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border-2 border-rose-400 relative flex items-end justify-center">
                             <div className="w-20 h-24 bg-slate-300 rounded-t-full mb-0 relative overflow-hidden">
                                {/* Shadow */}
                                <div className="absolute top-0 right-0 w-10 h-full bg-black/20"></div>
                             </div>
                             <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-0.5">
                                <X size={12} />
                             </div>
                        </div>
                        <p className="text-xs font-medium text-center text-rose-600">Shadows/Hair</p>
                    </div>
                </div>
            </div>

            {/* Detailed Rules */}
            <div>
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Ruler className="text-blue-600" size={20} />
                    Official Requirements
                </h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-sm text-slate-600">
                            <div className="mt-0.5 min-w-[20px] text-slate-400"><Ruler size={18} /></div>
                            <div>
                                <span className="font-semibold text-slate-800 block">Format & Size</span>
                                35mm wide x 45mm high. The head must cover 70-80% of the photo (32-36mm).
                            </div>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-600">
                            <div className="mt-0.5 min-w-[20px] text-slate-400"><Sun size={18} /></div>
                            <div>
                                <span className="font-semibold text-slate-800 block">Lighting & Background</span>
                                Even lighting, no shadows on face or background. Background must be plain light grey or white.
                            </div>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-600">
                            <div className="mt-0.5 min-w-[20px] text-slate-400"><Eye size={18} /></div>
                            <div>
                                <span className="font-semibold text-slate-800 block">Expression</span>
                                Neutral expression only. Mouth closed, eyes open and looking directly at the camera.
                            </div>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-600">
                            <div className="mt-0.5 min-w-[20px] text-slate-400"><CheckCircle2 size={18} /></div>
                            <div>
                                <span className="font-semibold text-slate-800 block">Quality</span>
                                High resolution, sharp focus, no pixilation. Printed on high-quality paper (if physical).
                            </div>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-600">
                            <div className="mt-0.5 min-w-[20px] text-slate-400"><XCircle size={18} /></div>
                            <div>
                                <span className="font-semibold text-slate-800 block">Restrictions</span>
                                No headwear (except religious), no hair covering eyes, no red-eye, no glasses glare.
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCheckPage;
