import { useRef, useState, useCallback } from 'react'

export function useHistory(editorRef) {
  const stack  = useRef([])
  const idx    = useRef(-1)
  const paused = useRef(false)
  const [canUndo, setCU] = useState(false)
  const [canRedo, setCR] = useState(false)

  const sync = (i, len) => { setCU(i > 0); setCR(i < len - 1) }

  const push = useCallback(html => {
    if (paused.current) return
    const s = stack.current.slice(0, idx.current + 1)
    if (s.length && s[s.length - 1] === html) return
    s.push(html)
    if (s.length > 100) s.shift()
    stack.current = s
    idx.current   = s.length - 1
    sync(idx.current, s.length)
  }, [])

  const travel = useCallback(dir => {
    const ni = idx.current + dir
    if (ni < 0 || ni >= stack.current.length) return null
    const html = stack.current[ni]
    idx.current = ni
    if (editorRef.current) {
      paused.current = true
      editorRef.current.innerHTML = html
      paused.current = false
    }
    sync(ni, stack.current.length)
    return html
  }, [editorRef])

  const undo  = useCallback(ev => { ev && ev.preventDefault(); return travel(-1) }, [travel])
  const redo  = useCallback(ev => { ev && ev.preventDefault(); return travel(1)  }, [travel])
  const reset = useCallback(html => {
    stack.current = [html]
    idx.current   = 0
    setCU(false)
    setCR(false)
  }, [])

  return { push, undo, redo, reset, canUndo, canRedo }
}
