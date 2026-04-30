
import React, { useState } from 'react';
import { TripDetails, UserProfile, AppSection, SearchResult } from '../types';
import { predictVisaProbability, generateVirtualTravelImage } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { 
  Calendar, 
  Briefcase, 
  MapPin, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Loader2,
  Plane,
  Camera,
  User,
  UserPlus,
  Users
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  trip: TripDetails;
  profile: UserProfile;
  setSection: (section: AppSection) => void;
  profiles: UserProfile[];
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  addProfile: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  trip, 
  profile, 
  setSection,
  profiles,
  activeProfileId,
  setActiveProfileId,
  addProfile
}) => {
  const [probabilityResult, setProbabilityResult] = useState<SearchResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Virtual Travel State
  const [showVirtualTravel, setShowVirtualTravel] = useState(false);
  const [virtualImage, setVirtualImage] = useState<string>('');
  const [isDreaming, setIsDreaming] = useState(false);

  const isTripConfigured = trip.startDate && trip.endDate && trip.mainDestination;
  const isProfileConfigured = profile.fullName && profile.citizenship;

  const steps = [
    { title: "Trip Details", done: isTripConfigured, action: () => setSection(AppSection.ITINERARY) },
    { title: "Documents Uploaded", done: trip.documents.length > 0, action: () => setSection(AppSection.DOCUMENTS) },
    { title: "Cover Letter", done: false, action: () => setSection(AppSection.COVER_LETTER) },
    { title: "Photo Check", done: false, action: () => setSection(AppSection.PHOTO_CHECK) }
  ];

  const budgetData = [
    { name: 'Accommodation', value: trip.budget * 0.4 },
    { name: 'Flights', value: trip.budget * 0.3 },
    { name: 'Daily Expenses', value: trip.budget * 0.2 },
    { name: 'Buffer', value: trip.budget * 0.1 },
  ];
  const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b'];

  const handlePredictProbability = async () => {
    if (!isTripConfigured || !isProfileConfigured) return;
    setIsCalculating(true);
    const result = await predictVisaProbability(trip, profile);
    setProbabilityResult(result);
    setIsCalculating(false);
    
    // If calculated, check if we should suggest virtual travel (e.g. if mentioned risk)
    // For now, always enable the button after calculation for fun.
    setShowVirtualTravel(true);
  };

  const handleVirtualTravelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setIsDreaming(true);
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const resultImage = await generateVirtualTravelImage(base64, trip.mainDestination);
            setVirtualImage(resultImage);
            setIsDreaming(false);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* Global Profile Switcher */}
      <div className="bg-white rounded-xl p-4 mb-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
               <User size={20} />
            </div>
            <div>
               <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Applicant Profile</h2>
               <p className="text-sm text-slate-500">Managing application for: <span className="font-semibold text-blue-600">{profile.fullName || 'Unnamed Applicant'}</span></p>
            </div>
         </div>
         
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[240px]">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                   value={activeProfileId}
                   onChange={(e) => setActiveProfileId(e.target.value)}
                   className="w-full rounded-lg border-slate-200 border bg-slate-50 py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                   {profiles.map((p, idx) => (
                      <option key={p.id} value={p.id}>{p.fullName || `Applicant ${idx + 1}`}</option>
                   ))}
                </select>
            </div>
            <button 
               onClick={addProfile}
               className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm shadow-blue-200"
               title="Add New Profile"
            >
               <UserPlus size={20} />
            </button>
         </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {profile.fullName || 'Traveler'}!</h1>
        <p className="text-slate-500 mt-1">Track your Schengen visa application progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg col-span-1 md:col-span-2 relative overflow-hidden">
           <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-blue-100 font-medium mb-1">Current Application</p>
                <h2 className="text-3xl font-bold">{trip.mainDestination || 'Select Destination'}</h2>
                <div className="flex items-center gap-4 mt-4 text-sm text-blue-100">
                    <div className="flex items-center gap-1"><Calendar size={16}/> {trip.startDate || '--'}</div>
                    <div className="flex items-center gap-1"><Briefcase size={16}/> {trip.purpose || '--'}</div>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <MapPin size={32} className="text-blue-100" />
              </div>
           </div>
        </div>

        {/* Probability / Status Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-2">Success Probability</h3>
            
            {!probabilityResult ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="mb-3 p-3 bg-slate-50 rounded-full">
                        <TrendingUp size={24} className="text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Analyze based on historical data & documents.</p>
                    <button 
                        onClick={handlePredictProbability}
                        disabled={!isTripConfigured || isCalculating}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isCalculating ? <Loader2 className="animate-spin" size={16} /> : "Analyze Now"}
                    </button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 text-sm">
                     <MarkdownRenderer content={probabilityResult.text} />
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checklist */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Application Steps</h3>
            <div className="space-y-3">
                {steps.map((step, idx) => (
                    <div key={idx} onClick={step.action} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3">
                            {step.done ? <CheckCircle2 className="text-emerald-500" size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
                            <span className={step.done ? 'text-slate-700 line-through' : 'text-slate-700'}>{step.title}</span>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                    </div>
                ))}
            </div>
        </div>

        {/* Budget Estimation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-800 mb-4">Estimated Budget Breakdown</h3>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={budgetData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {budgetData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `€${value.toFixed(0)}`}/>
                    </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-4 text-xs text-slate-500">
                {budgetData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                        {item.name}
                    </div>
                ))}
             </div>
        </div>
      </div>
      
      {!isTripConfigured && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
              <div>
                  <h4 className="font-semibold text-yellow-800">Setup Required</h4>
                  <p className="text-sm text-yellow-700">Go to the <b>Itinerary Creator</b> tab to fill in your trip details and unlock the full power of the AI.</p>
              </div>
          </div>
      )}

      {/* Virtual Travel / Consolation Feature */}
      {showVirtualTravel && (
        <div className="mt-8 animate-in slide-in-from-bottom-6 fade-in duration-700">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-purple-100">
                            <Plane size={20} />
                            <span className="font-medium uppercase tracking-wider text-sm">Virtual Travel</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-4">Worried about rejection?</h3>
                        <p className="text-purple-50 mb-6 text-lg leading-relaxed">
                            Don't let visa stress get you down. Upload your photo and let our AI instantly transport you to {trip.mainDestination || 'Europe'} right now!
                        </p>
                        
                        <label className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 hover:bg-purple-50 rounded-xl font-bold shadow-lg cursor-pointer transition-all transform hover:scale-105 active:scale-95">
                            {isDreaming ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                            <span>{isDreaming ? 'Teleporting...' : 'Take a Virtual Trip'}</span>
                            <input type="file" accept="image/*" onChange={handleVirtualTravelUpload} className="hidden" />
                        </label>
                    </div>
                    
                    <div className="flex justify-center md:justify-end">
                        {virtualImage ? (
                            <div className="relative group rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
                                <img src={virtualImage} alt="Virtual Travel" className="max-h-64 w-auto object-cover" />
                                <a href={virtualImage} download="virtual_trip.png" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity">
                                    Download Souvenir
                                </a>
                            </div>
                        ) : (
                            <div className="w-64 h-48 bg-white/10 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center text-purple-100">
                                <Camera size={48} className="mb-2 opacity-50" />
                                <span className="text-sm">Your photo here</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
