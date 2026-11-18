// ONE definition of every show field.
// Showload (UploadPage), My Hub edit (SubscriptionPage) and the catalog dossier + PDF (DiscoveryPage)
// all read from here, so the three can never drift apart again.
// Keys are the real database column names in the `shows` table.

export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'bool' | 'tri' | 'date' | 'country' | 'url' | 'title';
export interface Opt { value: string; label: string }
export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;          // default 'text'
  options?: Opt[];
  help?: string;             // short line under the field (form) and tooltip (dossier)
  placeholder?: string;
  required?: boolean;
  wide?: boolean;            // full row
  def?: string;              // default value for a new show
  locked?: boolean;          // Verified Producers only (this one field)
  hideInDossier?: boolean;   // shown elsewhere in the dossier (title, synopsis, trailer)
  dependsOn?: string;        // only shown in the dossier when this other field has a value
}
export interface SectionDef {
  id: string;
  num: string;
  title: string;
  intro: string;
  color: 'cyan' | 'pink' | 'yellow' | 'white';
  lock?: string;             // whole section Verified Producers only (dossier + PDF)
  fields: FieldDef[];
}

export const COLOR_TEXT: Record<SectionDef['color'], string> = {
  cyan: 'text-brand-cyan', pink: 'text-brand-pink', yellow: 'text-brand-yellow', white: 'text-white',
};

const o = (...pairs: [string, string][]): Opt[] => pairs.map(([value, label]) => ({ value, label }));
const same = (...values: string[]): Opt[] => values.map(v => ({ value: v, label: v }));

export const COUNTRIES = [
  'Albania', 'Austria', 'Belgium', 'Bosnia & Herzegovina', 'Bulgaria', 'Croatia',
  'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
  'Malta', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland',
  'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
  'Switzerland', 'Ukraine', 'United Kingdom', 'Australia', 'Canada', 'Israel',
  'Japan', 'New Zealand', 'South Africa', 'USA', 'Other',
];

const LEVEL = same('Low', 'Medium', 'High');

