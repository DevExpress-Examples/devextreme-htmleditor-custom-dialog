import { memo, useCallback } from 'react';
import Popover from 'devextreme-react/popover';
import TextBox, { type TextBoxTypes } from 'devextreme-react/text-box';
import type { EmojiPopoverProps } from './types';
import EmojiButton from './EmojiButton.tsx';

function EmojiPopover({
  filteredEmoji,
  isVisible,
  searchTerm,
  target,
  onEmojiInsert,
  onHide,
  onSearchChange,
}: EmojiPopoverProps): JSX.Element {
  const handleSearchChange = useCallback(
    (event: TextBoxTypes.ValueChangedEvent) => onSearchChange(event.value ?? ''),
    [onSearchChange],
  );

  return (
    <Popover
      width={320}
      height={380}
      position="top"
      visible={isVisible}
      target={target ?? undefined}
      hideOnOutsideClick
      hideOnParentScroll={false}
      showTitle={false}
      onHiding={onHide}
    >
      <div className="emoji-popover-content">
        <div className="emoji-search-box">
          <TextBox
            placeholder="Find something fun"
            mode="search"
            stylingMode="filled"
            value={searchTerm}
            valueChangeEvent="input"
            onValueChanged={handleSearchChange}
          />
        </div>
        <div className="emoji-grid-wrap">
          <div className="emoji-label">Emoji</div>
          <div className="emoji-grid">
            {filteredEmoji.map((emoji) => (
              <EmojiButton
                key={emoji.char}
                emoji={emoji}
                onInsert={onEmojiInsert}
              />
            ))}
          </div>
        </div>
      </div>
    </Popover>
  );
}

export default memo(EmojiPopover);
