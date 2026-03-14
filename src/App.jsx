import React, { useState, useRef, useEffect, useCallback } from 'react'
import { DB } from './db'
import { FONT_MAP, LINE_WIDTHS } from './constants'
import { todayStr, longDate, shortDate, wc, makeNote, daysUntilPurge, htmlToText, exportNotes } from './utils'
import { useHistory } from './hooks/useHistory'
import { useSelection } from './hooks/useSelection'
import SwipeCard from './components/SwipeCard'
import Sidebar from './components/Sidebar'
import Settings from './components/Settings'
import { FloatingToolbar, SizeSheet } from './components/Toolbar'
import { ConfirmDialog, FeedbackSheet } from './components/Dialogs'

const execFmt  = cmd => document.execCommand(cmd, false, null)
const execSize = px  => {
  const sel = window.getSelection(); if (!sel || !sel.rangeCount) return
  const r = sel.getRangeAt(0), sp = document.createElement('span')
  sp.style.fontSize = px + 'px'
  try { r.surroundContents(sp) } catch { const f = r.extractContents(); sp.appendChild(f); r.insertNode(sp) }
}

export default function App() {
  const [notes,          setNotes]       = useState([])
  const [dbReady,        setDbReady]     = useState(false)
  const [activeNote,     setActiveNote]  = useState(null)
  const [animDir,        setAnimDir]     = useState('in')
  const [isEditing,      setIsEditing]   = useState(false)
  const [editTitle,      setEditTitle]   = useState('')
  const [editContent,    setEditContent] = useState('')
  const [search,         setSearch]      = useState('')
  const [filter,         setFilter]      = useState('all')
  const [sidebarOpen,    setSidebarOpen] = useState(false)
  const [settingsOpen,   setSettingsOpen]= useState(false)
  const [feedbackOpen,   setFeedbackOpen]= useState(false)
  const [saveIndicator,  setSaveInd]     = useState(false)
  const [contextMenu,    setCtxMenu]     = useState(false)
  const [showSizePicker, setShowSize]    = useState(false)
  const [confirmDialog,  setConfirm]     = useState(null)
  const [prefs, setPrefs] = useState({ editorFont: 'Lora', fontSize: 17, lineWidth: 'comfortable' })

  const editorRef   = useRef(null)
  const titleRef    = useRef(null)
  const saveTimer   = useRef(null)
  const activeIdRef = useRef(null)
  const notesRef    = useRef(notes)
  useEffect(() => { notesRef.current = notes }, [notes])

  const hist = useHistory(editorRef)
  const sel  = useSelection()

  // Bootstrap
  useEffect(() => {
    ;(async () => {
      const [saved, font, fSize, lw] = await Promise.all([
        DB.getAllNotes(), DB.getPref('editorFont'), DB.getPref('fontSize'), DB.getPref('lineWidth'),
      ])
      setNotes(saved.filter(n => n.status !== 'trashed' || daysUntilPurge(n.deletedAt) > 0))
      setPrefs({ editorFont: font || 'Lora', fontSize: fSize || 17, lineWidth: lw || 'comfortable' })
      setDbReady(true)
    })()
  }, [])

  useEffect(() => {
    if (!dbReady) return
    DB.setPref('editorFont', prefs.editorFont)
    DB.setPref('fontSize',   prefs.fontSize)
    DB.setPref('lineWidth',  prefs.lineWidth)
  }, [prefs, dbReady])

  useEffect(() => {
    const c = (activeNote && activeNote.content) || ''
    if (editorRef.current && activeNote) editorRef.current.innerHTML = c
    hist.reset(c)
  }, [activeNote && activeNote.id])

  const setPref = useCallback((k, v) => setPrefs(p => ({ ...p, [k]: v })), [])

  // Save
  const commit = useCallback((id, title, content) => {
    const patch = { id, title: title.trim() || 'Untitled', content, wordCount: wc(content), date: todayStr() }
    setNotes(prev => {
      const next = prev.map(n => n.id === id ? { ...n, ...patch } : n)
      DB.saveNote({ ...(next.find(n => n.id === id) || {}), ...patch })
      return next
    })
    setActiveNote(prev => prev && prev.id === id ? { ...prev, ...patch } : prev)
  }, [])

  const scheduleSave = useCallback((id, title, content) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      commit(id, title, content)
      setSaveInd(true)
      setTimeout(() => setSaveInd(false), 1400)
    }, 600)
  }, [commit])

  const flush = (id, title, content) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    commit(id, title, content)
  }

  // Note CRUD
  const openNote = note => {
    if (activeIdRef.current) flush(activeIdRef.current, editTitle, editContent)
    setAnimDir('in'); setActiveNote(note); setEditTitle(note.title); setEditContent(note.content)
    activeIdRef.current = note.id; setIsEditing(false); sel.dismiss(); setShowSize(false); setCtxMenu(false); setSidebarOpen(false)
  }

  const goBack = () => {
    if (activeIdRef.current) flush(activeIdRef.current, editTitle, editContent)
    activeIdRef.current = null; setIsEditing(false); setAnimDir('out'); sel.dismiss(); setShowSize(false)
    setTimeout(() => setActiveNote(null), 220)
  }

  const createNote = () => {
    if (activeIdRef.current) flush(activeIdRef.current, editTitle, editContent)
    const nn = makeNote(filter)
    setNotes(prev => [nn, ...prev]); DB.saveNote(nn)
    setAnimDir('in'); setActiveNote(nn); setEditTitle(''); setEditContent('')
    activeIdRef.current = nn.id; setIsEditing(true); setSidebarOpen(false)
    setTimeout(() => titleRef.current && titleRef.current.focus(), 100)
  }

  const updateNote = (id, patch) => {
    setNotes(prev => {
      const next = prev.map(n => n.id === id ? { ...n, ...patch } : n)
      DB.saveNote({ ...(next.find(n => n.id === id) || {}), ...patch })
      return next
    })
    setActiveNote(prev => prev && prev.id === id ? { ...prev, ...patch } : prev)
  }

  const closeActive = id => {
    if (activeNote && activeNote.id === id) {
      activeIdRef.current = null; setIsEditing(false); setAnimDir('out')
      setTimeout(() => setActiveNote(null), 220)
    }
    setCtxMenu(false)
  }

  const archiveNote  = id => { if (id === activeIdRef.current) flush(id, editTitle, editContent); updateNote(id, { status: 'archived' }); closeActive(id) }
  const trashNote    = id => { if (id === activeIdRef.current) flush(id, editTitle, editContent); updateNote(id, { status: 'trashed', deletedAt: todayStr() }); closeActive(id) }
  const restoreNote  = id => updateNote(id, { status: 'active', deletedAt: undefined })
  const toggleStar   = id => { const n = notesRef.current.find(x => x.id === id); if (n) updateNote(id, { starred: !n.starred }) }
  const permDelete   = id => {
    setNotes(prev => prev.filter(n => n.id !== id)); DB.delNote(id)
    if (activeNote && activeNote.id === id) { activeIdRef.current = null; setAnimDir('out'); setTimeout(() => setActiveNote(null), 220) }
    setConfirm(null); setCtxMenu(false)
  }
  const emptyTrash  = () => { notesRef.current.filter(n => n.status === 'trashed').forEach(n => DB.delNote(n.id)); setNotes(prev => prev.filter(n => n.status !== 'trashed')); setConfirm(null) }
  const deleteAll   = async () => { await DB.clearNotes(); setNotes([]); setActiveNote(null); activeIdRef.current = null; setConfirm(null) }

  // Editor
  const onInput = ev => {
    const h = ev.currentTarget.innerHTML
    setEditContent(h); scheduleSave(activeIdRef.current, editTitle, h); hist.push(h)
  }

  const onKeyDown = ev => {
    if (ev.key === 'Escape') { sel.dismiss(); setShowSize(false); return }
    const mod = ev.metaKey || ev.ctrlKey
    if (mod && !ev.shiftKey && ev.key === 'z') { const h = hist.undo(ev); if (h !== null) { setEditContent(h); scheduleSave(activeIdRef.current, editTitle, h) }; return }
    if (mod && (ev.key === 'y' || (ev.shiftKey && ev.key === 'z'))) { const h = hist.redo(ev); if (h !== null) { setEditContent(h); scheduleSave(activeIdRef.current, editTitle, h) }; return }
  }

  const afterFmt = () => {
    const h = (editorRef.current && editorRef.current.innerHTML) || ''
    setEditContent(h); scheduleSave(activeIdRef.current, editTitle, h); hist.push(h)
    sel.dismiss(); setShowSize(false); editorRef.current && editorRef.current.focus()
  }

  const doFmt     = cmd => { sel.restore(); execFmt(cmd);  afterFmt() }
  const doSize    = px  => { sel.restore(); execSize(px);  afterFmt() }
  const doDefault = ()  => { sel.restore(); document.execCommand('removeFormat', false, null); afterFmt() }
  const dismissAll = () => { setCtxMenu(false); sel.dismiss(); setShowSize(false) }

  // Derived
  const canEdit    = activeNote && activeNote.status === 'active'
  const liveWC     = wc(editContent)
  const lwPx       = LINE_WIDTHS[prefs.lineWidth]
  const isTrashV   = filter === 'trash'
  const isArchiveV = filter === 'archive'

  const filtered = (() => {
    const pool = isTrashV
      ? notes.filter(n => n.status === 'trashed')
      : isArchiveV
      ? notes.filter(n => n.status === 'archived')
      : notes.filter(n => n.status === 'active')
    return pool.filter(n => {
      if (search) { const q = search.toLowerCase(); return n.title.toLowerCase().includes(q) || htmlToText(n.content).toLowerCase().includes(q) || n.tags.some(t => t.includes(q)) }
      if (isTrashV || isArchiveV) return true
      if (filter === 'starred')           return n.starred
      if (filter === 'journal')           return n.folder === 'Journal'
      if (filter.startsWith('folder:'))   return n.folder === filter.slice(7)
      if (filter.startsWith('tag:'))      return n.tags.includes(filter.slice(4))
      return true
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  })()

  const viewTitle = isTrashV ? 'Recently Deleted' : isArchiveV ? 'Archive' : filter === 'starred' ? 'Starred' : filter === 'journal' ? 'Journal' : filter.startsWith('folder:') ? filter.slice(7) : filter.startsWith('tag:') ? '#' + filter.slice(4) : 'All Notes'

  if (!dbReady) return (
    <div style={{ background: '#0d0d0d', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 32, opacity: 0.3 }}>◈</span>
      <span style={{ fontSize: 13, color: '#333' }}>Loading…</span>
    </div>
  )

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#e0dbd0', fontFamily: "'Lora',Georgia,serif",
        display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* ── LIST VIEW ── */}
      {!activeNote && (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 88 }}>
          {/* Header */}
          <div style={{ padding: '22px 20px 0', display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeSlideIn .3s ease both' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ color: '#555', fontSize: 22, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, flexShrink: 0 }}>⊞</button>
            <span style={{ fontSize: 17, opacity: 0.35 }}>◈</span>
            <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.5px', flex: 1 }}>Inkwell</span>
            {isTrashV && notes.filter(n => n.status === 'trashed').length > 0 && (
              <button onClick={() => setConfirm({ type: 'emptyTrash' })} style={{ fontSize: 12, color: '#e05555', padding: '4px 10px', background: '#1e1010', borderRadius: 20, border: '1px solid #3a1a1a', marginRight: 4 }}>Empty</button>
            )}
            {/* Settings gear — top right */}
            <button onClick={() => setSettingsOpen(true)}
                onMouseEnter={ev => ev.currentTarget.style.color = '#aaa'}
                onMouseLeave={ev => ev.currentTarget.style.color = '#555'}
                title="Settings"
                style={{ color: '#555', fontSize: 18, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, transition: 'color .15s', flexShrink: 0 }}>
              ⚙
            </button>
          </div>

          {(isTrashV || isArchiveV || filter !== 'all') && (
            <div style={{ padding: '12px 20px 0', fontSize: 13, color: '#555', animation: 'fadeSlideIn .3s ease both' }}>
              {viewTitle}
              {isTrashV && <span style={{ fontSize: 11, color: '#3a3a3a', marginLeft: 8 }}>auto-deleted after 30 days</span>}
            </div>
          )}

          {/* Search */}
          <div style={{ margin: '12px 12px', background: '#111', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', animation: 'fadeSlideIn .38s ease both', border: '1px solid #1a1a1a' }}>
            <span style={{ color: '#444', fontSize: 16 }}>⌕</span>
            <input value={search} onInput={ev => setSearch(ev.target.value)} placeholder="Search notes…" style={{ flex: 1, fontSize: 15, color: '#777', fontFamily: 'inherit' }} />
            {search && <button onClick={() => setSearch('')} style={{ color: '#444', fontSize: 14 }}>✕</button>}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#3a3a3a', padding: '52px 20px', animation: 'fadeSlideIn .4s ease both' }}>
              <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>{isTrashV ? '🗑' : isArchiveV ? '◫' : '◇'}</div>
              <div style={{ fontSize: 14 }}>{isTrashV ? 'Trash is empty' : isArchiveV ? 'Nothing archived' : 'No notes yet — tap + to begin'}</div>
            </div>
          )}

          {filtered.map(note => (
            <SwipeCard key={note.id} note={note}
              onOpen={openNote} onTrash={trashNote} onStar={toggleStar} onRestore={restoreNote}
              isArchive={isArchiveV} isTrash={isTrashV}
              onPermanentDelete={id => setConfirm({ type: 'delete', id })} />
          ))}

          {filtered.length > 0 && (
            <div style={{ textAlign: 'center', color: '#2a2a2a', fontSize: 11, marginTop: 10, paddingBottom: 4 }}>
              {filtered.length} note{filtered.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* ── NOTE VIEW ── */}
      {activeNote && (
        <div key={activeNote.id} onClick={dismissAll}
            style={{ flex: 1, overflowY: 'auto', paddingBottom: 60, minHeight: '100vh', background: '#0d0d0d',
              animation: animDir === 'out' ? 'slideOutRight .2s ease both' : 'slideInRight .26s cubic-bezier(.22,1,.36,1) both' }}>
          {/* Note header */}
          <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, background: '#0d0d0d', zIndex: 10, borderBottom: '1px solid #141414' }}>
            <button onClick={goBack} style={{ color: '#666', fontSize: 22, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {saveIndicator && <span style={{ fontSize: 10, color: '#4a7a68', animation: 'savedPulse 1.4s ease forwards' }}>Saved</span>}
              {isEditing && (
                <>
                  <span style={{ fontSize: 11, color: '#333' }}>{liveWC} words</span>
                  <button onClick={ev => { ev.stopPropagation(); const h = hist.undo(ev); if (h !== null) { setEditContent(h); scheduleSave(activeIdRef.current, editTitle, h) } }}
                      disabled={!hist.canUndo}
                      style={{ color: hist.canUndo ? '#888' : '#2a2a2a', fontSize: 20, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>↩</button>
                  <button onClick={ev => { ev.stopPropagation(); const h = hist.redo(ev); if (h !== null) { setEditContent(h); scheduleSave(activeIdRef.current, editTitle, h) } }}
                      disabled={!hist.canRedo}
                      style={{ color: hist.canRedo ? '#888' : '#2a2a2a', fontSize: 20, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>↪</button>
                </>
              )}
              <button onClick={ev => { ev.stopPropagation(); setCtxMenu(v => !v) }}
                  style={{ color: '#555', fontSize: 20, letterSpacing: 3, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>···</button>
            </div>
          </div>

          {/* Note body */}
          <div style={{ padding: '16px 20px 0', maxWidth: lwPx, margin: '0 auto' }}>
            <input ref={titleRef} value={editTitle}
              onInput={ev => { setEditTitle(ev.target.value); scheduleSave(activeIdRef.current, ev.target.value, editContent) }}
              placeholder="Title"
              style={{ display: isEditing ? 'block' : 'none', width: '100%', fontSize: 23, fontWeight: 700, fontFamily: 'inherit', color: '#f0ebe0', paddingBottom: 10, borderBottom: '1px solid #1a1a1a', marginBottom: 14 }} />

            <h1 onClick={ev => { ev.stopPropagation(); if (canEdit) { setIsEditing(true); setTimeout(() => titleRef.current && titleRef.current.focus(), 30) } }}
                style={{ display: isEditing ? 'none' : 'block', fontSize: 25, fontWeight: 700, lineHeight: 1.25, marginBottom: 8, color: canEdit ? '#f0ebe0' : '#777', cursor: canEdit ? 'text' : 'default' }}>
              {editTitle || <span style={{ color: '#333', fontStyle: 'italic' }}>Untitled</span>}
            </h1>

            <div style={{ fontSize: 12, color: '#484848', marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
              <span>{longDate(activeNote.date)}</span>
              <span>·</span>
              <span>{activeNote.wordCount} words</span>
              {activeNote.tags.map(t => (
                <span key={t} style={{ background: '#161616', border: '1px solid #222', borderRadius: 20, padding: '2px 9px', fontSize: 10, color: '#6a6a6a' }}>{t}</span>
              ))}
            </div>

            <div ref={editorRef} contentEditable={!!canEdit} suppressContentEditableWarning
              onInput={onInput}
              onMouseUp={sel.detect} onKeyUp={sel.detect}
              onTouchEnd={() => setTimeout(sel.detect, 100)}
              onKeyDown={onKeyDown}
              onClick={ev => {
                ev.stopPropagation()
                if (canEdit && !isEditing) {
                  setIsEditing(true)
                  setTimeout(() => {
                    if (editorRef.current) {
                      editorRef.current.focus()
                      const r = document.createRange(), s = window.getSelection()
                      r.selectNodeContents(editorRef.current); r.collapse(false)
                      s.removeAllRanges(); s.addRange(r)
                    }
                  }, 30)
                }
              }}
              data-placeholder="Start writing…"
              style={{ display: 'block', fontSize: prefs.fontSize, fontFamily: FONT_MAP[prefs.editorFont], lineHeight: 1.82,
                color: isEditing ? '#bbb' : '#c8c3b9', paddingTop: 4, outline: 'none', wordBreak: 'break-word',
                minHeight: '68vh', userSelect: isEditing ? 'text' : 'none', WebkitUserSelect: isEditing ? 'text' : 'none' }} />
          </div>

          <FloatingToolbar pos={sel.pos} onFormat={doFmt} onOpenSize={() => { sel.restore(); setShowSize(true) }} />
          {showSizePicker && isEditing && <SizeSheet onSize={doSize} onDefault={doDefault} onClose={() => setShowSize(false)} />}

          {/* Context menu */}
          {contextMenu && (
            <div style={{ position: 'fixed', bottom: 88, right: 16, background: '#1a1a1a', border: '1px solid #272727',
                borderRadius: 14, overflow: 'hidden', zIndex: 100, minWidth: 170,
                boxShadow: '0 10px 44px rgba(0,0,0,.7)', animation: 'popIn .2s cubic-bezier(.34,1.56,.64,1) both' }}>
              {activeNote.status === 'active' && (
                <>
                  {[
                    { label: activeNote.starred ? 'Unstar' : 'Star', icon: activeNote.starred ? '★' : '☆', color: '#c8a020', action: () => { toggleStar(activeNote.id); setCtxMenu(false) } },
                    { label: 'Edit note',     icon: '✎', color: '#ddd',    action: () => { setIsEditing(true); setCtxMenu(false); setTimeout(() => editorRef.current && editorRef.current.focus(), 30) } },
                    { label: 'Archive',       icon: '◫', color: '#aaa',    action: () => archiveNote(activeNote.id) },
                    { label: 'Move to trash', icon: '🗑', color: '#e05555', action: () => trashNote(activeNote.id) },
                  ].map((item, i, arr) => (
                    <button key={item.label} onClick={item.action} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 16px',
                      fontSize: 14, color: item.color, borderBottom: i < arr.length - 1 ? '1px solid #222' : 'none',
                    }}>
                      <span style={{ fontSize: 12 }}>{item.icon}</span>{item.label}
                    </button>
                  ))}
                </>
              )}
              {(activeNote.status === 'archived' || activeNote.status === 'trashed') && (
                <>
                  <button onClick={() => { restoreNote(activeNote.id); setCtxMenu(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 16px', fontSize: 14, color: '#7fb3a0', borderBottom: '1px solid #222' }}>
                    <span>↩</span> Restore
                  </button>
                  <button onClick={() => setConfirm({ type: 'delete', id: activeNote.id })} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 16px', fontSize: 14, color: '#e05555' }}>
                    <span>🗑</span> Delete forever
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── FAB ── */}
      {!activeNote && !isTrashV && !isArchiveV && (
        <button onClick={createNote} className="fab" style={{
          position: 'fixed', bottom: 26, right: 18, width: 52, height: 52, borderRadius: 26,
          background: '#1c1c1c', border: '1px solid #2e2e2e', fontSize: 26, color: '#d0cbc0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 28px rgba(0,0,0,.7)', zIndex: 50, transition: 'transform .18s, box-shadow .18s',
        }}>+</button>
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} filter={filter} onFilter={setFilter}
        notes={notes} onCreateNote={createNote} onSettings={() => setSettingsOpen(true)} onFeedback={() => setFeedbackOpen(true)} />

      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} prefs={prefs} onPref={setPref}
        notes={notes} onDeleteAll={() => { setSettingsOpen(false); setTimeout(() => setConfirm({ type: 'deleteAll' }), 250) }} />

      <FeedbackSheet open={feedbackOpen} onClose={() => setFeedbackOpen(false)}
        noteCount={notes.filter(n => n.status === 'active').length} />

      <ConfirmDialog dialog={confirmDialog} onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirmDialog.type === 'emptyTrash') emptyTrash()
          else if (confirmDialog.type === 'deleteAll') deleteAll()
          else permDelete(confirmDialog.id)
        }} />
    </div>
  )
}
