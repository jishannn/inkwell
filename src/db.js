const openDB = () => new Promise((res, rej) => {
  const r = indexedDB.open('inkwell', 1)
  r.onupgradeneeded = ev => {
    const db = ev.target.result
    if (!db.objectStoreNames.contains('notes')) db.createObjectStore('notes', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('prefs')) db.createObjectStore('prefs')
  }
  r.onsuccess = ev => res(ev.target.result)
  r.onerror   = ev => rej(ev.target.error)
})

const dbRun = (store, mode, fn) => openDB().then(db => new Promise((res, rej) => {
  const req = fn(db.transaction(store, mode).objectStore(store))
  req.onsuccess = ev => res(ev.target.result)
  req.onerror   = ev => rej(ev.target.error)
}))

export const DB = {
  getAllNotes: ()          => dbRun('notes', 'readonly',  s => s.getAll()),
  saveNote:   note        => dbRun('notes', 'readwrite', s => s.put(note)),
  delNote:    id          => dbRun('notes', 'readwrite', s => s.delete(id)),
  clearNotes: ()          => dbRun('notes', 'readwrite', s => s.clear()),
  getPref:    key         => dbRun('prefs', 'readonly',  s => s.get(key)).catch(() => undefined),
  setPref:    (key, val)  => dbRun('prefs', 'readwrite', s => s.put(val, key)),
}
