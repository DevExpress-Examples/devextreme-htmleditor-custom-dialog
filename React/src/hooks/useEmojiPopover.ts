import { useCallback, useMemo, useRef, useState } from 'react';
import { EMOJI_LIST } from '../data/emojiList';
import type { EmojiItem } from '../data/emojiList';
import type { EditorRef, EditorSelection } from '../types/editor';

type ShowEvent = { element: Element };

export type UseEmojiPopoverResult = {
  filteredEmoji: readonly EmojiItem[];
  isVisible: boolean;
  searchTerm: string;
  target: Element | null;
  hide: () => void;
  insertEmoji: (char: string) => void;
  setSearch: (term: string) => void;
  show: (event: ShowEvent) => void;
};

export function useEmojiPopover(
  editorRef: EditorRef,
  getSelectionOrEnd: () => EditorSelection,
): UseEmojiPopoverResult {
  const [isVisible, setIsVisible] = useState(false);
  const [target, setTarget] = useState<Element | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const insertIndexRef = useRef(0);

  const filteredEmoji = useMemo(
    () => EMOJI_LIST.filter((emoji) => emoji.terms.includes(searchTerm.toLowerCase().trim())),
    [searchTerm],
  );

  const show = useCallback((event: ShowEvent) => {
    insertIndexRef.current = getSelectionOrEnd().index;
    setSearchTerm('');
    setTarget(event.element);
    setIsVisible(true);
  }, [getSelectionOrEnd]);

  const hide = useCallback(() => setIsVisible(false), []);

  const setSearch = useCallback((term: string) => setSearchTerm(term), []);

  const insertEmoji = useCallback((char: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const index = insertIndexRef.current;
    editor.insertText(index, char, {});
    editor.setSelection(index + char.length, 0);
    setIsVisible(false);
  }, [editorRef]);

  return { filteredEmoji, isVisible, searchTerm, target, hide, insertEmoji, setSearch, show };
}
