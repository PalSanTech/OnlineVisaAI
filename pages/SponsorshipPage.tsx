
import React, { useState, useEffect } from 'react';
import { TripDetails, UserProfile } from '../types';
import { generateSponsorshipLetter } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import InputCard from '../components/InputCard';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import { HeartHandshake, Loader2, Download, Printer, Save, Edit3, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface SponsorshipPageProps {
  trip: TripDetails;
  profile: UserProfile;
}

const SponsorshipPage: React.FC<SponsorshipPageProps> = ({ trip, profile }) => {
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorRelation, setSponsorRelation] = useState('');
  const [sponsorStatus, setSponsorStatus] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`draft_sponsorship_${profile.id}`);
    if (saved) {
        setGeneratedLetter(saved);
        setIsSaved(true);
    }
  }, [profile.id]);

  const handleGenerate = async () => {
    if (!profile.fullName || !sponsorName || !sponsorRelation || !sponsorStatus) {
        alert("Please fill in all sponsor and applicant details.");
        return;
    }
    setIsGenerating(true);
    const result = await generateSponsorshipLetter(trip, profile, sponsorName, sponsorRelation, sponsorStatus);
    setGeneratedLetter(result);
    setIsSaved(false); // New draft
    setIsGenerating(false);
  };

  const handleSaveDraft = () => {
    if (generatedLetter) {
      localStorage.setItem(`draft_sponsorship_${profile.id}`, generatedLetter);
      setIsSaved(true);
      alert("Draft saved locally!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToInput = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 no-print">
        <h1 className="text-3xl font-bold text-slate-900">Sponsorship Letter Generator</h1>
        <p className="text-slate-500 mt-2">
          If someone else is paying for your trip, you need a strong sponsorship letter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6 no-print">
          <InputCard title="Sponsor Details">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sponsor Full Name</label>
                <input
                  type="text"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder="e.g. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship to Applicant</label>
                <input
                  type="text"
                  value={sponsorRelation}
                  onChange={(e) => setSponsorRelation(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder="e.g. Father, Spouse, Employer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Financial Status / Job</label>
                <textarea
                  value={sponsorStatus}
                  onChange={(e) => setSponsorStatus(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none bg-white"
                  placeholder="e.g. I am employed as a Senior Manager at TechCorp earning €60k/year and have sufficient savings."
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                Generating for: <b>{profile.fullName}</b>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold shadow-lg shadow-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <HeartHandshake size={20} />}
              Generate Letter
            </button>
          </InputCard>
        </div>

        {/* Result Section */}
        <div className="lg:col-span-2">
          {generatedLetter ? (
            <div className={`bg-white rounded-xl shadow-lg border h-full flex flex-col relative transition-colors ${isSaved ? 'border-slate-200' : 'border-amber-200 shadow-amber-50/50'}`}>
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
                  <button onClick={scrollToInput} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Edit Inputs">
                      <Edit3 size={20} />
                  </button>
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

               <div id="printable-content" className="p-8 md:p-12 flex-1 overflow-y-auto font-serif">
                  {/* Header for Print */}
                  <div className="mb-10 border-b border-slate-200 pb-4 hidden print:block">
                        <div className="flex justify-between items-end">
                            <h1 className="text-xl font-bold text-slate-900 uppercase">Sponsorship Letter</h1>
                            <div className="text-right text-sm text-slate-600">
                                Sponsor: {sponsorName}
                            </div>
                        </div>
                    </div>

                  <MarkdownRenderer content={generatedLetter} />

                  {/* Footer for Print */}
                  <div className="mt-12 pt-8 border-t border-slate-200 hidden print:block">
                      <p className="text-xs text-slate-400 text-center">Generated on {new Date().toLocaleDateString()} via SchengenVisaAI</p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 p-8 text-center no-print">
              <HeartHandshake size={48} className="mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-slate-500">No Letter Generated</h3>
              <p className="max-w-xs mt-2">Enter sponsor details to create a formal declaration of support.</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Sponsorship Letter"
        content={generatedLetter}
        metaInfo={`Sponsor: ${sponsorName}`}
      />
    </div>
  );
};

export default SponsorshipPage;