export const SHOW_SECTIONS: SectionDef[] = [
  {
    id: 'show', num: '01', title: 'The Show', color: 'cyan',
    intro: 'What your show is and who it is for.',
    fields: [
      { key: 'english_title', label: 'English title', type: 'title', required: true, wide: true, hideInDossier: true,
        placeholder: 'SHOW TITLE IN ENGLISH', help: 'The main title producers abroad will see.' },
      { key: 'title', label: 'Original title', wide: true, hideInDossier: true, help: 'Only if different from the English title.' },
      { key: 'author', label: 'Playwright / Author', required: true },
      { key: 'original_language', label: 'Original language', required: true, placeholder: 'e.g. Slovenian' },
      { key: 'location', label: 'Country of origin', type: 'country', required: true },
      { key: 'genre', label: 'Genre', type: 'select', required: true, def: 'Comedy',
        options: same('Comedy', 'Drama', 'Musical', 'Physical Theatre', 'Cabaret') },
      { key: 'subgenre', label: 'Subgenre', type: 'select',
        options: [{ value: '', label: 'Choose...' }, ...same('Monocomedy', 'Farce', 'Black Comedy', 'Dark Comedy', 'Satire', 'Absurd',
          'Romantic Comedy', 'Slapstick', 'Stand-up Theatre', 'Musical Comedy', 'Sketch Comedy', 'Character Comedy',
          'Physical Comedy', 'Cabaret Comedy', 'Storytelling')] },
      { key: 'humor_type', label: 'Type of humour', type: 'select', def: 'Universal',
        help: 'How easily the comedy travels to another country.',
        options: o(['Universal', 'Universal (works anywhere)'], ['Language-based', 'Language-based (wordplay)'],
          ['Local Politics', 'Local (needs a local rewrite)'], ['Physical Comedy', 'Physical (works without words)']) },
      { key: 'audience', label: 'Audience', type: 'select',
        options: o(['', 'Choose...'], ['Adults', 'Adults (18+)'], ['16+', '16+'], ['12+', '12+'], ['Family', 'Family']) },
      { key: 'production_year', label: 'Production year', type: 'number', def: String(new Date().getFullYear()) },
      { key: 'still_running', label: 'Still in repertoire', type: 'tri', help: 'Is the show still playing?' },
      { key: 'synopsis_en', label: 'Synopsis in English', type: 'textarea', required: true, wide: true, hideInDossier: true,
        placeholder: 'The story and why it is funny, in 5 to 10 sentences.' },
      { key: 'trailer_url', label: 'Trailer link', type: 'url', wide: true, hideInDossier: true,
        placeholder: 'https://youtube.com/...', help: 'YouTube or Vimeo.' },
    ],
  },
  {
    id: 'staging', num: '02', title: 'Cast & Staging', color: 'pink',
    intro: 'What it takes to put the show on stage.',
    fields: [
      { key: 'male_roles', label: 'Male roles', type: 'number', required: true, def: '1' },
      { key: 'female_roles', label: 'Female roles', type: 'number', required: true, def: '1' },
      { key: 'duration', label: 'Running time (min)', type: 'number', required: true, def: '90' },
      { key: 'has_intermission', label: 'Intermission', type: 'bool', def: 'false' },
      { key: 'gender_flexible', label: 'Gender-flexible roles', type: 'tri', help: 'Roles can be played by actors of any gender.' },
      { key: 'is_touring_friendly', label: 'Touring-friendly', type: 'bool', def: 'true', help: 'Set and crew travel easily.' },
      { key: 'production_scale', label: 'Production scale', type: 'select', def: 'Medium', options: same('Small', 'Medium', 'Large') },
      { key: 'stage_type', label: 'Stage type', type: 'select', def: 'Main Stage', options: same('Main Stage', 'Black Box', 'Arena', 'Open Air') },
      { key: 'adaptation_flexibility', label: 'Adaptation freedom', type: 'select', def: 'Medium',
        help: 'How freely a new team may change the staging.',
        options: o(['High', 'High (free to restage)'], ['Medium', 'Medium'], ['Low', 'Low (stay close to the original)']) },
      { key: 'technical_complexity', label: 'Technical complexity', type: 'select', def: 'Medium', options: LEVEL },
      { key: 'costume_complexity', label: 'Costume complexity', type: 'select', def: 'Medium', options: LEVEL },
      { key: 'tech_staff_lighting', label: 'Lighting technicians', type: 'number', def: '1' },
      { key: 'tech_staff_sound', label: 'Sound technicians', type: 'number', def: '1' },
      { key: 'tech_staff_stagehands', label: 'Stagehands', type: 'number', def: '1' },
      { key: 'tech_staff_prompter', label: 'Prompter', type: 'number', def: '0' },
      { key: 'tech_staff_other', label: 'Other crew', wide: true, placeholder: 'e.g. 1 dresser, 1 video operator' },
    ],
  },
  {
    id: 'team', num: '03', title: 'Creative Team', color: 'yellow',
    intro: 'The people behind the original production and what they can hand over.',
    lock: 'See who is behind each show: director, designers and composer.',
    fields: [
      { key: 'director', label: 'Director' },
      { key: 'music_author', label: 'Composer / Music' },
      { key: 'director_notes', label: "Director's notes", type: 'textarea', wide: true, placeholder: 'What matters most when staging this show.' },
      { key: 'original_production_solutions', label: 'Original staging solutions', type: 'textarea', wide: true,
        placeholder: 'Special set ideas, tricks, effects.' },
      { key: 'has_original_music', label: 'Original music', type: 'bool', def: 'false', help: 'Composed for this show.' },
      { key: 'has_video_projections', label: 'Video projections', type: 'bool', def: 'false' },
      { key: 'scenographer', label: 'Set designer' },
      { key: 'set_available', label: 'Original set', type: 'select', def: 'false',
        options: o(['false', 'Not available'], ['rent', 'For rent'], ['purchase', 'For purchase'], ['plans', 'Plans only']) },
      { key: 'lighting_designer', label: 'Lighting designer' },
      { key: 'lighting_design_available', label: 'Lighting design', type: 'select', def: 'false',
        options: o(['false', 'Not available'], ['cue_sheet', 'Cue sheet'], ['full', 'Full design + cue sheet']) },
      { key: 'costume_designer', label: 'Costume designer' },
      { key: 'costume_design_available', label: 'Original costumes', type: 'select', def: 'false',
        options: o(['false', 'Not available'], ['rent', 'For rent'], ['purchase', 'For purchase'], ['patterns', 'Patterns and specs']) },
      { key: 'video_author', label: 'Video / AV designer' },
      { key: 'video_description', label: 'Video description', wide: true, placeholder: 'What the projections show.' },
    ],
  },
  {
    id: 'script', num: '04', title: 'Script & Recording', color: 'cyan',
    intro: 'What a producer abroad can read and watch before deciding.',
    fields: [
      { key: 'script_in_english', label: 'Script in English', type: 'select', def: 'false',
        options: o(['false', 'Not yet'], ['partial', 'Partly translated'], ['true', 'Full script']) },
      { key: 'translations_available', label: 'Existing translations', placeholder: 'e.g. German, Croatian' },
      { key: 'translation_rights_included', label: 'Translation rights included', type: 'bool', def: 'false',
        help: 'The licensee may translate the script.' },
      { key: 'full_recording', label: 'Full recording on request', type: 'tri', help: 'You can send a video of the whole show.' },
      { key: 'script_excerpt_language', label: 'Excerpt language', def: 'English', dependsOn: 'script_scenario',
        placeholder: 'e.g. English', help: 'English is best, but any language is fine.' },
      { key: 'script_scenario', label: 'Script excerpt', type: 'textarea', wide: true, locked: true,
        placeholder: 'Paste one scene, up to 3 pages.',
        help: 'Optional, but shows with an excerpt get a badge in the catalog. Only Verified Producers can read it. Never paste the full script.' },
    ],
  },
  {
    id: 'track', num: '05', title: 'Track Record', color: 'white',
    intro: 'Where the show has played and how it did.',
    lock: 'See where this show has already played: premiere, performances, audience and awards.',
    fields: [
      { key: 'premiere_date', label: 'Premiere date', type: 'date' },
      { key: 'premiere_location', label: 'Premiere venue', placeholder: 'Theatre, city' },
      { key: 'performances_count', label: 'Performances so far', type: 'number', def: '0' },
      { key: 'total_audience', label: 'Audience so far', type: 'number', def: '0' },
      { key: 'locations_played', label: 'Where it has played', type: 'textarea', wide: true,
        placeholder: 'Cities and venues, e.g. Ljubljana, Maribor, Zagreb (HR)' },
      { key: 'awards', label: 'Awards', wide: true },
      { key: 'international_success_notes', label: 'Press & success', type: 'textarea', wide: true,
        placeholder: 'Reviews, sold-out runs, festivals.' },
    ],
  },
  {
    id: 'rights', num: '06', title: 'Rights', color: 'pink',
    intro: 'Who owns the rights and where they are available.',
    fields: [
      { key: 'rights_holder', label: 'Copyright holder', required: true, help: 'The person or company that owns the rights.' },
      { key: 'license_type', label: 'Deal type', type: 'select', def: 'License',
        help: 'Licence: they stage it. Option: they reserve it for a while first. Co-production: you produce it together.',
        options: o(['License', 'Licence'], ['Option', 'Option'], ['Co-production', 'Co-production']) },
      { key: 'exclusivity_level', label: 'Exclusivity', type: 'select', def: 'Exclusive',
        options: o(['Exclusive', 'Exclusive per territory'], ['Semi-exclusive', 'Semi-exclusive'], ['Non-exclusive', 'Non-exclusive']) },
      { key: 'territories_available', label: 'Available in', def: 'Worldwide', placeholder: 'e.g. Worldwide, or all except Slovenia' },
      { key: 'licensed_countries', label: 'Already licensed in', placeholder: 'e.g. Croatia, Austria' },
    ],
  },
];

