import React from 'react';
import {
  SHOW_SECTIONS, PACKAGES_SECTION, PACKAGE_INFO, FP_ITEMS, PUNCH_LANGUAGES, COUNTRIES, COLOR_TEXT,
  FieldDef, SectionDef, ShowForm, rawValue, displayValue,
} from '../lib/showFields';
import { VerifiedLock } from './Mascot';

const inp = "w-full bg-brand-black border-2 border-white/20 px-4 py-3 text-white font-bold outline-none focus:border-brand-cyan text-sm";
const sel = "w-full bg-brand-black border-2 border-white/20 px-4 py-3 text-white font-black text-xs uppercase italic outline-none focus:border-brand-cyan";
const lbl = "block text-[9px] font-black uppercase text-white/50 mb-1.5 italic tracking-widest";
const help = "text-white/30 text-[10px] italic mt-1 leading-snug";

type SetField = (key: string, value: any) => void;

// ─── FORM ────────────────────────────────────────────────────────────────────

const FieldInput: React.FC<{ d: FieldDef; form: ShowForm; set: SetField }> = ({ d, form, set }) => {
  const v = form[d.key] ?? '';
  const on = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(d.key, e.target.value);
  switch (d.type) {
    case 'title':
      return <input value={v} onChange={on} placeholder={d.placeholder}
        className="w-full bg-brand-black border-2 border-white px-5 py-4 text-white font-bold uppercase text-xl focus:border-brand-yellow outline-none" />;
    case 'textarea':
      return <textarea value={v} onChange={on} rows={d.key === 'script_scenario' ? 8 : 4} placeholder={d.placeholder}
        className={inp + ' italic resize-y'} />;
    case 'select':
      return <select value={v} onChange={on} className={sel}>{d.options!.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}</select>;
    case 'country':
      return <select value={v} onChange={on} className={sel}>
        <option value="">Choose country...</option>
        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        {v && !COUNTRIES.includes(v) && <option value={v}>{v}</option>}
      </select>;
    case 'bool':
      return <select value={v || 'false'} onChange={on} className={sel}><option value="true">Yes</option><option value="false">No</option></select>;
    case 'tri':
      return <select value={v} onChange={on} className={sel}><option value="">Not specified</option><option value="true">Yes</option><option value="false">No</option></select>;
    case 'number':
      return <input type="number" min={0} value={v} onChange={on} placeholder={d.placeholder} className={inp} />;
    case 'date':
      return <input type="date" value={v} onChange={on} className={inp} />;
    case 'url':
      return <input type="url" value={v} onChange={on} placeholder={d.placeholder} className={inp} />;
    default:
      return <input value={v} onChange={on} placeholder={d.placeholder} className={inp} />;
  }
};

const SectionHead: React.FC<{ num: string; title: string; intro: string; color: string }> = ({ num, title, intro, color }) => (
  <div className="border-b-2 border-white/10 pb-3 mb-2">
    <h3 className={`text-xl font-black uppercase italic ${color}`}>{num}. {title}</h3>
    <p className="text-white/40 text-xs italic mt-0.5">{intro}</p>
  </div>
);

// Short answers (numbers, yes/no) sit two per row even on phones.
const HALF = ['number', 'bool', 'tri'];

const sectionBox = "bg-brand-surface border-2 border-white p-6 md:p-8 space-y-5";

/** All show fields, same order and labels everywhere. Non-required fields carry the `opt` class
 *  so Showload can hide them behind "Show more details". */
export const ShowFormFields: React.FC<{ form: ShowForm; set: SetField; compact?: boolean }> = ({ form, set, compact }) => (
  <>
    {SHOW_SECTIONS.map(s => {
      const anyRequired = s.fields.some(f => f.required);
      return (
        <section key={s.id} id={'sec-' + s.id} className={'scroll-mt-44 ' + (compact ? 'border-2 border-white/20 p-5 space-y-4' : sectionBox) + (anyRequired ? '' : ' opt')}>
          <SectionHead num={s.num} title={s.title} intro={s.intro} color={COLOR_TEXT[s.color]} />
          {s.lock && <p className="text-[10px] italic text-white/30 -mt-2">Shown only to Verified Producers in the catalog.</p>}
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-4">
            {s.fields.map(d => (
              <div key={d.key} className={'min-w-0 ' + (d.wide ? 'col-span-2 ' : HALF.includes(d.type || 'text') ? 'col-span-1 ' : 'col-span-2 sm:col-span-1 ') + (d.required ? '' : 'opt')}>
                <label className={lbl}>{d.label}{d.required && <span className="text-brand-pink"> *</span>}</label>
                <FieldInput d={d} form={form} set={set} />
                {d.help && <p className={help}>{d.help}</p>}
              </div>
            ))}
          </div>
        </section>
      );
    })}
    <PackagesEditor form={form} set={set} compact={compact} />
  </>
);

