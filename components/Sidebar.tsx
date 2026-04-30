
import React from 'react';
import { AppSection } from '../types';
import { 
  LayoutDashboard, 
  Map, 
  FileText, 
  Search, 
  FolderOpen,
  X,
  Stamp,
  Camera,
  Download,
  HeartHandshake
} from 'lucide-react';

interface SidebarProps {
  currentSection: AppSection;
  setSection: (section: AppSection) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentSection, setSection, isMobileOpen, setIsMobileOpen }) => {
  const navItems = [
    { id: AppSection.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppSection.ITINERARY, label: 'Itinerary Creator', icon: Map },
    { id: AppSection.DOCUMENTS, label: 'My Documents', icon: FolderOpen },
    { id: AppSection.COVER_LETTER, label: 'Cover Letter', icon: FileText },
    { id: AppSection.NOC, label: 'NOC Generator', icon: Stamp },
    { id: AppSection.SPONSORSHIP, label: 'Sponsorship Letter', icon: HeartHandshake },
    { id: AppSection.PHOTO_CHECK, label: 'Photo Checker', icon: Camera },
    { id: AppSection.REQUIREMENTS, label: 'Visa Requirements', icon: Search },
    { id: AppSection.DOWNLOADS, label: 'Downloads', icon: Download },
  ];

  const baseClasses = "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 text-slate-600 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto shadow-xl md:shadow-none";
  const mobileClasses = isMobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${baseClasses} ${mobileClasses} flex flex-col`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <span className="block text-lg font-bold text-slate-900 leading-none">SchengenAI</span>
              <span className="text-xs text-slate-500 font-medium">Visa Assistant</span>
            </div>
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setIsMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSection(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Powered by</p>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Gemini 3 Pro
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
