import React, { useState, useRef } from 'react';
import Navigation from '../components/Navigation';
import { Page, User, Show } from '../types';
import { supabase } from '../lib/supabase';

interface UploadPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onUpload: (show: Show) => void;
  userShowCount?: number;
}

const inp = "w-full bg-brand-black border-2 border-white/20 px-4 py-3 text-white font-bold outline-none focus:border-brand-cyan text-sm";
const sel = "w-full bg-brand-black border-2 border-white/20 px-4 py-3 text-white font-black text-xs uppercase italic outline-none focus:border-brand-cyan";
const lbl = "block text-[9px] font-black uppercase text-white/40 mb-1.5 italic tracking-widest";
const sec = "bg-brand-surface border-4 border-white p-6 md:p-8 space-y-5";

const compressImage = (file: File, maxWidth: number, quality: number): Promise<File> =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => resolve(new File([blob!], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })), 'image/jpeg', quality);
    };
    img.src = url;
  });

const UploadPage: React.FC<UploadPageProps> = ({ onNavigate, onLogout, user, onUpload, userShowCount = 0 }) => {
  const plan = (user as any)?.plan || 'gigl';
  const uploadLimit = user?.isAdmin ? 9999 : plan === 'roar' ? 9999 : plan === 'laff' ? 5 : 1;
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
    // 00. BASIC INFO
    englishTitle: '', title: '', author: '', genre: 'Comedy', subgenre: '',
    originalLanguage: '', humorType: 'Universal', synopsisEn: '',
    internationalSuccessNotes: '', awards: '', trailerUrl: '', productionYear: new Date().getFullYear().toString(),
    // 01. PRODUCTION
    maleRoles: '1', femaleRoles: '1', duration: '90', hasIntermission: 'false',
    productionScale: 'Medium', stageType: 'Main Stage', isTouringFriendly: 'true',
    adaptationFlexibility: 'Medium', technicalComplexity: 'Medium',
    techStaffLighting: '1', techStaffSound: '1', techStaffPrompter: '0', techStaffStagehands: '1',
    director: '', directorNotes: '', originalProductionSolutions: '',
    // 02. CREATIVE ASSETS
    musicAuthor: '', hasOriginalMusic: 'false',
    videoAuthor: '', hasVideoProjections: 'false', videoDescription: '',
    scriptInEnglish: 'false', translationsAvailable: '', translationRightsIncluded: 'false',
    scriptScenario: '',
    // 03. MARKET PERFORMANCE
    premiereDate: '', premiereLocation: '', performancesCount: '0',
    totalAudience: '0', locationsPlayed: '', boxOfficeIndicator: 'Emerging',
    // 04. RIGHTS
    rightsHolder: '', rightsStatus: 'Available', territoriesAvailable: 'Global',
    licensedCountries: '', exclusivityLevel: 'Exclusive', licenseType: 'License',
    // 05. PACKAGES
    hasScriptPackage: true, scriptRoyaltyPct: '', scriptAdvanceFee: '',
    hasFullPunchPackage: false, fullPunchRoyaltyPct: '', fullPunchAdvanceFee: '',
    // Full Punch contents
    fpTheScript: true, fpThePlaybook: false, fpTheSoundtrack: false,
    fpTheVisuals: false, fpTheWardrobe: false, fpTheSetBlueprint: false,
    fpTheTechRider: false, fpThePromoKit: false, fpTheHandoverSession: false,
    fpPunchLanguage: 'EN', fpPunchSupport: false,
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
      reader.onloadend = () => { const p = [...photoPreviews]; p[index] = reader.result as string; setPhotoPreviews(p); };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = async () => {
    const errors: string[] = [];
    if (!formData.englishTitle?.trim() && !formData.title?.trim()) errors.push('Title');
    if (!formData.author?.trim()) errors.push('Author / Playwright');
    if (!formData.genre?.trim()) errors.push('Genre');
    if (!formData.originalLanguage?.trim()) errors.push('Original Language');
    if (!formData.synopsisEn?.trim()) errors.push('Synopsis in English');
    if (!formData.duration) errors.push('Duration');
    if (!formData.rightsHolder?.trim()) errors.push('Copyright Holder');
    if (!formData.hasScriptPackage && !formData.hasFullPunchPackage) errors.push('At least one package (Script or Full Punch)');
    if (formData.hasScriptPackage && !formData.scriptRoyaltyPct) errors.push('Script Royalty %');
    if (formData.hasFullPunchPackage && !formData.fullPunchRoyaltyPct) errors.push('Full Punch Royalty %');
    if (!imagePreview) errors.push('Show poster / image');
    if (errors.length > 0) { setValidationErrors(errors); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    let finalImageUrl = imagePreview || '';
    if (imageFile) {
      try {
        const compressed = await compressImage(imageFile, 800, 0.75);
        const path = `shows/${Date.now()}.jpg`;
        const { data: uploadData } = await supabase.storage.from('show-images').upload(path, compressed, { cacheControl: '31536000', upsert: false });
        if (uploadData) { const { data: urlData } = supabase.storage.from('show-images').getPublicUrl(path); finalImageUrl = urlData.publicUrl; }
      } catch {}
    }

    const uploadedPhotos: string[] = [];
    for (let i = 0; i < 3; i++) {
      const pf = photoFiles[i]; const pp = photoPreviews[i];
      if (pf) {
        try {
          const c = await compressImage(pf, 600, 0.7);
          const path = `shows/photo_${Date.now()}_${i}.jpg`;
          const { data: pd } = await supabase.storage.from('show-images').upload(path, c, { cacheControl: '31536000', upsert: false });
          if (pd) { const { data: pu } = supabase.storage.from('show-images').getPublicUrl(path); uploadedPhotos.push(pu.publicUrl); }
        } catch { if (pp) uploadedPhotos.push(pp); }
      } else if (pp) { uploadedPhotos.push(pp); }
    }

    const newShow = {
      english_title: formData.englishTitle || formData.title,
      title: formData.title || formData.englishTitle,
      author: formData.author,
      director: formData.director,
      director_notes: formData.directorNotes,
      original_production_solutions: formData.originalProductionSolutions,
      synopsis_en: formData.synopsisEn,
      original_language: formData.originalLanguage,
      script_in_english: formData.scriptInEnglish,
      trailer_url: formData.trailerUrl,
      image_url: finalImageUrl,
      genre: formData.genre,
      subgenre: formData.subgenre,
      language: formData.originalLanguage,
      humor_type: formData.humorType,
      awards: formData.awards,
      international_success_notes: formData.internationalSuccessNotes,
      production_year: parseInt(formData.productionYear),
      duration: parseInt(formData.duration),
      male_roles: parseInt(formData.maleRoles),
      female_roles: parseInt(formData.femaleRoles),
      has_intermission: formData.hasIntermission === 'true',
      production_scale: formData.productionScale,
      stage_type: formData.stageType,
      is_touring_friendly: formData.isTouringFriendly === 'true',
      adaptation_flexibility: formData.adaptationFlexibility,
      technical_complexity: formData.technicalComplexity,
      tech_staff_lighting: parseInt(formData.techStaffLighting),
      tech_staff_sound: parseInt(formData.techStaffSound),
      tech_staff_prompter: parseInt(formData.techStaffPrompter),
      tech_staff_stagehands: parseInt(formData.techStaffStagehands),
      music_author: formData.musicAuthor || null,
      has_original_music: formData.hasOriginalMusic === 'true',
      video_author: formData.videoAuthor || null,
      has_video_projections: formData.hasVideoProjections === 'true',
      video_description: formData.videoDescription || null,
      translations_available: formData.translationsAvailable,
      translation_rights_included: formData.translationRightsIncluded === 'true',
      script_scenario: formData.scriptScenario,
      premiere_date: formData.premiereDate,
      premiere_location: formData.premiereLocation,
      performances_count: parseInt(formData.performancesCount),
      total_audience: parseInt(formData.totalAudience),
      locations_played: formData.locationsPlayed,
      box_office_indicator: formData.boxOfficeIndicator,
      rights_holder: formData.rightsHolder,
      rights_status: formData.rightsStatus,
      territories_available: formData.territoriesAvailable,
      licensed_countries: formData.licensedCountries,
      exclusivity_level: formData.exclusivityLevel,
      license_type: formData.licenseType,
      has_script_package: formData.hasScriptPackage === true || (formData.hasScriptPackage as any) === 'true',
      script_royalty_pct: formData.scriptRoyaltyPct ? Number(formData.scriptRoyaltyPct) : null,
      script_advance_fee: formData.scriptAdvanceFee ? Number(formData.scriptAdvanceFee) : null,
      has_full_punch_package: formData.hasFullPunchPackage === true || (formData.hasFullPunchPackage as any) === 'true',
      full_punch_royalty_pct: formData.fullPunchRoyaltyPct ? Number(formData.fullPunchRoyaltyPct) : null,
      full_punch_advance_fee: formData.fullPunchAdvanceFee ? Number(formData.fullPunchAdvanceFee) : null,
      fp_the_script: true,
      fp_the_playbook: !!(formData as any).fpThePlaybook,
      fp_the_soundtrack: !!(formData as any).fpTheSoundtrack,
      fp_the_visuals: !!(formData as any).fpTheVisuals,
      fp_the_wardrobe: !!(formData as any).fpTheWardrobe,
      fp_the_set_blueprint: !!(formData as any).fpTheSetBlueprint,
      fp_the_tech_rider: !!(formData as any).fpTheTechRider,
      fp_the_promo_kit: !!(formData as any).fpThePromoKit,
      fp_the_handover_session: !!(formData as any).fpTheHandoverSession,
      fp_punch_language: (formData as any).fpPunchLanguage || 'EN',
      fp_punch_support: !!(formData as any).fpPunchSupport,
      production_photos: uploadedPhotos,
      is_produced: true,
      likes_count: 0, views_count: 0, inquiries_count: 0,
      producer_name: user?.name || '',
      producer_email: user?.email || '',
      user_id: user?.id,
    };

    const { data, error } = await supabase.from('shows').insert([newShow]).select().single();
    if (!error && data) {
      onUpload(data as unknown as Show);
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); onNavigate('subscription'); }, 3000);
    }
  };

  if (isSuccess) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="text-6xl font-black text-brand-cyan">✓</div>
        <h2 className="text-4xl md:text-5xl font-black uppercase italic text-white">Show Listed!</h2>
        <p className="text-brand-cyan font-bold uppercase tracking-widest text-sm">Redirecting to My Hub...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-brand-black text-white">
      <Navigation onNavigate={onNavigate} onLogout={onLogout} activePage="upload" user={user} />

      {isAtLimit && (
        <div className="fixed inset-0 z-50 bg-brand-black flex flex-col items-center justify-center gap-6 px-4">
          <h1 className="text-4xl font-black uppercase italic text-white text-center">Upload limit reached.</h1>
          <p className="text-white/40 font-bold italic text-center max-w-md">
            {plan === 'gigl' ? 'Upgrade to LAFF for up to 5 shows.' : 'Upgrade to ROAR for unlimited uploads.'}
          </p>
          <button onClick={() => onNavigate('pricing')} className="bg-brand-yellow text-black px-10 py-4 font-black uppercase italic border-4 border-black hover:bg-white transition-all">
            Upgrade →
          </button>
        </div>
      )}

      <main className="pt-32 pb-24 px-4 md:px-8">
        <div className="max-w-5xl mx-auto space-y-8">

          <header>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none">
              LIST YOUR <span className="text-brand-pink">SHOW</span>
            </h1>
            <p className="text-white/30 text-xs italic mt-2 font-black uppercase tracking-widest">
              Fields marked <span className="text-brand-pink">*</span> are required before publishing.
            </p>
          </header>

          {validationErrors.length > 0 && (
            <div className="bg-brand-pink border-4 border-black p-5">
              <p className="font-black uppercase italic mb-2 text-sm">Please fill in:</p>
              <ul className="space-y-1">{validationErrors.map((e, i) => <li key={i} className="text-sm font-bold">• {e}</li>)}</ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">

              {/* 00. BASIC INFO */}
              <section className={sec + " shadow-neo-cyan"}>
                <div className="border-b-2 border-white/10 pb-3 mb-2">
                  <h3 className="text-xl font-black uppercase italic text-brand-cyan">00. Basic Info</h3>
                  <p className="text-white/30 text-xs italic mt-0.5">What your show is about.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>English Title <span style={{color:"#FF0266"}}>*</span> <span className="text-white/20 normal-case font-normal">(main title for international buyers)</span></label>
                    <input name="englishTitle" value={formData.englishTitle} onChange={handleInputChange} className="w-full bg-brand-black border-4 border-white px-5 py-4 text-white font-bold uppercase text-xl focus:border-brand-yellow outline-none" placeholder="SHOW TITLE IN ENGLISH" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Original Title (if different)</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} className={inp} placeholder="Original language title" />
                  </div>
                  <div><label className={lbl}>Author / Playwright <span style={{color:"#FF0266"}}>*</span></label><input name="author" value={formData.author} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Original Language <span style={{color:"#FF0266"}}>*</span></label><input name="originalLanguage" value={formData.originalLanguage} onChange={handleInputChange} className={inp} placeholder="Slovenian, French..." /></div>
                  <div><label className={lbl}>Genre <span style={{color:"#FF0266"}}>*</span></label>
                    <select name="genre" value={formData.genre} onChange={handleInputChange} className={sel}>
                      <option value="">Select genre...</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Drama">Drama</option>
                      <option value="Musical">Musical</option>
                      <option value="Physical Theatre">Physical Theatre</option>
                      <option value="Cabaret">Cabaret</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Subgenre</label>
                    <select name="subgenre" value={formData.subgenre} onChange={handleInputChange} className={sel}>
                      <option value="">Select subgenre...</option>
                      <option value="Monocomedy">Monocomedy</option>
                      <option value="Farce">Farce</option>
                      <option value="Black Comedy">Black Comedy</option>
                      <option value="Dark Comedy">Dark Comedy</option>
                      <option value="Satire">Satire</option>
                      <option value="Absurd">Absurd</option>
                      <option value="Romantic Comedy">Romantic Comedy</option>
                      <option value="Slapstick">Slapstick</option>
                      <option value="Stand-up Theatre">Stand-up Theatre</option>
                      <option value="Musical Comedy">Musical Comedy</option>
                      <option value="Sketch Comedy">Sketch Comedy</option>
                      <option value="Character Comedy">Character Comedy</option>
                      <option value="Physical Comedy">Physical Comedy</option>
                      <option value="Cabaret Comedy">Cabaret Comedy</option>
                      <option value="Storytelling">Storytelling</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Humor Type</label>
                    <select name="humorType" value={formData.humorType} onChange={handleInputChange} className={sel}>
                      <option value="Universal">Universal</option>
                      <option value="Language-based">Language-based</option>
                      <option value="Local Politics">Local Politics</option>
                      <option value="Physical Comedy">Physical Comedy</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Production Year</label><input name="productionYear" type="number" value={formData.productionYear} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Awards</label><input name="awards" value={formData.awards} onChange={handleInputChange} className={inp} placeholder="Best Comedy, Best Director..." /></div>
                  <div><label className={lbl}>Trailer URL</label><input name="trailerUrl" value={formData.trailerUrl} onChange={handleInputChange} className={inp} placeholder="https://youtube.com/..." /></div>
                  <div className="sm:col-span-2"><label className={lbl}>Synopsis in English <span style={{color:"#FF0266"}}>*</span> <span className="text-white/20 normal-case font-normal">(for international buyers)</span></label><textarea name="synopsisEn" value={formData.synopsisEn} onChange={handleInputChange} rows={4} className={inp} placeholder="Write a compelling synopsis in English..." /></div>
                  <div className="sm:col-span-2"><label className={lbl}>International Success Notes</label><input name="internationalSuccessNotes" value={formData.internationalSuccessNotes} onChange={handleInputChange} className={inp} placeholder="Toured X countries, won festival Y..." /></div>
                </div>
              </section>

              {/* 01. PRODUCTION */}
              <section className={sec + " shadow-neo-magenta"}>
                <div className="border-b-2 border-white/10 pb-3 mb-2">
                  <h3 className="text-xl font-black uppercase italic text-brand-pink">01. Production</h3>
                  <p className="text-white/30 text-xs italic mt-0.5">Cast, technical requirements and staging.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div><label className={lbl}>Male Roles *</label><input name="maleRoles" type="number" value={formData.maleRoles} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Female Roles *</label><input name="femaleRoles" type="number" value={formData.femaleRoles} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Duration (min) *</label><input name="duration" type="number" value={formData.duration} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Intermission</label>
                    <select name="hasIntermission" value={formData.hasIntermission} onChange={handleInputChange} className={sel}>
                      <option value="false">No</option><option value="true">Yes</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Scale</label>
                    <select name="productionScale" value={formData.productionScale} onChange={handleInputChange} className={sel}>
                      <option value="Small">Small</option><option value="Medium">Medium</option><option value="Large">Large</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Stage Type</label>
                    <select name="stageType" value={formData.stageType} onChange={handleInputChange} className={sel}>
                      <option value="Main Stage">Main Stage</option><option value="Black Box">Black Box</option><option value="Arena">Arena</option><option value="Open Air">Open Air</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Touring</label>
                    <select name="isTouringFriendly" value={formData.isTouringFriendly} onChange={handleInputChange} className={sel}>
                      <option value="true">Touring friendly</option><option value="false">Not touring</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Adaptation</label>
                    <select name="adaptationFlexibility" value={formData.adaptationFlexibility} onChange={handleInputChange} className={sel}>
                      <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div><label className={lbl}>Lighting Staff</label><input name="techStaffLighting" type="number" value={formData.techStaffLighting} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Sound Staff</label><input name="techStaffSound" type="number" value={formData.techStaffSound} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Stagehands</label><input name="techStaffStagehands" type="number" value={formData.techStaffStagehands} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Technical</label>
                    <select name="technicalComplexity" value={formData.technicalComplexity} onChange={handleInputChange} className={sel}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={lbl}>Director</label><input name="director" value={formData.director} onChange={handleInputChange} className={inp} /></div>
                  <div className="sm:col-span-2"><label className={lbl}>Director's Notes</label><textarea name="directorNotes" value={formData.directorNotes} onChange={handleInputChange} rows={2} className={inp} placeholder="Vision, approach, key staging decisions..." /></div>
                  <div className="sm:col-span-2"><label className={lbl}>Original Production Solutions</label><textarea name="originalProductionSolutions" value={formData.originalProductionSolutions} onChange={handleInputChange} rows={2} className={inp} placeholder="Unique staging, set design, technical innovations..." /></div>
                </div>
              </section>

              {/* 02. FULL PUNCH */}
              <section className={sec + " shadow-neo-magenta border-brand-pink"}>
                <div className="border-b-2 border-white/10 pb-3 mb-2">
                  <h3 className="text-xl font-black uppercase italic text-brand-pink">02. Licensing Packages</h3>
                  <p className="text-white/30 text-xs italic mt-0.5">Set up your licensing packages — Script Only and Full Punch. Buyers choose which they want.</p>
                </div>

                {/* ENABLE FULL PUNCH */}
                <div className={"border-4 p-4 space-y-4 " + ((formData as any).hasFullPunchPackage ? "border-brand-pink/50 bg-brand-pink/5" : "border-white/10")}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="hasFullPunch" checked={!!(formData as any).hasFullPunchPackage}
                      onChange={e => setFormData(p => ({ ...p, hasFullPunchPackage: e.target.checked }))}
                      className="w-4 h-4 accent-brand-pink" />
                    <label htmlFor="hasFullPunch" className="font-black uppercase italic text-white cursor-pointer text-lg">🥊 Offer Full Punch Package</label>
                  </div>
                  <p className="text-white/30 text-xs italic pl-7">Enable to let buyers license your complete production know-how. Script is always included.</p>

                  {(formData as any).hasFullPunchPackage && (
                    <div className="space-y-5 pl-0 pt-2">

                      {/* Pricing */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Full Punch Royalty % *</label>
                          <input type="number" name="fullPunchRoyaltyPct" value={(formData as any).fullPunchRoyaltyPct} onChange={handleInputChange} className={inp} placeholder="15" />
                          <p className="text-white/20 text-[9px] italic mt-1">All royalties in one rate</p>
                        </div>
                        <div>
                          <label className={lbl}>Advance Fee (EUR)</label>
                          <input type="number" name="fullPunchAdvanceFee" value={(formData as any).fullPunchAdvanceFee} onChange={handleInputChange} className={inp} placeholder="0" />
                        </div>
                      </div>

                      {/* Know-How Contents */}
                      <div>
                        <p className="text-[9px] font-black uppercase text-brand-pink/60 tracking-widest mb-3">What's In The Package</p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { key: 'fpTheScript',          label: '📄 The Script',             desc: 'Complete script + stage directions', locked: true },
                            { key: 'fpThePlaybook',        label: '📋 The Playbook',            desc: "Director's complete production notes" },
                            { key: 'fpTheSoundtrack',      label: '🎵 The Soundtrack',          desc: 'Original music files + cue sheet' },
                            { key: 'fpTheVisuals',         label: '🎬 The Visuals',             desc: 'Video projection files + technical specs' },
                            { key: 'fpTheWardrobe',        label: '👗 The Wardrobe',            desc: 'Costume design sketches + supplier list' },
                            { key: 'fpTheSetBlueprint',    label: '🏗️ The Set Blueprint',       desc: 'Set design plans + construction notes' },
                            { key: 'fpTheTechRider',       label: '🔧 The Tech Rider',          desc: 'Full technical requirements document' },
                            { key: 'fpThePromoKit',        label: '📸 The Promo Kit',           desc: 'Press photos, trailer, marketing assets' },
                            { key: 'fpTheHandoverSession', label: '🤝 The Handover Session',    desc: 'Live session with director / creative team' },
                          ].map(({ key, label, desc, locked }) => (
                            <div key={key} className={"flex items-start gap-3 p-3 border " + ((formData as any)[key] ? 'border-brand-pink/40 bg-brand-pink/5' : 'border-white/10')}>
                              <input type="checkbox" id={key} checked={locked ? true : !!(formData as any)[key]}
                                disabled={locked}
                                onChange={e => setFormData(p => ({ ...p, [key]: e.target.checked }))}
                                className="w-4 h-4 accent-brand-pink mt-0.5 flex-shrink-0" />
                              <label htmlFor={key} className={"cursor-pointer " + (locked ? 'opacity-50' : '')}>
                                <span className="font-black uppercase italic text-white text-xs">{label}</span>
                                {locked && <span className="text-[8px] text-brand-yellow/60 ml-2 uppercase">always included</span>}
                                <p className="text-white/30 text-[9px] italic mt-0.5">{desc}</p>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Punch Language + Support */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Punch Language</label>
                          <select name="fpPunchLanguage" value={(formData as any).fpPunchLanguage || 'EN'} onChange={handleInputChange} className={sel}>
                            {['EN','SI','DE','FR','IT','ES','HR','PL','CZ','HU','RO'].map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                          <p className="text-white/20 text-[9px] italic mt-1">Language of all documentation</p>
                        </div>
                        <div className="flex flex-col justify-center gap-2 pt-4">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="fpPunchSupport" checked={!!(formData as any).fpPunchSupport}
                              onChange={e => setFormData(p => ({ ...p, fpPunchSupport: e.target.checked }))}
                              className="w-4 h-4 accent-brand-pink" />
                            <label htmlFor="fpPunchSupport" className="font-black uppercase italic text-white text-xs cursor-pointer">🤝 Punch Support</label>
                          </div>
                          <p className="text-white/20 text-[9px] italic pl-7">Creative team available for buyer onboarding</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CREATIVE DETAILS — always visible, inform the dossier */}
                <div className="space-y-3 pt-2">
                  <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Production Assets Info</p>
                  <div className="border-2 border-white/10 p-4 space-y-3">
                    <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest">Music</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={lbl}>Music Author / Composer</label><input name="musicAuthor" value={formData.musicAuthor} onChange={handleInputChange} className={inp} placeholder="Composer name" /></div>
                      <div><label className={lbl}>Original Music</label>
                        <select name="hasOriginalMusic" value={formData.hasOriginalMusic} onChange={handleInputChange} className={sel}>
                          <option value="false">No — licensed / existing</option>
                          <option value="true">Yes — original composition</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="border-2 border-white/10 p-4 space-y-3">
                    <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest">Video & AV</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={lbl}>Video / AV Author</label><input name="videoAuthor" value={formData.videoAuthor} onChange={handleInputChange} className={inp} placeholder="Video artist name" /></div>
                      <div><label className={lbl}>Has Video Projections</label>
                        <select name="hasVideoProjections" value={formData.hasVideoProjections} onChange={handleInputChange} className={sel}>
                          <option value="false">No</option>
                          <option value="true">Yes — original video</option>
                        </select>
                      </div>
                      {formData.hasVideoProjections === 'true' && (
                        <div className="sm:col-span-2"><label className={lbl}>Video Description</label><input name="videoDescription" value={formData.videoDescription} onChange={handleInputChange} className={inp} placeholder="e.g. 4 back projections, 20min, abstract animations" /></div>
                      )}
                    </div>
                  </div>
                  <div className="border-2 border-white/10 p-4 space-y-3">
                    <p className="text-[9px] font-black uppercase italic text-white/50 tracking-widest">Scenography</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={lbl}>Scenographer</label><input name="scenographer" value={(formData as any).scenographer || ''} onChange={handleInputChange} className={inp} placeholder="Set designer name" /></div>
                      <div><label className={lbl}>Set Available for Licensing</label>
                        <select name="setAvailable" value={(formData as any).setAvailable || 'false'} onChange={handleInputChange} className={sel}>
                          <option value="false">No — buyer builds own set</option>
                          <option value="rent">Yes — available for rent</option>
                          <option value="purchase">Yes — available for purchase</option>
                          <option value="plans">Plans/blueprints only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="border-2 border-white/10 p-4 space-y-3">
                    <p className="text-[9px] font-black uppercase italic text-white/50 tracking-widest">Lighting Design</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={lbl}>Lighting Designer</label><input name="lightingDesigner" value={(formData as any).lightingDesigner || ''} onChange={handleInputChange} className={inp} placeholder="Lighting designer name" /></div>
                      <div><label className={lbl}>Lighting Design Available</label>
                        <select name="lightingDesignAvailable" value={(formData as any).lightingDesignAvailable || 'false'} onChange={handleInputChange} className={sel}>
                          <option value="false">No</option>
                          <option value="cue_sheet">Cue sheet only</option>
                          <option value="full">Full design + cue sheet</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="border-2 border-white/10 p-4 space-y-3">
                    <p className="text-[9px] font-black uppercase italic text-brand-pink tracking-widest">Script</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={lbl}>Script in English</label>
                        <select name="scriptInEnglish" value={formData.scriptInEnglish} onChange={handleInputChange} className={sel}>
                          <option value="false">No</option>
                          <option value="partial">Synopsis only</option>
                          <option value="true">Full script</option>
                        </select>
                      </div>
                      <div><label className={lbl}>Translations Available</label><input name="translationsAvailable" value={formData.translationsAvailable} onChange={handleInputChange} className={inp} placeholder="EN, DE, FR..." /></div>
                      <div><label className={lbl}>Translation Rights</label>
                        <select name="translationRightsIncluded" value={formData.translationRightsIncluded} onChange={handleInputChange} className={sel}>
                          <option value="false">Not included</option>
                          <option value="true">Included</option>
                        </select>
                      </div>
                    </div>
                    <div><label className={lbl}>Script Excerpt / Scenario (3 pages in English)</label><textarea name="scriptScenario" value={formData.scriptScenario} onChange={handleInputChange} rows={4} className={inp} placeholder="Paste a short excerpt or scene description..." /></div>
                  </div>
                </div>


                {/* SCRIPT PACKAGE */}
                <div className="border-t-2 border-white/10 mt-4 pt-4">
                  <p className="text-[9px] font-black uppercase italic text-brand-yellow tracking-widest mb-3">Script Only Package</p>
                <div className={"border-4 p-4 space-y-3 " + (formData.hasScriptPackage ? "border-brand-yellow/50" : "border-white/10")}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="hasScript" checked={!!formData.hasScriptPackage}
                      onChange={e => setFormData(p => ({ ...p, hasScriptPackage: e.target.checked }))}
                      className="w-4 h-4 accent-brand-yellow" />
                    <label htmlFor="hasScript" className="font-black uppercase italic text-white cursor-pointer">📄 The Script — Script Only License</label>
                  </div>
                  <p className="text-white/30 text-xs italic pl-7">Buyer gets the script and produces independently.</p>
                  {formData.hasScriptPackage && (
                    <div className="grid grid-cols-2 gap-3 pl-7">
                      <div>
                        <label className={lbl}>Royalty % *</label>
                        <input type="number" name="scriptRoyaltyPct" value={formData.scriptRoyaltyPct} onChange={handleInputChange} className={inp} placeholder="10" />
                        <p className="text-white/20 text-[9px] italic mt-1">% of gross box office</p>
                      </div>
                      <div>
                        <label className={lbl}>Advance Fee (EUR)</label>
                        <input type="number" name="scriptAdvanceFee" value={formData.scriptAdvanceFee} onChange={handleInputChange} className={inp} placeholder="0" />
                        <p className="text-white/20 text-[9px] italic mt-1">Optional upfront payment</p>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </section>

              {/* 03. MARKET PERFORMANCE */}
              <section className={sec + " shadow-neo-cyan"}>
                <div className="border-b-2 border-white/10 pb-3 mb-2">
                  <h3 className="text-xl font-black uppercase italic text-brand-cyan">03. Market Performance</h3>
                  <p className="text-white/30 text-xs italic mt-0.5">Track record and audience data.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={lbl}>Premiere Date</label><input name="premiereDate" type="date" value={formData.premiereDate} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Premiere Location</label><input name="premiereLocation" value={formData.premiereLocation} onChange={handleInputChange} className={inp} placeholder="Theatre name, City" /></div>
                  <div><label className={lbl}>Total Performances</label><input name="performancesCount" type="number" value={formData.performancesCount} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Total Audience</label><input name="totalAudience" type="number" value={formData.totalAudience} onChange={handleInputChange} className={inp} /></div>
                  <div><label className={lbl}>Locations Played</label><input name="locationsPlayed" value={formData.locationsPlayed} onChange={handleInputChange} className={inp} placeholder="Ljubljana, Berlin, London..." /></div>
                  <div><label className={lbl}>Box Office</label>
                    <select name="boxOfficeIndicator" value={formData.boxOfficeIndicator} onChange={handleInputChange} className={sel}>
                      <option value="High">High — sold out regularly</option>
                      <option value="Medium">Medium — consistent</option>
                      <option value="Emerging">Emerging — early stage</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* 04. RIGHTS */}
              <section className={sec + " shadow-neo-magenta"}>
                <div className="border-b-2 border-white/10 pb-3 mb-2">
                  <h3 className="text-xl font-black uppercase italic text-brand-pink">04. Rights & Identity</h3>
                  <p className="text-white/30 text-xs italic mt-0.5">Ownership and availability.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className={lbl}>Copyright Holder *</label><input name="rightsHolder" value={formData.rightsHolder} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-brand-yellow/40 px-4 py-3 text-brand-yellow font-bold outline-none focus:border-brand-yellow text-sm" /></div>
                  <div><label className={lbl}>Rights Status</label>
                    <select name="rightsStatus" value={formData.rightsStatus} onChange={handleInputChange} className={sel}>
                      <option value="Available">Available</option>
                      <option value="Co-production Only">Co-production Only</option>
                      <option value="Licensed">Licensed</option>
                    </select>
                  </div>
                  <div><label className={lbl}>License Type</label>
                    <select name="licenseType" value={formData.licenseType} onChange={handleInputChange} className={sel}>
                      <option value="License">License</option>
                      <option value="Option">Option</option>
                      <option value="Co-production">Co-production</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Territories Available</label><input name="territoriesAvailable" value={formData.territoriesAvailable} onChange={handleInputChange} className={inp} placeholder="Global, Europe..." /></div>
                  <div><label className={lbl}>Licensed Countries</label><input name="licensedCountries" value={formData.licensedCountries} onChange={handleInputChange} className={inp} placeholder="Already licensed in..." /></div>
                  <div><label className={lbl}>Exclusivity</label>
                    <select name="exclusivityLevel" value={formData.exclusivityLevel} onChange={handleInputChange} className={sel}>
                      <option value="Exclusive">Exclusive per territory</option>
                      <option value="Semi-exclusive">Semi-exclusive</option>
                      <option value="Non-exclusive">Non-exclusive</option>
                    </select>
                  </div>
                </div>
              </section>

            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start">

              {/* POSTER */}
              <div className="bg-brand-surface border-4 border-white p-5 space-y-3 shadow-neo-magenta">
                <p className="text-[9px] font-black uppercase italic text-brand-pink tracking-widest">Show Poster *</p>
                <div className="relative aspect-[2/3] bg-brand-black border-2 border-white/20 overflow-hidden cursor-pointer hover:border-brand-yellow transition-colors"
                  onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-white/20">add_photo_alternate</span>
                      <p className="text-white/20 text-xs font-black uppercase italic">Upload Poster</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-white/20 text-white/40 py-2 font-black uppercase italic text-xs hover:border-white hover:text-white transition-all">
                  {imagePreview ? 'Change Image' : 'Choose Image'}
                </button>
              </div>

              {/* PRODUCTION PHOTOS */}
              <div className="bg-brand-surface border-4 border-white p-5 space-y-3 shadow-neo-cyan">
                <p className="text-[9px] font-black uppercase italic text-brand-cyan tracking-widest">Production Photos</p>
                <p className="text-white/20 text-[9px] italic">Up to 3 photos from the production.</p>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="relative aspect-square bg-brand-black border-2 border-white/20 overflow-hidden cursor-pointer hover:border-brand-cyan transition-colors"
                      onClick={() => photoRefs[i].current?.click()}>
                      {photoPreviews[i] ? (
                        <img src={photoPreviews[i]!} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl text-white/20">add_photo_alternate</span>
                        </div>
                      )}
                      <input ref={photoRefs[i]} type="file" accept="image/*" onChange={handlePhotoChange(i)} className="hidden" />
                    </div>
                  ))}
                </div>
              </div>

              {/* LAUNCH */}
              <button onClick={handleLaunch}
                className="w-full bg-brand-yellow text-black py-5 font-black uppercase italic text-lg border-4 border-black hover:bg-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-neo-yellow">
                SHOWLOAD IT →
              </button>

              <p className="text-white/20 text-[9px] italic text-center">
                By listing you confirm you hold the rights to this show.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
