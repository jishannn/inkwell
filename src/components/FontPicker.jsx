import React from 'react'
import { FONTS, FONT_MAP } from '../constants'

export default function FontPicker({ current, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {['Serif', 'Sans', 'Mono'].map(cat => {
        const group = FONTS.filter(f => f.category === cat)
        if (!group.length) return null
        return (
          <div key={cat}>
            <div style={{ fontSize: 9, color: '#333', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 5, paddingLeft: 2 }}>
              {cat}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.map(f => {
                const sel = current === f.name
                return (
                  <button key={f.name} onClick={() => onChange(f.name)}
                      style={{ width: '100%', padding: '13px 14px',
                        background: sel ? '#1e2e28' : '#0f0f0f',
                        border: sel ? '1px solid #2e4a3e' : '1px solid #1a1a1a',
                        borderRadius: 10, display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', transition: 'all .14s' }}>
                    <div>
                      <div style={{ fontFamily: f.stack, fontSize: 16, color: sel ? '#e8e3d9' : '#999', lineHeight: 1.3, marginBottom: 2 }}>
                        The quick brown fox
                      </div>
                      <div style={{ fontSize: 10, color: sel ? '#5a8a78' : '#3a3a3a' }}>{f.name}</div>
                    </div>
                    {sel && <span style={{ color: '#7fb3a0', fontSize: 16, marginLeft: 10 }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