// ─── LICENSING PACKAGES (section 07) ─────────────────────────────────────────
export const PACKAGES_SECTION = {
  num: '07', title: 'Licensing Packages',
  intro: 'Offer one package or both. The royalty is a percentage of gross box office, paid per performance.',
};

export const PACKAGE_INFO = {
  script: {
    name: 'The Script', icon: '📄', tagline: 'They stage their own version.',
    text: 'The licensee gets the script and the right to perform it. They make their own production: their own director, set, music and costumes.',
    buyerText: 'You get the script and the right to perform it. You make your own production: your own director, set, music and costumes.',
  },
  fullPunch: {
    name: 'Full Punch', icon: '🥊', tagline: 'They restage your original production.',
    text: 'The licensee gets the script plus the know-how of your production: the materials you tick below. They can recreate the show the way it plays at home.',
    buyerText: 'You get the script plus the know-how of the original production: the materials listed here. You can recreate the show the way it plays at home.',
  },
  royaltyHelp: '% of gross box office, per performance. Leave empty for "on request".',
  advanceHelp: 'Optional. Paid once when the licence is signed.',
};

export const FP_ITEMS: { key: string; label: string; icon: string; desc: string; always?: boolean }[] = [
  { key: 'fp_the_script', icon: '📄', label: 'The Script', desc: 'Full script with stage directions', always: true },
  { key: 'fp_the_playbook', icon: '📋', label: 'The Playbook', desc: "Director's book: blocking, notes, rehearsal plan" },
  { key: 'fp_the_soundtrack', icon: '🎵', label: 'The Soundtrack', desc: 'Music files and cue sheet' },
  { key: 'fp_the_visuals', icon: '🎬', label: 'The Visuals', desc: 'Video projection files and specs' },
  { key: 'fp_the_wardrobe', icon: '👗', label: 'The Wardrobe', desc: 'Costume sketches, patterns and suppliers' },
  { key: 'fp_the_set_blueprint', icon: '🏗️', label: 'The Set Blueprint', desc: 'Set plans and construction notes' },
  { key: 'fp_the_tech_rider', icon: '🔧', label: 'The Tech Rider', desc: 'Full technical requirements' },
  { key: 'fp_the_promo_kit', icon: '📸', label: 'The Promo Kit', desc: 'Photos, trailer, poster files and press texts' },
  { key: 'fp_the_handover_session', icon: '🤝', label: 'The Handover Session', desc: 'Live session with your director or creative team' },
];

