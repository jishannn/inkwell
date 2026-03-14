import React, { useState, useRef } from 'react'
import { htmlToText, shortDate, daysUntilPurge } from '../utils'

export default function SwipeCard({ note, onOpen, onTrash, onStar, onRestore, onPermanentDelete, isArchive, isTrash }) {
  const [offset,  setOff]  = useState(0)
  const [exiting, setExit] = useState(false)
  const startX   = useRef(null)
  const dragging = useRef(false)
  const THRESH   = 80

  const onTS = ev => { startX.current = ev.touches[0].clientX; dragging.current = false }
  const onTM = ev => {
    const dx = ev.touches[0].clientX - startX.current
    if (Math.abs(dx) > 6) { dragging.current = true; setOff(dx) }
  }
  const onTE = () => {
    if (Math.abs(offset) > THRESH) {
      setExit(true)
      setTimeout(() => {
        offset > 0
          ? (isTrash || isArchive) ? onRestore(note.id)          : onStar(note.id)
          : (isTrash || isArchive) ? onPermanentDelete(note.id)  : onTrash(note.id)
      }, 280)
    } else setOff(0)
    dragging.current = false
  }

  const rOp      = offset > 8  ? Math.min(1, (offset - 8) / 55)  : 0
  const lOp      = offset < -8 ? Math.min(1, (-offset - 8) / 55) : 0
  const ri       = (isTrash || isArchive) ? '↩' : note.starred ? '✦' : '☆'
  const rl       = (isTrash || isArchive) ? 'Restore' : note.starred ? 'Unstar' : 'Star'
  const rb       = (isTrash || isArchive) ? '#1a2a1a' : note.starred ? '#2e2a12' : '#1a2e1a'
  const preview  = htmlToText(note.content)
  const purgeDay = note.deletedAt ? daysUntilPurge(note.deletedAt) : null

  return (
    <div style={{ position: 'relative', margin: '5px 12px', borderRadius: 12, overflow: 'hidden',
        opacity: exiting ? 0 : 1, transform: exiting ? 'scale(.95)' : 'none',
        transition: exiting ? 'all .28s ease' : 'none' }}>
      {/* Right action */}
      <div style={{ position: 'absolute', inset: 0, background: rb, display: 'flex', alignItems: 'center',
          paddingLeft: 18, opacity: rOp, borderRadius: 12 }}>
        <span style={{ fontSize: 11, color: '#7a9a7a', fontWeight: 700 }}>{ri} {rl}</span>
      </div>
      {/* Left action */}
      <div style={{ position: 'absolute', inset: 0, background: '#2e1a1a', display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end', paddingRight: 18, opacity: lOp, borderRadius: 12 }}>
        <span style={{ fontSize: 11, color: '#a06a6a', fontWeight: 700 }}>
          🗑 {(isTrash || isArchive) ? 'Delete' : 'Trash'}
        </span>
      </div>
      {/* Card */}
      <div onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
          onClick={() => { if (!dragging.current) onOpen(note) }}
          style={{ transform: `translateX(${offset}px)`, transition: dragging.current ? 'none' : 'transform .22s ease',
            background: '#111', borderRadius: 12, border: '1px solid #181818', padding: '14px 16px',
            cursor: 'pointer', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#e8e3d9', lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
            {note.title || <span style={{ color: '#333', fontStyle: 'italic' }}>Untitled</span>}
          </span>
          <span style={{ fontSize: 10, color: '#3a3a3a', flexShrink: 0, paddingTop: 2 }}>{shortDate(note.date)}</span>
        </div>
        {preview && (
          <p style={{ fontSize: 12, color: '#4a4a4a', lineHeight: 1.5, marginBottom: note.tags.length ? 7 : 0 }}>
            {preview.slice(0, 100)}{preview.length > 100 ? '…' : ''}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: preview ? 0 : 2 }}>
          {note.starred && <span style={{ fontSize: 9, color: '#c8a020' }}>★</span>}
          {note.tags.map(t => (
            <span key={t} style={{ fontSize: 9, color: '#4a4a4a', background: '#161616',
                border: '1px solid #1e1e1e', borderRadius: 20, padding: '1px 7px' }}>{t}</span>
          ))}
          {purgeDay !== null && (
            <span style={{ fontSize: 9, color: '#7a4a4a', marginLeft: 'auto' }}>Deleted in {purgeDay}d</span>
          )}
        </div>
      </div>
    </div>
  )
}
