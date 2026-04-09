import React, { useState } from 'react'
import Navigation from '../components/Navigation'
import { supabase } from '../lib/supabase'
import { Page, User, Show } from '../types'

interface Props {
  user?: User | null
  onNavigate: (page: Page) => void
  onLogout: () => void
  onUpload: (show: Partial<Show>) => Promise<void>
}

const UploadPage: React.FC<Props> = ({ user, onNavigate, onLogout, onUpload }) => {
  const [form, setForm] = useState({
    title: '', author: '', director: '', synopsis: '', genre: 'Comedy',
    language: 'Slovenščina', location: '', duration: '90',
    maleRoles: '1', femaleRoles: '1', rightsHolder: '',
    licenseType: 'License', licensingModel: 'Royalty-based', royaltyRange: '8-10%',
    rightsStatus: 'Available', productionYear: new Date().getFullYear().toString()
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    const errs: string[] = []
    if (!form.title) errs.push('Naslov')
    if (!form.author) errs.push('Avtor')
    if (!form.synopsis) errs.push('Sinopsis')
    if (!form.location) errs.push('Izvor')
    if (!form.rightsHolder) errs.push('Imetnik pravic')
    if (errs.length > 0) { setErrors(errs); return }

    setLoading(true)
    setErrors([])

    try {
      let imageUrl = ''
      if (imageFile && user) {
        const ext = imageFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { data: uploadData } = await supabase.storage.from('show-images').upload(path, imageFile)
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('show-images').getPublicUrl(path)
          imageUrl = urlData.publicUrl
        }
      }

      await onUpload({
        title: form.title,
        author: form.author,
        director: form.director,
        synopsis: form.synopsis,
        genre: form.genre,
        language: form.language,
        location: form.location,
        duration: parseInt(form.duration),
        maleRoles: parseInt(form.maleRoles),
        femaleRoles: parseInt(form.femaleRoles),
        rightsHolder: form.rightsHolder,
        licenseType: form.licenseType,
        licensingModel: form.licensingModel,
        royaltyRange: form.royaltyRange,
        rightsStatus: form.rightsStatus,
        productionYear: parseInt(form.productionYear),
        imageUrl,
        producerName: user?.name || '',
        producerEmail: user?.email || '',
        likesCount: 0,
        viewsCount: 0,
      })

      setSuccess(true)
      setTimeout(() => { setSuccess(false); onNavigate('subscription') }, 2500)
    } catch (err) {
      setErrors(['Save error. Please try again.'])
    }
    setLoading(false)
  }

  const inp: React.CSSProperties = { width: '100%', background: '#0a0a0a', border: '2px solid rgba(245,245,240,0.15)', padding: '0.875rem 1rem', color: '#f5f5f0', fontFamily: 'Space Mono', fontSize: '0.8rem', outline: 'none' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.4rem', color: 'rgba(245,245,240,0.5)', fontFamily: 'Barlow Condensed' }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#00E5FF', border: '8px solid #0a0a0a', padding: '4rem', textAlign: 'center', boxShadow: '12px 12px 0 #FF0266' }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '5rem', color: '#0a0a0a', textTransform: 'uppercase' }}>DEPLOYED!</div>
          <p style={{ fontFamily: 'Space Mono', fontSize: '0.85rem', color: '#0a0a0a', marginTop: '1rem' }}>Show is in the catalog. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f0' }}>
      <Navigation activePage="upload" user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <main style={{ paddingTop: '6rem', padding: '6rem 2rem 4rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '4rem', textTransform: 'uppercase', marginBottom: '3rem', lineHeight: 0.9 }}>
          DEPLOY <span style={{ color: '#00E5FF' }}>PREDSTAVO</span>
        </h1>

        {errors.length > 0 && (
          <div style={{ background: '#FF0266', padding: '1rem 1.5rem', marginBottom: '2rem', fontFamily: 'Space Mono', fontSize: '0.8rem' }}>
            Missing required fields: {errors.join(', ')}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Section 1 */}
            <div style={{ background: '#161616', border: '4px solid rgba(245,245,240,0.1)', padding: '2rem' }}>
              <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.5rem', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '1.5rem', borderBottom: '2px solid rgba(245,245,240,0.1)', paddingBottom: '0.75rem' }}>01. Identiteta</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Production Title *</label>
                  <input name="title" value={form.title} onChange={handle} style={{ ...inp, fontSize: '1.1rem', fontFamily: 'Barlow Condensed', fontWeight: 900 }} placeholder="E.G. THE CHRISTMAS COMEDY" />
                </div>
                <div>
                  <label style={lbl}>Author *</label>
                  <input name="author" value={form.author} onChange={handle} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Director</label>
                  <input name="director" value={form.director} onChange={handle} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Rights Holder *</label>
                  <input name="rightsHolder" value={form.rightsHolder} onChange={handle} style={{ ...inp, color: '#FFD600' }} />
                </div>
                <div>
                  <label style={lbl}>Origin Market *</label>
                  <input name="location" value={form.location} onChange={handle} style={inp} placeholder="E.G. USA, UK..." />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Synopsis *</label>
                  <textarea name="synopsis" value={form.synopsis} onChange={handle} rows={4} style={{ ...inp, resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div style={{ background: '#161616', border: '4px solid rgba(245,245,240,0.1)', padding: '2rem' }}>
              <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.5rem', textTransform: 'uppercase', color: '#FFD600', marginBottom: '1.5rem', borderBottom: '2px solid rgba(245,245,240,0.1)', paddingBottom: '0.75rem' }}>02. Produkcija</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lbl}>Genre</label>
                  <input name="genre" value={form.genre} onChange={handle} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Language</label>
                  <input name="language" value={form.language} onChange={handle} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Duration (min)</label>
                  <input name="duration" type="number" value={form.duration} onChange={handle} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Male Roles</label>
                  <input name="maleRoles" type="number" value={form.maleRoles} onChange={handle} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Female Roles</label>
                  <input name="femaleRoles" type="number" value={form.femaleRoles} onChange={handle} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Production Year</label>
                  <input name="productionYear" type="number" value={form.productionYear} onChange={handle} style={inp} />
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div style={{ background: '#161616', border: '4px solid rgba(245,245,240,0.1)', padding: '2rem' }}>
              <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.5rem', textTransform: 'uppercase', color: '#FF0266', marginBottom: '1.5rem', borderBottom: '2px solid rgba(245,245,240,0.1)', paddingBottom: '0.75rem' }}>03. Licence</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lbl}>License Type</label>
                  <select name="licenseType" value={form.licenseType} onChange={handle} style={{ ...inp, cursor: 'pointer' }}>
                    <option>License</option><option>Option</option><option>Co-production</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Licensing Model</label>
                  <select name="licensingModel" value={form.licensingModel} onChange={handle} style={{ ...inp, cursor: 'pointer' }}>
                    <option>Royalty-based</option><option>Flat fee</option><option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Royalty Range</label>
                  <input name="royaltyRange" value={form.royaltyRange} onChange={handle} style={inp} placeholder="8-10%" />
                </div>
                <div>
                  <label style={lbl}>Rights Status</label>
                  <select name="rightsStatus" value={form.rightsStatus} onChange={handle} style={{ ...inp, cursor: 'pointer' }}>
                    <option>Available</option><option>Licensed</option><option>Co-production Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ background: '#f5f5f0', border: '4px solid #0a0a0a', padding: '1.5rem', boxShadow: '8px 8px 0 #FFD600', position: 'sticky', top: '6rem' }}>
            <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.25rem', textTransform: 'uppercase', color: '#FF0266', marginBottom: '1.5rem', borderBottom: '3px solid #0a0a0a', paddingBottom: '0.75rem' }}>Poster</h3>

            <div onClick={() => document.getElementById('img-upload')?.click()} style={{ width: '100%', height: '220px', border: '4px dashed rgba(10,10,10,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '1.5rem', overflow: 'hidden', background: '#e8e8e3' }}>
              {imagePreview ? (
                <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(10,10,10,0.3)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Click to upload</div>
                </div>
              )}
            </div>
            <input id="img-upload" type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', background: '#FF0266', color: '#fff', border: '4px solid #0a0a0a', padding: '1.25rem', fontFamily: 'Barlow Condensed', fontWeight: 900, fontStyle: 'italic', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '4px 4px 0 #0a0a0a' }}
            >
              {loading ? 'UPLOADING...' : 'DEPLOY →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UploadPage
