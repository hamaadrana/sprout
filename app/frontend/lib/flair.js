export const STRAND_EMOJI = {
  'Foundations': '🧺',
  'Counting': '🔢',
  'Operations': '➕',
  'Shape and space': '🔷',
  'Measurement and time': '📏',
  'Listening & talking': '🗣️',
  'Sounds & phonics': '🔤',
  'Reading': '📖',
  'Writing': '✏️',
  'Me & my senses': '👀',
  'Living things': '🌿',
  'Weather & seasons': '🌦️',
  'My community & planet': '🏘️',
  'Big moves': '🏃',
  'Clever hands': '🤏',
  'All about me': '🪞',
  'Feelings & friends': '💛',
  'Healthy & safe': '🛡️',
  'Colours': '🌈',
  'Making & drawing': '🖍️',
  'Music & pretend': '🎭',
}

export const DOMAIN_EMOJI = {
  'Numeracy': '🔢',
  'English': '📚',
  'My World': '🌍',
  'Movement': '🤸',
  'Little Me': '🧡',
  'Creativity': '🎨',
  NUM: '🔢',
  LIT: '📚',
  WLD: '🌍',
  MOV: '🤸',
  GRW: '🧡',
  ART: '🎨',
}

export const DOMAIN_COLOR = {
  NUM: 'var(--color-sky)',
  LIT: 'var(--color-accent-2)',
  WLD: 'var(--color-green)',
  MOV: 'var(--color-accent)',
  GRW: 'var(--color-pink)',
  ART: 'var(--color-sunshine)',
}

export const KIND_EMOJI = {
  hands_on: '🙌',
  'hands on': '🙌',
  worksheet: '📝',
  game: '🎲',
  conversation: '💬',
}

export const PERSONALITY_LABELS = {
  explorer: 'little explorer',
  thinker: 'quiet thinker',
  chatterbox: 'little chatterbox',
  maker: 'busy maker',
}

export function childEmoji(child) {
  if (!child) return '🧒'
  return child.gender === 'boy' ? '👦' : child.gender === 'girl' ? '👧' : '🧒'
}
