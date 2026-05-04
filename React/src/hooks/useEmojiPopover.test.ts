import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEmojiPopover } from './useEmojiPopover';
import { EMOJI_LIST } from '../data/emojiList';
import type { EditorRef } from '../types/editor';

function createMockEditor() {
  return {
    insertText: vi.fn(),
    setSelection: vi.fn(),
  };
}

function setup(editorOverrides = {}) {
  const editor = { ...createMockEditor(), ...editorOverrides };
  const editorRef = { current: editor } as unknown as EditorRef;
  const getSelectionOrEnd = vi.fn(() => ({ index: 5, length: 0 }));

  const { result } = renderHook(() => useEmojiPopover(editorRef, getSelectionOrEnd));
  return { result, editor, getSelectionOrEnd };
}

describe('useEmojiPopover', () => {
  describe('initial state', () => {
    it('starts hidden', () => {
      const { result } = setup();
      expect(result.current.isVisible).toBe(false);
    });

    it('starts with no target', () => {
      const { result } = setup();
      expect(result.current.target).toBeNull();
    });

    it('starts with empty search term', () => {
      const { result } = setup();
      expect(result.current.searchTerm).toBe('');
    });

    it('returns all emoji when search is empty', () => {
      const { result } = setup();
      expect(result.current.filteredEmoji).toHaveLength(EMOJI_LIST.length);
    });
  });

  describe('show', () => {
    it('sets visibility to true', () => {
      const { result } = setup();
      const element = document.createElement('button');

      act(() => result.current.show({ element }));

      expect(result.current.isVisible).toBe(true);
    });

    it('sets the target element', () => {
      const { result } = setup();
      const element = document.createElement('button');

      act(() => result.current.show({ element }));

      expect(result.current.target).toBe(element);
    });

    it('resets search term on show', () => {
      const { result } = setup();
      const element = document.createElement('button');

      act(() => result.current.setSearch('fire'));
      act(() => result.current.show({ element }));

      expect(result.current.searchTerm).toBe('');
    });

    it('captures cursor index from getSelectionOrEnd', () => {
      const { result, editor, getSelectionOrEnd } = setup();
      getSelectionOrEnd.mockReturnValue({ index: 10, length: 0 });
      const element = document.createElement('button');

      act(() => result.current.show({ element }));
      act(() => result.current.insertEmoji('🔥'));

      expect(editor.insertText).toHaveBeenCalledWith(10, '🔥', {});
    });
  });

  describe('hide', () => {
    it('sets visibility to false', () => {
      const { result } = setup();
      const element = document.createElement('button');

      act(() => result.current.show({ element }));
      act(() => result.current.hide());

      expect(result.current.isVisible).toBe(false);
    });
  });

  describe('setSearch', () => {
    it('updates the search term', () => {
      const { result } = setup();

      act(() => result.current.setSearch('rocket'));

      expect(result.current.searchTerm).toBe('rocket');
    });

    it('filters emoji by search term', () => {
      const { result } = setup();

      act(() => result.current.setSearch('rocket'));

      expect(result.current.filteredEmoji).toEqual([
        { char: '🚀', terms: 'rocket launch ship space' },
      ]);
    });

    it('filters case-insensitively', () => {
      const { result } = setup();

      act(() => result.current.setSearch('ROCKET'));

      expect(result.current.filteredEmoji).toHaveLength(1);
      expect(result.current.filteredEmoji[0].char).toBe('🚀');
    });

    it('trims whitespace from search', () => {
      const { result } = setup();

      act(() => result.current.setSearch('  fire  '));

      expect(result.current.filteredEmoji[0].char).toBe('🔥');
    });

    it('returns empty array for no matches', () => {
      const { result } = setup();

      act(() => result.current.setSearch('zzzzz'));

      expect(result.current.filteredEmoji).toHaveLength(0);
    });
  });

  describe('insertEmoji', () => {
    it('calls editor.insertText with the emoji at the stored index', () => {
      const { result, editor, getSelectionOrEnd } = setup();
      getSelectionOrEnd.mockReturnValue({ index: 7, length: 0 });
      const element = document.createElement('button');

      act(() => result.current.show({ element }));
      act(() => result.current.insertEmoji('😀'));

      expect(editor.insertText).toHaveBeenCalledWith(7, '😀', {});
    });

    it('sets selection after the inserted emoji', () => {
      const { result, editor, getSelectionOrEnd } = setup();
      getSelectionOrEnd.mockReturnValue({ index: 3, length: 0 });
      const element = document.createElement('button');

      act(() => result.current.show({ element }));
      act(() => result.current.insertEmoji('👍'));

      expect(editor.setSelection).toHaveBeenCalledWith(3 + '👍'.length, 0);
    });

    it('hides the popover after inserting', () => {
      const { result } = setup();
      const element = document.createElement('button');

      act(() => result.current.show({ element }));
      act(() => result.current.insertEmoji('😀'));

      expect(result.current.isVisible).toBe(false);
    });

    it('does nothing when editor ref is null', () => {
      const editorRef = { current: null } as Parameters<typeof useEmojiPopover>[0];
      const getSelectionOrEnd = vi.fn(() => ({ index: 0, length: 0 }));
      const { result } = renderHook(() => useEmojiPopover(editorRef, getSelectionOrEnd));

      act(() => result.current.insertEmoji('😀'));
    });
  });
});
