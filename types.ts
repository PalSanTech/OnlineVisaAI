
export interface Companion {
  id: string;
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  citizenship: string;
  passportNumber: string;
  occupation: string;
}

export interface SupportingDocument {
  id: string;
  name: string;
  type: 'Flight' | 'Accommodation' | 'Financial' | 'Insurance' | 'Home Ties' | 'Other';
  file: File;
  date: string;
  size: number;
  status: 'draft' | 'verified';
}

export interface UserProfile {
  id: string;
  fullName: string;
  dateOfBirth: string;
  citizenship: string;
  passportNumber: string;
  occupation: string;
  residenceCity: string;
  bankName: string;
  companions: Companion[];
}

export interface BudgetBreakdown {
  flights: number;
  accommodation: number;
  dailyExpenses: number;
  other: number;
}

export interface TripDetails {
  mainDestination: string;
  otherCountries: string[];
  startDate: string;
  endDate: string;
  purpose: string;
  budget: number;
  budgetBreakdown: BudgetBreakdown;
  documents: SupportingDocument[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export enum AppSection {
  DASHBOARD = 'dashboard',
  ITINERARY = 'itinerary',
  COVER_LETTER = 'cover_letter',
  SPONSORSHIP = 'sponsorship',
  REQUIREMENTS = 'requirements',
  DOCUMENTS = 'documents',
  NOC = 'noc_generator',
  PHOTO_CHECK = 'photo_check',
  DOWNLOADS = 'downloads',
}

export interface GroundingSource {
  url: string;
  title: string;
}

export interface SearchResult {
  text: string;
  sources: GroundingSource[];
}
