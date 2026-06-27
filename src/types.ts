export type Page = 'landing' | 'discovery' | 'admin' | 'login' | 'subscription' | 'about' | 'privacy' | 'upload' | 'pricing' | 'faq' | 'producer' | 'wire';

export type InvitationDuration = '7 Days' | '1 Month' | '1 Year' | 'Lifetime';
export interface SubscriptionInfo {
  type: 'Free' | 'Quarterly' | 'Annual';
  expiryDate?: string;
  status: 'Active' | 'Expired' | 'Pending';
  discounts: string[];
}
export interface Invitation {
  id: string; recipient: string; email: string; duration: InvitationDuration;
  sentDate: string; status: 'live' | 'pending' | 'expired'; note?: string;
  generatedUsername: string; generatedPassword: string;
}
export interface Show {
  id: string;

  // 00. BASIC INFO
  title: string;
  englishTitle?: string;
  author: string;
  director: string;
  genre: string;
  subgenre?: string;
  language: string;
  synopsis?: string;
  humorType: 'Language-based' | 'Local Politics' | 'Physical Comedy' | 'Universal';
  internationalSuccessNotes?: string;
  awards?: string;
  audienceProfile?: string;

  // 01. PRODUCTION
  productionYear: number;
  duration: number;
  hasIntermission: boolean;
  maleRoles: number;
  femaleRoles: number;
  canMergeRoles: boolean;
  productionScale: 'Small' | 'Medium' | 'Large';
  isTouringFriendly: boolean;
  stageType: 'Black Box' | 'Main Stage' | 'Arena' | 'Open Air';
  techStaffLighting: number;
  techStaffSound: number;
  techStaffPrompter: number;
  techStaffStagehands: number;
  techStaffOther?: string;
  technicalComplexity: 'Low' | 'Medium' | 'High';
  costumeComplexity: 'Low' | 'Medium' | 'High';
  setComplexity: 'Low' | 'Medium' | 'High';
  adaptationFlexibility: 'Low' | 'Medium' | 'High';
  scalabilityNotes?: string;
  directorNotes?: string;
  originalProductionSolutions?: string;
  isDirectorMandatory: boolean;
  creativeTeamAvailability: 'Required' | 'Optional' | 'Not required';

  // 02. CREATIVE ASSETS
  musicAuthor?: string;
  hasOriginalMusic: boolean;
  videoAuthor?: string;
  hasVideoProjections: boolean;
  videoDescription?: string;
  translationsAvailable?: string;
  translationRightsIncluded: boolean;
  scriptExcerpt?: string;
  scriptScenario?: string;

  // 03. MARKET PERFORMANCE
  premiereDate?: string;
  premiereLocation?: string;
  performancesCount: number;
  totalAudience: number;
  locationsPlayed?: string;
  boxOfficeIndicator: 'High' | 'Medium' | 'Emerging';

  // 04. RIGHTS & IDENTITY
  producerName: string;
  producerEmail: string;
  rightsHolder: string;
  rightsStatus: 'Available' | 'Co-production Only' | 'Licensed';
  territoriesAvailable?: string;
  licensedCountries?: string;
  exclusivityLevel: 'Exclusive' | 'Semi-exclusive' | 'Non-exclusive';
  licenseType: 'Option' | 'License' | 'Co-production';
  location?: string;

  // 05. PACKAGES
  hasScriptPackage: boolean;
  scriptRoyaltyPct?: number;
  scriptAdvanceFee?: number;
  hasFullPunchPackage: boolean;
  fullPunchRoyaltyPct?: number;
  fullPunchAdvanceFee?: number;
  // Full Punch contents (The Know-How)
  fpTheScript?: boolean;       // always true if Full Punch
  fpThePlaybook?: boolean;     // Director's production notes
  fpTheSoundtrack?: boolean;   // Original music files
  fpTheVisuals?: boolean;      // Video projection files
  fpTheWardrobe?: boolean;     // Costume design docs
  fpTheSetBlueprint?: boolean; // Set design plans
  fpTheTechRider?: boolean;    // Technical rider
  fpThePromoKit?: boolean;     // Press photos + trailer
  fpTheHandoverSession?: boolean; // Live session with director
  fpPunchLanguage?: string;    // Language of documentation
  fpPunchSupport?: boolean;    // Creative team available for handover

  // Legacy fields (kept for compatibility)
  licensingModel?: 'Royalty-based' | 'Flat fee' | 'Hybrid';
  royaltyRange?: string;
  advanceFee?: string;
  budgetRange?: 'Low' | 'Medium' | 'High';
  riskProfile?: 'Proven hit' | 'Moderate risk' | 'Experimental';
  rightsClearingSpeed?: 'Fast' | 'Medium' | 'Slow';
  buyoutLocations?: string;
  contactLink?: string;
  isSponsorFriendly?: boolean;
  isGroupSalesFriendly?: boolean;
  decisionMakerType?: 'Single' | 'Committee';
  breakEvenThreshold?: 'Low' | 'Medium' | 'High';
  breakEvenPerformances?: number;
  programmingCompatibility?: string[];
  exitScenarios?: string;
  originatingProducerTrackRecord?: string;
  transparencyScore?: number;
  territoryConflicts?: string;
  mediaConflicts?: string;

  // MEDIA
  likesCount: number;
  viewsCount: number;
  inquiriesCount: number;
  imageUrl: string;
  productionPhotos: string[];
  isFavorited?: boolean;
  userId?: string;
}
export interface User {
  id?: string; email?: string; name: string; role: string; avatar: string; isPaid: boolean; isAdmin?: boolean; plan?: 'gigl' | 'laff' | 'roar';
  subscription?: SubscriptionInfo; favorites: string[]; uploadedShowIds?: string[];
  totalViews?: number; totalInquiries?: number;
}
