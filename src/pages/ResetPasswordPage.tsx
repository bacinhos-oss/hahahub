{\rtf1\ansi\ansicpg1252\cocoartf1561\cocoasubrtf610
{\fonttbl\f0\fswiss\fcharset0 ArialMT;}
{\colortbl;\red255\green255\blue255;\red26\green26\blue26;\red255\green255\blue255;}
{\*\expandedcolortbl;;\cssrgb\c13333\c13333\c13333;\cssrgb\c100000\c100000\c100000;}
\paperw11900\paperh16840\margl1440\margr1440\vieww10800\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\sl220\partightenfactor0

\f0\fs20 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import React, \{ useState \} from 'react';\
import \{ supabase \} from '../lib/supabase';\
\
interface Props \{ onSuccess: () => void; \}\
\
const ResetPasswordPage: React.FC<Props> = (\{ onSuccess \}) => \{\
\'a0 const [password, setPassword] = useState('');\
\'a0 const [confirm, setConfirm] = useState('');\
\'a0 const [loading, setLoading] = useState(false);\
\'a0 const [error, setError] = useState('');\
\'a0 const [done, setDone] = useState(false);\
\
\'a0 const handleSubmit = async (e: React.FormEvent) => \{\
\'a0 \'a0 e.preventDefault();\
\'a0 \'a0 if (password !== confirm) \{ setError('Passwords do not match'); return; \}\
\'a0 \'a0 setLoading(true);\
\'a0 \'a0 const \{ error \} = await supabase.auth.updateUser(\{ password \});\
\'a0 \'a0 if (error) \{ setError(error.message); setLoading(false); return; \}\
\'a0 \'a0 setDone(true);\
\'a0 \'a0 setTimeout(() => onSuccess(), 2000);\
\'a0 \};\
\
\'a0 if (done) return (\
\'a0 \'a0 <div style=\{\{ minHeight:'100vh', background:'#050505', display:'flex', alignItems:'center', justifyContent:'center' \}\}>\
\'a0 \'a0 \'a0 <div style=\{\{ color:'#03DAC6', fontFamily:'monospace', fontSize:'2rem', fontWeight:900 \}\}>PASSWORD UPDATED! Redirecting...</div>\
\'a0 \'a0 </div>\
\'a0 );\
\
\'a0 return (\
\'a0 \'a0 <div style=\{\{ minHeight:'100vh', background:'#050505', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' \}\}>\
\'a0 \'a0 \'a0 <div style=\{\{ background:'#f5f5f0', border:'8px solid #0a0a0a', padding:'48px', maxWidth:'420px', width:'100%', boxShadow:'12px 12px 0 #FF0266' \}\}>\
\'a0 \'a0 \'a0 \'a0 <h1 style=\{\{ fontFamily:'monospace', fontSize:'1.5rem', fontWeight:900, marginBottom:'32px', color:'#0a0a0a', textTransform:'uppercase' \}\}>Set New Password</h1>\
\'a0 \'a0 \'a0 \'a0 <form onSubmit=\{handleSubmit\} style=\{\{ display:'flex', flexDirection:'column', gap:'20px' \}\}>\
\'a0 \'a0 \'a0 \'a0 \'a0 <input type="password" value=\{password\} onChange=\{e=>setPassword(e.target.value)\} required minLength=\{6\} placeholder="New password" style=\{\{ width:'100%', background:'#e8e8e3', border:'4px solid #0a0a0a', padding:'14px', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' \}\} />\
\'a0 \'a0 \'a0 \'a0 \'a0 <input type="password" value=\{confirm\} onChange=\{e=>setConfirm(e.target.value)\} required placeholder="Confirm password" style=\{\{ width:'100%', background:'#e8e8e3', border:'4px solid #0a0a0a', padding:'14px', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' \}\} />\
\'a0 \'a0 \'a0 \'a0 \'a0 \{error && <div style=\{\{ background:'#FF0266', color:'#fff', padding:'12px', fontSize:'0.8rem', fontWeight:700 \}\}>\{error\}</div>\}\
\'a0 \'a0 \'a0 \'a0 \'a0 <button type="submit" disabled=\{loading\} style=\{\{ background:'#0a0a0a', color:'#FFDE03', border:'4px solid #0a0a0a', padding:'16px', fontWeight:900, fontSize:'1rem', textTransform:'uppercase', cursor:'pointer' \}\}>\
\'a0 \'a0 \'a0 \'a0 \'a0 \'a0 \{loading ? 'SAVING...' : 'SET NEW PASSWORD \uc0\u8594 '\}\
\'a0 \'a0 \'a0 \'a0 \'a0 </button>\
\'a0 \'a0 \'a0 \'a0 </form>\
\'a0 \'a0 \'a0 </div>\
\'a0 \'a0 </div>\
\'a0 );\
\};\
\
export default ResetPasswordPage;}