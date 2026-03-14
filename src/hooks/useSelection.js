import { useRef, useState, useCallback } from 'react'

export function useSelection() {
  const saved = useRef(null)
  const [pos, setPos] = useState(null)

  const detect = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) { setPos(null); return }
    const r = sel.getRangeAt(0)
    saved.current = r.cloneRange()
    const rect = r.getBoundingClientRect()
    if (!rect.width) { setPos(null); return }
    setPos({ x: rect.left + rect.width / 2, y: rect.top, yB: rect.bottom })
  }, [])

  const restore = useCallback(() => {
    if (!saved.current) return
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(saved.current)
  }, [])

  const dismiss = useCallback(() => setPos(null), [])

  return { pos, detect, restore, dismiss }
}