export const PackagesEditor: React.FC<{ form: ShowForm; set: SetField; compact?: boolean }> = ({ form, set, compact }) => (
  <section id="sec-packages" className={'scroll-mt-44 ' + (compact ? 'border-2 border-white/20 p-5 space-y-4' : sectionBox)}>
    <SectionHead num={PACKAGES_SECTION.num} title={PACKAGES_SECTION.title} intro={PACKAGES_SECTION.intro} color="text-brand-yellow" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      {/* THE SCRIPT */}
      <div className={"border-2 p-5 space-y-4 transition-colors " + (form.has_script_package ? 'border-brand-yellow bg-brand-yellow/5' : 'border-white/15')}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={!!form.has_script_package} onChange={e => set('has_script_package', e.target.checked)} className="w-5 h-5 accent-brand-yellow mt-1" />
          <span>
            <span className="block font-black uppercase italic text-white text-lg">{PACKAGE_INFO.script.icon} {PACKAGE_INFO.script.name}</span>
            <span className="block text-brand-yellow text-xs font-black uppercase italic">{PACKAGE_INFO.script.tagline}</span>
          </span>
        </label>
        <p className="text-white/50 text-xs italic leading-relaxed">{PACKAGE_INFO.script.text}</p>
        {form.has_script_package && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Royalty %</label>
              <input type="number" min={0} value={form.script_royalty_pct} onChange={e => set('script_royalty_pct', e.target.value)} className={inp} placeholder="10" />
              <p className={help}>{PACKAGE_INFO.royaltyHelp}</p>
            </div>
            <div>
              <label className={lbl}>Advance (EUR)</label>
              <input type="number" min={0} value={form.script_advance_fee} onChange={e => set('script_advance_fee', e.target.value)} className={inp} placeholder="0" />
              <p className={help}>{PACKAGE_INFO.advanceHelp}</p>
            </div>
          </div>
        )}
      </div>

      {/* FULL PUNCH */}
      <div className={"border-2 p-5 space-y-4 transition-colors " + (form.has_full_punch_package ? 'border-brand-pink bg-brand-pink/5' : 'border-white/15')}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={!!form.has_full_punch_package} onChange={e => set('has_full_punch_package', e.target.checked)} className="w-5 h-5 accent-brand-pink mt-1" />
          <span>
            <span className="block font-black uppercase italic text-white text-lg">{PACKAGE_INFO.fullPunch.icon} {PACKAGE_INFO.fullPunch.name}</span>
            <span className="block text-brand-pink text-xs font-black uppercase italic">{PACKAGE_INFO.fullPunch.tagline}</span>
          </span>
        </label>
        <p className="text-white/50 text-xs italic leading-relaxed">{PACKAGE_INFO.fullPunch.text}</p>
        {form.has_full_punch_package && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Royalty %</label>
                <input type="number" min={0} value={form.full_punch_royalty_pct} onChange={e => set('full_punch_royalty_pct', e.target.value)} className={inp} placeholder="15" />
                <p className={help}>{PACKAGE_INFO.royaltyHelp}</p>
              </div>
              <div>
                <label className={lbl}>Advance (EUR)</label>
                <input type="number" min={0} value={form.full_punch_advance_fee} onChange={e => set('full_punch_advance_fee', e.target.value)} className={inp} placeholder="0" />
                <p className={help}>{PACKAGE_INFO.advanceHelp}</p>
              </div>
            </div>
            <div>
              <p className={lbl}>What is in the package</p>
              <div className="space-y-2">
                {FP_ITEMS.map(it => (
                  <label key={it.key} className={"flex items-start gap-3 " + (it.always ? 'opacity-60' : 'cursor-pointer')}>
                    <input type="checkbox" disabled={it.always} checked={it.always || !!form[it.key]} onChange={e => set(it.key, e.target.checked)} className="w-4 h-4 accent-brand-pink mt-0.5" />
                    <span>
                      <span className="font-black uppercase italic text-white text-xs">{it.icon} {it.label}</span>
                      {it.always && <span className="text-[8px] text-brand-yellow/70 ml-2 uppercase">always included</span>}
                      <span className="block text-white/35 text-[10px] italic">{it.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Language of the materials</label>
                <select value={form.fp_punch_language || 'EN'} onChange={e => set('fp_punch_language', e.target.value)} className={sel}>
                  {PUNCH_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <label className="flex items-start gap-3 cursor-pointer pt-5">
                <input type="checkbox" checked={!!form.fp_punch_support} onChange={e => set('fp_punch_support', e.target.checked)} className="w-4 h-4 accent-brand-pink mt-0.5" />
                <span>
                  <span className="font-black uppercase italic text-white text-xs">🤝 Punch Support</span>
                  <span className="block text-white/35 text-[10px] italic">Your team helps the new team during rehearsals.</span>
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  </section>
);

// ─── DOSSIER ─────────────────────────────────────────────────────────────────

const BORDER: Record<SectionDef['color'], string> = { cyan: 'border-brand-cyan', pink: 'border-brand-pink', yellow: 'border-brand-yellow', white: 'border-white/30' };

const hasValue = (show: any, d: FieldDef) =>
  displayValue(d, rawValue(show, d.key)) !== '' && (!d.dependsOn || !!String(rawValue(show, d.dependsOn) ?? '').trim());

/** Catalog dossier: the same sections, labels and order as the forms. */
export const ShowDossierSections: React.FC<{ show: any; fullAccess: boolean; onList?: () => void; onAskExcerpt?: () => void }> = ({ show, fullAccess, onList, onAskExcerpt }) => (
  <>
    {SHOW_SECTIONS.map((s: SectionDef) => {
      const fields = s.fields.filter(d => !d.hideInDossier && hasValue(show, d));
      if (fields.length === 0) return null;
      const short = fields.filter(d => !d.wide);
      const wide = fields.filter(d => d.wide);
      return (
        <section key={s.id} className="space-y-4">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] italic ${COLOR_TEXT[s.color]}`}>{s.num}. {s.title}</h4>
          {s.lock && !fullAccess ? <VerifiedLock what={s.lock} onList={onList} /> : (
            <>
              {short.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {short.map(d => (
                    <div key={d.key} className="bg-brand-surface border border-white/15 p-3 md:p-4 min-w-0" title={d.help}>
                      <p className="text-[8px] font-black uppercase text-white/40 tracking-widest italic mb-1">{d.label}</p>
                      {d.locked && !fullAccess
                        ? <p className="text-xs font-black italic text-white/30">🔒 Verified Producers</p>
                        : <p className="text-sm font-black uppercase italic break-words">{displayValue(d, rawValue(show, d.key))}</p>}
                    </div>
                  ))}
                </div>
              )}
              {wide.map(d => (
                d.locked && !fullAccess ? (
                  <VerifiedLock key={d.key} what={d.key === 'script_scenario' ? 'Read the script excerpt of every show in the catalog.' : `See the ${d.label.toLowerCase()}.`} onList={onList} />
                ) : d.key === 'script_scenario' ? (
                  <div key={d.key} className="space-y-2">
                    <p className="text-[8px] font-black uppercase text-brand-yellow tracking-widest italic">{d.label}</p>
                    <div className="bg-black border-2 border-brand-yellow p-4 md:p-8 overflow-hidden">
                      <pre className="text-white font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words">{displayValue(d, rawValue(show, d.key))}</pre>
                    </div>
                  </div>
                ) : (
                  <div key={d.key} className={`border-l-4 pl-4 py-2 bg-white/5 ${BORDER[s.color]}`}>
                    <p className="text-[8px] font-black uppercase text-white/40 tracking-widest italic mb-1">{d.label}</p>
                    <p className="text-sm italic text-gray-200 leading-relaxed break-words whitespace-pre-line">{displayValue(d, rawValue(show, d.key))}</p>
                  </div>
                )
              ))}
              {s.id === 'script' && onAskExcerpt && !String(rawValue(show, 'script_scenario') ?? '').trim() && (
                <div className="border-2 border-dashed border-white/20 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase italic tracking-[0.3em] text-brand-yellow mb-1">Excerpt on request</p>
                    <p className="text-white/60 text-sm font-bold italic">No script excerpt online yet. Ask the producer and they can send you a scene.</p>
                  </div>
                  <button onClick={onAskExcerpt} className="bg-white text-black px-6 py-3 font-black uppercase italic text-xs tracking-widest hover:bg-brand-yellow transition-colors whitespace-nowrap">
                    Ask for an excerpt →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      );
    })}
  </>
);
