import React, { useState } from 'react'
import StatsPanel from './StatsPanel'

export default function Sidebar({ open, onClose, filter, onFilter, notes, onCreateNote, onSettings, onFeedback }) {
  const [section, setSection] = useState(null)
  if (!open) return null

  const active   = notes.filter(n => n.status === 'active')
  const archived = notes.filter(n => n.status === 'archived')
  const trashed  = notes.filter(n => n.status === 'trashed')
  const folders  = [...new Set(active.map(n => n.folder))]
  const allTags  = active.reduce((acc, n) => { n.tags.forEach(t => acc[t] = (acc[t] || 0) + 1); return acc }, {})

  const NavBtn = ({ id, icon, label, count, warn = false }) => (
    <button className="sr" onClick={() => { onFilter(id); onClose() }} style={{
      width: 'calc(100% - 16px)', margin: '1px 8px', padding: '10px 12px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: filter === id ? '#1a1a1a' : 'transparent', borderRadius: 9,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
          color: filter === id ? '#ddd' : warn ? '#7a4a4a' : '#777' }}>
        <span style={{ color: warn ? '#5a3a3a' : '#555', fontSize: 12, width: 14, textAlign: 'center' }}>{icon}</span>
        <span>{label}</span>
      </div>
      {count > 0 && (
        <span style={{ fontSize: 11, color: warn ? '#7a4a4a' : '#3a3a3a',
            background: warn ? '#1e1010' : 'transparent', borderRadius: 10, padding: warn ? '1px 6px' : 0 }}>
          {count}
        </span>
      )}
    </button>
  )

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 80,
          backdropFilter: 'blur(3px)', animation: 'fadeSlideIn .18s ease both' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(285px, 85vw)',
          background: '#0a0a0a', zIndex: 90, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid #181818', animation: 'sideIn .24s cubic-bezier(.22,1,.36,1) both' }}>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
          {/* Header */}
          <div style={{ padding: '20px 16px 14px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', borderBottom: '1px solid #141414',
              position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, opacity: 0.4 }}>◈</span>
              <span style={{ fontSize: 17, fontWeight: 700 }}>Inkwell</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setSection(section === 'stats' ? null : 'stats')} style={{
                padding: '5px 11px', borderRadius: 20, fontSize: 12, fontWeight: 600, transition: 'all .14s',
                background: section === 'stats' ? '#1e1e1e' : 'transparent',
                color: section === 'stats' ? '#7fb3a0' : '#555',
                border: `1px solid ${section === 'stats' ? '#2e2e2e' : 'transparent'}`,
              }}>Stats</button>
              <button onClick={onCreateNote} style={{ color: '#666', fontSize: 22, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          </div>

          {section === 'stats'
            ? <StatsPanel notes={notes} />
            : (
              <>
                <div style={{ padding: '12px 0 4px' }}>
                  <NavBtn id="all"     icon="▤" label="All Notes" count={active.length} />
                  <NavBtn id="journal" icon="◉" label="Journal"   count={active.filter(n => n.folder === 'Journal').length} />
                  <NavBtn id="starred" icon="★" label="Starred"   count={active.filter(n => n.starred).length} />
                </div>
                <div style={{ height: 1, background: '#141414', margin: '8px 16px' }} />
                <div style={{ padding: '10px 16px 6px', fontSize: 10, color: '#3a3a3a', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700 }}>Folders</div>
                {folders.map(f => (
                  <button key={f} className="sr" onClick={() => { onFilter('folder:' + f); onClose() }} style={{
                    width: 'calc(100% - 16px)', margin: '1px 8px', padding: '10px 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderRadius: 9, fontSize: 14,
                    background: filter === 'folder:' + f ? '#1a1a1a' : 'transparent',
                    color: filter === 'folder:' + f ? '#ddd' : '#777',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#444', fontSize: 11 }}>▣</span>
                      <span>{f}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#3a3a3a' }}>{active.filter(n => n.folder === f).length}</span>
                  </button>
                ))}
                <div style={{ padding: '14px 16px 6px', fontSize: 10, color: '#3a3a3a', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700 }}>Tags</div>
                <div style={{ padding: '0 16px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {Object.entries(allTags).map(([tag, count]) => (
                    <button key={tag} onClick={() => { onFilter('tag:' + tag); onClose() }} style={{
                      fontSize: 11, borderRadius: 20, padding: '3px 9px', transition: 'all .14s',
                      border: '1px solid #222',
                      color: filter === 'tag:' + tag ? '#d8d3c9' : '#666',
                      background: filter === 'tag:' + tag ? '#222' : '#141414',
                    }}>
                      {tag} <span style={{ color: '#3a3a3a' }}>{count}</span>
                    </button>
                  ))}
                </div>
                <div style={{ height: 1, background: '#141414', margin: '14px 16px 8px' }} />
                <NavBtn id="archive" icon="◫" label="Archive"          count={archived.length} />
                <NavBtn id="trash"   icon="🗑" label="Recently Deleted" count={trashed.length} warn />
              </>
            )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #141414', background: '#0a0a0a', flexShrink: 0 }}>
          <button className="sr" onClick={() => { onClose(); onSettings() }} style={{
            display: 'flex', alignItems: 'center', gap: 10, color: '#555', fontSize: 13,
            padding: '12px 18px', width: '100%', borderBottom: '1px solid #141414',
          }}>
            <span style={{ fontSize: 15 }}>⚙</span>
            <span>Settings</span>
          </button>
          <button className="sr" onClick={() => { onClose(); onFeedback() }} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', width: '100%', textAlign: 'left',
          }}>
            <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>💬</span>
            <div>
              <div style={{ fontSize: 13, color: '#888', fontWeight: 600, lineHeight: 1.3 }}>Send Feedback</div>
              <div style={{ fontSize: 11, color: '#3a3a3a', marginTop: 3, lineHeight: 1.4 }}>Love it, suggest a feature, or report a bug</div>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}
