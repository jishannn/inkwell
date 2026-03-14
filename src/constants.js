export const FONTS = [
  { name: 'Lora',              stack: "'Lora', serif",              category: 'Serif' },
  { name: 'Georgia',           stack: 'Georgia, serif',             category: 'Serif' },
  { name: 'Playfair Display',  stack: "'Playfair Display', serif",  category: 'Serif' },
  { name: 'Merriweather',      stack: "'Merriweather', serif",      category: 'Serif' },
  { name: 'EB Garamond',       stack: "'EB Garamond', serif",       category: 'Serif' },
  { name: 'Cormorant',         stack: "'Cormorant', serif",         category: 'Serif' },
  { name: 'Libre Baskerville', stack: "'Libre Baskerville', serif", category: 'Serif' },
  { name: 'Crimson Text',      stack: "'Crimson Text', serif",      category: 'Serif' },
  { name: 'Inter',             stack: "'Inter', sans-serif",        category: 'Sans'  },
  { name: 'DM Sans',           stack: "'DM Sans', sans-serif",      category: 'Sans'  },
  { name: 'Nunito',            stack: "'Nunito', sans-serif",       category: 'Sans'  },
  { name: 'Raleway',           stack: "'Raleway', sans-serif",      category: 'Sans'  },
  { name: 'iA Writer',         stack: "'Courier New', monospace",   category: 'Mono'  },
  { name: 'System Serif',      stack: 'ui-serif, serif',            category: 'Serif' },
]

export const FONT_MAP = Object.fromEntries(FONTS.map(f => [f.name, f.stack]))

export const LINE_WIDTHS = { narrow: 500, comfortable: 640, wide: 800 }

export const FEEDBACK_TYPES = [
  { id: 'love',       emoji: '😊', label: 'Love it',    hint: 'Tell us what\'s working great',      placeholder: 'What do you enjoy most about Inkwell?' },
  { id: 'suggestion', emoji: '💡', label: 'Suggestion', hint: 'Share an idea or improvement',      placeholder: 'What would make Inkwell better for you?' },
  { id: 'bug',        emoji: '🐛', label: 'Bug report', hint: 'Something not working as expected', placeholder: 'What happened? What were you doing when it broke?' },
]
