
import React, { useState, useEffect } from 'react';
import { TripDetails, UserProfile, Companion } from '../types';
import { SCHENGEN_COUNTRIES, WORLD_COUNTRIES, DAILY_BUDGET_GUIDELINES } from '../constants';
import InputCard from './InputCard';
import { Plus, Trash2, AlertCircle, Calculator, Settings2, X, PieChart } from 'lucide-react';

interface TripFormProps {
  trip: TripDetails;
  setTrip: React.Dispatch<React.SetStateAction<TripDetails>>;
  profile: UserProfile;
  updateProfile: (updated: UserProfile) => void;
}

const TripForm: React.FC<TripFormProps> = ({ 
  trip, 
  setTrip, 
  profile, 
  updateProfile
}) => {
  const [suggestedBudget, setSuggestedBudget] = useState<number | null>(null);
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null);
  
  // Validation States
  const [dobError, setDobError] = useState<string | null>(null);
  
  // Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const handleTripChange = (field: keyof TripDetails, value: any) => {
    setTrip(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    updateProfile({ ...profile, [field]: value });
    
    if (field === 'dateOfBirth') {
        validateApplicantAge(value);
    }
  };

  const validateApplicantAge = (dob: string) => {
      if (!dob) {
          setDobError(null);
          return;
      }
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      
      if (age < 18) {
          setDobError("Main applicant must be at least 18 years old.");
      } else {
          setDobError(null);
      }
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
     const options = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
     handleTripChange('otherCountries', options);
  };

  const addCompanion = () => {
    updateProfile({
      ...profile,
      companions: [
        ...(profile.companions || []), 
        { 
          id: Date.now().toString(),
          fullName: '', 
          relationship: '', 
          dateOfBirth: '', 
          citizenship: profile.citizenship || '', 
          passportNumber: '', 
          occupation: '' 
        }
      ]
    });
  };

  const removeCompanion = (index: number) => {
    updateProfile({
      ...profile,
      companions: (profile.companions || []).filter((_, i) => i !== index)
    });
  };

  const updateCompanion = (index: number, field: keyof Companion, value: string) => {
    updateProfile({
      ...profile,
      companions: (profile.companions || []).map((c, i) => i === index ? { ...c, [field]: value } : c)
    });
  };

  // Calculate suggested budget whenever relevant fields change
  useEffect(() => {
    if (trip.startDate && trip.endDate && trip.mainDestination) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end date

      if (diffDays > 0) {
        const dailyRate = DAILY_BUDGET_GUIDELINES[trip.mainDestination] || 65; // Default to 65 EUR if unknown
        const minTotal = dailyRate * diffDays;
        setSuggestedBudget(minTotal);

        if (trip.budget < minTotal && trip.budget > 0) {
          setBudgetWarning(`Recommended minimum for ${trip.mainDestination} is ~€${dailyRate}/day (Total: €${minTotal}).`);
        } else {
          setBudgetWarning(null);
        }
      }
    }
  }, [trip.startDate, trip.endDate, trip.mainDestination, trip.budget]);

  // Initialize DOB validation on load if populated
  useEffect(() => {
      if (profile.dateOfBirth) validateApplicantAge(profile.dateOfBirth);
  }, []);

  // Handle Budget Breakdown updates
  const updateBreakdown = (field: keyof typeof trip.budgetBreakdown, value: number) => {
      const newBreakdown = { ...trip.budgetBreakdown, [field]: value };
      const newTotal = Object.values(newBreakdown).reduce((a: number, b: number) => a + b, 0);
      
      setTrip(prev => ({
          ...prev,
          budget: newTotal,
          budgetBreakdown: newBreakdown
      }));
  };

  return (
    <div className="space-y-6 relative">
      
      <InputCard title="Traveler Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name (as on Passport)</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => handleProfileChange('fullName', e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
              className={`w-full rounded-lg border p-2.5 focus:ring-2 outline-none bg-white ${dobError ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
            />
            {dobError && (
                <p className="text-xs text-red-600 mt-1">{dobError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Citizenship</label>
            <select
              value={profile.citizenship}
              onChange={(e) => handleProfileChange('citizenship', e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="" disabled>Select Country</option>
              {WORLD_COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Passport Number</label>
             <input
              type="text"
              value={profile.passportNumber}
              onChange={(e) => handleProfileChange('passportNumber', e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="A1234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
             <input
              type="text"
              value={profile.occupation}
              onChange={(e) => handleProfileChange('occupation', e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="Software Engineer"
            />
          </div>
        </div>

        {/* Companions Section */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700">Travel Companions / Family Members</label>
            <button 
              onClick={addCompanion}
              className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
            >
              <Plus size={16} /> Add Person
            </button>
          </div>
          
          <div className="space-y-4">
            {profile.companions?.map((companion, index) => (
              <div key={companion.id || index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative animate-in fade-in slide-in-from-top-2">
                <button 
                   onClick={() => removeCompanion(index)} 
                   className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                   title="Remove"
                >
                   <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="col-span-1">
                        <label className="block text-xs text-slate-500 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={companion.fullName}
                            onChange={(e) => updateCompanion(index, 'fullName', e.target.value)}
                            className="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs text-slate-500 mb-1">Relationship</label>
                        <input
                            type="text"
                            value={companion.relationship}
                            onChange={(e) => updateCompanion(index, 'relationship', e.target.value)}
                            className="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                            placeholder="Spouse, Child, Friend"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs text-slate-500 mb-1">Date of Birth</label>
                        <input
                            type="date"
                            value={companion.dateOfBirth}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => updateCompanion(index, 'dateOfBirth', e.target.value)}
                            className="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs text-slate-500 mb-1">Citizenship</label>
                        <select
                          value={companion.citizenship}
                          onChange={(e) => updateCompanion(index, 'citizenship', e.target.value)}
                          className="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                        >
                          <option value="" disabled>Select</option>
                          {WORLD_COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs text-slate-500 mb-1">Passport No.</label>
                        <input
                            type="text"
                            value={companion.passportNumber}
                            onChange={(e) => updateCompanion(index, 'passportNumber', e.target.value)}
                            className="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs text-slate-500 mb-1">Occupation</label>
                        <input
                            type="text"
                            value={companion.occupation}
                            onChange={(e) => updateCompanion(index, 'occupation', e.target.value)}
                            className="w-full rounded-md border-slate-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                        />
                    </div>
                </div>
              </div>
            ))}
            {(!profile.companions || profile.companions.length === 0) && (
              <p className="text-sm text-slate-400 italic text-center py-2">No companions added.</p>
            )}
          </div>
        </div>
      </InputCard>

      <InputCard title="Location & Finance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Residence (City)</label>
                <input
                type="text"
                value={profile.residenceCity}
                onChange={(e) => handleProfileChange('residenceCity', e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                placeholder="e.g. Mumbai, London, New York"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Bank Name</label>
                <input
                type="text"
                value={profile.bankName}
                onChange={(e) => handleProfileChange('bankName', e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                placeholder="e.g. HDFC, Chase, HSBC"
                />
            </div>
        </div>
      </InputCard>

      <InputCard title="Trip Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Main Destination</label>
            <select
              value={trip.mainDestination}
              onChange={(e) => handleTripChange('mainDestination', e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {SCHENGEN_COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Travel</label>
             <div className="flex gap-2">
                <select 
                    className="w-1/3 rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                    onChange={(e) => {
                        if (e.target.value) handleTripChange('purpose', e.target.value);
                    }}
                    value={['Tourism', 'Business', 'Visiting Family', 'Study'].includes(trip.purpose) ? trip.purpose : ''}
                >
                    <option value="" disabled>Quick Select</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Business">Business</option>
                    <option value="Visiting Family">Visiting Family</option>
                    <option value="Study">Study</option>
                </select>
                <input
                  type="text"
                  value={trip.purpose}
                  onChange={(e) => handleTripChange('purpose', e.target.value)}
                  className="flex-1 rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder="Specific purpose..."
                />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={trip.startDate}
              onChange={(e) => handleTripChange('startDate', e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={trip.endDate}
              onChange={(e) => handleTripChange('endDate', e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
              <span>Estimated Budget (€)</span>
              {suggestedBudget !== null && (
                 <span className="text-xs text-emerald-600 font-normal flex items-center gap-1">
                    <Calculator size={12}/> Sug: €{suggestedBudget}+
                 </span>
              )}
            </label>
            <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={trip.budget}
                  readOnly
                  className={`w-full rounded-lg border bg-white p-2.5 focus:ring-2 outline-none ${
                      budgetWarning ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                <button 
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-2"
                    title="Refine Budget"
                >
                    <Settings2 size={18} />
                    <span className="hidden sm:inline text-sm font-medium">Refine</span>
                </button>
            </div>
            {budgetWarning && (
                <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-md">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{budgetWarning}</span>
                </div>
            )}
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Other Countries (Hold Ctrl/Cmd)</label>
             <select
              multiple
              value={trip.otherCountries}
              onChange={handleMultiSelect}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-24 bg-white"
            >
               {SCHENGEN_COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </InputCard>

      {/* Budget Refinement Modal */}
      {isBudgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 transition-all">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <PieChart size={20} className="text-blue-600" /> Refine Budget Breakdown
                      </h3>
                      <button onClick={() => setIsBudgetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <span className="text-sm text-blue-600 uppercase tracking-wide font-semibold">Total Budget</span>
                          <div className="text-3xl font-bold text-blue-900 mt-1">€{trip.budget}</div>
                      </div>

                      <div className="space-y-3">
                          <div>
                              <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                                  <span>Flights (Return)</span>
                                  <span className="text-slate-500">€{trip.budgetBreakdown?.flights || 0}</span>
                              </label>
                              <input 
                                  type="range" 
                                  min="0" max={trip.budget + 1000} step="50"
                                  value={trip.budgetBreakdown?.flights || 0}
                                  onChange={(e) => updateBreakdown('flights', parseInt(e.target.value))}
                                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <input 
                                  type="number"
                                  value={trip.budgetBreakdown?.flights || 0}
                                  onChange={(e) => updateBreakdown('flights', parseInt(e.target.value) || 0)}
                                  className="w-full mt-1 p-2 border rounded-lg text-sm bg-white"
                              />
                          </div>

                          <div>
                              <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                                  <span>Accommodation (Total)</span>
                                  <span className="text-slate-500">€{trip.budgetBreakdown?.accommodation || 0}</span>
                              </label>
                              <input 
                                  type="range" 
                                  min="0" max={trip.budget + 1000} step="50"
                                  value={trip.budgetBreakdown?.accommodation || 0}
                                  onChange={(e) => updateBreakdown('accommodation', parseInt(e.target.value))}
                                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <input 
                                  type="number"
                                  value={trip.budgetBreakdown?.accommodation || 0}
                                  onChange={(e) => updateBreakdown('accommodation', parseInt(e.target.value) || 0)}
                                  className="w-full mt-1 p-2 border rounded-lg text-sm bg-white"
                              />
                          </div>

                          <div>
                              <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                                  <span>Daily Expenses (Food, Transport)</span>
                                  <span className="text-slate-500">€{trip.budgetBreakdown?.dailyExpenses || 0}</span>
                              </label>
                              <input 
                                  type="range" 
                                  min="0" max={trip.budget + 1000} step="50"
                                  value={trip.budgetBreakdown?.dailyExpenses || 0}
                                  onChange={(e) => updateBreakdown('dailyExpenses', parseInt(e.target.value))}
                                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <input 
                                  type="number"
                                  value={trip.budgetBreakdown?.dailyExpenses || 0}
                                  onChange={(e) => updateBreakdown('dailyExpenses', parseInt(e.target.value) || 0)}
                                  className="w-full mt-1 p-2 border rounded-lg text-sm bg-white"
                              />
                          </div>
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
                      <button 
                          onClick={() => setIsBudgetModalOpen(false)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
                      >
                          Done
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TripForm;
