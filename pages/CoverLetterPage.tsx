
import React, { useState, useEffect } from 'react';
import { TripDetails, UserProfile, AppSection } from '../types';
import { generateCoverLetter } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import { FileText, Loader2, Download, Printer, Save, Edit3, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface CoverLetterPageProps {
  trip: TripDetails;
  profile: UserProfile;
  generatedLetter: string;
  setGeneratedLetter: (val: string) => void;
}

const CoverLetterPage: React.FC<CoverLetterPageProps> = ({ trip, profile, generatedLetter, setGeneratedLetter }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!generatedLetter) {
      const saved = localStorage.getItem(`draft_coverletter_${profile.id}`);
      if (saved) {
          setGeneratedLetter(saved);
          setIsSaved(true);
      }
    }
  }, [profile.id, generatedLetter, setGeneratedLetter]);

  const handleGenerate = async () => {
     if (!profile.fullName || !profile.passportNumber) {
        alert("Please ensure your Name and Passport Number are entered in the Itinerary or Dashboard section.");
        return;
    }
    setIsGenerating(true);
    const result = await generateCoverLetter(trip, profile);
    setGeneratedLetter(result);
    setIsSaved(false); // New draft
    setIsGenerating(false);
  };

  const handleSaveDraft = () => {
    if (generatedLetter) {
      localStorage.setItem(`draft_coverletter_${profile.id}`, generatedLetter);
      setIsSaved(true);
      alert("Draft saved locally!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center no-print">
        <h1 className="text-3xl font-bold text-slate-900">Cover Letter Generator</h1>
        <p className="text-slate-500 mt-2">
          Create a professional, formally formatted cover letter for the consulate.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print">
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="text-sm text-slate-600">
                    Generating for: <span className="font-semibold text-slate-900">{profile.fullName || 'Unknown User'}</span> traveling to <span className="font-semibold text-slate-900">{trip.mainDestination}</span>.
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                    Generate Letter
                </button>
            </div>
        </div>

        {generatedLetter ? (
            <div className={`bg-white rounded-xl shadow-lg border relative flex flex-col transition-colors ${isSaved ? 'border-slate-200' : 'border-amber-200 shadow-amber-50/50'}`}>
                {/* Toolbar */}
                <div className="absolute top-4 right-4 flex gap-2 no-print items-center bg-white/80 backdrop-blur-sm p-1 rounded-full border border-slate-100 shadow-sm z-10">
                     {!isSaved ? (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium mr-2 animate-pulse flex items-center gap-1">
                            <AlertCircle size={12} /> Draft
                        </span>
                    ) : (
                         <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mr-2 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Saved
                        </span>
                    )}
                     <button onClick={handleSaveDraft} className={`p-2 rounded-full transition-colors ${!isSaved ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`} title="Save Draft">
                        <Save size={20} />
                    </button>
                    <button onClick={() => setIsPreviewOpen(true)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Full Preview">
                        <Eye size={20} />
                    </button>
                    <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Print / PDF">
                        <Printer size={20} />
                    </button>
                    <button 
                        onClick={() => navigator.clipboard.writeText(generatedLetter)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Copy Text"
                    >
                        <Download size={20} />
                    </button>
                </div>

                <div id="printable-content" className="p-8 md:p-12">
                    {/* Header for Print */}
                    <div className="mb-10 border-b border-slate-200 pb-4 hidden print:block">
                        <div className="flex justify-between items-end">
                            <h1 className="text-xl font-bold text-slate-900">VISA APPLICATION COVER LETTER</h1>
                            <div className="text-right text-sm text-slate-600">
                                {profile.fullName}<br/>
                                Passport: {profile.passportNumber}
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none font-serif">
                        <MarkdownRenderer content={generatedLetter} />
                    </div>
                    
                    {/* Footer for Print */}
                    <div className="mt-12 pt-8 border-t border-slate-200 hidden print:block">
                        <p className="text-xs text-slate-400 text-center">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        ) : (
             <div className="h-64 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 no-print">
                <p>Click "Generate Letter" to see the result.</p>
             </div>
        )}
      </div>

       {/* Preview Modal */}
       <DocumentPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Visa Application Cover Letter"
        content={generatedLetter}
        profileName={profile.fullName}
        metaInfo={`Passport: ${profile.passportNumber}`}
      />
    </div>
  );
};

export default CoverLetterPage;