export const PUNCH_LANGUAGES = ['EN', 'SI', 'DE', 'FR', 'IT', 'ES', 'HR', 'PL', 'CZ', 'HU', 'RO'];

const PACKAGE_BOOL_KEYS = ['has_script_package', 'has_full_punch_package', 'fp_punch_support', ...FP_ITEMS.map(i => i.key)];
const PACKAGE_NUM_KEYS = ['script_royalty_pct', 'script_advance_fee', 'full_punch_royalty_pct', 'full_punch_advance_fee'];

export const ALL_FIELDS: FieldDef[] = SHOW_SECTIONS.flatMap(s => s.fields);

// ─── VALUES ──────────────────────────────────────────────────────────────────
export type ShowForm = Record<string, any>;

const camel = (k: string) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

/** Raw DB value of a field from a (mapped) show object. */
export const rawValue = (show: any, key: string): any => {
  if (!show) return undefined;
  if (key === 'title') return show.originalTitle ?? show.title;           // mapped shows put the English title in `title`
  if (key === 'english_title') return show.english_title || show.englishTitle || show.title;
  if (key === 'original_language') return show.original_language || show.originalLanguage || show.language;
  if (show[key] !== undefined && show[key] !== null) return show[key];
  return show[camel(key)];
};

const boolStr = (v: any) => (v === true || v === 'true' ? 'true' : 'false');
const triStr = (v: any) => (v === true || v === 'true' ? 'true' : v === false || v === 'false' ? 'false' : '');

export const emptyForm = (): ShowForm => {
  const f: ShowForm = {};
  ALL_FIELDS.forEach(d => { f[d.key] = d.def ?? ''; });
  PACKAGE_BOOL_KEYS.forEach(k => { f[k] = false; });
  PACKAGE_NUM_KEYS.forEach(k => { f[k] = ''; });
  f.has_script_package = true;
  f.fp_the_script = true;
  f.fp_punch_language = 'EN';
  return f;
};

