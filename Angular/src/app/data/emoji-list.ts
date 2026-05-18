export interface EmojiItem {
  char: string;
  terms: string;
}

export const EMOJI_LIST: readonly EmojiItem[] = [
  { char: '😀', terms: 'grinning face happy smile' },
  { char: '😂', terms: 'joy tears laugh crying haha' },
  { char: '🥰', terms: 'love hearts smiling affection' },
  { char: '😎', terms: 'cool sunglasses glasses' },
  { char: '🤔', terms: 'thinking hmm ponder' },
  { char: '🙌', terms: 'celebration hands raise' },
  { char: '👍', terms: 'thumbs up yes approve' },
  { char: '👎', terms: 'thumbs down no bad' },
  { char: '🔥', terms: 'fire hot lit trending' },
  { char: '🎉', terms: 'party popper celebration' },
  { char: '💡', terms: 'lightbulb idea genius' },
  { char: '🚀', terms: 'rocket launch ship space' },
  { char: '👀', terms: 'eyes looking seeing watch' },
  { char: '😢', terms: 'sad cry tear' },
  { char: '😡', terms: 'angry mad red furious' },
  { char: '💯', terms: '100 hundred perfect score' },
  { char: '✅', terms: 'check mark done yes correct' },
  { char: '✨', terms: 'sparkles magic shiny star' },
];
