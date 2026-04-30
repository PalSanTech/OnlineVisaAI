
import React, { useState, useEffect } from 'react';
import { TripDetails, UserProfile, AppSection } from '../types';
import TripForm from '../components/TripForm';
import { generateItinerary } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import { Wand2, Loader2, Download, Printer, Save, Edit3, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface ItineraryPageProps {
  trip: TripDetails;
  setTrip: React.Dispatch<React.SetStateAction<TripDetails>>;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  generatedItinerary: string;
  setGeneratedItinerary: (val: string) => void;
  updateProfile?: (updated: UserProfile) => void;
}

const ItineraryPage: React.FC<ItineraryPageProps> = ({ 
    trip, setTrip, profile, setProfile, generatedItinerary, setGeneratedItinerary,
    updateProfile
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load from local storage on mount if empty
  useEffect(() => {
    if (!generatedItinerary) {
      const saved = localStorage.getItem(`draft_itinerary_${profile.id}`);
      if (saved) {
          setGeneratedItinerary(saved);
          setIsSaved(true); // Loaded from storage, so it's saved
      }
    }
  }, [profile.id, generatedItinerary, setGeneratedItinerary]);

  const handleGenerate = async () => {
    if (!profile.citizenship || !trip.startDate) {
        alert("Please fill in at least the Citizenship and Start Date fields.");
        return;
    }
    setIsGenerating(true);
    const result = await generateItinerary(trip, profile);
    setGeneratedItinerary(result);
    // New content is considered a draft until explicitly saved
    setIsSaved(false); 
    setIsGenerating(false);
  };

  const handleSaveDraft = () => {
    if (generatedItinerary) {
      localStorage.setItem(`draft_itinerary_${profile.id}`, generatedItinerary);
      setIsSaved(true);
      alert("Draft saved locally!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToForm = () => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 no-print">
        <h1 className="text-3xl font-bold text-slate-900">Smart Itinerary Creator</h1>
        <p className="text-slate-500 mt-2">
          Use Gemini's advanced thinking mode to generate a logical, visa-ready itinerary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 no-print">
          <TripForm 
            trip={trip} 
            setTrip={setTrip} 
            profile={profile} 
            updateProfile={updateProfile || setProfile}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Thinking...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate Itinerary
              </>
            )}
          </button>
          {isGenerating && (
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm border border-blue-100 animate-in fade-in">
                  <p className="font-semibold mb-1">Thinking Budget: 32k tokens</p>
                  Gemini is calculating travel times, checking logical flows, and building a robust plan. This may take up to 30 seconds.
              </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {generatedItinerary ? (
            <div className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-full min-h-[600px] transition-colors ${isSaved ? 'border-slate-200' : 'border-amber-200 shadow-amber-50'}`}>
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-2 justify-between items-center no-print">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-800">Generated Itinerary</h3>
                    {!isSaved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium animate-pulse">
                            <AlertCircle size={12} /> Unsaved Draft
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                            <CheckCircle2 size={12} /> Saved
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    <button onClick={scrollToForm} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Inputs">
                        <Edit3 size={18} />
                    </button>
                    <button onClick={handleSaveDraft} className={`p-2 rounded-lg transition-colors ${!isSaved ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`} title="Save Draft">
                        <Save size={18} />
                    </button>
                    <button onClick={() => setIsPreviewOpen(true)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Full Preview">
                        <Eye size={18} />
                    </button>
                    <button onClick={handlePrint} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Print / Save as PDF">
                        <Printer size={18} />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Copy to Clipboard">
                        <Download size={18} onClick={() => navigator.clipboard.writeText(generatedItinerary)} />
                    </button>
                </div>
              </div>
              
              {/* Printable Area */}
              <div id="printable-content" className="p-8 overflow-y-auto flex-1 bg-white">
                {/* Doc Header */}
                <div className="mb-8 border-b-2 border-slate-800 pb-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Travel Itinerary</h1>
                        <p className="text-sm text-slate-600 mt-1">Schengen Visa Application</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                        <p><span className="font-semibold">Applicant:</span> {profile.fullName}</p>
                        <p><span className="font-semibold">Passport:</span> {profile.passportNumber}</p>
                        <p><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <MarkdownRenderer content={generatedItinerary} />
                
                {/* Doc Footer */}
                <div className="mt-12 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                    Generated via SchengenVisaAI • {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8 text-center no-print">
              <Wand2 size={48} className="mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-slate-500">Ready to Generate</h3>
              <p className="max-w-xs mt-2">Fill in the details on the left and click generate to create your document.</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Travel Itinerary"
        content={generatedItinerary}
        profileName={profile.fullName}
        metaInfo={`Passport: ${profile.passportNumber}`}
      />
    </div>
  );
};

export default ItineraryPage;