export const formFromShow = (show: any): ShowForm => {
  const f = emptyForm();
  ALL_FIELDS.forEach(d => {
    const v = rawValue(show, d.key);
    if (d.type === 'bool') f[d.key] = v === undefined || v === null ? (d.def ?? 'false') : boolStr(v);
    else if (d.type === 'tri') f[d.key] = triStr(v);
    else f[d.key] = v === undefined || v === null ? '' : String(v);
  });
  if (f.title === f.english_title) f.title = '';
  PACKAGE_BOOL_KEYS.forEach(k => { const v = rawValue(show, k); f[k] = v === true || v === 'true'; });
  f.has_script_package = rawValue(show, 'has_script_package') !== false;
  f.fp_the_script = true;
  PACKAGE_NUM_KEYS.forEach(k => { const v = rawValue(show, k); f[k] = v === undefined || v === null ? '' : String(v); });
  f.fp_punch_language = rawValue(show, 'fp_punch_language') || 'EN';
  return f;
};

/** Form → columns for supabase insert/update. */
export const formToDb = (f: ShowForm): Record<string, any> => {
  const out: Record<string, any> = {};
  ALL_FIELDS.forEach(d => {
    const v = f[d.key];
    switch (d.type) {
      case 'number': {
        const n = v === '' || v === null || v === undefined ? NaN : Number(v);
        out[d.key] = Number.isFinite(n) ? Math.round(n) : (d.key === 'production_year' ? new Date().getFullYear() : 0);
        break;
      }
      case 'bool': out[d.key] = v === true || v === 'true'; break;
      case 'tri': out[d.key] = v === 'true' ? true : v === 'false' ? false : null; break;
      case 'date': out[d.key] = v ? String(v) : null; break;
      default: out[d.key] = (v ?? '').toString().trim();
    }
  });
  out.english_title = out.english_title || out.title;
  out.title = out.title || out.english_title;
  out.language = out.original_language;               // catalog language filter reads `language`
  PACKAGE_BOOL_KEYS.forEach(k => { out[k] = !!f[k]; });
  out.fp_the_script = true;
  PACKAGE_NUM_KEYS.forEach(k => { const n = Number(f[k]); out[k] = f[k] === '' || f[k] === null || !Number.isFinite(n) ? null : n; });
  out.fp_punch_language = f.fp_punch_language || 'EN';
  return out;
};

/** The short checklist shown on top of Showload: everything needed to publish. */
export const requiredChecklist = (f: ShowForm, hasPoster: boolean): { label: string; done: boolean; section: string }[] => [
  ...SHOW_SECTIONS.flatMap(sec => sec.fields.filter(d => d.required).map(d => ({
    label: d.label,
    section: sec.id,
    done: d.key === 'english_title' ? !!String(f.english_title || f.title || '').trim() : !!String(f[d.key] ?? '').trim(),
  }))),
  { label: 'Licensing package', section: 'packages', done: !!(f.has_script_package || f.has_full_punch_package) },
  { label: 'Show poster', section: 'poster', done: hasPoster },
];

/** Missing required fields → list of labels. */
export const missingRequired = (f: ShowForm): string[] => {
  const errs: string[] = [];
  ALL_FIELDS.filter(d => d.required).forEach(d => {
    if (d.key === 'english_title') { if (!String(f.english_title || f.title || '').trim()) errs.push(d.label); return; }
    if (!String(f[d.key] ?? '').trim()) errs.push(d.label);
  });
  if (!f.has_script_package && !f.has_full_punch_package) errs.push('At least one licensing package');
  return errs;
};

/** Human-readable value for the dossier/PDF, or '' when there is nothing worth showing. */
export const displayValue = (d: FieldDef, raw: any): string => {
  if (raw === undefined || raw === null) return '';
  switch (d.type) {
    case 'bool': return raw === true || raw === 'true' ? 'Yes' : 'No';
    case 'tri': return raw === true || raw === 'true' ? 'Yes' : raw === false || raw === 'false' ? 'No' : '';
    case 'number': { const n = Number(raw); if (!Number.isFinite(n) || n <= 0) return ''; return d.key === 'production_year' ? String(n) : n.toLocaleString('en-US'); }
    case 'select': {
      const s = String(raw);
      if (s === '' || (s === 'false' && d.options?.[0]?.value === 'false' && d.key !== 'script_in_english')) return '';
      return d.options?.find(op => op.value === s)?.label || s;
    }
    default: return String(raw).trim();
  }
};
