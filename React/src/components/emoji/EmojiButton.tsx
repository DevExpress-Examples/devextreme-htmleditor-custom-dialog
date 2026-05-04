import { memo, useCallback } from 'react';
import type { EmojiButtonProps } from './types';

function preventBlur(event: React.MouseEvent): void {
  event.preventDefault();
}

const EmojiButton = memo(function EmojiButton({ emoji, onInsert }: EmojiButtonProps) {
  const handleClick = useCallback(() => {
    onInsert(emoji.char);
  }, [onInsert, emoji.char]);

  return (
    <button
      className="emoji-item"
      type="button"
      onMouseDown={preventBlur}
      onClick={handleClick}
    >
      {emoji.char}
    </button>
  );
});

export default EmojiButton;
