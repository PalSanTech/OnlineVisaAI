
import React, { useState } from 'react';
import { AppSection, UserProfile } from '../types';
import { Download, Map, FileText, Stamp, ExternalLink, Printer } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

interface DownloadsPageProps {
  profile: UserProfile;
  generatedItinerary: string;
  generatedCoverLetter: string;
  generatedNoc: string;
  setSection: (section: AppSection) => void;
}

const DownloadsPage: React.FC<DownloadsPageProps> = ({ 
    profile,
    generatedItinerary, 
    generatedCoverLetter, 
    generatedNoc,
    setSection 
}) => {
  const [previewDoc, setPreviewDoc] = useState<{title: string, content: string, metaInfo?: string} | null>(null);

  const downloadFile = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  const openPreview = (title: string, content: string, metaInfo?: string) => {
      setPreviewDoc({ title, content, metaInfo });
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Downloads</h1>
        <p className="text-slate-500 mt-2">
          Access and download all your AI-generated application documents in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Itinerary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-blue-50/50 flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Map className="text-blue-600" size={20} />
                        Travel Itinerary
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Detailed day-by-day plan</p>
                </div>
                {generatedItinerary && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">Ready</span>}
            </div>
            <div className="flex-1 p-6 bg-slate-50 min-h-[200px] relative group">
                 {generatedItinerary ? (
                    <div className="h-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50"></div>
                        <div className="text-[10px] text-slate-400">
                            <MarkdownRenderer content={generatedItinerary.substring(0, 300) + '...'} />
                        </div>
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                        <p className="text-sm mb-4">Not generated yet.</p>
                        <button onClick={() => setSection(AppSection.ITINERARY)} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                            Go to Creator <ExternalLink size={12} />
                        </button>
                    </div>
                 )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
                <button 
                    onClick={() => downloadFile(generatedItinerary, 'Schengen_Itinerary.md')}
                    disabled={!generatedItinerary}
                    className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-blue-300 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <Download size={16} className={generatedItinerary ? "text-blue-600" : "text-slate-300"} /> .md
                </button>
                <button 
                    onClick={() => openPreview('Travel Itinerary', generatedItinerary, `Passport: ${profile.passportNumber}`)}
                    disabled={!generatedItinerary}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <Printer size={16} /> Print / PDF
                </button>
            </div>
        </div>

        {/* Cover Letter Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-indigo-50/50 flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <FileText className="text-indigo-600" size={20} />
                        Cover Letter
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Formal request to consulate</p>
                </div>
                {generatedCoverLetter && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">Ready</span>}
            </div>
            <div className="flex-1 p-6 bg-slate-50 min-h-[200px] relative group">
                 {generatedCoverLetter ? (
                    <div className="h-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50"></div>
                        <div className="text-[10px] text-slate-400">
                            <MarkdownRenderer content={generatedCoverLetter.substring(0, 300) + '...'} />
                        </div>
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                        <p className="text-sm mb-4">Not generated yet.</p>
                        <button onClick={() => setSection(AppSection.COVER_LETTER)} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                            Go to Creator <ExternalLink size={12} />
                        </button>
                    </div>
                 )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
                <button 
                    onClick={() => downloadFile(generatedCoverLetter, 'Cover_Letter.md')}
                    disabled={!generatedCoverLetter}
                    className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-blue-300 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <Download size={16} className={generatedCoverLetter ? "text-indigo-600" : "text-slate-300"} /> .md
                </button>
                <button 
                    onClick={() => openPreview('Visa Application Cover Letter', generatedCoverLetter, `Passport: ${profile.passportNumber}`)}
                    disabled={!generatedCoverLetter}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <Printer size={16} /> Print / PDF
                </button>
            </div>
        </div>

        {/* NOC Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Stamp className="text-amber-600" size={20} />
                        NOC Letter
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Employer/School certificate</p>
                </div>
                {generatedNoc && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">Ready</span>}
            </div>
            <div className="flex-1 p-6 bg-slate-50 min-h-[200px] relative group">
                 {generatedNoc ? (
                    <div className="h-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50"></div>
                        <div className="text-[10px] text-slate-400">
                            <MarkdownRenderer content={generatedNoc.substring(0, 300) + '...'} />
                        </div>
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                        <p className="text-sm mb-4">Not generated yet.</p>
                        <button onClick={() => setSection(AppSection.NOC)} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                            Go to Creator <ExternalLink size={12} />
                        </button>
                    </div>
                 )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
                <button 
                    onClick={() => downloadFile(generatedNoc, 'NOC.md')}
                    disabled={!generatedNoc}
                    className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-blue-300 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <Download size={16} className={generatedNoc ? "text-amber-600" : "text-slate-300"} /> .md
                </button>
                <button 
                    onClick={() => openPreview('No Objection Certificate', generatedNoc)}
                    disabled={!generatedNoc}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <Printer size={16} /> Print / PDF
                </button>
            </div>
        </div>

      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal 
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || ''}
        content={previewDoc?.content || ''}
        profileName={profile.fullName}
        metaInfo={previewDoc?.metaInfo}
      />
    </div>
  );
};

export default DownloadsPage;
