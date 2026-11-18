import { ShowFormFields } from '../components/ShowFields';
import { formFromShow, formToDb, missingRequired, ShowForm } from '../lib/showFields';
import { mapShow } from '../lib/mapShow';
import React, { useState, useMemo, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import ProducerStudio from './ProducerStudio';
import { Badge, getProfileBadges } from '../components/Badge';
import DealsPipelinePage from './DealsPipelinePage';
import Smile from '../components/Smile';
import { Page, User, Show } from '../types';
import { canSeeVerified, VerifiedLock } from '../components/Mascot';

interface SubscriptionPageProps {
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
  user?: User;
  onToggleFavorite: (id: string) => void;
  shows: Show[];
  onDeleteShow: (id: string) => void;
  onUpdateShow: (show: Show) => void;
}

const CONTRACT_TEMPLATES = [
  {
    title: 'Standard Licensing Agreement', tag: 'Essential', icon: 'description', color: 'brand-cyan',
    desc: 'Basic template for granting performance rights to a foreign producer. Covers territory, duration, royalties and exclusivity.',
    content: `THEATRICAL LICENSING AGREEMENT

This Agreement is entered into as of [DATE] between:

LICENSOR: [Name/Company], hereinafter "Rights Holder"
Address: [Address], [Country] | Email: [Email]

LICENSEE: [Name/Company], hereinafter "Producer"  
Address: [Address], [Country] | Email: [Email]

1. GRANT OF RIGHTS
The Rights Holder grants the Producer a license to produce and perform "[SHOW TITLE]" under:
Territory: [Country/Region] | Language: [Language]
Duration: [START DATE] to [END DATE] | Max Performances: [NUMBER]

2. FINANCIAL TERMS
Royalty: [X] pct of gross box office per performance
Minimum Guarantee: EUR [AMOUNT] per performance
Advance Payment: EUR [AMOUNT] (non-refundable, due upon signing)
Payment: Within 30 days after each performance

3. ARTISTIC REQUIREMENTS
- Present the Work substantially as written
- No material changes without written consent
- Credit original author and production company in all materials
- Submit all marketing materials for approval prior to publication

4. CREDITS
All programs, posters, and advertising must include:
"[SHOW TITLE] is presented by arrangement with [RIGHTS HOLDER NAME]"
"Originally produced by [ORIGINAL PRODUCTION COMPANY]"

5. TERMINATION
Either party may terminate with 30 days written notice for material breach uncured within 14 days.

6. GOVERNING LAW: Laws of [COUNTRY]

Rights Holder: _________________________ Date: _________
Producer: _________________________ Date: _________`
  },
  {
    title: 'Option Agreement', tag: 'First Step', icon: 'timer', color: 'brand-pink',
    desc: 'Grants a producer exclusive rights to negotiate a full license within a set period — standard first step in any deal.',
    content: `THEATRICAL OPTION AGREEMENT

This Option Agreement is made as of [DATE] between:
RIGHTS HOLDER: [Name/Company]
PRODUCER: [Name/Company]
WORK: "[SHOW TITLE]" written by [AUTHOR]

1. OPTION GRANT
For EUR [OPTION FEE] (receipt acknowledged), Rights Holder grants Producer an exclusive option to negotiate and execute a full Licensing Agreement.

2. OPTION PERIOD
Valid for [NUMBER] months from signing.
Extension: [NUMBER] additional months upon payment of EUR [EXTENSION FEE].

3. OPTION FEE
EUR [AMOUNT] — non-refundable, applicable toward advance if full license executed.

4. PRODUCER'S RIGHTS DURING OPTION
- Develop production plans and approach venues
- Apply for grants and funding
- Announce production as "in development"

5. EXCLUSIVITY
Rights Holder will not grant any other producer rights in [TERRITORY] during the option period.

6. EXPIRATION
If not exercised within the option period, all rights revert to Rights Holder.

Rights Holder: _________________________ Date: _________
Producer: _________________________ Date: _________`
  },
  {
    title: 'Co-Production Agreement', tag: 'Popular', icon: 'handshake', color: 'brand-yellow',
    desc: 'Framework for joint productions between two or more producers across different territories.',
    content: `CO-PRODUCTION AGREEMENT

This Agreement is entered into as of [DATE] between:
CO-PRODUCER A: [Name/Company], [Country]
CO-PRODUCER B: [Name/Company], [Country]
PRODUCTION: "[SHOW TITLE]"

1. FINANCIAL CONTRIBUTIONS
Co-Producer A: [X] pct = EUR [AMOUNT]
Co-Producer B: [X] pct = EUR [AMOUNT]
Total Budget: EUR [TOTAL AMOUNT]

2. REVENUE SHARING (after all production costs)
Co-Producer A: [X] pct | Co-Producer B: [X] pct

3. CREATIVE RESPONSIBILITIES
Co-Producer A: [e.g., artistic direction, casting, script]
Co-Producer B: [e.g., venue, local marketing, technical]

4. TERRITORIES
Co-Producer A: [TERRITORY A] | Co-Producer B: [TERRITORY B]
Joint decisions required for all other territories.

5. CREDITS
All materials: "A co-production by [COMPANY A] and [COMPANY B]"
Equal and simultaneous billing.

6. DECISION MAKING
Major decisions require written consent of both parties.

7. DISPUTE RESOLUTION
Good faith negotiation → Mediation → ICC Arbitration.

Co-Producer A: _________________________ Date: _________
Co-Producer B: _________________________ Date: _________`
  },
  {
    title: 'Translation Rights Agreement', tag: 'Useful', icon: 'translate', color: 'brand-cyan',
    desc: 'Covers the rights to translate and adapt a script into another language for local production.',
    content: `TRANSLATION RIGHTS AGREEMENT

Made as of [DATE] between:
RIGHTS HOLDER: [Name/Company]
PRODUCER: [Name/Company]
ORIGINAL WORK: "[ORIGINAL TITLE]" by [AUTHOR] in [ORIGINAL LANGUAGE]

1. GRANT OF RIGHTS
Rights Holder grants Producer the right to commission and use a [TARGET LANGUAGE] translation for theatrical production in [TERRITORY].

2. TRANSLATION
Translator: [NAME] (approved by Rights Holder)
Translator fee: EUR [AMOUNT]

3. OWNERSHIP
Translation jointly owned by both parties.
Neither may use it without the other's written consent.

4. FINANCIAL TERMS
Translation royalty: [X] pct of gross box office
Translator royalty: [X] pct (included or additional)

5. QUALITY APPROVAL
Rights Holder may review and approve final translation before production.

6. CREDITS
"[ORIGINAL TITLE] by [ORIGINAL AUTHOR]"
"[TARGET LANGUAGE] translation by [TRANSLATOR NAME]"

7. REVERSION
If not produced within [NUMBER] months, translation rights revert to Rights Holder.

Rights Holder: _________________________ Date: _________
Producer: _________________________ Date: _________`
  },
  {
    title: 'Touring Rights Agreement', tag: 'Useful', icon: 'tour', color: 'brand-yellow',
    desc: 'Specific terms for productions that will tour across multiple venues or territories.',
    content: `TOURING RIGHTS AGREEMENT

Made as of [DATE] between:
RIGHTS HOLDER: [Name/Company]
TOURING PRODUCER: [Name/Company]
WORK: "[SHOW TITLE]"

1. APPROVED TOUR VENUES
1. [VENUE/CITY], [COUNTRY] — [FROM] to [TO]
2. [VENUE/CITY], [COUNTRY] — [FROM] to [TO]
3. [VENUE/CITY], [COUNTRY] — [FROM] to [TO]
Additional venues require written approval.

2. FINANCIAL TERMS
Royalty: [X] pct of gross box office per venue
Minimum per venue: EUR [AMOUNT]
Settlement: Within 14 days after final performance at each venue.

3. PRODUCTION STANDARDS
- Maintain artistic standards of the approved production
- No principal cast substitution without written approval

4. INSURANCE
Comprehensive general liability: min EUR [AMOUNT] per occurrence.
Rights Holder named as additional insured.

5. REPORTING
Box office reports due within 7 days of final performance at each venue.

Rights Holder: _________________________ Date: _________
Touring Producer: _________________________ Date: _________`
  },
  {
    title: 'Letter of Intent (LOI)', tag: 'First Step', icon: 'mail', color: 'brand-pink',
    desc: 'Non-binding document to initiate formal negotiations — signals serious interest before full contract.',
    content: `LETTER OF INTENT

[DATE]

To: [RIGHTS HOLDER NAME]
From: [PRODUCER NAME / COMPANY]
Re: Expression of Interest — "[SHOW TITLE]"

Dear [RIGHTS HOLDER NAME],

[PRODUCER COMPANY] ("Producer") expresses formal interest in licensing "[SHOW TITLE]" by [AUTHOR].

PROPOSED TERMS:
Territory: [COUNTRY/REGION] | Language: [LANGUAGE]
Planned Premiere: [APPROXIMATE DATE]
Estimated Performances: [NUMBER]
Proposed Venue: [VENUE]

Financial Proposal:
- Royalty: [X] pct of gross box office
- Advance: EUR [AMOUNT]
- Minimum guarantee: EUR [AMOUNT] per performance

Producer Background:
[BRIEF DESCRIPTION OF COMPANY AND TRACK RECORD]

NON-BINDING NATURE:
This LOI is a non-binding expression of intent. Neither party is legally obligated until a formal agreement is signed.

NEXT STEPS: We propose a call on [DATE] to discuss terms.

Sincerely,
[PRODUCER NAME] | [TITLE] | [COMPANY] | [EMAIL] | [PHONE]`
  },
]

const downloadContract = (title: string, content: string) => {
  const element = document.createElement('a')
  const file = new Blob([content], { type: 'text/plain' })
  element.href = URL.createObjectURL(file)
  element.download = title.replace(/[^a-z0-9]/gi, '_') + '_HAHAHUB_Template.txt'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}


const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onNavigate, onLogout, user, onToggleFavorite, shows, onDeleteShow, onUpdateShow }) => {
  const [manageShow, setManageShow] = useState<Show | null>(null);
  const [editForm, setEditForm] = useState<Partial<Show>>({});
  const [pendingPosterFile, setPendingPosterFile] = useState<File | null>(null);
  const [editPhotoPreviews, setEditPhotoPreviews] = useState<(string | null)[]>([null, null, null]);
  const editPhotoRef0 = React.useRef<HTMLInputElement>(null);
  const editPhotoRef1 = React.useRef<HTMLInputElement>(null);
  const editPhotoRef2 = React.useRef<HTMLInputElement>(null);
  const editPhotoRefs = [editPhotoRef0, editPhotoRef1, editPhotoRef2];
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'studio' | 'assets' | 'profile'>('studio');
  const [studioTab, setStudioTab] = useState<'pipeline' | 'royalties' | 'incoming' | 'analytics' | 'contracts' | 'calculator' | 'contacts'>('pipeline');
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [myStats, setMyStats] = useState({ views: 0, likes: 0, inquiries: 0 });
  const [catalogAvg, setCatalogAvg] = useState({ views: 0, likes: 0, inquiries: 0 });
  const [shortlistCounts, setShortlistCounts] = useState<Record<string, number>>({});
  const [inquiryStatuses, setInquiryStatuses] = useState<Record<string, string>>({});
  const [inquiryNotes, setInquiryNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({ bio: '', website: '', location_city: '', festivals: '', avatar_url: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [realStats, setRealStats] = useState({ totalViews: 0, totalInquiries: 0, totalLikes: 0 });
  const [inquiries, setInquiries] = useState<any[]>([]);
  const verifyKey = `hh_verify_requested_${(user as any)?.id || ''}`;
  const [verifyRequested, setVerifyRequested] = useState<boolean>(() => {
    try { return localStorage.getItem(verifyKey) === '1'; } catch { return false; }
  });
  const [verifySending, setVerifySending] = useState(false);
  const requestVerification = async () => {
    if (!user) return;
    setVerifySending(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          to: 'info@hahahub.art',
          data: {
            feedbackType: 'verify',
            message: `${user.name} (${user.email}) asks to be verified.\nShows listed: ${userUploads.length}\nProfile: https://hahahub.art/#producer`,
            url: window.location.href,
            ts: new Date().toISOString(),
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setVerifyRequested(true);
        try { localStorage.setItem(verifyKey, '1'); } catch { /* ignore */ }
      } else {
        alert('Could not send the request. Please email info@hahahub.art.');
      }
    } catch {
      alert('Could not send the request. Please email info@hahahub.art.');
    }
    setVerifySending(false);
  };
  const welcomeKey = `hh_welcome_dismissed_${(user as any)?.id || ''}`;
  const [welcomeDismissed, setWelcomeDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem(welcomeKey) === '1'; } catch { return false; }
  });
  const dismissWelcome = () => {
    setWelcomeDismissed(true);
    try { localStorage.setItem(welcomeKey, '1'); } catch { /* ignore */ }
  };
  const [sentInquiries, setSentInquiries] = useState<any[]>([]);
  const [laffRoyaltyReports, setLaffRoyaltyReports] = useState<any[]>([]);
  const [laffIncomingReports, setLaffIncomingReports] = useState<any[]>([]);
  const [laffNewReport, setLaffNewReport] = useState({ date: '', show: '', venue: '', tickets: '', price: '', royaltyPct: '', notes: '' });
  const [laffReportSaved, setLaffReportSaved] = useState(false);
  const [laffLicensedShows, setLaffLicensedShows] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [inquiryView, setInquiryView] = useState<'received' | 'sent'>('received');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [dealInquiry, setDealInquiry] = useState<any | null>(null);
  const [dealForm, setDealForm] = useState({ royalty_pct: '', years: '', territory: '', performances: '', notes: '', signed_date: new Date().toISOString().split('T')[0] });
  const [dealSaved, setDealSaved] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [tickledToast, setTickledToast] = useState<{show: boolean, showTitle: string}>({show: false, showTitle: ''});

  // Royalty Calculator state
  const [calcTicketPrice, setCalcTicketPrice] = useState(25);
  const [calcSeats, setCalcSeats] = useState(200);
  const [calcOccupancy, setCalcOccupancy] = useState(75);
  const [calcPerformances, setCalcPerformances] = useState(10);
  const [calcRoyalty, setCalcRoyalty] = useState(8);
  const calcGrossPerShow = calcTicketPrice * calcSeats * (calcOccupancy / 100);
  const calcTotalGross = calcGrossPerShow * calcPerformances;
  const calcTotalRoyalty = calcTotalGross * (calcRoyalty / 100);
  const calcROI = 99; // annual membership cost
  const calcMultiplier = calcTotalRoyalty > 0 ? (calcTotalRoyalty / calcROI).toFixed(1) : '0';

  useEffect(() => {
    if (user?.id) {
      // Load everything in parallel
      Promise.all([loadMyRealStats(), loadInquiries(), loadDeals(), loadLaffRoyalties()]);
      // Load analytics for ROAR/Admin
      if ((user as any)?.plan === 'roar' || (user as any)?.isAdmin) {
        // My shows analytics
        supabase.from('shows')
          .select('id, title, views_count, likes_count, inquiries_count, location, genre, production_year, licensed_countries')
          .eq('user_id', user.id)
          .then(({ data }) => {
            if (data && data.length > 0) setAnalyticsData(data);
          });
        // Catalog average for benchmarking
        supabase.from('shows')
          .select('views_count, likes_count, inquiries_count')
          .then(({ data }) => {
            if (data && data.length > 0) {
              const avg = {
                views: Math.round(data.reduce((s, x) => s + (x.views_count || 0), 0) / data.length),
                likes: Math.round(data.reduce((s, x) => s + (x.likes_count || 0), 0) / data.length),
                inquiries: Math.round(data.reduce((s, x) => s + (x.inquiries_count || 0), 0) / data.length),
              };
              setCatalogAvg(avg);
            }
          });
        // Shortlist counts — how many producers favorited each show
        supabase.from('profiles')
          .select('favorites')
          .then(({ data }) => {
            if (data) {
              const counts: Record<string, number> = {};
              data.forEach((p: any) => {
                (p.favorites || []).forEach((id: string) => {
                  counts[id] = (counts[id] || 0) + 1;
                });
              });
              setShortlistCounts(counts);
            }
          });
      }
      supabase.from('profiles').select('bio, website, location_city, festivals, avatar_url').eq('id', user.id).maybeSingle().then(({ data }) => {
        if (data) setProfileForm({ bio: data.bio || '', website: data.website || '', location_city: data.location_city || '', festivals: data.festivals || '', avatar_url: data.avatar_url || '' });
      });
    }
  }, [user?.id]);

  const loadLaffRoyalties = async () => {
    if (!user?.id) return;
    // My logged reports (as buyer)
    const { data: myReports } = await supabase.from('royalty_reports')
      .select('*').eq('buyer_id', user.id).order('date', { ascending: false });
    if (myReports) setLaffRoyaltyReports(myReports);
    // Incoming reports on my shows (as seller)
    const myShowIds = shows.filter((s: any) => s.user_id === user.id).map((s: any) => s.id);
    if (myShowIds.length > 0) {
      const { data: incoming } = await supabase.from('royalty_reports')
        .select('*').in('show_id', myShowIds).order('date', { ascending: false });
      if (incoming) setLaffIncomingReports(incoming);
    }
    // Licensed shows from deals
    const { data: deals } = await supabase.from('deals')
      .select('show_title, royalty_pct, show_id').eq('buyer_email', user.email);
    if (deals) setLaffLicensedShows(deals);
  };

  const loadDeals = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('deals')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setDeals(data);
  };

  const loadMyRealStats = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('shows')
      .select('views_count, likes_count, inquiries_count')
      .eq('user_id', user.id);
    if (data && data.length > 0) {
      const views = data.reduce((s, x) => s + (x.views_count || 0), 0);
      const likes = data.reduce((s, x) => s + (x.likes_count || 0), 0);
      const inquiries = data.reduce((s, x) => s + (x.inquiries_count || 0), 0);
      setRealStats({ totalViews: views, totalInquiries: inquiries, totalLikes: likes });
      setMyStats({ views, likes, inquiries });
    }
  };

  const loadInquiries = async () => {
    // PREJETE — inquiries where I am the recipient (rights holder)
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .eq('producer_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // POSLANE — inquiries I sent (producer_id = me, type = sent)
    const { data: sent } = await supabase
      .from('inquiries')
      .select('*')
      .eq('producer_id', user?.id)
      .eq('type', 'sent')
      .order('created_at', { ascending: false })
      .limit(20);
    if (sent) setSentInquiries(sent);
    if (data) {
      setInquiries(data);
      const unread = data.filter((inq: any) => !inq.is_read);
      const toastKey = 'hahahub_toast_shown_' + user?.id;
      const alreadyShown = localStorage.getItem(toastKey);
      if (unread.length > 0 && !alreadyShown) {
        setTickledToast({ show: true, showTitle: unread[0].show_title });
        localStorage.setItem(toastKey, '1');
        setTimeout(() => setTickledToast({ show: false, showTitle: '' }), 5000);
        // Send email notification for new inquiries
        unread.forEach(async (inq: any) => {
          if (!inq.email_sent && user?.email) {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'inquiry',
                to: user.email,
                data: {
                  producerName: user.name,
                  buyerName: inq.buyer_name || 'A Producer',
                  buyerEmail: inq.buyer_email || '',
                  showTitle: inq.show_title || '',
                  message: inq.message || '',
                },
              }),
            }).catch(console.error);
          }
        });
      }
    }
  };

  const markAsRead = async (inquiryId: string) => {
    // Update status to 'read' when producer opens
    // Optimistic update first — instant UI feedback
    setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, is_read: true } : inq));
    // Then persist to Supabase
    await supabase.from('inquiries').update({ is_read: true }).eq('id', inquiryId);
  };

  const daysRemaining = useMemo(() => {
    if (!user?.subscription?.expiryDate) return 365;
    const expiry = new Date(user.subscription.expiryDate);
    if (isNaN(expiry.getTime())) return 365;
    return Math.max(0, Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  }, [user?.id]);

  const subscriptionProgress = useMemo(() => {
    const total = 365;
    return ((total - Math.min(total, daysRemaining)) / total) * 100;
  }, [daysRemaining]);

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <button onClick={() => onNavigate('login')} className="bg-white text-black hover:bg-brand-pink hover:text-white px-12 py-5 font-black uppercase border-2 border-white  italic">Login to View Hub</button>
      </div>
    );
  }

  const userUploads = shows.filter((s: Show) => (s as any).user_id === user.id || user.uploadedShowIds?.includes(s.id));

  const stats = [
    { label: 'Assets Deployed', value: userUploads.length, icon: 'upload', color: 'brand-cyan' },
    { label: 'Asset Views', value: realStats.totalViews.toLocaleString(), icon: 'visibility', color: 'brand-yellow' },
    { label: 'Inquiry Rate', value: realStats.totalInquiries > 0 ? ((realStats.totalInquiries / (realStats.totalViews || 1)) * 100).toFixed(1) + '%' : '0%', icon: 'insights', color: 'brand-pink' },
    { label: 'Active Favs', value: realStats.totalLikes.toLocaleString(), icon: 'favorite', color: 'white' },
  ];

  const openManage = (show: Show) => {
    setManageShow(show);
    setEditForm({
      ...formFromShow(show),
      imageUrl: show.imageUrl || (show as any).image_url || '',
      productionPhotos: show.productionPhotos || [],
    } as any);
    setEditPhotoPreviews([show.productionPhotos?.[0] || null, show.productionPhotos?.[1] || null, show.productionPhotos?.[2] || null]);
  };

  const handleSave = async () => {
    if (!manageShow) return;
    const missing = missingRequired(editForm as ShowForm);
    if (missing.length) { alert('Please fill in: ' + missing.join(', ')); return; }
    setIsSaving(true);
    try {
      // Upload poster if new file selected
      let finalImageUrl = (editForm as any).imageUrl || null;
      if (pendingPosterFile) {
        const file = pendingPosterFile;
        const ext = file.name.split('.').pop();
        const path = 'posters/' + Date.now() + '_poster.' + ext;
        const { data: uploadData } = await supabase.storage.from('show-images').upload(path, file, { cacheControl: '31536000', upsert: false });
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('show-images').getPublicUrl(uploadData.path);
          finalImageUrl = urlData.publicUrl;
        }
      }
      const { data: saved, error } = await supabase.from('shows').update({
        ...formToDb(editForm as ShowForm),
        is_produced: true,
        production_photos: ((editForm as any).productionPhotos || []).filter(Boolean),
        image_url: finalImageUrl,
      }).eq('id', manageShow.id).select().single();

      if (error) { console.error('Error:', error.message); alert(`❌ Could not save changes: ${error.message}\n\nPlease try again.`); }
      else {
        const m = manageShow as any;
        onUpdateShow(saved ? mapShow(saved, { is_verified: m.is_verified, is_founding: m.is_founding, member_tier: m.member_tier, user_type: m.producer_plan }) as Show
          : ({ ...manageShow, ...editForm } as Show));
        setSaveSuccess(true);
        setTimeout(() => { setSaveSuccess(false); setManageShow(null); }, 1500);
      }
    } catch (err: any) { console.error('Error:', err.message || err); }
    setPendingPosterFile(null);
    setIsSaving(false);
  };

  return (
    <React.Fragment>
      {manageShow && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setManageShow(null)}></div>
          <div className="relative bg-brand-black border-2 border-white w-full max-w-5xl my-8 p-8  text-white">
            <button onClick={() => setManageShow(null)} className="absolute top-6 right-6 text-white hover:text-brand-pink z-10">
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>

            <h2 className="text-4xl font-black uppercase italic mb-2">Edit Production</h2>
            <p className="text-brand-cyan text-xs font-black uppercase tracking-widest italic mb-10">{manageShow.title}</p>

            <div className="space-y-5">

              <ShowFormFields form={editForm as ShowForm} set={(k, v) => setEditForm(prev => ({ ...prev, [k]: v }))} compact />
            </div>

            {/* POSTER IMAGE */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-black uppercase italic text-brand-yellow border-b-2 border-brand-yellow/20 pb-2">Poster / Main Image</h3>
              <div className="flex items-start gap-4">
                {(editForm as any).imageUrl && (
                  <img src={(editForm as any).imageUrl} alt="Current poster" className="w-24 h-32 object-cover border-2 border-white/20 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <label className="block border-2 border-dashed border-white/20 hover:border-brand-yellow p-6 text-center cursor-pointer transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const localUrl = URL.createObjectURL(file);
                      setPendingPosterFile(file);
                      setEditForm((prev: any) => ({ ...prev, imageUrl: localUrl }));
                    }} />
                    <span className="material-symbols-outlined text-3xl text-white/30 block mb-2">upload</span>
                    <p className="text-white/40 text-xs font-black uppercase italic">Click to upload new poster</p>
                    <p className="text-white/20 text-[9px] mt-1">JPG, PNG — recommended 400×600px</p>
                  </label>
                </div>
              </div>
            </div>

            {/* PRODUCTION PHOTOS */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-black uppercase italic text-brand-cyan border-b-2 border-brand-cyan/20 pb-2">Photos from Production</h3>
              <div className="space-y-2">
                {[0, 1, 2].map(i => (
                  <div key={i}>
                    <div className="relative">
                      <div
                        onClick={() => editPhotoRefs[i].current?.click()}
                        className="w-full border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-brand-cyan overflow-hidden bg-black/40 relative group" style={{aspectRatio:"16/9"}}
                      >
                        {editPhotoPreviews[i] ? (
                          <>
                            <img src={editPhotoPreviews[i]!} className="w-full h-full object-cover" alt={"Photo " + (i+1)} />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-2xl">edit</span>
                            </div>
                          </>
                        ) : (
                          <span className="material-symbols-outlined text-white/20 text-3xl">add_photo_alternate</span>
                        )}
                      </div>
                      {editPhotoPreviews[i] && (
                        <button onClick={(e) => {
                          e.stopPropagation();
                          const newPreviews = [...editPhotoPreviews];
                          newPreviews[i] = null;
                          setEditPhotoPreviews(newPreviews);
                          const newPhotos = [...(editForm.productionPhotos || [null, null, null])];
                          newPhotos[i] = null;
                          setEditForm(prev => ({ ...prev, productionPhotos: newPhotos }));
                        }} className="absolute top-2 right-2 bg-brand-pink text-white w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-all z-10" title="Remove photo">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={editPhotoRefs[i]}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !manageShow) return;

                        // Show local preview immediately
                        const localUrl = URL.createObjectURL(file);
                        const newPreviews = [...editPhotoPreviews];
                        newPreviews[i] = localUrl;
                        setEditPhotoPreviews(newPreviews);

                        // Upload to Supabase Storage
                        const ext = file.name.split('.').pop();
                        const path = `production-photos/${manageShow.id}/photo_${i}_${Date.now()}.${ext}`;
                        const { data: uploadData, error: uploadError } = await supabase.storage
                          .from('show-images')
                          .upload(path, file, { upsert: false, cacheControl: '31536000' });

                        if (uploadError) {
                          // Fallback to base64 if storage fails
                          const reader = new FileReader();
                          reader.onload = () => {
                            const newPhotos = [...(editForm.productionPhotos || [null, null, null])];
                            newPhotos[i] = reader.result as string;
                            setEditForm(prev => ({ ...prev, productionPhotos: newPhotos }));
                          };
                          reader.readAsDataURL(file);
                        } else {
                          // Get public URL
                          const { data: urlData } = supabase.storage
                            .from('show-images')
                            .getPublicUrl(path);
                          const publicUrl = urlData.publicUrl;

                          // Update preview with real URL
                          const newPreviews2 = [...editPhotoPreviews];
                          newPreviews2[i] = publicUrl;
                          setEditPhotoPreviews(newPreviews2);

                          // Update form
                          const newPhotos = [...(editForm.productionPhotos || [null, null, null])];
                          newPhotos[i] = publicUrl;
                          setEditForm(prev => ({ ...prev, productionPhotos: newPhotos }));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <button onClick={handleSave} disabled={isSaving} className="w-full bg-brand-cyan text-black py-5 font-black uppercase italic border-2 border-black  hover:bg-brand-yellow transition-all disabled:opacity-50 text-xl">
                {isSaving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save All Changes'}
              </button>
              <button onClick={() => { if (confirm('Delete this show permanently?')) { onDeleteShow(manageShow.id); setManageShow(null); } }} className="w-full bg-red-600 text-white py-4 font-black uppercase italic border-2 border-black">
                Delete This Asset Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-brand-black flex flex-col">
        <Navigation activePage="subscription" onNavigate={onNavigate} onLogout={onLogout} user={user} />
        <main className="flex-1 pt-24 md:pt-32 pb-20 px-4 md:px-12 text-white">
          <div className="max-w-7xl mx-auto space-y-12">

            {/* HEADER */}
            <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-10">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">My <span className="text-spectrumLight-green">Hub</span></h1>
              <div className="flex items-center gap-6">
                <div className="bg-brand-surface border-2 border-white p-6 ">
                  <p className="text-xl font-black uppercase italic">{user.name}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getProfileBadges(user).map(b => (
                        <Badge key={b} type={b} size="md" showLabel />
                      ))}
                      {user.isAdmin && <Badge type="roar" size="md" showLabel />}
                    </div>
                    {!user.isAdmin && !(user as any).is_verified && (
                      verifyRequested ? (
                        <span className="text-[10px] font-black uppercase italic tracking-widest text-brand-cyan">Verification requested ✓</span>
                      ) : (
                        <button
                          onClick={requestVerification}
                          disabled={verifySending || userUploads.length === 0}
                          title={userUploads.length === 0 ? 'List a show first' : 'Ask HahaHub to verify your profile'}
                          className="text-[10px] font-black uppercase italic tracking-widest text-brand-cyan border border-brand-cyan/40 px-3 py-1 hover:bg-brand-cyan hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {verifySending ? 'Sending…' : 'Request verification'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ONBOARDING TOUR — samo za nove producente brez uploadov */}
            {userUploads.length === 0 && !user.isAdmin && !welcomeDismissed && (
              <section className="relative border-2 border-brand-yellow bg-brand-yellow/5 p-6 md:p-8">
                <button onClick={dismissWelcome} aria-label="Dismiss" title="Dismiss" className="absolute top-3 right-3 text-white/40 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-3xl">🎭</span>
                  <div>
                    <h3 className="text-xl font-black uppercase italic text-brand-yellow">Welcome to HahaHub!</h3>
                    <p className="text-white/60 font-bold italic text-sm mt-1">You're 3 steps away from going live. Here's how to start:</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { step: '01', icon: 'upload', color: 'brand-cyan', title: 'Deploy Your First Show', desc: 'Upload a production with full data — cast, rights, script scenario in English.', action: 'List Your Show →', page: 'upload' as const },
                    { step: '02', icon: 'search', color: 'brand-yellow', title: 'Browse the Catalog', desc: 'Explore international comedy productions. Tickle List shows you like.', action: 'Go to Catalog →', page: 'discovery' as const },
                    { step: '03', icon: 'mail', color: 'brand-pink', title: 'Send Your First Inquiry', desc: 'Contact a rights holder directly. No agents. No fees.', action: 'Browse Shows →', page: 'discovery' as const },
                  ].map((item, i) => (
                    <div key={i} className="bg-brand-black border-2 border-white/10 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-3xl font-black italic text-${item.color} opacity-30`}>{item.step}</span>
                        <span className={`material-symbols-outlined text-2xl text-${item.color}`}>{item.icon}</span>
                      </div>
                      <h4 className="font-black uppercase italic text-white text-sm mb-2">{item.title}</h4>
                      <p className="text-white/40 text-xs font-bold italic leading-relaxed mb-4">{item.desc}</p>
                      <button onClick={() => { dismissWelcome(); onNavigate(item.page); }} className={`text-[10px] font-black uppercase italic text-${item.color} hover:underline`}>{item.action}</button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TICKLED TOAST NOTIFICATION */}
            {tickledToast.show && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                <div className="bg-brand-yellow text-black border-2 border-black  px-8 py-6 text-center max-w-sm">
                  <p className="text-2xl font-black uppercase italic leading-none mb-1">YOU'VE BEEN<br/><span className="text-brand-pink">TICKLED!</span> 🎭</p>
                  <p className="text-xs font-black uppercase tracking-widest mt-2 opacity-70">{tickledToast.showTitle}</p>
                  <button onClick={() => setTickledToast({show: false, showTitle: ''})} className="mt-4 text-[9px] font-black uppercase border-2 border-black px-4 py-1 hover:bg-black hover:text-white transition-all">Dismiss</button>
                </div>
              </div>
            )}

            {/* STATS BAR — all plans */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'VIEWS', value: myStats.views, icon: 'visibility', color: 'text-brand-cyan', border: 'border-brand-cyan/30' },
                { label: 'LIKES', value: myStats.likes, icon: 'favorite', color: 'text-brand-pink', border: 'border-brand-pink/30' },
                { label: 'INQUIRIES', value: inquiries.length, icon: 'mail', color: 'text-brand-yellow', border: 'border-brand-yellow/30' },
                { label: 'MY SHOWS', value: userUploads.length, icon: 'theater_comedy', color: 'text-white', border: 'border-white/20' },
              ].map((s, i) => (
                <div key={i} className={`border-2 ${s.border} p-4 flex items-center gap-3`}>
                  <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                  <div>
                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] font-black uppercase italic text-white/30 tracking-widest">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* TABS — by plan */}
            <div className="flex border-2 border-white/20 w-full overflow-x-auto">
              {(['studio', 'assets', 'profile'] as const).map(tab => {
                const unread = tab === 'studio' ? inquiries.filter((i: any) => !i.is_read).length : 0;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-3 py-3 font-black uppercase italic text-xs tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-brand-yellow text-black' : 'text-white/40 hover:text-white'}`}>
                    {tab === 'studio' ? 'STUDIO' : tab === 'assets' ? 'MY SHOWS' : 'PROFILE'}
                    {unread > 0 && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-black text-brand-yellow' : 'bg-brand-pink text-white'}`}>{unread}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 1. MY ASSETS */}
            {activeTab === 'assets' && (
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black uppercase italic">My <span className="text-spectrumLight-green">Shows</span></h2>
                <button onClick={() => onNavigate('upload')} className="bg-brand-cyan text-black px-8 py-3 font-black uppercase text-xs border-2 border-black  italic hover:bg-brand-yellow transition-all">+ List Your Show</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {userUploads.length === 0 ? (
                  <div className="col-span-2 py-20 border-2 border-dashed border-white/10 text-center">
                    <div className="flex justify-center mb-4"><Smile height={88} className="opacity-70" /></div>
                    <p className="text-white/40 font-black uppercase italic">No shows yet.</p>
                    <button onClick={() => onNavigate('upload')} className="mt-4 text-brand-cyan uppercase font-black text-xs hover:underline italic">Showload your first show →</button>
                  </div>
                ) : userUploads.map((show) => (
                  <div key={show.id} className={"bg-brand-surface border-2 p-4 md:p-6 flex gap-4  transition-all " + (show.inquiriesCount > 0 && inquiries.some(inq => inq.show_id === show.id && !inq.is_read) ? "border-brand-cyan " : show.inquiriesCount > 0 ? "border-brand-cyan" : "border-white")}>
                    <div className="w-20 md:w-24 h-28 md:h-32 border-2 border-white/10 flex-shrink-0">
                      <img src={show.imageUrl} className="w-full h-full object-cover" alt={show.title} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {inquiries.some(inq => inq.show_id === show.id && !inq.is_read) && (
                          <span className="inline-block bg-brand-cyan text-black text-[8px] font-black uppercase px-2 py-1 mb-1 text-[8px] font-black uppercase px-2 py-1 mb-1">🎭 New Tickle</span>
                        )}
                        <h3 className="text-lg font-black uppercase italic leading-none truncate">{show.title}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={'w-2 h-2 rounded-full ' + (show.rightsStatus === 'Available' ? 'bg-green-500' : 'bg-brand-yellow')}></span>
                          <p className="text-[9px] text-gray-500 font-bold uppercase italic">{show.rightsStatus}</p>
                        </div>
                        <div className="mt-3 flex gap-4 text-[9px] font-black uppercase text-white/40">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-brand-cyan">visibility</span>{show.viewsCount}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-brand-pink">favorite</span>{show.likesCount}</span>
                          <span className="flex items-center gap-1 relative">
                            {show.inquiriesCount > 0 && (
                              <span className="absolute -top-1 -right-2 w-2 h-2 bg-brand-cyan rounded-full animate-ping"></span>
                            )}
                            <span className="material-symbols-outlined text-xs text-brand-yellow">mail</span>
                            <span className={show.inquiriesCount > 0 ? "text-brand-cyan font-black" : ""}>{show.inquiriesCount}</span>
                          </span>
                        </div>
                      </div>
                      <button onClick={() => openManage(show)} className="mt-4 w-full bg-brand-pink text-white py-2 text-[9px] font-black uppercase italic border-2 border-black shadow-[2px_2px_0px_white]">Manage / Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            )}

            {/* 2. PIPELINE */}
            {activeTab === 'studio' && user && (
            <section className="space-y-6">
              <div>
                <h2 className="text-4xl font-black uppercase italic">PRODUCER <span className="text-spectrumLight-green">STUDIO</span></h2>
                <p className="text-white/30 font-bold italic text-xs mt-1 uppercase tracking-widest">Your business command center</p>
              </div>
              <div className="flex gap-0 border-b-4 border-white/10 overflow-x-auto -mx-4 px-4">
                {([
                  { key: 'pipeline', label: 'PIPELINE', badge: inquiries.filter((i: any) => !i.is_read).length },
                  { key: 'analytics', label: 'ANALYTICS', badge: 0 },
                  { key: 'contracts', label: 'DOCUMENTS', badge: 0 },
                  { key: 'contacts', label: 'HAHAFRIENDS', badge: 0 },
                  { key: 'calculator', label: 'CALCULATOR', badge: 0 },
                ] as {key: string; label: string; badge: number}[]).map(t => (
                  <button key={t.key} onClick={() => setStudioTab(t.key as any)}
                    className={"px-3 py-3 font-black uppercase italic text-xs tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5 border-b-4 -mb-1 " + (studioTab === t.key ? 'border-brand-yellow text-brand-yellow' : 'border-transparent text-white/50 hover:text-white')}>
                    {t.key !== 'pipeline' && !canSeeVerified(user) && <span className="material-symbols-outlined text-sm">lock</span>}
                    {t.label}
                    {t.badge > 0 && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-brand-pink text-white">{t.badge}</span>}
                  </button>
                ))}
              </div>
              <div style={{ minHeight: '600px' }}>
                {studioTab === 'pipeline' && <DealsPipelinePage user={user} onNavigate={onNavigate} />}
                {studioTab !== 'pipeline' && !canSeeVerified(user) ? (
                  <VerifiedLock what="Analytics, Documents, HahaFriends and the Calculator are part of the full Studio." onList={() => onNavigate('upload')} />
                ) : (<>
                {studioTab === 'analytics' && <ProducerStudio user={user} shows={shows} initialTab='dashboard' hideHeader hideTabs />}
                {studioTab === 'contracts' && <ProducerStudio user={user} shows={shows} initialTab='contracts' hideHeader hideTabs />}
                {studioTab === 'contacts' && <ProducerStudio user={user} shows={shows} initialTab='contacts' hideHeader hideTabs />}
                {studioTab === 'calculator' && <ProducerStudio user={user} shows={shows} initialTab='calculator' hideHeader hideTabs />}
                </>)}
              </div>
            </section>
            )}




                        {activeTab === 'profile' && (
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black uppercase italic">My <span className="text-spectrumLight-green">Profile</span></h2>
                  <button
                    onClick={() => { onNavigate('producer'); }}
                    className="bg-brand-cyan text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-white transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    View Public Profile
                  </button>
                </div>
                <p className="text-white/40 font-bold italic text-sm -mt-4">Appears on your public Producer Profile page.</p>
                <div className="space-y-6 max-w-2xl">

                  {/* AVATAR */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic block mb-3">Profile Photo</label>
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-full border-2 border-white/20 overflow-hidden flex items-center justify-center bg-brand-surface flex-shrink-0">
                        {profileForm.avatar_url ? (
                          <img src={profileForm.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black uppercase italic text-white/20">{user?.name?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer bg-white text-black px-6 py-2 font-black uppercase italic text-xs border-2 border-black hover:bg-brand-yellow transition-all inline-block">
                          Upload Photo
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            // Resize image before base64 to keep it small
                            const img = new Image();
                            const objectUrl = URL.createObjectURL(file);
                            img.onload = async () => {
                              const canvas = document.createElement('canvas');
                              const MAX = 200;
                              const ratio = Math.min(MAX / img.width, MAX / img.height);
                              canvas.width = img.width * ratio;
                              canvas.height = img.height * ratio;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                              const base64 = canvas.toDataURL('image/jpeg', 0.8);
                              URL.revokeObjectURL(objectUrl);
                              setProfileForm(p => ({ ...p, avatar_url: base64 }));
                              if (user?.id) {
                                const { error } = await supabase.from('profiles').update({ avatar_url: base64 }).eq('id', user.id);
                                if (error) console.error('Avatar save error:', error);
                              }
                            };
                            img.src = objectUrl;
                          }} />
                        </label>
                        <p className="text-white/20 text-[9px] italic mt-1">Max 500KB · JPG or PNG</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic block mb-2">Bio / About</label>
                    <textarea value={profileForm.bio} onChange={e => setProfileForm(p => ({...p, bio: e.target.value}))} placeholder="Short intro — who you are, what you produce..." className="w-full bg-brand-surface border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 resize-none h-28 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic block mb-2">City / Country</label>
                    <input type="text" autoComplete="off" value={profileForm.location_city} onChange={e => setProfileForm(p => ({...p, location_city: e.target.value}))} placeholder="Ljubljana, Slovenia" className="w-full bg-brand-surface border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic block mb-2">Website</label>
                    <input type="text" autoComplete="off" value={profileForm.website} onChange={e => setProfileForm(p => ({...p, website: e.target.value}))} placeholder="https://yourproduction.com" className="w-full bg-brand-surface border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic block mb-2">Festivals & Credits</label>
                    <textarea value={profileForm.festivals} onChange={e => setProfileForm(p => ({...p, festivals: e.target.value}))} placeholder="Edinburgh Fringe 2023, Avignon 2024..." className="w-full bg-brand-surface border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 resize-none h-20 transition-colors" />
                  </div>
                  <button onClick={async () => {
                    if (!user?.id) return;
                    setProfileSaving(true);
                    const { error: profileSaveError } = await supabase.from('profiles').update({
                      bio: profileForm.bio,
                      website: profileForm.website,
                      location_city: profileForm.location_city,
                      festivals: profileForm.festivals,
                      avatar_url: profileForm.avatar_url,
                    }).eq('id', user.id);
                    setProfileSaving(false);
                    if (profileSaveError) {
                      console.error('Profile save error:', profileSaveError);
                      alert(`❌ Could not save your profile: ${profileSaveError.message}\n\nPlease try again.`);
                      return;
                    }
                    setProfileSaved(true);
                    setTimeout(() => setProfileSaved(false), 3000);
                  }} disabled={profileSaving} className="bg-white text-black px-10 py-4 font-black uppercase italic border-2 border-black  hover:bg-brand-pink hover:text-white transition-all disabled:opacity-40">
                    {profileSaving ? 'Saving...' : profileSaved ? 'Saved! ✓' : 'Save Profile →'}
                  </button>

                  {/* CHANGE PASSWORD */}
                  <div className="border-t-4 border-white/10 pt-8 mt-4 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Change Password</p>
                    <input
                      type="password"
                      placeholder="New password (min 6 chars)"
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setPasswordMsg(''); }}
                      className="w-full bg-brand-surface border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 transition-colors"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setPasswordMsg(''); }}
                      className="w-full bg-brand-surface border-2 border-white/20 focus:border-brand-yellow text-white font-bold italic p-4 outline-none placeholder:text-white/20 transition-colors"
                    />
                    {passwordMsg && (
                      <p className={`text-xs font-black italic ${passwordMsg.includes('✓') ? 'text-brand-cyan' : 'text-brand-pink'}`}>{passwordMsg}</p>
                    )}
                    <button
                      onClick={async () => {
                        if (newPassword.length < 6) { setPasswordMsg('⚠ Min 6 characters'); return; }
                        if (newPassword !== confirmPassword) { setPasswordMsg('⚠ Passwords do not match'); return; }
                        setPasswordSaving(true);
                        const { error } = await supabase.auth.updateUser({ password: newPassword });
                        if (error) { setPasswordMsg('⚠ ' + error.message); }
                        else { setPasswordMsg('✓ Password updated!'); setNewPassword(''); setConfirmPassword(''); }
                        setPasswordSaving(false);
                      }}
                      disabled={passwordSaving || !newPassword || !confirmPassword}
                      className="border-2 border-white text-white px-8 py-3 font-black uppercase italic hover:bg-white hover:text-black transition-all disabled:opacity-30"
                    >
                      {passwordSaving ? 'Updating...' : 'Update Password →'}
                    </button>
                  </div>

                {/* DELETE ACCOUNT */}
                <div className="border-t-2 border-red-500/20 pt-8">
                  <h3 className="font-black uppercase italic text-red-400 text-sm mb-2">Danger Zone</h3>
                  <p className="text-white/30 text-xs mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
                  <button onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone. All your shows, deals and data will be permanently deleted.')) return;
                    if (!window.confirm('Last warning — this is permanent. Delete account?')) return;
                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      const res = await fetch('/api/delete-account', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                        body: JSON.stringify({ userId: user?.id })
                      });
                      if (!res.ok) throw new Error('Failed to delete account');
                      onLogout();
                    } catch (e) {
                      alert('Error deleting account. Please contact info@hahahub.art');
                    }
                  }} className="border-2 border-red-500/40 text-red-400 px-6 py-3 font-black uppercase italic text-xs hover:bg-red-500 hover:text-white transition-all">
                    Delete My Account
                  </button>
                </div>
                </div>
              </section>
            )}


            {/* studio duplicate removed */}

          </div>
        </main>
      </div>
      <Footer onNavigate={onNavigate} />
      {/* DEAL MODAL */}
      {dealInquiry && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => setDealInquiry(null)}></div>
          <div className="relative bg-brand-black border-2 border-brand-cyan w-full max-w-2xl p-8  text-white z-10">
            <button onClick={() => setDealInquiry(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="mb-6">
              <span className="bg-brand-cyan text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest">DEAL CLOSED</span>
              <h2 className="text-3xl font-black uppercase italic mt-3">{dealInquiry.show_title}</h2>
              <p className="text-white/40 text-sm italic mt-1">Buyer: {dealInquiry.from_name} · {dealInquiry.from_email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[9px] font-black uppercase text-white/40 italic mb-1 block">Royalty %</label>
                <input value={dealForm.royalty_pct} onChange={e => setDealForm(p => ({...p, royalty_pct: e.target.value}))}
                  placeholder="e.g. 10" className="w-full bg-black border-2 border-white/20 p-3 text-white font-black outline-none focus:border-brand-cyan" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-white/40 italic mb-1 block">License Years</label>
                <input value={dealForm.years} onChange={e => setDealForm(p => ({...p, years: e.target.value}))}
                  placeholder="e.g. 3" className="w-full bg-black border-2 border-white/20 p-3 text-white font-black outline-none focus:border-brand-cyan" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-white/40 italic mb-1 block">Territory</label>
                <input value={dealForm.territory} onChange={e => setDealForm(p => ({...p, territory: e.target.value}))}
                  placeholder="e.g. Slovenia, Croatia" className="w-full bg-black border-2 border-white/20 p-3 text-white font-black outline-none focus:border-brand-cyan" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-white/40 italic mb-1 block">Max Performances</label>
                <input value={dealForm.performances} onChange={e => setDealForm(p => ({...p, performances: e.target.value}))}
                  placeholder="e.g. 20" className="w-full bg-black border-2 border-white/20 p-3 text-white font-black outline-none focus:border-brand-cyan" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-white/40 italic mb-1 block">Signed Date</label>
                <input type="date" value={dealForm.signed_date} onChange={e => setDealForm(p => ({...p, signed_date: e.target.value}))}
                  className="w-full bg-black border-2 border-white/20 p-3 text-white font-black outline-none focus:border-brand-cyan" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-white/40 italic mb-1 block">Notes</label>
                <input value={dealForm.notes} onChange={e => setDealForm(p => ({...p, notes: e.target.value}))}
                  placeholder="Special conditions..." className="w-full bg-black border-2 border-white/20 p-3 text-white font-black outline-none focus:border-brand-cyan" />
              </div>
            </div>

            {dealSaved && <p className="text-brand-cyan text-xs font-black uppercase italic mb-4">✓ Deal saved!</p>}

            <div className="flex gap-3">
              <button onClick={async () => {
                try {
                  const { error: dealError } = await supabase.from('deals').insert({
                    inquiry_id: dealInquiry.id,
                    show_id: dealInquiry.show_id,
                    show_title: dealInquiry.show_title,
                    seller_id: user.id,
                    buyer_name: dealInquiry.from_name,
                    buyer_email: dealInquiry.from_email || dealInquiry.email,
                    royalty_pct: dealForm.royalty_pct,
                    years: Number(dealForm.years) || null,
                    territory: dealForm.territory,
                    performances: Number(dealForm.performances) || null,
                    notes: dealForm.notes,
                    signed_date: dealForm.signed_date,
                  });
                  if (dealError) {
                    console.error('Deal save error:', dealError);
                    alert(`❌ Could not save this deal: ${dealError.message}\n\nNothing was recorded. Please try again.`);
                    return;
                  }
                  await supabase.from('inquiries').update({ status: 'deal' }).eq('id', dealInquiry.id);
                  setInquiries(prev => prev.map(i => i.id === dealInquiry.id ? {...i, status: 'deal'} : i));

                  // Deal closed email — pošljemo obema
                  try {
                    const dealEmailData = {
                      sellerName: user?.name || 'Rights Holder',
                      buyerName: dealInquiry?.from_name || 'Producer',
                      showTitle: dealInquiry?.show_title || '',
                      royalty: dealForm.royalty_pct,
                      years: dealForm.years,
                      territory: dealForm.territory,
                      performances: dealForm.performances,
                    };
                    await fetch('/api/send-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: 'deal_closed', to: user?.email, data: { ...dealEmailData, isseller: true } })
                    });
                    if (dealInquiry?.from_email || dealInquiry?.email) {
                      await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'deal_closed', to: dealInquiry.from_email || dealInquiry.email, data: { ...dealEmailData, isseller: false } })
                      });
                    }
                  } catch(e) { console.error('Deal email error:', e); }

                  setDealSaved(true);
                  setTimeout(() => { setDealSaved(false); setDealInquiry(null); }, 2000);
                } catch(e) { console.error(e); }
              }} className="bg-brand-cyan text-black px-8 py-3 font-black uppercase italic border-2 border-black hover:bg-white transition-all">
                Save Deal →
              </button>
              <button onClick={() => setDealInquiry(null)} className="border-2 border-white/20 text-white/40 px-6 py-3 font-black uppercase italic hover:border-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </React.Fragment>
  );
};

export default SubscriptionPage;
