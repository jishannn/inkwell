export const todayStr = () => new Date().toISOString().slice(0, 10)

export const shortDate = d =>
  new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const longDate = d =>
  new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

export const daysUntilPurge = da =>
  Math.max(0, 30 - Math.floor((Date.now() - new Date(da)) / 86400000))

export const htmlToText = s => {
  if (!s) return ''
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export const wc = s => htmlToText(s).split(/\s+/).filter(Boolean).length

export const makeNote = filter => ({
  id: Date.now().toString(),
  title: '',
  content: '',
  wordCount: 0,
  status: 'active',
  date: todayStr(),
  folder: filter === 'journal' ? 'Journal' : filter.startsWith('folder:') ? filter.slice(7) : 'Personal',
  tags: filter.startsWith('tag:') ? [filter.slice(4)] : [],
  starred: filter === 'starred',
})

export const exportNotes = (notes, onDone) => {
  const active = notes.filter(n => n.status === 'active')
  if (active.length === 0) { onDone && onDone(0); return }

  const header = [
    '╔══════════════════════════════════════════╗',
    '║           INKWELL EXPORT                 ║',
    '║  ' + new Date().toLocaleString().padEnd(40) + '║',
    '╚══════════════════════════════════════════╝',
    '',
    active.length + ' notes · ' + active.reduce((s, n) => s + (n.wordCount || 0), 0).toLocaleString() + ' total words',
    '',
  ].join('\n')

  const body = active.map((n, i) => {
    const divider = '─'.repeat(44)
    return [
      divider,
      'NOTE ' + (i + 1) + ' OF ' + active.length,
      '',
      'Title   : ' + (n.title || 'Untitled'),
      'Date    : ' + longDate(n.date),
      'Folder  : ' + n.folder,
      n.tags.length ? 'Tags    : ' + n.tags.join(', ') : null,
      'Words   : ' + (n.wordCount || 0),
      '',
      htmlToText(n.content) || '(empty)',
      '',
    ].filter(l => l !== null).join('\n')
  }).join('\n')

  const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'inkwell-export-' + todayStr() + '.txt'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a) }, 200)
  onDone && onDone(active.length)
}
