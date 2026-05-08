import type { EmojiItem } from '../../data/emojiList';

export type EmojiButtonProps = {
  emoji: EmojiItem;
  onInsert: (char: string) => void;
};

export type EmojiPopoverProps = {
  filteredEmoji: readonly EmojiItem[];
  isVisible: boolean;
  searchTerm: string;
  target: Element | null;
  onEmojiInsert: (char: string) => void;
  onHide: () => void;
  onSearchChange: (term: string) => void;
};
