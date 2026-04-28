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

const UploadPage: React.FC<UploadPageProps> = ({ onNavigate, onLogout, user, onUpload }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const [formData, setFormData] = useState({
    title: '',
    originalTitle: '',
    author: '',
    director: '',
    directorNotes: '',
    originalProductionSolutions: '',
    producerName: '',
    rightsHolder: '',
    producerEmail: user?.name ? `${user.name.toLowerCase()}@hahahub.com` : '',
    isDirectorMandatory: 'false',
    creativeTeamAvailability: 'Optional',
    genre: 'Comedy',
    subgenre: '',
    language: 'English',
    location: '',
    maleRoles: '1',
    femaleRoles: '1',
    canMergeRoles: 'false',
    duration: '90',
    hasIntermission: 'true',
    productionScale: 'Medium',
    isTouringFriendly: 'true',
    technicalComplexity: 'Medium',
    costumeComplexity: 'Medium',
    setComplexity: 'Medium',
    adaptationFlexibility: 'Medium',
    scalabilityNotes: '',
    techStaffLighting: '1',
    techStaffSound: '1',
    techStaffPrompter: '0',
    techStaffStagehands: '1',
    techStaffOther: '',
    premiereLocation: '',
    buyoutLocations: '',
    licensedCountries: '',
    riskProfile: 'Proven hit',
    breakEvenPerformances: '40',
    breakEvenThreshold: 'Medium',
    translationsAvailable: '',
    translationRightsIncluded: 'true',
    isSponsorFriendly: 'true',
    isGroupSalesFriendly: 'true',
    rightsClearingSpeed: 'Medium',
    exclusivityLevel: 'Exclusive',
    licenseType: 'License',
    licensingModel: 'Royalty-based',
    royaltyRange: '8-10%',
    advanceFee: '',
    productionYear: new Date().getFullYear().toString(),
    performancesCount: '0',
    totalAudience: '0',
    premiereDate: '',
    synopsis: '',
    scriptExcerpt: '',
    scriptScenario: '',
    audienceProfile: '',
    awards: '',
    boxOfficeIndicator: 'Emerging',
    budgetRange: 'Medium'
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

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleLaunch = async () => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Production Title');
    if (!formData.author.trim()) errors.push('Author/Playwright');
    if (!formData.rightsHolder.trim()) errors.push('Copyright Holder');
    if (!formData.location.trim()) errors.push('Origin Market');
    if (!formData.synopsis.trim()) errors.push('Synopsis');
    if (!formData.scriptScenario.trim()) errors.push('Script Scenario');
    if (!imagePreview) errors.push('Poster Visual');

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const newShow: Show = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      maleRoles: parseInt(formData.maleRoles),
      femaleRoles: parseInt(formData.femaleRoles),
      duration: parseInt(formData.duration),
      techStaffLighting: parseInt(formData.techStaffLighting),
      techStaffSound: parseInt(formData.techStaffSound),
      techStaffPrompter: parseInt(formData.techStaffPrompter),
      techStaffStagehands: parseInt(formData.techStaffStagehands),
      performancesCount: parseInt(formData.performancesCount),
      totalAudience: parseInt(formData.totalAudience),
      premiereDate: formData.premiereDate,
      locationsPlayed: '',
      boxOfficeIndicator: formData.boxOfficeIndicator as any,
      awards: '',
      audienceProfile: '',
      productionYear: parseInt(formData.productionYear),
      breakEvenPerformances: parseInt(formData.breakEvenPerformances),
      isDirectorMandatory: formData.isDirectorMandatory === 'true',
      canMergeRoles: formData.canMergeRoles === 'true',
      hasIntermission: formData.hasIntermission === 'true',
      isTouringFriendly: formData.isTouringFriendly === 'true',
      translationRightsIncluded: formData.translationRightsIncluded === 'true',
      isSponsorFriendly: formData.isSponsorFriendly === 'true',
      isGroupSalesFriendly: formData.isGroupSalesFriendly === 'true',
      transparencyScore: 92,
      likesCount: 0,
      viewsCount: 0,
      inquiriesCount: 0,
      imageUrl: imagePreview || '',
      productionPhotos: [],
      rightsStatus: 'Available',
      territoriesAvailable: 'Global',
      programmingCompatibility: ['Commercial'],
      stageType: 'Main Stage',
      humorType: 'Universal'
    } as Show;

    // Upload image to Supabase Storage if we have a file
    if (imageFile) {
      try {
        const ext = imageFile.name.split('.').pop();
        const path = `shows/${Date.now()}.${ext}`;
        const { data: uploadData } = await supabase.storage.from('show-images').upload(path, imageFile);
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('show-images').getPublicUrl(path);
          newShow.imageUrl = urlData.publicUrl;
        }
      } catch (e) {
        // keep base64 preview if storage fails
      }
    }

    // Save to Supabase database (basic fields only)
    const { error } = await supabase.from('shows').insert([{
      id: newShow.id,
      user_id: user?.id,
      title: newShow.title,
      author: newShow.author,
      director: newShow.director,
      synopsis: newShow.synopsis,
      image_url: newShow.imageUrl,
      genre: newShow.genre,
      language: newShow.language,
      location: newShow.location,
      duration: newShow.duration,
      male_roles: newShow.maleRoles,
      female_roles: newShow.femaleRoles,
      producer_name: newShow.producerName,
      producer_email: newShow.producerEmail,
      rights_holder: newShow.rightsHolder,
      premiere_date: newShow.premiereDate,
      production_year: newShow.productionYear,
      license_type: newShow.licenseType,
      script_scenario: newShow.scriptScenario,
      likes_count: 0,
      views_count: 0,
      inquiries_count: 0
    }]);

    if (error) {
      alert('Error uploading: ' + error.message);
      return;
    }

    // Update user's uploaded shows
    if (user?.id) {
      await supabase.from('profiles').update({
        uploaded_show_ids: [...(user.uploadedShowIds || []), newShow.id]
      }).eq('id', user.id);
    }

    onUpload(newShow);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onNavigate('discovery');
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-black overflow-y-auto text-white">
      <Navigation onNavigate={onNavigate} onLogout={onLogout} activePage="upload" user={user} />
     
      <main className="pt-40 pb-24 px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <header className="mb-20">
            <h1 className="text-7xl md:text-[140px] font-black uppercase italic leading-[0.8] tracking-tighter">
              DEPLOY <span className="text-brand-pink">ASSET</span>
            </h1>
            <p className="text-white/40 italic uppercase text-xs mt-8 tracking-[0.5em]">Global Listing Registry / Pro Version 3.2</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-20">
               
               <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-cyan">
                  <h3 className="text-3xl font-black uppercase italic text-brand-cyan mb-10 border-b-4 border-white/10 pb-4">00. Rights & Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Production Company *</label>
                        <input name="producerName" value={formData.producerName} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold uppercase focus:border-brand-cyan outline-none" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Copyright Holder Name *</label>
                        <input name="rightsHolder" value={formData.rightsHolder} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-brand-yellow font-bold uppercase focus:border-brand-yellow outline-none" />
                     </div>
                  </div>
               </section>

               <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-magenta">
                  <h3 className="text-3xl font-black uppercase italic text-brand-pink mb-10 border-b-4 border-white/10 pb-4">01. Creative Engine</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="col-span-2">
                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Production Title *</label>
                        <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-brand-black border-4 border-white px-6 py-5 text-white font-bold uppercase text-2xl focus:border-brand-yellow outline-none" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Author / Playwright *</label>
                        <input name="author" value={formData.author} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold outline-none" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Main Genre *</label>
                        <input name="genre" value={formData.genre} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black italic focus:border-brand-yellow outline-none uppercase" />
                     </div>
                     <div className="col-span-2">
                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Synopsis *</label>
                        <textarea name="synopsis" value={formData.synopsis} onChange={handleInputChange} rows={5} className="w-full bg-brand-black border-2 border-white/10 p-6 text-white text-xl italic leading-relaxed outline-none focus:border-brand-pink"></textarea>
                     </div>
                     <div className="col-span-2">
                        <label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Director's Vision Notes</label>
                        <textarea name="directorNotes" value={formData.directorNotes} onChange={handleInputChange} rows={3} className="w-full bg-brand-black border-2 border-white/10 p-5 text-white italic outline-none focus:border-brand-pink" placeholder="Style, interpretation, staging direction..."></textarea>
                     </div>
                     <div className="col-span-2">
                        <label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Original Staging Solutions</label>
                        <textarea name="originalProductionSolutions" value={formData.originalProductionSolutions} onChange={handleInputChange} rows={3} className="w-full bg-brand-black border-2 border-white/10 p-5 text-white italic outline-none focus:border-brand-yellow" placeholder="Describe unique technical or creative staging requirements..."></textarea>
                     </div>
                  </div>
               </section>

               <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-yellow">
                  <h3 className="text-3xl font-black uppercase italic text-brand-yellow mb-10 border-b-4 border-white/10 pb-4">02. Cast & Tech</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Male Cast</label>
                        <input name="maleRoles" type="number" value={formData.maleRoles} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Female Cast</label>
                        <input name="femaleRoles" type="number" value={formData.femaleRoles} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Production Scale</label>
                        <select name="productionScale" value={formData.productionScale} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white text-xs font-black uppercase italic">
                           <option value="Small">Small</option>
                           <option value="Medium">Medium</option>
                           <option value="Large">Large</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-cyan mb-2 italic">Touring Friendly</label>
                        <select name="isTouringFriendly" value={formData.isTouringFriendly} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white text-xs font-black uppercase italic">
                           <option value="true">YES</option>
                           <option value="false">NO</option>
                        </select>
                     </div>
                     
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Costume Complexity</label>
                        <select name="costumeComplexity" value={formData.costumeComplexity} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white text-xs font-black uppercase italic">
                           <option value="Low">Low</option>
                           <option value="Medium">Medium</option>
                           <option value="High">High</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-cyan mb-2 italic">Set Complexity</label>
                        <select name="setComplexity" value={formData.setComplexity} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white text-xs font-black uppercase italic">
                           <option value="Low">Low</option>
                           <option value="Medium">Medium</option>
                           <option value="High">High</option>
                        </select>
                     </div>
                     
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-cyan mb-2 italic">Lighting Staff</label>
                        <input name="techStaffLighting" type="number" value={formData.techStaffLighting} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Sound Staff</label>
                        <input name="techStaffSound" type="number" value={formData.techStaffSound} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Stagehands</label>
                        <input name="techStaffStagehands" type="number" value={formData.techStaffStagehands} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-white mb-2 italic">Prompter</label>
                        <input name="techStaffPrompter" type="number" value={formData.techStaffPrompter} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" />
                     </div>

                     <div className="col-span-2">
                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Duration (Min) *</label>
                        <input name="duration" type="number" value={formData.duration} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" />
                     </div>
                     <div className="col-span-2">
                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Origin Market *</label>
                        <input name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold uppercase" placeholder="E.G. SLOVENIA, USA..." />
                     </div>
                  </div>
               </section>

               <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-cyan">
                  <h3 className="text-3xl font-black uppercase italic text-brand-cyan mb-10 border-b-4 border-white/10 pb-4">03. Market Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Premiere Date</label>
                        <input name="premiereDate" type="date" value={formData.premiereDate} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold uppercase outline-none focus:border-brand-yellow" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-cyan mb-2 italic">Total Performances</label>
                        <input name="performancesCount" type="number" value={formData.performancesCount} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-pink mb-2 italic">Total Audience</label>
                        <input name="totalAudience" type="number" value={formData.totalAudience} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-black text-xl" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Box Office Indicator</label>
                        <select name="boxOfficeIndicator" value={formData.boxOfficeIndicator} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white text-xs font-black uppercase italic">
                           <option value="High">High</option>
                           <option value="Medium">Medium</option>
                           <option value="Emerging">Emerging</option>
                        </select>
                     </div>
                  </div>
               </section>

               <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-magenta">
                  <h3 className="text-3xl font-black uppercase italic text-brand-pink mb-10 border-b-4 border-white/10 pb-4">04. Script Preview</h3>
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic tracking-widest font-black uppercase">Public Preview Script Scenario (3 Pages) *</label>
                     <textarea name="scriptScenario" value={formData.scriptScenario} onChange={handleInputChange} rows={15} className="w-full bg-brand-black border-2 border-white/10 p-8 text-white font-mono text-sm leading-relaxed outline-none focus:border-brand-yellow"></textarea>
                  </div>
               </section>

               <div className="bg-brand-pink/10 border-4 border-brand-pink p-8 text-center shadow-neo-yellow">
                  <span className="material-symbols-outlined text-brand-pink text-5xl mb-4">gavel</span>
                  <p className="text-lg font-black uppercase italic tracking-widest text-white leading-tight">
                    The producer or author must be the holder of the copyrights; otherwise, legal complications may arise!
                  </p>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-12">
               <section className="bg-white text-black p-10 shadow-neo-white sticky top-32">
                  <h3 className="text-2xl font-black uppercase italic mb-10 border-b-4 border-black pb-4 leading-none text-brand-pink">Commercial Bible</h3>
                  <div className="space-y-8">
                     <div
                       onClick={() => fileInputRef.current?.click()}
                       className="w-full h-64 border-4 border-dashed border-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-pink overflow-hidden bg-gray-50 group"
                     >
                        {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-black/10 text-6xl group-hover:text-brand-pink">add_a_photo</span>}
                        <p className="mt-2 text-[8px] font-black uppercase text-gray-400">Poster Visual *</p>
                     </div>
                     <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />

                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 italic">License Type</label>
                        <select name="licenseType" value={formData.licenseType} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-black px-4 py-3 text-xs font-black uppercase italic">
                           <option value="License">License</option>
                           <option value="Option">Option</option>
                           <option value="Co-production">Co-production</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 italic">Licensing Model</label>
                        <select name="licensingModel" value={formData.licensingModel} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-black px-4 py-3 text-xs font-black uppercase italic">
                           <option value="Royalty-based">Royalty-based</option>
                           <option value="Flat fee">Flat fee</option>
                           <option value="Hybrid">Hybrid</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 italic">Royalty Range</label>
                        <input name="royaltyRange" value={formData.royaltyRange} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-black px-4 py-3 text-sm font-black italic" placeholder="8-10%" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 italic">Advance Fee</label>
                        <input name="advanceFee" value={formData.advanceFee} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-black px-4 py-3 text-sm font-black italic" placeholder="€0" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 italic">Exclusivity Level</label>
                        <select name="exclusivityLevel" value={formData.exclusivityLevel} onChange={handleInputChange} className="w-full bg-gray-100 border-2 border-black px-4 py-3 text-xs font-black uppercase italic">
                           <option value="Exclusive">Exclusive</option>
                           <option value="Semi-exclusive">Semi-exclusive</option>
                           <option value="Non-exclusive">Non-exclusive</option>
                        </select>
                     </div>
                  </div>

                  <div className="mt-12 pt-8 border-t-4 border-black">
                     <button
                        onClick={handleLaunch}
                        className="w-full bg-brand-pink text-white font-black uppercase py-6 border-4 border-black shadow-neo-cyan hover:bg-black transition-all italic tracking-[0.2em] text-xl"
                      >
                        Deploy Asset
                      </button>
                  </div>
               </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;