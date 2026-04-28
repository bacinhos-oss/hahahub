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
    author: '',
    director: '',
    producerName: '',
    rightsHolder: '',
    producerEmail: user?.name ? `${user.name.toLowerCase()}@hahahub.com` : '',
    genre: 'Comedy',
    language: 'English',
    location: '',
    maleRoles: '1',
    femaleRoles: '1',
    duration: '90',
    synopsis: '',
    scriptScenario: '',
    premiereDate: '',
    productionYear: new Date().getFullYear().toString(),
    licenseType: 'License',
    licensingModel: 'Royalty-based',
    exclusivityLevel: 'Exclusive',
    royaltyRange: '8-10%',
    advanceFee: '',
    productionScale: 'Medium',
    isTouringFriendly: 'true',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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

    // Upload image to Supabase Storage if we have a file
    let finalImageUrl = imagePreview || '';
    if (imageFile) {
      try {
        const ext = imageFile.name.split('.').pop();
        const path = `shows/${Date.now()}.${ext}`;
        const { data: uploadData } = await supabase.storage.from('show-images').upload(path, imageFile);
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('show-images').getPublicUrl(path);
          finalImageUrl = urlData.publicUrl;
        }
      } catch (e) {
        // keep base64 preview if storage fails
      }
    }

    const newShow: Show = {
      title: formData.title,
      author: formData.author,
      director: formData.director,
      synopsis: formData.synopsis,
      imageUrl: finalImageUrl,
      genre: formData.genre,
      language: formData.language,
      location: formData.location,
      duration: parseInt(formData.duration),
      maleRoles: parseInt(formData.maleRoles),
      femaleRoles: parseInt(formData.femaleRoles),
      producerName: formData.producerName,
      producerEmail: formData.producerEmail,
      rightsHolder: formData.rightsHolder,
      premiereDate: formData.premiereDate,
      productionYear: parseInt(formData.productionYear),
      licenseType: formData.licenseType,
      licensingModel: formData.licensingModel,
      exclusivityLevel: formData.exclusivityLevel,
      royaltyRange: formData.royaltyRange,
      advanceFee: formData.advanceFee,
      productionScale: formData.productionScale,
      isTouringFriendly: formData.isTouringFriendly === 'true',
      scriptScenario: formData.scriptScenario,
      likesCount: 0,
      viewsCount: 0,
      inquiriesCount: 0,
    } as Show;

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
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-20">
              <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-cyan">
                <h3 className="text-3xl font-black uppercase italic text-brand-cyan mb-10">00. Rights & Identity</h3>
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
                <h3 className="text-3xl font-black uppercase italic text-brand-pink mb-10">01. Creative Engine</h3>
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
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 italic">Origin Market *</label>
                    <input name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-brand-black border-2 border-white/20 px-5 py-4 text-white font-bold uppercase" placeholder="E.G. SLOVENIA, USA..." />
                  </div>
                </div>
              </section>

              <section className="bg-brand-surface border-4 border-white p-10 shadow-neo-magenta">
                <h3 className="text-3xl font-black uppercase italic text-brand-pink mb-10">04. Script Preview</h3>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-brand-yellow mb-2 italic">Public Preview Script Scenario *</label>
                  <textarea name="scriptScenario" value={formData.scriptScenario} onChange={handleInputChange} rows={15} className="w-full bg-brand-black border-2 border-white/10 p-8 text-white font-mono text-sm leading-relaxed outline-none focus:border-brand-yellow"></textarea>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 space-y-12">
              <section className="bg-white text-black p-10 shadow-neo-white sticky top-32">
                <h3 className="text-2xl font-black uppercase italic mb-10 border-b-4 border-black pb-4 text-brand-pink">Commercial Bible</h3>
                <div className="space-y-8">
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-64 border-4 border-dashed border-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-pink overflow-hidden bg-gray-50 group">
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
                </div>
                <div className="mt-12 pt-8 border-t-4 border-black">
                  <button onClick={handleLaunch} className="w-full bg-brand-pink text-white font-black uppercase py-6 border-4 border-black shadow-neo-cyan hover:bg-black transition-all italic tracking-[0.2em] text-xl">
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