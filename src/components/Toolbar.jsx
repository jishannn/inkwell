import React from 'react'

export function FloatingToolbar({ pos, onFormat, onOpenSize }) {
  if (!pos) return null
  const PAD = 8, W = 220, vw = window.innerWidth
  const left = Math.max(PAD, Math.min(pos.x - W / 2, vw - W - PAD))
  const top  = (pos.y - 52) < 52 ? pos.yB + 8 : pos.y - 52

  const fmts = [
    { cmd: 'bold',          node: <strong style={{ fontFamily: 'Georgia,serif', fontSize: 14 }}>B</strong> },
    { cmd: 'italic',        node: <em     style={{ fontFamily: 'Georgia,serif', fontSize: 14 }}>I</em>     },
    { cmd: 'underline',     node: <span   style={{ textDecoration: 'underline',    fontSize: 14 }}>U</span>  },
    { cmd: 'strikeThrough', node: <span   style={{ textDecoration: 'line-through', fontSize: 14 }}>S</span>  },
  ]

  return (
    <div onMouseDown={ev => ev.preventDefault()}
        style={{ position: 'fixed', left, top, zIndex: 300, background: '#1e1e1e',
          border: '1px solid #2e2e2e', borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,.9)',
          display: 'flex', alignItems: 'center', gap: 1, padding: '4px 6px',
          animation: 'popIn .14s cubic-bezier(.34,1.56,.64,1) both' }}>
      {fmts.map(({ cmd, node }) => (
        <button key={cmd}
          onMouseDown={ev => { ev.preventDefault(); onFormat(cmd) }}
          onTouchEnd={ev  => { ev.preventDefault(); onFormat(cmd) }}
          onMouseEnter={ev => ev.currentTarget.style.background = '#2e2e2e'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
          style={{ width: 38, height: 38, borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#d0cbc0', background: 'transparent' }}>
          {node}
        </button>
      ))}
      <div style={{ width: 1, height: 20, background: '#333', margin: '0 2px' }} />
      <button
        onMouseDown={ev => { ev.preventDefault(); onOpenSize() }}
        onTouchEnd={ev  => { ev.preventDefault(); onOpenSize() }}
        style={{ height: 38, padding: '0 10px', borderRadius: 8, fontSize: 13, color: '#d0cbc0',
          background: 'transparent', display: 'flex', alignItems: 'center', gap: 3 }}>
        Aa <span style={{ fontSize: 8, color: '#555' }}>▾</span>
      </button>
    </div>
  )
}

export function SizeSheet({ onSize, onDefault, onClose }) {
  return (
    <>
      <div onMouseDown={ev => { ev.preventDefault(); onClose() }}
          onTouchEnd={ev  => { ev.preventDefault(); onClose() }}
          style={{ position: 'fixed', inset: 0, zIndex: 310, background: 'rgba(0,0,0,.5)' }} />
      <div onMouseDown={ev => ev.preventDefault()}
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 320, background: '#181818',
            borderRadius: '18px 18px 0 0', border: '1px solid #2a2a2a',
            boxShadow: '0 -8px 40px rgba(0,0,0,.9)',
            animation: 'slideInUp .22s cubic-bezier(.22,1,.36,1) both',
            paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '12px auto 0' }} />
        <div style={{ padding: '12px 16px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#555', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Font Size</span>
          <button onMouseDown={ev => { ev.preventDefault(); onClose() }} style={{ color: '#444', fontSize: 18 }}>✕</button>
        </div>
        <button
          onMouseDown={ev => { ev.preventDefault(); onDefault() }}
          onMouseEnter={ev => ev.currentTarget.style.background = '#1e1e1e'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
          style={{ width: '100%', padding: '14px 20px', fontSize: 15, color: '#7fb3a0', textAlign: 'left',
            fontWeight: 700, background: 'transparent', borderBottom: '1px solid #222',
            display: 'flex', justifyContent: 'space-between' }}>
          <span>Default</span>
          <span style={{ fontSize: 12, color: '#3a3a3a' }}>Remove formatting</span>
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, padding: '8px 12px 16px' }}>
          {[12, 14, 16, 18, 20, 24, 28, 32].map(sz => (
            <button key={sz}
              onMouseDown={ev => { ev.preventDefault(); onSize(sz) }}
              onTouchEnd={ev  => { ev.preventDefault(); onSize(sz) }}
              onMouseEnter={ev => ev.currentTarget.style.background = '#282828'}
              onMouseLeave={ev => ev.currentTarget.style.background = '#1e1e1e'}
              style={{ padding: '16px 8px', borderRadius: 10, fontSize: 13, color: '#c8c3b9',
                background: '#1e1e1e', border: '1px solid #252525',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: Math.min(sz, 22), lineHeight: 1, color: '#e0dbd0' }}>A</span>
              <span style={{ fontSize: 10, color: '#555' }}>{sz}px</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
