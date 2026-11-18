import React, { useState, useRef } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Page, User, Show } from '../types';
import { supabase } from '../lib/supabase';
import Smile from '../components/Smile';
import { ShowFormFields } from '../components/ShowFields';
import { emptyForm, formToDb, missingRequired, requiredChecklist, SHOW_SECTIONS, ShowForm } from '../lib/showFields';

interface UploadPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onUpload: (show: Show) => void;
  userShowCount?: number;
}

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
  const [showMore, setShowMore] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const photoRef0 = useRef<HTMLInputElement>(null);
  const photoRef1 = useRef<HTMLInputElement>(null);
  const photoRef2 = useRef<HTMLInputElement>(null);
  const photoRefs = [photoRef0, photoRef1, photoRef2];
  const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null, null, null]);
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null]);

  const [form, setForm] = useState<ShowForm>(emptyForm);
  const setField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const checklist = requiredChecklist(form, !!imagePreview);
  const doneCount = checklist.filter(c => c.done).length;
  const jump = (id: string) => {
    const sec = SHOW_SECTIONS.find(x => x.id === id);
    const opt = !!sec && !sec.fields.some(f => f.required);
    if (opt && !showMore) setShowMore(true);
    const target = id === 'poster' && window.innerWidth >= 1024 ? 'sec-poster-side' : 'sec-' + id;
    setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), opt && !showMore ? 60 : 0);
  };

  // Poster picker: on phones it sits on top of the form, on desktop in the sidebar.
  const posterCard = (variant: 'top' | 'side') => (
    <div id={variant === 'side' ? 'sec-poster-side' : undefined} className="bg-brand-surface border-2 border-white p-5 space-y-3 scroll-mt-44">
      <p className="text-[9px] font-black uppercase italic text-brand-pink tracking-widest">Show poster *</p>
      <label className={"block cursor-pointer " + (variant === 'top' ? 'flex gap-4 items-center' : '')}>
        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        <div className={"relative bg-brand-black border-2 border-white/20 overflow-hidden hover:border-brand-yellow transition-colors flex-shrink-0 " + (variant === 'top' ? 'w-24 aspect-[2/3]' : 'aspect-[2/3]')}>
          {imagePreview ? (
            <img src={imagePreview} alt="Poster preview" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-3xl text-white/20">add_photo_alternate</span>
              {variant === 'side' && <p className="text-white/20 text-xs font-black uppercase italic">Upload poster</p>}
            </div>
          )}
        </div>
        <div className={variant === 'top' ? 'flex-1 space-y-2' : 'mt-3'}>
          {variant === 'top' && <p className="text-white/50 text-xs italic">The image producers see in the catalog. A vertical poster works best.</p>}
          <span className="block w-full text-center border-2 border-white/20 text-white/60 py-2 font-black uppercase italic text-xs hover:border-white hover:text-white transition-all">
            {imagePreview ? 'Change image' : 'Choose image'}
          </span>
        </div>
      </label>
    </div>
  );

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
    const errors: string[] = missingRequired(form);
    if (!imagePreview) errors.push('Show poster');
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
      ...formToDb(form),
      image_url: finalImageUrl,
      rights_status: 'Available',
      box_office_indicator: 'Emerging',
      production_photos: uploadedPhotos,
      is_produced: true,
      likes_count: 0, views_count: 0, inquiries_count: 0,
      producer_name: user?.name || '',
      producer_email: user?.email || '',
      user_id: user?.id,
    };

    const { data, error } = await supabase.from('shows').insert([newShow]).select().single();
    if (error) {
      console.error('Show upload failed:', error);
      alert(`❌ Upload failed: ${error.message}\n\nYour show was not saved. Please try again or contact info@hahahub.art.`);
      return;
    }
    if (data) {
      onUpload(data as unknown as Show);
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); onNavigate('subscription'); }, 3000);
    }
  };

  if (isSuccess) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="flex justify-center"><Smile height={120} /></div>
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
          <button onClick={() => onNavigate('login')} className="bg-white text-black px-10 py-4 font-black uppercase italic border-2 border-black hover:bg-brand-pink hover:text-white transition-all">
            Upgrade →
          </button>
        </div>
      )}

      <main className="pt-32 pb-24 px-4 md:px-8">
        <div className="max-w-5xl mx-auto space-y-8">

          <header>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none">
              LIST YOUR <span className="text-brand-cyan">SHOW</span>
            </h1>
          </header>

          {/* HOW MUCH TO FILL IN */}
          <div className="border-2 border-white/15 bg-brand-surface p-5 md:p-7 space-y-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-yellow mb-1">Required to publish</p>
                <p className="text-white/70 font-bold italic">These {checklist.length} are enough to list your show. About 5 minutes.</p>
              </div>
              <p className="text-3xl font-black italic text-white whitespace-nowrap">{doneCount}<span className="text-white/30"> / {checklist.length}</span></p>
            </div>
            <div className="h-1.5 bg-white/10"><div className="h-full bg-brand-cyan transition-all" style={{ width: `${(doneCount / checklist.length) * 100}%` }} /></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
              {checklist.map(c => (
                <button key={c.label} type="button" onClick={() => jump(c.section)}
                  className={"flex items-center gap-2 text-left text-xs font-black uppercase italic " + (c.done ? 'text-brand-cyan' : 'text-white/50 hover:text-white')}>
                  <span className={"w-4 h-4 flex-shrink-0 flex items-center justify-center border text-[10px] " + (c.done ? 'bg-brand-cyan border-brand-cyan text-black' : 'border-white/30')}>{c.done ? '✓' : ''}</span>
                  {c.label}
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 pt-5 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:items-center">
              <div className="grid grid-cols-2 border-2 border-white">
                <button type="button" onClick={() => setShowMore(false)}
                  className={"px-5 py-3 text-xs font-black uppercase italic tracking-widest transition-colors " + (!showMore ? 'bg-white text-black' : 'text-white/60 hover:text-white')}>
                  Required only
                </button>
                <button type="button" onClick={() => setShowMore(true)}
                  className={"px-5 py-3 text-xs font-black uppercase italic tracking-widest transition-colors " + (showMore ? 'bg-brand-yellow text-black' : 'text-white/60 hover:text-white')}>
                  + All details
                </button>
              </div>
              <p className="text-white/50 text-xs italic leading-relaxed">
                {showMore
                  ? 'All details are open. Fill in what you know and skip the rest. You can add more later in My Hub.'
                  : 'All details add the creative team, script excerpt, staging and track record. Producers abroad decide faster with them. You can also add them later in My Hub.'}
              </p>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-brand-pink border-2 border-black p-5">
              <p className="font-black uppercase italic mb-2 text-sm">Please fill in:</p>
              <ul className="space-y-1">{validationErrors.map((e, i) => <li key={i} className="text-sm font-bold">• {e}</li>)}</ul>
            </div>
          )}

          {/* SECTION JUMP BAR */}
          <div className="sticky top-[72px] md:top-[88px] z-30 -mx-4 md:mx-0 px-4 md:px-0 py-2 bg-brand-black/95 backdrop-blur border-y border-white/10">
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
              <button type="button" onClick={() => jump('poster')} className="lg:hidden px-3 py-1.5 text-[10px] font-black uppercase italic tracking-widest border border-brand-pink/60 text-brand-pink">Poster</button>
              {[...SHOW_SECTIONS.map(x => ({ id: x.id, num: x.num, title: x.title, opt: !x.fields.some(f => f.required) })), { id: 'packages', num: '07', title: 'Packages', opt: false }].map(x => (
                <button key={x.id} type="button" onClick={() => jump(x.id)}
                  className={"px-3 py-1.5 text-[10px] font-black uppercase italic tracking-widest border transition-colors " + (x.opt && !showMore ? 'border-white/10 text-white/30 hover:text-white' : 'border-white/25 text-white/70 hover:border-brand-cyan hover:text-brand-cyan')}>
                  {x.num} {x.title}{x.opt && !showMore ? ' +' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={"lg:col-span-8 space-y-6 " + (showMore ? "" : "[&_.opt]:hidden")}>

              <div id="sec-poster" className="lg:hidden scroll-mt-44">{posterCard('top')}</div>

              <ShowFormFields form={form} set={setField} />

              {!showMore && (
                <button type="button" onClick={() => setShowMore(true)}
                  className="w-full border-2 border-dashed border-brand-yellow/60 text-brand-yellow px-6 py-5 text-sm font-black uppercase italic tracking-widest hover:bg-brand-yellow hover:text-black transition-colors">
                  + Add all details: creative team, script, track record
                </button>
              )}

            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-40 lg:self-start">

              <div className="hidden lg:block">{posterCard('side')}</div>

              {/* PRODUCTION PHOTOS */}
              <div className="bg-brand-surface border-2 border-white p-5 space-y-3 ">
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

              {/* YOUR SHOW STAYS YOURS */}
              <div className="border border-brand-cyan/40 p-5">
                <p className="text-[10px] font-black uppercase italic tracking-widest text-brand-cyan mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">verified_user</span> Your show stays yours
                </p>
                <ul className="space-y-2 text-white/60 text-xs font-bold italic leading-relaxed">
                  <li>You share only a short excerpt, never the full script.</li>
                  <li>The excerpt, the creators and where the show has played are seen only by Verified Producers.</li>
                  <li>You edit or remove the show anytime in My Hub.</li>
                  <li>Every licence is agreed directly between you and the other producer.</li>
                  <li>Your data is stored in the EU and never sold to third parties.</li>
                </ul>
              </div>

              {/* LAUNCH */}
              <button onClick={handleLaunch}
                className="w-full bg-white text-black py-5 font-black uppercase italic text-lg border-2 border-black hover:bg-brand-pink hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ">
                SHOWLOAD IT →
              </button>
              {doneCount < checklist.length && (
                <p className="text-brand-pink text-[10px] font-black uppercase italic tracking-widest text-center">
                  {checklist.length - doneCount} required {checklist.length - doneCount === 1 ? 'item' : 'items'} missing
                </p>
              )}

              <p className="text-white/20 text-[9px] italic text-center">
                By listing you confirm you hold the rights to this show.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default UploadPage;
