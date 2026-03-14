import React, { useState } from 'react'
import { FONT_MAP } from '../constants'
import { exportNotes } from '../utils'
import FontPicker from './FontPicker'

export default function Settings({ open, onClose, prefs, onPref, notes, onDeleteAll, onRequestDeleteAll }) {
  const [tab, setTab] = useState('appearance')
  const [exportStatus, setExportStatus] = useState(null)

  if (!open) return null
  const { editorFont, fontSize, lineWidth } = prefs

  const handleExport = () => {
    setExportStatus('exporting')
    setTimeout(() => {
      exportNotes(notes, count => {
        setExportStatus(count)
        setTimeout(() => setExportStatus(null), 3000)
      })
    }, 80)
  }

  const TabRow = ({ tabs }) => (
    <div style={{ display: 'flex', gap: 3, marginBottom: 3, background: '#0d0d0d', borderRadius: 11, padding: 3 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => setTab(t)} style={{
          flex: 1, padding: '9px 6px', borderRadius: 9, fontSize: 12, fontWeight: 600, transition: 'all .14s',
          background: tab === t ? '#1e1e1e' : 'transparent',
          color: t === 'danger' ? '#e05555' : tab === t ? '#e0dbd0' : '#4a4a4a',
        }}>
          {t === 'danger' ? 'Danger Zone' : t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#141414',
          borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 20px 36px',
          maxHeight: '74vh', overflowY: 'auto',
          animation: 'slideInUp .28s cubic-bezier(.22,1,.36,1) both', borderTop: '1px solid #1e1e1e' }}>
        <div style={{ width: 32, height: 3, borderRadius: 2, background: '#2e2e2e', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>Settings</span>
          <button onClick={onClose} style={{ color: '#444', fontSize: 17 }}>✕</button>
        </div>
        <div style={{ marginBottom: 22 }}>
          <TabRow tabs={['appearance', 'editor']} />
          <TabRow tabs={['data', 'danger']} />
        </div>

        {tab === 'appearance' && (
          <div style={{ animation: 'fadeSlideIn .2s ease both' }}>
            <div style={{ fontSize: 10, color: '#444', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Editor Font</div>
            <FontPicker current={editorFont} onChange={v => onPref('editorFont', v)} />
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 10, color: '#444', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Font Size</div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0d0d0d', borderRadius: 10, padding: '10px 14px', border: '1px solid #1e1e1e' }}>
                <button onClick={() => onPref('fontSize', Math.max(12, fontSize - 1))} style={{ fontSize: 20, color: '#888', width: 32 }}>−</button>
                <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontFamily: FONT_MAP[editorFont] }}>{fontSize}</span>
                <button onClick={() => onPref('fontSize', Math.min(28, fontSize + 1))} style={{ fontSize: 20, color: '#888', width: 32 }}>+</button>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 10, color: '#444', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Line Width</div>
              <div style={{ display: 'flex', background: '#0d0d0d', borderRadius: 10, padding: 3, border: '1px solid #1e1e1e' }}>
                {['narrow', 'comfortable', 'wide'].map(w => (
                  <button key={w} onClick={() => onPref('lineWidth', w)} style={{
                    flex: 1, padding: '9px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700, transition: 'all .14s',
                    background: lineWidth === w ? '#1e1e1e' : 'transparent',
                    color: lineWidth === w ? '#e0dbd0' : '#4a4a4a',
                  }}>
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'editor' && (
          <div style={{ color: '#444', fontSize: 14, padding: '20px 0' }}>Editor preferences coming soon.</div>
        )}

        {tab === 'data' && (
          <div style={{ animation: 'fadeSlideIn .2s ease both' }}>
            <div style={{ background: '#0f0f0f', borderRadius: 12, padding: '14px 16px', border: '1px solid #1a1a1a', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#5a5a5a', lineHeight: 1.7 }}>
                All notes are stored <span style={{ color: '#7fb3a0', fontWeight: 600 }}>locally on this device</span> — nothing is sent to any server. Export downloads a plain .txt file of all your active notes.
              </div>
            </div>
            <button onClick={handleExport} disabled={exportStatus === 'exporting'} style={{
              background: exportStatus && exportStatus !== 'exporting' ? '#1a2e1a' : '#1e2e28',
              color: exportStatus && exportStatus !== 'exporting' ? '#5ab87a' : '#7fb3a0',
              padding: '15px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              border: `1px solid ${exportStatus && exportStatus !== 'exporting' ? '#2e5a3e' : '#2e4a3e'}`,
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all .2s', opacity: exportStatus === 'exporting' ? 0.6 : 1,
            }}>
              {exportStatus === 'exporting'
                ? <><span style={{ fontSize: 16 }}>↓</span> Preparing export…</>
                : exportStatus
                ? <><span style={{ fontSize: 16 }}>✓</span> {exportStatus} note{exportStatus !== 1 ? 's' : ''} exported!</>
                : <><span style={{ fontSize: 16 }}>↓</span> Export Notes as .txt</>
              }
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, padding: '0 4px' }}>
              <span style={{ fontSize: 11, color: '#333' }}>{notes.filter(n => n.status === 'active').length} active notes</span>
              <span style={{ fontSize: 11, color: '#333' }}>{notes.filter(n => n.status === 'active').reduce((s, n) => s + (n.wordCount || 0), 0).toLocaleString()} words</span>
            </div>
            <div style={{ background: '#0a0a0a', borderRadius: 10, padding: '12px 14px', marginTop: 14, border: '1px solid #151515' }}>
              <div style={{ fontSize: 9, color: '#2e2e2e', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, fontWeight: 700 }}>Export format preview</div>
              <pre style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: '#2e2e2e', lineHeight: 1.8, whiteSpace: 'pre' }}>
{`Title   : Your note title
Date    : Monday, January 1, 2025
Folder  : Personal
Tags    : writing, ideas
Words   : 142

Your note content appears here…`}
              </pre>
            </div>
          </div>
        )}

        {tab === 'danger' && (
          <div style={{ animation: 'fadeSlideIn .2s ease both' }}>
            <div style={{ background: '#1a0f0f', border: '1px solid #3a1a1a', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ color: '#c04040', fontSize: 13, lineHeight: 1.6 }}>
                ⚠️ This action is <strong>permanent</strong> and cannot be undone. All your notes will be gone forever.
              </p>
            </div>
            <button
              onClick={() => { onClose(); setTimeout(onDeleteAll, 200) }}
              style={{ background: '#1a0a0a', color: '#e05555', padding: '14px 22px', borderRadius: 12,
                fontSize: 14, fontWeight: 700, width: '100%', border: '2px solid #3a1a1a', transition: 'all .15s' }}
              onMouseEnter={ev => { ev.currentTarget.style.background = '#e05555'; ev.currentTarget.style.color = '#fff' }}
              onMouseLeave={ev => { ev.currentTarget.style.background = '#1a0a0a'; ev.currentTarget.style.color = '#e05555' }}>
              🗑 Delete All Notes
            </button>
          </div>
        )}
      </div>
    </>
  )
}
