
import React, { useState, useEffect } from 'react';
import { TripDetails, UserProfile } from '../types';
import { generateNoc } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import InputCard from '../components/InputCard';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import { Stamp, Loader2, Download, Building2, GraduationCap, Printer, Save, Edit3, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface NocPageProps {
  trip: TripDetails;
  profile: UserProfile;
  generatedNoc: string;
  setGeneratedNoc: (val: string) => void;
}

const NocPage: React.FC<NocPageProps> = ({ trip, profile, generatedNoc, setGeneratedNoc }) => {
  const [nocType, setNocType] = useState<'Employee' | 'Student'>('Employee');
  const [organization, setOrganization] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!generatedNoc) {
      const saved = localStorage.getItem(`draft_noc_${profile.id}`);
      if (saved) {
          setGeneratedNoc(saved);
          setIsSaved(true);
      }
    }
  }, [profile.id, generatedNoc, setGeneratedNoc]);

  const handleGenerate = async () => {
    if (!profile.fullName || !organization || !signerName || !signerRole) {
        alert("Please fill in all fields.");
        return;
    }
    setIsGenerating(true);
    const result = await generateNoc(trip, profile, organization, signerName, signerRole, nocType);
    setGeneratedNoc(result);
    setIsSaved(false); // New draft
    setIsGenerating(false);
  };

  const handleSaveDraft = () => {
    if (generatedNoc) {
      localStorage.setItem(`draft_noc_${profile.id}`, generatedNoc);
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
        <h1 className="text-3xl font-bold text-slate-900">NOC Generator</h1>
        <p className="text-slate-500 mt-2">
          Generate a professional No Objection Certificate from your employer or school.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6 no-print">
          <InputCard title="Certificate Details">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Applicant Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNocType('Employee')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
                      nocType === 'Employee' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Building2 size={16} /> Employee
                  </button>
                  <button
                    onClick={() => setNocType('Student')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
                      nocType === 'Student' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <GraduationCap size={16} /> Student
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {nocType === 'Employee' ? 'Company Name' : 'School/College Name'}
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder={nocType === 'Employee' ? "Acme Corp" : "University of Technology"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Signatory Name</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Signatory Role</label>
                <input
                  type="text"
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value)}
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder={nocType === 'Employee' ? "HR Manager" : "Principal / Dean"}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold shadow-lg shadow-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Stamp size={20} />}
              Generate NOC
            </button>
          </InputCard>
        </div>

        {/* Result Section */}
        <div className="lg:col-span-2">
          {generatedNoc ? (
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
                      onClick={() => navigator.clipboard.writeText(generatedNoc)}
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
                            <h1 className="text-xl font-bold text-slate-900 uppercase">No Objection Certificate</h1>
                            <div className="text-right text-sm text-slate-600">
                                {organization}
                            </div>
                        </div>
                    </div>

                  <MarkdownRenderer content={generatedNoc} />
                  
                  {/* Footer for Print */}
                  <div className="mt-12 pt-8 border-t border-slate-200 hidden print:block">
                      <p className="text-xs text-slate-400 text-center">Generated on {new Date().toLocaleDateString()} via SchengenVisaAI</p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 p-8 text-center no-print">
              <Stamp size={48} className="mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-slate-500">No Document Generated</h3>
              <p className="max-w-xs mt-2">Enter your organization details and click generate to create a compliant No Objection Certificate.</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="No Objection Certificate"
        content={generatedNoc}
        metaInfo={organization}
      />
    </div>
  );
};

export default NocPage;
