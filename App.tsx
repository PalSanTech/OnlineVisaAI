
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChatWidget from './components/ChatWidget';
import Dashboard from './pages/Dashboard';
import ItineraryPage from './pages/ItineraryPage';
import CoverLetterPage from './pages/CoverLetterPage';
import SponsorshipPage from './pages/SponsorshipPage';
import RequirementsPage from './pages/RequirementsPage';
import DocumentsPage from './pages/DocumentsPage';
import NocPage from './pages/NocPage';
import PhotoCheckPage from './pages/PhotoCheckPage';
import DownloadsPage from './pages/DownloadsPage';
import { AppSection, TripDetails, UserProfile } from './types';
import { DEFAULT_TRIP, DEFAULT_PROFILE } from './constants';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [trip, setTrip] = useState<TripDetails>(DEFAULT_TRIP);
  
  // Multi-profile State Management
  const [profiles, setProfiles] = useState<UserProfile[]>([DEFAULT_PROFILE]);
  const [activeProfileId, setActiveProfileId] = useState<string>(DEFAULT_PROFILE.id);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Centralized State for Generated Documents
  const [generatedItinerary, setGeneratedItinerary] = useState<string>('');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>('');
  const [generatedNoc, setGeneratedNoc] = useState<string>('');

  // Derived active profile
  const activeProfile = useMemo(() => 
    profiles.find(p => p.id === activeProfileId) || profiles[0], 
    [profiles, activeProfileId]
  );

  // Profile Handlers
  const updateProfile = (updatedProfile: UserProfile) => {
    setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  const addProfile = () => {
    const newProfile: UserProfile = {
        ...DEFAULT_PROFILE,
        id: `user-${Date.now()}`,
        fullName: 'New Applicant',
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const renderContent = () => {
    switch (currentSection) {
      case AppSection.DASHBOARD:
        return (
            <Dashboard 
                trip={trip} 
                profile={activeProfile} 
                setSection={setCurrentSection} 
                profiles={profiles}
                activeProfileId={activeProfileId}
                setActiveProfileId={setActiveProfileId}
                addProfile={addProfile}
            />
        );
      case AppSection.ITINERARY:
        return (
            <ItineraryPage 
                trip={trip} 
                setTrip={setTrip} 
                profile={activeProfile} 
                setProfile={(val) => {
                    if (typeof val === 'function') {
                        updateProfile(val(activeProfile));
                    } else {
                        updateProfile(val);
                    }
                }} 
                updateProfile={updateProfile}
                generatedItinerary={generatedItinerary}
                setGeneratedItinerary={setGeneratedItinerary}
            />
        );
      case AppSection.DOCUMENTS:
        return <DocumentsPage trip={trip} setTrip={setTrip} />;
      case AppSection.COVER_LETTER:
        return (
            <CoverLetterPage 
                trip={trip} 
                profile={activeProfile}
                generatedLetter={generatedCoverLetter}
                setGeneratedLetter={setGeneratedCoverLetter}
            />
        );
      case AppSection.NOC:
        return (
            <NocPage 
                trip={trip} 
                profile={activeProfile} 
                generatedNoc={generatedNoc}
                setGeneratedNoc={setGeneratedNoc}
            />
        );
      case AppSection.SPONSORSHIP:
        return (
            <SponsorshipPage 
                trip={trip} 
                profile={activeProfile} 
            />
        );
      case AppSection.PHOTO_CHECK:
        return <PhotoCheckPage />;
      case AppSection.REQUIREMENTS:
        return <RequirementsPage trip={trip} profile={activeProfile} />;
      case AppSection.DOWNLOADS:
        return (
            <DownloadsPage 
                profile={activeProfile}
                generatedItinerary={generatedItinerary}
                generatedCoverLetter={generatedCoverLetter}
                generatedNoc={generatedNoc}
                setSection={setCurrentSection}
            />
        );
      default:
        return (
            <Dashboard 
                trip={trip} 
                profile={activeProfile} 
                setSection={setCurrentSection} 
                profiles={profiles}
                activeProfileId={activeProfileId}
                setActiveProfileId={setActiveProfileId}
                addProfile={addProfile}
            />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        currentSection={currentSection} 
        setSection={setCurrentSection} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
           <div className="flex items-center gap-2">
             <span className="text-xl font-bold tracking-tight text-slate-900">SchengenAI</span>
           </div>
           <button onClick={() => setIsMobileOpen(true)} className="text-slate-600">
             <Menu size={24} />
           </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

export default App;
