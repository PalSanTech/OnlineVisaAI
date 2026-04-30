import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Basic processing to make the output look decent without a heavy markdown library
  // For a production app, react-markdown is recommended.
  
  const formattedContent = content.split('\n').map((line, idx) => {
    if (line.startsWith('### ')) {
      return <h3 key={idx} className="text-lg font-bold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-3 border-b pb-2">{line.replace('## ', '')}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={idx} className="text-2xl font-bold text-blue-700 mt-6 mb-4">{line.replace('# ', '')}</h1>;
    }
    if (line.startsWith('- ')) {
      return <li key={idx} className="ml-4 list-disc text-slate-700 mb-1">{line.replace('- ', '')}</li>;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-bold text-slate-800 mb-2">{line.replace(/\*\*/g, '')}</p>
    }
    if (line.trim() === '') {
      return <br key={idx} />;
    }
    return <p key={idx} className="text-slate-700 mb-2 leading-relaxed">{line}</p>;
  });

  return (
    <div className="prose prose-slate max-w-none">
      {formattedContent}
    </div>
  );
};

export default MarkdownRenderer;