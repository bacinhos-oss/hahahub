import React, { useState, useRef } from 'react';
import Navigation from '../components/Navigation';
import { Page, User, Show } from '../types';
import { supabase } from '../lib/supabase';

interface UploadPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onUpload: (show: Show) => void;
}

const inp = "w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold outline-none focus:border-brand-cyan";
const sel = "w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xs uppercase italic outline-none focus:border-brand-cyan";
const lbl = "block text-[10px] font-black uppercase text-gray-500 mb-2 italic";

const compressImage = (file: File, maxWidth: number, quality: number): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.src = url;
  });
};

const UploadPage: React.FC<UploadPageProps> = ({ onNavigate, onLogout, user, onUpload, userShowCount = 0 }) => {
  const plan = (user as any)?.plan || 'gigl';
  const uploadLimit = user?.isAdmin ? 9999 : plan === 'roar' ? 9999 : plan === 'laff' ? 10 : 1;
  const isAtLimit = userShowCount >= uploadLimit;
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoRef0 = useRef<HTMLInputElement>(null);
  const photoRef1 = useRef<HTMLInputElement>(null);
  const photoRef2 = useRef<HTMLInputElement>(null);
  const photoRefs = [photoRef0, photoRef1, photoRef2];
  const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null, null, null]);
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null]);

  const [formData, setFormData] = useState({
    // CORE
    title: '', author: '', director: '',
    producerName: user?.name || '', producerEmail: user?.email || '', rightsHolder: '',
    // CREATIVE
    genre: 'Comedy', subgenre: '', language: '',
    originalLanguage: '', translationsAvailable: '', scriptInEnglish: 'false',
    location: '', humorType: 'Universal',
    // PRODUCTION
    maleRoles: '1', femaleRoles: '1', duration: '90',
    hasIntermission: 'false', productionScale: 'Medium',
    isTouringFriendly: 'true', stageType: 'Main Stage',
    technicalComplexity: 'Medium', costumeComplexity: 'Medium',
    setComplexity: 'Medium', adaptationFlexibility: 'Medium',
    creativeTeamAvailability: 'Optional', budgetRange: 'Medium',
    techStaffLighting: '1', techStaffSound: '1', techStaffStagehands: '1',
    // HISTORY
    premiereDate: '', premiereLocation: '',
    productionYear: new Date().getFullYear().toString(),
    performancesCount: '0', totalAudience: '0',
    locationsPlayed: '', awards: '', audienceProfile: '',
    boxOfficeIndicator: 'Emerging', internationalSuccessNotes: '',
    // RIGHTS
    rightsStatus: 'Available', territoriesAvailable: 'Global',
    licensedCountries: '', licenseType: 'License', licensingModel: 'Royalty-based',
    exclusivityLevel: 'Exclusive', royaltyRange: '8-10%', advanceFee: '',
    // PACKAGES
    hasScriptPackage: true, scriptRoyaltyPct: '10', scriptAdvanceFee: '',
    hasFullPunchPackage: false, fullPunchRoyaltyPct: '15', fullPunchAdvanceFee: '', fullPunchIncludes: '',
    rightsClearingSpeed: 'Medium', riskProfile: 'Proven hit',
    breakEvenThreshold: 'Medium', breakEvenPerformances: '40',
    isSponsorFriendly: 'true', isGroupSalesFriendly: 'true',
    translationRightsIncluded: 'true',
    // CONTENT
    synopsis: '', synopsisEn: '', directorNotes: '', scriptScenario: '', trailerUrl: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...photoFiles]; newFiles[index] = file; setPhotoFiles(newFiles);
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...photoPreviews]; newPreviews[index] = reader.result as string; setPhotoPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = async () => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Production Title');
    if (!formData.rightsHolder.trim()) errors.push('Copyright Holder');
    if (!formData.location.trim()) errors.push('Origin Market');
    if (!formData.synopsisEn.trim()) errors.push('Synopsis in English');
    if (!imagePreview) errors.push('Poster Visual');
    if (errors.length > 0) { setValidationErrors(errors); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    let finalImageUrl = imagePreview || '';
    if (imageFile) {
      try {
        const compressed = await compressImage(imageFile, 800, 0.75);
        const path = `shows/${Date.now()}.jpg`;
        const { data: uploadData } = await supabase.storage.from('show-images').upload(path, compressed, { cacheControl: '31536000', upsert: false });
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('show-images').getPublicUrl(path);
          finalImageUrl = urlData.publicUrl;
        }
      } catch {}
    }

    const uploadedPhotos: string[] = [];
    for (let i = 0; i < 3; i++) {
      const pf = photoFiles[i]; const pp = photoPreviews[i];
      if (pf) {
        try {
          const compressedPhoto = await compressImage(pf, 600, 0.7);
          const path = `shows/photo_${Date.now()}_${i}.jpg`;
          const { data: pd } = await supabase.storage.from('show-images').upload(path, compressedPhoto, { cacheControl: '31536000', upsert: false });
          if (pd) { const { data: pu } = supabase.storage.from('show-images').getPublicUrl(path); uploadedPhotos.push(pu.publicUrl); }
        } catch { if (pp) uploadedPhotos.push(pp); }
      } else if (pp) { uploadedPhotos.push(pp); }
    }

    const newShow: Show = {
      title: formData.title, author: formData.author, director: formData.director,
      directorNotes: formData.directorNotes, originalProductionSolutions: formData.originalProductionSolutions,
      synopsis: formData.synopsisEn || formData.synopsis,
      trailerUrl: formData.trailerUrl || '',
      synopsisOriginal: formData.synopsis,
      originalLanguage: formData.originalLanguage,
      scriptInEnglish: formData.scriptInEnglish, imageUrl: finalImageUrl,
      genre: formData.genre, subgenre: formData.subgenre, language: formData.language,
      location: formData.location, duration: parseInt(formData.duration),
      maleRoles: parseInt(formData.maleRoles), femaleRoles: parseInt(formData.femaleRoles),
      canMergeRoles: formData.canMergeRoles === 'true',
      hasIntermission: formData.hasIntermission === 'true',
      isDirectorMandatory: formData.isDirectorMandatory === 'true',
      creativeTeamAvailability: formData.creativeTeamAvailability as Show['creativeTeamAvailability'],
      productionScale: formData.productionScale as Show['productionScale'],
      isTouringFriendly: formData.isTouringFriendly === 'true',
      technicalComplexity: formData.technicalComplexity as Show['technicalComplexity'],
      costumeComplexity: formData.costumeComplexity as Show['costumeComplexity'],
      setComplexity: formData.setComplexity as Show['setComplexity'],
      adaptationFlexibility: formData.adaptationFlexibility as Show['adaptationFlexibility'],
      scalabilityNotes: formData.scalabilityNotes,
      stageType: formData.stageType as Show['stageType'],
      techStaffLighting: parseInt(formData.techStaffLighting),
      techStaffSound: parseInt(formData.techStaffSound),
      techStaffPrompter: parseInt(formData.techStaffPrompter),
      techStaffStagehands: parseInt(formData.techStaffStagehands),
      techStaffOther: formData.techStaffOther,
      premiereDate: formData.premiereDate, premiereLocation: formData.premiereLocation,
      productionYear: parseInt(formData.productionYear),
      performancesCount: parseInt(formData.performancesCount),
      totalAudience: parseInt(formData.totalAudience),
      locationsPlayed: formData.locationsPlayed, buyoutLocations: formData.buyoutLocations,
      boxOfficeIndicator: formData.boxOfficeIndicator as Show['boxOfficeIndicator'],
      awards: formData.awards, audienceProfile: formData.audienceProfile,
      producerName: formData.producerName, producerEmail: formData.producerEmail,
      rightsHolder: formData.rightsHolder,
      rightsStatus: formData.rightsStatus as Show['rightsStatus'],
      territoriesAvailable: formData.territoriesAvailable, licensedCountries: formData.licensedCountries,
      licenseType: formData.licenseType as Show['licenseType'],
      licensingModel: formData.licensingModel as Show['licensingModel'],
      exclusivityLevel: formData.exclusivityLevel as Show['exclusivityLevel'],
      royaltyRange: formData.royaltyRange, advanceFee: formData.advanceFee,
      has_script_package: formData.hasScriptPackage === true || formData.hasScriptPackage === 'true',
      script_royalty_pct: formData.scriptRoyaltyPct ? Number(formData.scriptRoyaltyPct) : null,
      script_advance_fee: formData.scriptAdvanceFee ? Number(formData.scriptAdvanceFee) : null,
      has_full_punch_package: formData.hasFullPunchPackage === true || formData.hasFullPunchPackage === 'true',
      full_punch_royalty_pct: formData.fullPunchRoyaltyPct ? Number(formData.fullPunchRoyaltyPct) : null,
      full_punch_advance_fee: formData.fullPunchAdvanceFee ? Number(formData.fullPunchAdvanceFee) : null,
      full_punch_includes: formData.fullPunchIncludes,
      rightsClearingSpeed: formData.rightsClearingSpeed as Show['rightsClearingSpeed'],
      decisionMakerType: formData.decisionMakerType as Show['decisionMakerType'],
      riskProfile: formData.riskProfile as Show['riskProfile'],
      breakEvenThreshold: formData.breakEvenThreshold as Show['breakEvenThreshold'],
      breakEvenPerformances: parseInt(formData.breakEvenPerformances),
      budgetRange: formData.budgetRange as Show['budgetRange'],
      humorType: formData.humorType as Show['humorType'],
      translationsAvailable: formData.translationsAvailable,
      translationRightsIncluded: formData.translationRightsIncluded === 'true',
      isSponsorFriendly: formData.isSponsorFriendly === 'true',
      isGroupSalesFriendly: formData.isGroupSalesFriendly === 'true',
      exitScenarios: formData.exitScenarios,
      originatingProducerTrackRecord: formData.originatingProducerTrackRecord,
      territoryConflicts: formData.territoryConflicts, mediaConflicts: formData.mediaConflicts,
      internationalSuccessNotes: formData.internationalSuccessNotes,
      scriptScenario: formData.scriptScenario,
      programmingCompatibility: ['Commercial'],
      transparencyScore: 80, likesCount: 0, viewsCount: 0, inquiriesCount: 0,
      productionPhotos: uploadedPhotos, is_produced: true,
    } as Show;

    onUpload(newShow);
    setIsSuccess(true);
    setTimeout(() => { setIsSuccess(false); onNavigate('subscription'); }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-8xl font-black text-brand-cyan">✓</div>
          <h2 className="text-5xl font-black uppercase italic text-white">Show Listed! 🎭 🥊</h2>
          <p className="text-brand-cyan font-bold uppercase tracking-widest">Redirecting to My Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-black overflow-y-auto text-white">
      <Navigation onNavigate={onNavigate} onLogout={onLogout} activePage="upload" user={user} />
      {isAtLimit && (
        <div className="fixed inset-0 z-50 bg-brand-black flex flex-col items-center justify-center gap-6 px-4">
          <h1 className="text-5xl font-black uppercase italic text-white text-center">
            {plan === 'gigl' ? 'GIGL limit reached.' : 'LAFF limit reached.'}
          </h1>
          <p className="text-white/40 font-bold italic text-center max-w-md">
            {plan === 'gigl' ? `You've used your 1 free show slot. Upgrade to LAFF for up to 10 shows.` : `You've reached 10 shows on LAFF. Upgrade to ROAR for unlimited uploads.`}
          </p>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('pricing')} className="bg-brand-yellow text-black px-10 py-4 font-black uppercase italic border-4 border-black hover:bg-white transition-all">
              {plan === 'gigl' ? 'Upgrade to LAFF →' : 'Upgrade to ROAR →'}
            </button>
            <button onClick={() => onNavigate('subscription')} className="border-4 border-white text-white px-8 py-4 font-black uppercase italic hover:bg-white hover:text-black transition-all">
              My Hub
            </button>
          </div>
          <p className="text-white/20 text-xs italic">
            {plan === 'gigl' ? '1/1 show used' : `${userShowCount}/10 shows used`}
          </p>
        </div>
      )}
      <main className="pt-40 pb-24 px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <header>
            <h1 className="text-7xl md:text-[120px] font-black uppercase italic leading-[0.8] tracking-tighter">
              LIST YOUR <span className="text-brand-pink">SHOW</span>
            </h1>
          </header>

          {validationErrors.length > 0 && (
            <div className="bg-brand-pink border-4 border-black p-6">
              <p className="font-black uppercase italic mb-2">Missing required fields:</p>
              <p className="text-sm font-bold">{validationErrors.join(', ')}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">

              {/* 00. RIGHTS & IDENTITY */}
              <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-cyan">
                <h3 className="text-2xl font-black uppercase italic text-brand-cyan mb-8">00. Rights & Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div><label className={lbl}>Production Company</label><input name="producerName" value={formData.producerName} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Producer Email</label><input name="producerEmail" value={formData.producerEmail} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Copyright Holder *</label><input name="rightsHolder" value={formData.rightsHolder} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-brand-yellow font-bold outline-none focus:border-brand-yellow" /></div>
                  <div><label className={lbl}>Rights Status</label>
                    <select name="rightsStatus" value={formData.rightsStatus} onChange={handleInputChange} className={sel}>
                      <option value="Available">Available</option>
                      <option value="Co-production Only">Co-production Only</option>
                      <option value="Licensed">Licensed</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Territories Available</label><input name="territoriesAvailable" value={formData.territoriesAvailable} onChange={handleInputChange} className={inp} placeholder="Global, Europe..." /></div>
                  <div><label className={lbl}>Licensed Countries</label><input name="licensedCountries" value={formData.licensedCountries} onChange={handleInputChange} className={inp} /></div>


                </div>
              </section>

              {/* 01. CREATIVE ENGINE */}
              <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-magenta">
                <h3 className="text-2xl font-black uppercase italic text-brand-pink mb-8">01. Creative Engine</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2"><label className={lbl}>Production Title *</label><input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-brand-black border-4 border-white px-6 py-5 text-white font-bold uppercase text-2xl focus:border-brand-yellow outline-none" /></div>
                  <div><label className={lbl}>Author / Playwright</label><input name="author" value={formData.author} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Director</label><input name="director" value={formData.director} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Genre *</label><input name="genre" value={formData.genre} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Subgenre</label><input name="subgenre" value={formData.subgenre} onChange={handleInputChange} className={inp} placeholder="Farce, Satire..." /></div>
                  <div><label className={lbl}>Original Language *</label><input name="originalLanguage" value={formData.originalLanguage} onChange={handleInputChange} className={inp} placeholder="Slovenian, French..." /></div>
                  <div><label className={lbl}>Performance Language</label><input name="language" value={formData.language} onChange={handleInputChange} className={inp} placeholder="English, German..." /></div>
                  <div><label className={lbl}>Translations Available</label><input name="translationsAvailable" value={formData.translationsAvailable} onChange={handleInputChange} className={inp} placeholder="EN, DE, FR..." /></div>
                  <div><label className={lbl}>Script in English</label>
                    <select name="scriptInEnglish" value={formData.scriptInEnglish} onChange={handleInputChange} className={sel}>
                      <option value="true">Yes — full script</option>
                      <option value="partial">Yes — partial / synopsis only</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Origin Market *</label><input name="location" value={formData.location} onChange={handleInputChange} className={inp} placeholder="Slovenia, USA..." /></div>
                  <div><label className={lbl}>Humor Type</label>
                    <select name="humorType" value={formData.humorType} onChange={handleInputChange} className={sel}>
                      <option value="Universal">Universal</option>
                      <option value="Language-based">Language-based</option>
                      <option value="Local Politics">Local Politics</option>
                      <option value="Physical Comedy">Physical Comedy</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Translations Available</label><input name="translationsAvailable" value={formData.translationsAvailable} onChange={handleInputChange} className={inp} placeholder="EN, DE, FR..." /></div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-yellow mb-2 italic">Synopsis in English *</label>
                    <p className="text-white/30 text-xs italic mb-2">Required — this is what international producers will read first.</p>
                    <textarea name="synopsisEn" value={formData.synopsisEn} onChange={handleInputChange} rows={5} className="w-full bg-brand-black border-2 border-brand-yellow/30 p-6 text-white text-lg italic leading-relaxed outline-none focus:border-brand-yellow"></textarea>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Synopsis (Original Language)</label>
                    <textarea name="synopsis" value={formData.synopsis} onChange={handleInputChange} rows={4} className="w-full bg-brand-black border-2 border-white/10 p-6 text-white italic leading-relaxed outline-none focus:border-brand-pink"></textarea>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-cyan mb-2 italic">🎬 Trailer / Teaser URL</label>
                    <p className="text-white/30 text-xs italic mb-2">YouTube or Vimeo link — producers want to see the show before inquiring.</p>
                    <input name="trailerUrl" value={formData.trailerUrl} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-brand-cyan/30 p-4 text-white outline-none focus:border-brand-cyan" placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..." />
                  </div>
                  <div className="col-span-2"><label className={lbl}>Director's Notes</label><textarea name="directorNotes" value={formData.directorNotes} onChange={handleInputChange} rows={3} className="w-full bg-brand-black border-2 border-white/10 p-4 text-white italic outline-none focus:border-brand-cyan"></textarea></div>
                  <div className="col-span-2"><label className={lbl}>International Success Notes</label><textarea name="internationalSuccessNotes" value={formData.internationalSuccessNotes} onChange={handleInputChange} rows={2} className="w-full bg-brand-black border-2 border-white/10 p-4 text-white italic outline-none focus:border-brand-cyan"></textarea></div>

                  <div className="col-span-2 bg-brand-black border-4 border-brand-yellow p-6 space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-brand-yellow mb-1 italic tracking-widest">Script Scenario — 3 Pages in English *</label>
                      <p className="text-[9px] text-gray-500 italic mb-4">Public preview visible to all producers. Paste the first 3 pages of the script in English.</p>
                      <textarea name="scriptScenario" value={formData.scriptScenario} onChange={handleInputChange} rows={18} className="w-full bg-black border-2 border-white/10 p-6 text-white font-mono text-sm leading-relaxed outline-none focus:border-brand-yellow"></textarea>
                    </div>
                  </div>
                </div>
              </section>

              {/* 02. PRODUCTION & CAST */}
              <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-yellow">
                <h3 className="text-2xl font-black uppercase italic text-brand-yellow mb-8">02. Production & Cast</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div><label className={lbl}>Male Roles</label><input name="maleRoles" type="number" value={formData.maleRoles} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Female Roles</label><input name="femaleRoles" type="number" value={formData.femaleRoles} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Duration (min)</label><input name="duration" type="number" value={formData.duration} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Production Year</label><input name="productionYear" type="number" value={formData.productionYear} onChange={handleInputChange} className={inp} /></div>

                  <div><label className={lbl}>Intermission</label>
                    <select name="hasIntermission" value={formData.hasIntermission} onChange={handleInputChange} className={sel}>
                      <option value="false">No</option><option value="true">Yes</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Production Scale</label>
                    <select name="productionScale" value={formData.productionScale} onChange={handleInputChange} className={sel}>
                      <option value="Small">Small</option><option value="Medium">Medium</option><option value="Large">Large</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Stage Type</label>
                    <select name="stageType" value={formData.stageType} onChange={handleInputChange} className={sel}>
                      <option value="Main Stage">Main Stage</option><option value="Black Box">Black Box</option>
                      <option value="Arena">Arena</option><option value="Open Air">Open Air</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Touring Friendly</label>
                    <select name="isTouringFriendly" value={formData.isTouringFriendly} onChange={handleInputChange} className={sel}>
                      <option value="true">Yes</option><option value="false">No</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Technical Complexity</label>
                    <select name="technicalComplexity" value={formData.technicalComplexity} onChange={handleInputChange} className={sel}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Costume Complexity</label>
                    <select name="costumeComplexity" value={formData.costumeComplexity} onChange={handleInputChange} className={sel}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Set Complexity</label>
                    <select name="setComplexity" value={formData.setComplexity} onChange={handleInputChange} className={sel}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Adaptation Flexibility</label>
                    <select name="adaptationFlexibility" value={formData.adaptationFlexibility} onChange={handleInputChange} className={sel}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Director Mandatory</label>
                    <select name="isDirectorMandatory" value={formData.isDirectorMandatory} onChange={handleInputChange} className={sel}>
                      <option value="false">No</option><option value="true">Yes</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Creative Team</label>
                    <select name="creativeTeamAvailability" value={formData.creativeTeamAvailability} onChange={handleInputChange} className={sel}>
                      <option value="Optional">Optional</option><option value="Required">Required</option><option value="Not required">Not required</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Budget Range</label>
                    <select name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className={sel}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>

                </div>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div><label className={lbl}>Lighting Staff</label><input name="techStaffLighting" type="number" value={formData.techStaffLighting} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Sound Staff</label><input name="techStaffSound" type="number" value={formData.techStaffSound} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Prompter</label><input name="techStaffPrompter" type="number" value={formData.techStaffPrompter} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Stagehands</label><input name="techStaffStagehands" type="number" value={formData.techStaffStagehands} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Other Tech</label><input name="techStaffOther" value={formData.techStaffOther} onChange={handleInputChange} className={inp} placeholder="SFX, Video..." /></div>
                </div>
              </section>

              {/* 03. MARKET PERFORMANCE */}
              <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-cyan">
                <h3 className="text-2xl font-black uppercase italic text-brand-cyan mb-8">03. Market Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div><label className={lbl}>Premiere Date</label><input name="premiereDate" type="date" value={formData.premiereDate} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Premiere Location</label><input name="premiereLocation" value={formData.premiereLocation} onChange={handleInputChange} className={inp} placeholder="Theatre name, City" /></div>
                  <div><label className={lbl}>Total Performances</label><input name="performancesCount" type="number" value={formData.performancesCount} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Total Audience</label><input name="totalAudience" type="number" value={formData.totalAudience} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Locations Played</label><input name="locationsPlayed" value={formData.locationsPlayed} onChange={handleInputChange} className={inp} placeholder="London, Berlin, NYC..." /></div>
                  <div><label className={lbl}>Buyout Locations</label><input name="buyoutLocations" value={formData.buyoutLocations} onChange={handleInputChange} className={inp} placeholder="None" /></div>
                  <div><label className={lbl}>Box Office</label>
                    <select name="boxOfficeIndicator" value={formData.boxOfficeIndicator} onChange={handleInputChange} className={sel}>
                      <option value="High">High</option><option value="Medium">Medium</option><option value="Emerging">Emerging</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Risk Profile</label>
                    <select name="riskProfile" value={formData.riskProfile} onChange={handleInputChange} className={sel}>
                      <option value="Proven hit">Proven Hit</option><option value="Moderate risk">Moderate Risk</option><option value="Experimental">Experimental</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Break Even Threshold</label>
                    <select name="breakEvenThreshold" value={formData.breakEvenThreshold} onChange={handleInputChange} className={sel}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Break Even Performances</label><input name="breakEvenPerformances" type="number" value={formData.breakEvenPerformances} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Awards</label><input name="awards" value={formData.awards} onChange={handleInputChange} className={inp} placeholder="Fringe First 2024..." /></div>
                  <div><label className={lbl}>Audience Profile</label><input name="audienceProfile" value={formData.audienceProfile} onChange={handleInputChange} className={inp} placeholder="Ages 25-65, Urban..." /></div>
                  <div><label className={lbl}>Producer Track Record</label><input name="originatingProducerTrackRecord" value={formData.originatingProducerTrackRecord} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Exit Scenarios</label><input name="exitScenarios" value={formData.exitScenarios} onChange={handleInputChange} className={inp} placeholder="Standard termination..." /></div>
                </div>
              </section>

              {/* 04. COMMERCIAL BIBLE */}
              <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-magenta">
                <h3 className="text-2xl font-black uppercase italic text-brand-pink mb-8">04. Commercial Bible</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div><label className={lbl}>License Type</label>
                    <select name="licenseType" value={formData.licenseType} onChange={handleInputChange} className={sel}>
                      <option value="License">License</option><option value="Option">Option</option><option value="Co-production">Co-production</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Licensing Model</label>
                    <select name="licensingModel" value={formData.licensingModel} onChange={handleInputChange} className={sel}>
                      <option value="Royalty-based">Royalty-based</option><option value="Flat fee">Flat fee</option><option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Exclusivity</label>
                    <select name="exclusivityLevel" value={formData.exclusivityLevel} onChange={handleInputChange} className={sel}>
                      <option value="Exclusive">Exclusive</option><option value="Semi-exclusive">Semi-exclusive</option><option value="Non-exclusive">Non-exclusive</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Rights Clearing Speed</label>
                    <select name="rightsClearingSpeed" value={formData.rightsClearingSpeed} onChange={handleInputChange} className={sel}>
                      <option value="Fast">Fast</option><option value="Medium">Medium</option><option value="Slow">Slow</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Decision Maker</label>
                    <select name="decisionMakerType" value={formData.decisionMakerType} onChange={handleInputChange} className={sel}>
                      <option value="Single">Single</option><option value="Committee">Committee</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Royalty Range</label><input name="royaltyRange" value={formData.royaltyRange} onChange={handleInputChange} className={inp} placeholder="8-10% GBO" /></div>
                  <div><label className={lbl}>Advance Fee</label><input name="advanceFee" value={formData.advanceFee} onChange={handleInputChange} className={inp} placeholder="€2,000" /></div>
                </div>

                {/* ── PACKAGES ── */}
                <div className="border-4 border-brand-yellow/30 p-5 space-y-5">
                  <div>
                    <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest mb-1">Licensing Packages</p>
                    <p className="text-white/30 text-xs italic">Define what you offer and at what price. Buyers will select a package when they send an inquiry.</p>
                  </div>

                  {/* SCRIPT PACKAGE */}
                  <div className={"border-2 p-4 space-y-3 " + (formData.hasScriptPackage ? "border-brand-yellow/60" : "border-white/10")}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="hasScript" checked={!!formData.hasScriptPackage}
                        onChange={e => setFormData((p: any) => ({...p, hasScriptPackage: e.target.checked}))}
                        className="w-4 h-4 accent-brand-yellow" />
                      <label htmlFor="hasScript" className="font-black uppercase italic text-white text-sm cursor-pointer">
                        🎭 SCRIPT — Script only license
                      </label>
                    </div>
                    <p className="text-white/30 text-xs italic pl-7">Buyer gets the script and produces independently. Lower royalty, maximum creative freedom for buyer.</p>
                    {formData.hasScriptPackage && (
                      <div className="grid grid-cols-2 gap-3 pl-7">
                        <div>
                          <label className={lbl}>Royalty %</label>
                          <input type="number" name="scriptRoyaltyPct" value={formData.scriptRoyaltyPct} onChange={handleInputChange} className={inp} placeholder="e.g. 10" />
                          <p className="text-white/20 text-[9px] italic mt-1">% of gross box office per performance</p>
                        </div>
                        <div>
                          <label className={lbl}>Advance Fee (EUR)</label>
                          <input type="number" name="scriptAdvanceFee" value={formData.scriptAdvanceFee} onChange={handleInputChange} className={inp} placeholder="e.g. 1000" />
                          <p className="text-white/20 text-[9px] italic mt-1">One-time upfront payment (optional)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FULL PUNCH PACKAGE */}
                  <div className={"border-2 p-4 space-y-3 " + (formData.hasFullPunchPackage ? "border-brand-pink/60" : "border-white/10")}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="hasFullPunch" checked={!!formData.hasFullPunchPackage}
                        onChange={e => setFormData((p: any) => ({...p, hasFullPunchPackage: e.target.checked}))}
                        className="w-4 h-4 accent-brand-pink" />
                      <label htmlFor="hasFullPunch" className="font-black uppercase italic text-white text-sm cursor-pointer">
                        🥊 FULL PUNCH — Complete know-how package
                      </label>
                    </div>
                    <p className="text-white/30 text-xs italic pl-7">Script + production know-how: director's notes, set design reference, costume design reference, lighting/sound plan, original video material (back projections, AV content), original music. Buyer decides what to use.</p>
                    {formData.hasFullPunchPackage && (
                      <div className="space-y-3 pl-7">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={lbl}>Royalty %</label>
                            <input type="number" name="fullPunchRoyaltyPct" value={formData.fullPunchRoyaltyPct} onChange={handleInputChange} className={inp} placeholder="e.g. 15" />
                            <p className="text-white/20 text-[9px] italic mt-1">Includes video + music royalties</p>
                          </div>
                          <div>
                            <label className={lbl}>Advance Fee (EUR)</label>
                            <input type="number" name="fullPunchAdvanceFee" value={formData.fullPunchAdvanceFee} onChange={handleInputChange} className={inp} placeholder="e.g. 3000" />
                          </div>
                        </div>
                        <div>
                          <label className={lbl}>What's included (optional detail)</label>
                          <input name="fullPunchIncludes" value={formData.fullPunchIncludes} onChange={handleInputChange} className={inp} placeholder="e.g. 4 video projections, original score by..." />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex gap-6">
                    <div className="flex-1"><label className={lbl}>Sponsor Friendly</label>
                      <select name="isSponsorFriendly" value={formData.isSponsorFriendly} onChange={handleInputChange} className={sel}>
                        <option value="true">Yes</option><option value="false">No</option>
                      </select>
                    </div>
                    <div className="flex-1"><label className={lbl}>Group Sales</label>
                      <select name="isGroupSalesFriendly" value={formData.isGroupSalesFriendly} onChange={handleInputChange} className={sel}>
                        <option value="true">Yes</option><option value="false">No</option>
                      </select>
                    </div>
                  </div>
                  <div><label className={lbl}>Translation Rights</label>
                    <select name="translationRightsIncluded" value={formData.translationRightsIncluded} onChange={handleInputChange} className={sel}>
                      <option value="true">Included</option><option value="false">Separate</option>
                    </select>
                  </div>
                </div>
              </section>

            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4">
              <div className="bg-white text-black p-10 shadow-neo-white sticky top-32 space-y-8">
                <div>
                  <h3 className="text-xl font-black uppercase italic border-b-4 border-black pb-4 text-brand-pink mb-4">Poster Visual *</h3>
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-56 border-4 border-dashed border-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-pink overflow-hidden bg-gray-50">
                    {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-black/20 text-6xl">add_a_photo</span>}
                    <p className="mt-2 text-[8px] font-black uppercase text-gray-400">Click to upload</p>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>

                <div>
                  <h3 className="text-xl font-black uppercase italic border-b-4 border-black pb-4 text-brand-cyan mb-4">Production Photos</h3>
                  <div className="space-y-3">
                    {[0, 1, 2].map(i => (
                      <div key={i}>
                        <div onClick={() => photoRefs[i].current?.click()} className="w-full border-2 border-dashed border-black/20 flex items-center justify-center cursor-pointer hover:border-brand-cyan overflow-hidden bg-gray-50" style={{aspectRatio:"16/9"}}>
                          {photoPreviews[i] ? <img src={photoPreviews[i]!} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-black/20 text-3xl">add_photo_alternate</span>}
                        </div>
                        <input type="file" ref={photoRefs[i]} onChange={handlePhotoChange(i)} className="hidden" accept="image/*" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t-4 border-black">
                  <button onClick={handleLaunch} className="w-full bg-brand-pink text-white font-black uppercase py-6 border-4 border-black shadow-neo-cyan hover:bg-black transition-all italic tracking-[0.2em] text-xl">
                    Showload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
