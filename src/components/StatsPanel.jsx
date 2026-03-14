import React from 'react'
import { todayStr, htmlToText } from '../utils'

export default function StatsPanel({ notes }) {
  const active = notes.filter(n => n.status === 'active')
  const today  = todayStr()
  const total  = active.reduce((s, n) => s + (n.wordCount || 0), 0)
  const tday   = active.filter(n => n.date === today).reduce((s, n) => s + (n.wordCount || 0), 0)
  const tags   = active.reduce((acc, n) => { n.tags.forEach(t => acc[t] = (acc[t] || 0) + 1); return acc }, {})
  const topTag = Object.entries(tags).sort((a, b) => b[1] - a[1])[0]
  const avg    = active.length ? Math.round(total / active.length) : 0

  const grid = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i))
    const ds = d.toISOString().slice(0, 10)
    return { ds, wc: active.filter(n => n.date === ds).reduce((s, n) => s + (n.wordCount || 0), 0) }
  })
  const maxWc = Math.max(...grid.map(g => g.wc), 1)

  const Stat = (v, lbl, c = '#e0dbd0') => (
    <div style={{ background: '#111', borderRadius: 10, padding: '12px 14px', border: '1px solid #181818' }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: c, lineHeight: 1, display: 'block' }}>{v}</span>
      <span style={{ fontSize: 10, color: '#3a3a3a', marginTop: 3, display: 'block' }}>{lbl}</span>
    </div>
  )

  return (
    <div style={{ padding: '16px 14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {Stat(active.length, 'notes')}
        {Stat(total.toLocaleString(), 'total words')}
        {Stat(tday, 'words today')}
        {Stat(avg, 'avg / note')}
      </div>
      {topTag && Stat('#' + topTag[0], 'most used tag', '#7fb3a0')}
      <div style={{ background: '#111', borderRadius: 10, padding: '12px 14px', border: '1px solid #181818', marginTop: 8 }}>
        <div style={{ fontSize: 10, color: '#3a3a3a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Activity — 30 days
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }}>
          {grid.map(g => (
            <div key={g.ds} title={`${g.ds}: ${g.wc}w`} style={{
              flex: 1, borderRadius: 2,
              background: g.wc > 0 ? '#7fb3a0' : '#1a1a1a',
              height: g.wc > 0 ? Math.max(4, (g.wc / maxWc) * 40) : 4,
              opacity: g.wc > 0 ? 0.3 + 0.7 * (g.wc / maxWc) : 1,
              transition: 'height .3s',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
