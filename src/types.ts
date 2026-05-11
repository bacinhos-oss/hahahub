export type Page = 'landing' | 'discovery' | 'admin' | 'login' | 'subscription' | 'about' | 'privacy' | 'upload' | 'pricing' | 'faq';

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
  id: string; title: string; oƒΩriginalTitle?: string; englishTitle?: string;
  author: string; director: string; directorNotes?: string; originalProductionSolutions?: string;
  isDirectorMandatory: boolean; creativeTeamAvailability: 'Required' | 'Optional' | 'Not required';
  genre: string; subgenre?: string; language: string; maleRoles: number; femaleRoles: number;
  canMergeRoles: boolean; duration: number; hasIntermission: boolean;
  productionScale: 'Small' | 'Medium' | 'Large'; isTouringFriendly: boolean;
  technicalComplexity: 'Low' | 'Medium' | 'High'; costumeComplexity: 'Low' | 'Medium' | 'High';
  setComplexity: 'Low' | 'Medium' | 'High'; adaptationFlexibility: 'Low' | 'Medium' | 'High';
  scalabilityNotes: string; stageType: 'Black Box' | 'Main Stage' | 'Arena' | 'Open Air';
  techStaffLighting: number; techStaffSound: number; techStaffPrompter: number; techStaffStagehands: number; techStaffOther: string;
  performancesCount: number; totalAudience: number; premiereDate: string; locationsPlayed: string;
  boxOfficeIndicator: 'High' | 'Medium' | 'Emerging'; awards: string; audienceProfile: string; productionYear: number;
  producerName: string; producerEmail: string; rightsHolder: string;
  rightsStatus: 'Available' | 'Co-production Only' | 'Licensed';
  territoriesAvailable: string; licensedCountries: string;
  exclusivityLevel: 'Exclusive' | 'Semi-exclusive' | 'Non-exclusive';
  licenseType: 'Option' | 'License' | 'Co-production';
  territoryConflicts?: string; mediaConflicts?: string; premiereLocation: string; buyoutLocations: string;
  riskProfile: 'Proven hit' | 'Moderate risk' | 'Experimental';
  breakEvenThreshold: 'Low' | 'Medium' | 'High'; breakEvenPerformances: number;
  programmingCompatibility: string[]; translationsAvailable: string; translationRightsIncluded: boolean;
  isSponsorFriendly: boolean; isGroupSalesFriendly: boolean; rightsClearingSpeed: 'Fast' | 'Medium' | 'Slow';
  decisionMakerType: 'Single' | 'Committee'; exitScenarios: string; originatingProducerTrackRecord: string;
  transparencyScore: number; location: string; synopsis?: string; contactLink?: string;
  scriptExcerpt?: string; scriptScenario?: string;
  humorType: 'Language-based' | 'Local Politics' | 'Physical Comedy' | 'Universal';
  internationalSuccessNotes?: string; licensingModel: 'Royalty-based' | 'Flat fee' | 'Hybrid';
  royaltyRange?: string; advanceFee?: string; budgetRange: 'Low' | 'Medium' | 'High';
  likesCount: number; viewsCount: number; inquiriesCount: number; imageUrl: string; productionPhotos: string[];
  isFavorited?: boolean; userId?: string;
}
export interface User {
  id?: string; email?: string; name: string; role: string; avatar: string; isPaid: boolean; isAdmin?: boolean;
  subscription?: SubscriptionInfo; favorites: string[]; uploadedShowIds?: string[];
  totalViews?: number; totalInquiries?: number;
}
