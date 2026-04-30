
import React, { useState } from 'react';
import { SearchResult, UserProfile, TripDetails } from '../types';
import { checkVisaRequirements, getInsuranceOptions, getFlightRequirements, getBankStatementInfo, getVisaCenterInfo } from '../services/geminiService';
import { WORLD_COUNTRIES } from '../constants';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Search, Globe, ExternalLink, Loader2, ShieldCheck, Plane, AlertTriangle, Building2, MapPin } from 'lucide-react';

interface RequirementsPageProps {
  profile: UserProfile;
  trip: TripDetails;
}

const RequirementsPage: React.FC<RequirementsPageProps> = ({ profile, trip }) => {
  const [citizenship, setCitizenship] = useState(profile.citizenship);
  const [destination, setDestination] = useState(trip.mainDestination);
  const [residenceCity, setResidenceCity] = useState(profile.residenceCity || '');
  const [bankName, setBankName] = useState(profile.bankName || '');
  
  const [mainResult, setMainResult] = useState<SearchResult | null>(null);
  const [insuranceResult, setInsuranceResult] = useState<SearchResult | null>(null);
  const [flightResult, setFlightResult] = useState<SearchResult | null>(null);
  const [bankResult, setBankResult] = useState<SearchResult | null>(null);
  const [visaCenterResult, setVisaCenterResult] = useState<SearchResult | null>(null);

  const [loadingMain, setLoadingMain] = useState(false);
  const [loadingInsurance, setLoadingInsurance] = useState(false);
  const [loadingFlight, setLoadingFlight] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [loadingVisaCenter, setLoadingVisaCenter] = useState(false);

  const handleMainSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenship || !destination) return;
    
    setLoadingMain(true);
    const data = await checkVisaRequirements(citizenship, destination);
    setMainResult(data);
    setLoadingMain(false);
  };

  const handleInsuranceCheck = async () => {
    if (!citizenship || !destination) return;
    setLoadingInsurance(true);
    const data = await getInsuranceOptions(citizenship, destination);
    setInsuranceResult(data);
    setLoadingInsurance(false);
  };

  const handleFlightCheck = async () => {
    if (!destination) return;
    setLoadingFlight(true);
    const data = await getFlightRequirements(destination);
    setFlightResult(data);
    setLoadingFlight(false);
  };

  const handleBankCheck = async () => {
    if (!bankName) return;
    setLoadingBank(true);
    const data = await getBankStatementInfo(bankName, citizenship || 'your country');
    setBankResult(data);
    setLoadingBank(false);
  };

  const handleVisaCenterCheck = async () => {
    if (!residenceCity || !destination) return;
    setLoadingVisaCenter(true);
    const data = await getVisaCenterInfo(residenceCity, destination);
    setVisaCenterResult(data);
    setLoadingVisaCenter(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Visa Requirements Checker</h1>
        <p className="text-slate-500 mt-2">
          Powered by Google Search Grounding to provide the most up-to-date official information.
        </p>
      </div>

      {/* Main Search Form */}
      <form onSubmit={handleMainSearch} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1">Citizenship</label>
          <select
            value={citizenship}
            onChange={(e) => setCitizenship(e.target.value)}
            className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            required
          >
            <option value="" disabled>Select Country</option>
            {WORLD_COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Country</label>
           <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            required
          >
            <option value="" disabled>Select Country</option>
            {WORLD_COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loadingMain}
          className="w-full md:w-auto py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loadingMain ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          Check Rules
        </button>
      </form>

      {/* Main Results */}
      {mainResult && (
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
             <div className="flex items-center gap-2 text-emerald-700 mb-4 border-b border-slate-100 pb-4">
                <Globe size={20} />
                <span className="font-semibold text-lg">General Requirements</span>
             </div>
            <MarkdownRenderer content={mainResult.text} />
            
            {mainResult.sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Sources</h4>
                <div className="flex flex-wrap gap-3">
                  {mainResult.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 hover:underline text-xs bg-blue-50 px-2 py-1 rounded-md"
                    >
                      <ExternalLink size={10} />
                      <span className="truncate max-w-[200px]">{source.title || 'Link'}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Travel Essentials Section */}
      <div className="mt-8 mb-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="text-blue-600" />
          Travel Essentials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Insurance Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-slate-800">Medical Insurance</h3>
                    <p className="text-xs text-slate-500 mt-1">Find €30k+ coverage policies</p>
                </div>
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                    <ShieldCheck size={24} />
                </div>
            </div>
            
            <div className="flex-1">
               {!insuranceResult ? (
                  <div className="text-sm text-slate-600 mb-4">
                    <p>Schengen rules strictly require travel insurance. Use AI to find providers that cover visa rejection refunds.</p>
                  </div>
               ) : (
                  <div className="mb-4 h-64 overflow-y-auto pr-2 text-sm custom-scrollbar">
                     <MarkdownRenderer content={insuranceResult.text} />
                  </div>
               )}
            </div>

            <button
                onClick={handleInsuranceCheck}
                disabled={loadingInsurance || !citizenship}
                className="w-full mt-auto py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
                {loadingInsurance ? <Loader2 className="animate-spin" size={16} /> : "Find Recommendations"}
            </button>
          </div>

          {/* Flight Tickets Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-slate-800">Flight Tickets</h3>
                    <p className="text-xs text-slate-500 mt-1">Paid tickets vs Reservations</p>
                </div>
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Plane size={24} />
                </div>
            </div>

            <div className="flex-1">
               {!flightResult ? (
                  <div className="text-sm text-slate-600 mb-4">
                    <div className="flex items-start gap-2 mb-3 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                        <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-yellow-800">Buying non-refundable tickets before visa approval is risky. Check if the consulate accepts reservations.</p>
                    </div>
                    <p>Check specifically for {destination || 'your destination'}.</p>
                  </div>
               ) : (
                  <div className="mb-4 h-64 overflow-y-auto pr-2 text-sm custom-scrollbar">
                     <MarkdownRenderer content={flightResult.text} />
                  </div>
               )}
            </div>

            <button
                onClick={handleFlightCheck}
                disabled={loadingFlight || !destination}
                className="w-full mt-auto py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
                {loadingFlight ? <Loader2 className="animate-spin" size={16} /> : "Check Flight Rules"}
            </button>
          </div>

        </div>
      </div>

      {/* Logistics Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Building2 className="text-indigo-600" />
          Logistics & Banking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Bank Statements Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-slate-800">Bank Statements</h3>
                    <p className="text-xs text-slate-500 mt-1">Get download links for {bankName || 'your bank'}</p>
                </div>
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Building2 size={24} />
                </div>
            </div>
            
            <div className="flex-1 mb-4">
               <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Your Bank Name</label>
                  <input 
                    type="text" 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    placeholder="e.g. HDFC, HSBC"
                  />
               </div>
               {bankResult && (
                  <div className="h-48 overflow-y-auto pr-2 text-sm custom-scrollbar border-t border-slate-100 pt-3">
                     <MarkdownRenderer content={bankResult.text} />
                      {bankResult.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-50">
                        {bankResult.sources.slice(0, 2).map((source, idx) => (
                          <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-blue-600 hover:underline mb-1">
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
               )}
            </div>

            <button
                onClick={handleBankCheck}
                disabled={loadingBank || !bankName}
                className="w-full mt-auto py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
                {loadingBank ? <Loader2 className="animate-spin" size={16} /> : "Find Login / Statement Link"}
            </button>
          </div>

          {/* Visa Center Locator Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-slate-800">Visa Application Center</h3>
                    <p className="text-xs text-slate-500 mt-1">Find VFS/BLS/TLS near you</p>
                </div>
                <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                    <MapPin size={24} />
                </div>
            </div>
            
            <div className="flex-1 mb-4">
               <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Your Current City</label>
                  <input 
                    type="text" 
                    value={residenceCity}
                    onChange={(e) => setResidenceCity(e.target.value)}
                    className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none bg-white"
                    placeholder="e.g. New York"
                  />
               </div>
               {visaCenterResult && (
                  <div className="h-48 overflow-y-auto pr-2 text-sm custom-scrollbar border-t border-slate-100 pt-3">
                     <MarkdownRenderer content={visaCenterResult.text} />
                  </div>
               )}
            </div>

            <button
                onClick={handleVisaCenterCheck}
                disabled={loadingVisaCenter || !residenceCity}
                className="w-full mt-auto py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
                {loadingVisaCenter ? <Loader2 className="animate-spin" size={16} /> : "Locate Nearest Center"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RequirementsPage;
