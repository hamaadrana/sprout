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
}

export const DOMAIN_EMOJI = {
  Numeracy: '🔢',
  English: '📚',
  NUM: '🔢',
  LIT: '📚',
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
