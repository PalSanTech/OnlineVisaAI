
import React, { useState, useRef } from 'react';
import { TripDetails, SupportingDocument } from '../types';
import { validateDocumentQuality } from '../services/geminiService';
import { Upload, Trash2, Plane, Home, CreditCard, Shield, FileText, File as FileIcon, CheckCircle2, Anchor, ScanEye, Loader2, Clock, Info } from 'lucide-react';

interface DocumentsPageProps {
  trip: TripDetails;
  setTrip: React.Dispatch<React.SetStateAction<TripDetails>>;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ trip, setTrip }) => {
  const [selectedType, setSelectedType] = useState<SupportingDocument['type']>('Flight');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Dynamic guidelines based on document type
  const DOC_GUIDELINES: Record<string, { title: string; description: string; items: string[]; icon: any; colorClass: string }> = {
    'Flight': {
      title: 'Flight Itinerary',
      description: 'Proof of round-trip transport entering and leaving the Schengen Area.',
      items: ['Confirmed round-trip tickets', 'Internal train/bus tickets', 'Flight reservation (if allowed)'],
      icon: Plane,
      colorClass: 'text-sky-700 bg-sky-50 border-sky-100'
    },
    'Accommodation': {
      title: 'Proof of Accommodation',
      description: 'Evidence of where you will stay for every single night of your trip.',
      items: ['Hotel booking confirmations', 'Airbnb/Hostel receipts', 'Invitation letter from host'],
      icon: Home,
      colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-100'
    },
    'Financial': {
      title: 'Financial Subsistence',
      description: 'Proof that you have enough money to cover all expenses.',
      items: ['Bank statements (Last 3-6 months)', 'Payslips (Last 3 months)', 'Income Tax Returns (ITR)', 'Sponsorship Letter'],
      icon: CreditCard,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-100'
    },
    'Insurance': {
      title: 'Travel Medical Insurance',
      description: 'Mandatory insurance policy valid for the entire duration.',
      items: ['Min. coverage €30,000', 'Covers all Schengen states', 'Covers repatriation & emergencies'],
      icon: Shield,
      colorClass: 'text-rose-700 bg-rose-50 border-rose-100'
    },
    'Home Ties': {
      title: 'Strong Home Ties',
      description: 'Critical proof that you will return to your home country.',
      items: ['Employment contract / Leave letter', 'Property deeds', 'Marriage/Birth certificates', 'Business registration'],
      icon: Anchor,
      colorClass: 'text-amber-700 bg-amber-50 border-amber-100'
    },
    'Other': {
      title: 'Additional Documents',
      description: 'Any other supporting material for your specific case.',
      items: ['Cover Letter', 'Trip Itinerary', 'Civil status documents', 'Vaccination proof'],
      icon: FileText,
      colorClass: 'text-slate-700 bg-slate-50 border-slate-100'
    }
  };

  const currentGuideline = DOC_GUIDELINES[selectedType];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const newDoc: SupportingDocument = {
      id: Date.now().toString(),
      name: file.name,
      type: selectedType,
      file: file,
      date: new Date().toLocaleDateString(),
      size: file.size,
      status: 'draft'
    };

    setTrip(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));
  };

  const handleDelete = (id: string) => {
    setTrip(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }));
  };

  const handleAnalyze = async (doc: SupportingDocument) => {
     setAnalyzingId(doc.id);
     const result = await validateDocumentQuality(doc.file);
     
     // Update document status to verified after check
     setTrip(prev => ({
        ...prev,
        documents: prev.documents.map(d => d.id === doc.id ? { ...d, status: 'verified' } : d)
     }));

     alert(`Analysis for ${doc.name}:\n\n${result}`); 
     setAnalyzingId(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Flight': return <Plane className="text-sky-500" />;
      case 'Accommodation': return <Home className="text-indigo-500" />;
      case 'Financial': return <CreditCard className="text-emerald-500" />;
      case 'Insurance': return <Shield className="text-rose-500" />;
      case 'Home Ties': return <Anchor className="text-amber-500" />;
      default: return <FileText className="text-slate-500" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const docTypes: SupportingDocument['type'][] = ['Flight', 'Accommodation', 'Financial', 'Insurance', 'Home Ties', 'Other'];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Supporting Documents</h1>
        <p className="text-slate-500 mt-2">
          Upload and manage your visa application documents. Drafts are saved locally until you verify them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Add New Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
                <div className="flex flex-wrap gap-2">
                  {docTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                        selectedType === type 
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <Upload className={`mb-3 ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} size={32} />
                <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>
            </div>
          </div>
          
          {/* Dynamic Info Card */}
          {currentGuideline && (
            <div className={`border rounded-xl p-4 ${currentGuideline.colorClass}`}>
               <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <currentGuideline.icon size={16} /> {currentGuideline.title}
               </h4>
               <p className="text-xs leading-relaxed mb-3 opacity-90">
                  {currentGuideline.description}
               </p>
               <div className="text-xs font-medium mb-1 opacity-80">Recommended:</div>
               <ul className="list-disc list-inside text-xs opacity-90 space-y-1">
                  {currentGuideline.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
               </ul>
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <h3 className="font-semibold text-slate-800">Uploaded Files ({trip.documents.length})</h3>
            </div>
            
            <div className="p-4 flex-1">
               {trip.documents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                     <FileIcon size={48} className="mb-4 opacity-20" />
                     <p>No documents uploaded yet.</p>
                  </div>
               ) : (
                  <div className="space-y-3">
                     {trip.documents.map(doc => (
                        <div key={doc.id} className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group bg-white relative">
                           <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                              {getIconForType(doc.type)}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-slate-900 truncate">{doc.name}</h4>
                                {doc.status === 'verified' ? (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-medium">
                                        <CheckCircle2 size={10} /> Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium">
                                        <Clock size={10} /> Draft
                                    </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                 <span className="px-2 py-0.5 rounded-full bg-slate-100">{doc.type}</span>
                                 <span>{formatSize(doc.size)}</span>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-2">
                               <button
                                  onClick={() => handleAnalyze(doc)}
                                  disabled={analyzingId === doc.id}
                                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                    doc.status === 'verified' 
                                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' 
                                        : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                                  }`}
                                  title="Analyze Quality with AI"
                               >
                                  {analyzingId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <ScanEye size={14} />}
                                  {doc.status === 'verified' ? 'Re-check' : 'Check'}
                               </button>

                               <button 
                                  onClick={() => handleDelete(doc.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove file"
                               >
                                  <Trash2 size={18} />
                               </button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
