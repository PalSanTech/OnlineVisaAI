import React, { useState } from 'react';
import { X, Printer, Download, Loader2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  profileName?: string;
  metaInfo?: string;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  profileName,
  metaInfo
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    const element = document.getElementById('preview-content');
    
    // Check if html2pdf is available (loaded from CDN in index.html)
    // @ts-ignore
    if (typeof window !== 'undefined' && window.html2pdf && element) {
        const opt = {
            margin: [10, 15, 10, 15], // top, left, bottom, right
            filename: `${title.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        try {
            // @ts-ignore
            await window.html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Could not generate PDF automatically. Opening print dialog instead.");
            window.print();
        }
    } else {
        // Fallback
        window.print();
    }
    setIsDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl h-[90vh] flex flex-col bg-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{title} - Preview</h3>
            <p className="text-xs text-slate-500">Review formatting before generating PDF</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:bg-blue-400"
            >
              {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isDownloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area (Grey Background) */}
        <div className="flex-1 overflow-y-auto bg-slate-200/50 p-8 flex justify-center custom-scrollbar">
          
          {/* A4 Simulation Container */}
          <div 
            id="preview-content"
            className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-xl p-[20mm] text-slate-900 mx-auto relative"
            style={{ width: '210mm', minHeight: '297mm' }} // Explicit A4 dimensions
          >
            {/* Document Header */}
            <div className="mb-10 border-b-2 border-slate-800 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide font-serif">{title}</h1>
                    <p className="text-sm text-slate-600 mt-1 font-serif">Schengen Visa Application</p>
                </div>
                <div className="text-right text-sm text-slate-600 font-serif">
                    {profileName && <p><span className="font-bold">Applicant:</span> {profileName}</p>}
                    {metaInfo && <p>{metaInfo}</p>}
                    <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Content */}
            <div className="prose prose-slate max-w-none font-serif text-justify leading-relaxed">
                <MarkdownRenderer content={content} />
            </div>

            {/* Document Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 font-sans">
                Generated via SchengenVisaAI • {new Date().toLocaleDateString()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;