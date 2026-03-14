import React, { useState, useRef, useEffect } from 'react'
import { FEEDBACK_TYPES } from '../constants'

export function ConfirmDialog({ dialog, onCancel, onConfirm }) {
  if (!dialog) return null
  const M = {
    emptyTrash: { icon: '🗑', title: 'Empty trash?',      body: 'All trashed notes will be permanently deleted.' },
    deleteAll:  { icon: '⚠️', title: 'Delete all notes?', body: 'This action cannot be undone.' },
    delete:     { icon: '🗑', title: 'Delete permanently?', body: 'This action cannot be undone.' },
  }
  const m = M[dialog.type]
  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 500 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          background: '#161616', borderRadius: 18, padding: '24px 20px', zIndex: 510,
          width: 'min(284px, 88vw)', textAlign: 'center', border: '1px solid #222',
          animation: 'popIn .22s cubic-bezier(.34,1.56,.64,1) both' }}>
        <div style={{ fontSize: 26, marginBottom: 10 }}>{m.icon}</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 7 }}>{m.title}</div>
        <div style={{ fontSize: 12, color: '#4a4a4a', marginBottom: 20 }}>{m.body}</div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button onClick={onCancel}  style={{ flex: 1, padding: 11, background: '#1e1e1e', borderRadius: 10, fontSize: 13, color: '#777', border: '1px solid #2a2a2a' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 11, background: '#e05555', borderRadius: 10, fontSize: 13, color: '#fff', fontWeight: 700 }}>Delete</button>
        </div>
      </div>
    </>
  )
}

export function FeedbackSheet({ open, onClose, noteCount }) {
  const [type, setType] = useState(null)
  const [text, setText] = useState('')
  const [sent, setSent]  = useState(false)
  const textRef = useRef(null)

  useEffect(() => { if (open) { setType(null); setText(''); setSent(false) } }, [open])
  useEffect(() => { if (type) setTimeout(() => textRef.current && textRef.current.focus(), 120) }, [type])

  if (!open) return null
  const chosen = FEEDBACK_TYPES.find(t => t.id === type)

  const send = () => {
    if (!text.trim()) return
    const subj = `Inkwell ${chosen.label} — ${new Date().toLocaleDateString()}`
    const body  = [text.trim(), '', '---', `Type: ${chosen.emoji} ${chosen.label}`, `Notes: ${noteCount}`, `UA: ${navigator.userAgent.slice(0, 80)}`].join('\n')
    window.location.href = `mailto:feedback@inkwell.app?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
    setSent(true); setTimeout(onClose, 2000)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 400, backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 410, background: '#141414',
          borderRadius: '20px 20px 0 0', border: '1px solid #222', borderBottom: 'none',
          boxShadow: '0 -8px 48px rgba(0,0,0,.9)', animation: 'slideInUp .26s cubic-bezier(.22,1,.36,1) both',
          paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#2e2e2e', margin: '14px auto 0' }} />
        {sent ? (
          <div style={{ padding: '32px 24px 44px', textAlign: 'center', animation: 'popIn .3s cubic-bezier(.34,1.56,.64,1) both' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🙏</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#e0dbd0', marginBottom: 6 }}>Thank you!</div>
            <div style={{ fontSize: 13, color: '#555' }}>Your feedback means a lot to us.</div>
          </div>
        ) : !type ? (
          <div style={{ padding: '20px 20px 32px' }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e0dbd0', marginBottom: 5 }}>Share Feedback</div>
              <div style={{ fontSize: 13, color: '#444', lineHeight: 1.5 }}>Help us improve Inkwell — pick what best describes your feedback.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {FEEDBACK_TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                    onMouseEnter={ev => { ev.currentTarget.style.background = '#1a1a1a'; ev.currentTarget.style.borderColor = '#333' }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = '#0f0f0f'; ev.currentTarget.style.borderColor = '#222' }}
                    style={{ flex: 1, padding: '18px 8px 14px', background: '#0f0f0f', border: '1px solid #222',
                      borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all .14s' }}>
                  <span style={{ fontSize: 30 }}>{t.emoji}</span>
                  <span style={{ fontSize: 12, color: '#ccc', fontWeight: 600 }}>{t.label}</span>
                  <span style={{ fontSize: 10, color: '#444', textAlign: 'center', lineHeight: 1.4 }}>{t.hint}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '18px 20px 24px', animation: 'fadeSlideIn .2s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <button onClick={() => setType(null)} style={{ color: '#555', fontSize: 20 }}>←</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20, padding: '5px 13px' }}>
                <span style={{ fontSize: 15 }}>{chosen.emoji}</span>
                <span style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>{chosen.label}</span>
              </div>
              <button onClick={onClose} style={{ marginLeft: 'auto', color: '#3a3a3a', fontSize: 16 }}>✕</button>
            </div>
            <textarea ref={textRef} value={text} onInput={ev => setText(ev.target.value)}
              placeholder={chosen.placeholder} rows={4}
              style={{ width: '100%', background: '#0d0d0d', border: '1px solid #222', borderRadius: 12,
                padding: '14px 16px', fontSize: 15, color: '#d0cbc0', fontFamily: "'Lora',Georgia,serif",
                lineHeight: 1.6, outline: 'none', caretColor: '#7fb3a0' }} />
            <button onClick={send} disabled={!text.trim()} style={{
              width: '100%', marginTop: 10, padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700,
              background: text.trim() ? '#1e2e28' : '#111', color: text.trim() ? '#7fb3a0' : '#333',
              border: text.trim() ? '1px solid #2e4a3e' : '1px solid #1a1a1a',
              transition: 'all .18s', cursor: text.trim() ? 'pointer' : 'default',
            }}>Send feedback →</button>
            <p style={{ fontSize: 10, color: '#2e2e2e', textAlign: 'center', marginTop: 8 }}>Opens your mail app · nothing stored on our servers</p>
          </div>
        )}
      </div>
    </>
  )
}
