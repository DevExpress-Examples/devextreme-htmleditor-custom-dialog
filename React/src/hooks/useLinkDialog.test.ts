import {
  describe, expect, it, vi,
} from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLinkDialog } from './useLinkDialog';
import type { EditorRef } from '../types/editor';

function createMockEditor(overrides = {}) {
  return {
    delete: vi.fn(),
    getFormat: vi.fn(() => ({})),
    getLength: vi.fn(() => 10),
    getText: vi.fn(() => 'Hello'),
    insertText: vi.fn(),
    option: vi.fn(),
    setSelection: vi.fn(),
    ...overrides,
  };
}

function setup(editorOverrides = {}, selectionOverride = { index: 0, length: 0 }) {
  const editor = createMockEditor(editorOverrides);
  const editorRef = { current: editor } as unknown as EditorRef;
  const getSelectionOrEnd = vi.fn(() => selectionOverride);

  const { result } = renderHook(() => useLinkDialog(editorRef, getSelectionOrEnd));
  return { result, editor, getSelectionOrEnd };
}

describe('useLinkDialog', () => {
  describe('initial state', () => {
    it('starts hidden', () => {
      const { result } = setup();
      expect(result.current.state.isVisible).toBe(false);
    });

    it('starts with empty URL', () => {
      const { result } = setup();
      expect(result.current.state.url).toBe('');
    });
  });

  describe('show', () => {
    it('opens the dialog', () => {
      const { result } = setup();

      act(() => result.current.show());

      expect(result.current.state.isVisible).toBe(true);
    });

    it('captures cursor index and length', () => {
      const { result } = setup({}, { index: 5, length: 3 });

      act(() => result.current.show());

      expect(result.current.state.index).toBe(5);
      expect(result.current.state.length).toBe(3);
    });

    it('reads selected text when selection exists', () => {
      const editor = createMockEditor({
        getText: vi.fn(() => 'link text'),
        getFormat: vi.fn(() => ({ bold: true, link: 'https://example.com' })),
      });
      const editorRef = { current: editor } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 2, length: 9 }));

      const { result } = renderHook(() => useLinkDialog(editorRef, getSelectionOrEnd));

      act(() => result.current.show());

      expect(result.current.state.selectedText).toBe('link text');
      expect(result.current.state.url).toBe('https://example.com');
      expect(result.current.state.selectedFormats).toEqual({ bold: true });
    });

    it('sets empty selectedText when no selection', () => {
      const { result } = setup({}, { index: 5, length: 0 });

      act(() => result.current.show());

      expect(result.current.state.selectedText).toBe('');
    });

    it('does nothing when editor is null', () => {
      const editorRef = { current: null } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 0, length: 0 }));
      const { result } = renderHook(() => useLinkDialog(editorRef, getSelectionOrEnd));

      act(() => result.current.show());

      expect(result.current.state.isVisible).toBe(false);
    });
  });

  describe('hide', () => {
    it('closes the dialog', () => {
      const { result } = setup();

      act(() => result.current.show());
      act(() => result.current.hide());

      expect(result.current.state.isVisible).toBe(false);
    });
  });

  describe('setUrl', () => {
    it('updates the URL', () => {
      const { result } = setup();

      act(() => result.current.show());
      act(() => result.current.setUrl('https://google.com'));

      expect(result.current.state.url).toBe('https://google.com');
    });
  });

  describe('apply', () => {
    it('inserts link with URL as text when link editor is empty', () => {
      const editor = createMockEditor();
      const editorRef = { current: editor } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 3, length: 0 }));

      const { result } = renderHook(() => useLinkDialog(editorRef, getSelectionOrEnd));

      const linkEditor = {
        getFormat: vi.fn(() => ({})),
        getLength: vi.fn(() => 1),
        getText: vi.fn(() => '\n'),
        insertText: vi.fn(),
        option: vi.fn(),
      };

      act(() => result.current.show());
      act(() => result.current.handleLinkEditorInitialized({
        component: linkEditor,
      } as unknown as Parameters<typeof result.current.handleLinkEditorInitialized>[0]));
      act(() => result.current.setUrl('https://devexpress.com'));
      act(() => result.current.apply());

      expect(editor.insertText).toHaveBeenCalledWith(
        3,
        'https://devexpress.com',
        { link: 'https://devexpress.com' },
      );
    });

    it('inserts link with custom text from link editor', () => {
      const editor = createMockEditor();
      const editorRef = { current: editor } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 0, length: 0 }));

      const { result } = renderHook(() => useLinkDialog(editorRef, getSelectionOrEnd));

      const linkEditor = {
        getFormat: vi.fn(() => ({ bold: true })),
        getLength: vi.fn(() => 6),
        getText: vi.fn(() => 'Click\n'),
        insertText: vi.fn(),
        option: vi.fn(),
      };

      act(() => result.current.show());
      act(() => result.current.handleLinkEditorInitialized({
        component: linkEditor,
      } as unknown as Parameters<typeof result.current.handleLinkEditorInitialized>[0]));
      act(() => result.current.setUrl('https://example.com'));
      act(() => result.current.apply());

      expect(editor.insertText).toHaveBeenCalledWith(
        0,
        'Click',
        { bold: true, link: 'https://example.com' },
      );
    });

    it('deletes existing selection before inserting', () => {
      const editor = createMockEditor();
      const editorRef = { current: editor } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 2, length: 4 }));

      const { result } = renderHook(() => useLinkDialog(editorRef, getSelectionOrEnd));

      const linkEditor = {
        getFormat: vi.fn(() => ({})),
        getLength: vi.fn(() => 1),
        getText: vi.fn(() => '\n'),
        insertText: vi.fn(),
        option: vi.fn(),
      };

      act(() => result.current.show());
      act(() => result.current.handleLinkEditorInitialized({
        component: linkEditor,
      } as unknown as Parameters<typeof result.current.handleLinkEditorInitialized>[0]));
      act(() => result.current.setUrl('https://test.com'));
      act(() => result.current.apply());

      expect(editor.delete).toHaveBeenCalledWith(2, 4);
    });

    it('sets selection after inserted text', () => {
      const editor = createMockEditor();
      const editorRef = { current: editor } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 0, length: 0 }));

      const { result } = renderHook(() => useLinkDialog(editorRef, getSelectionOrEnd));

      const linkEditor = {
        getFormat: vi.fn(() => ({})),
        getLength: vi.fn(() => 4),
        getText: vi.fn(() => 'Hi!\n'),
        insertText: vi.fn(),
        option: vi.fn(),
      };

      act(() => result.current.show());
      act(() => result.current.handleLinkEditorInitialized({
        component: linkEditor,
      } as unknown as Parameters<typeof result.current.handleLinkEditorInitialized>[0]));
      act(() => result.current.setUrl('https://x.com'));
      act(() => result.current.apply());

      expect(editor.setSelection).toHaveBeenCalledWith(3, 0);
    });

    it('hides dialog after applying', () => {
      const editor = createMockEditor();
      const editorRef = { current: editor } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 0, length: 0 }));

      const { result } = renderHook(() => useLinkDialog(editorRef, getSelectionOrEnd));

      const linkEditor = {
        getFormat: vi.fn(() => ({})),
        getLength: vi.fn(() => 1),
        getText: vi.fn(() => '\n'),
        insertText: vi.fn(),
        option: vi.fn(),
      };

      act(() => result.current.show());
      act(() => result.current.handleLinkEditorInitialized({
        component: linkEditor,
      } as unknown as Parameters<typeof result.current.handleLinkEditorInitialized>[0]));
      act(() => result.current.setUrl('https://test.com'));
      act(() => result.current.apply());

      expect(result.current.state.isVisible).toBe(false);
    });

    it('does nothing when URL is empty', () => {
      const editor = createMockEditor();
      const editorRef = { current: editor } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 0, length: 0 }));

      const { result } = renderHook(() => useLinkDialog(editorRef, getSelectionOrEnd));

      const linkEditor = {
        getFormat: vi.fn(() => ({})),
        getLength: vi.fn(() => 1),
        getText: vi.fn(() => '\n'),
        insertText: vi.fn(),
        option: vi.fn(),
      };

      act(() => result.current.show());
      act(() => result.current.handleLinkEditorInitialized({
        component: linkEditor,
      } as unknown as Parameters<typeof result.current.handleLinkEditorInitialized>[0]));
      act(() => result.current.apply());

      expect(editor.insertText).not.toHaveBeenCalled();
    });

    it('does nothing when editor is null', () => {
      const editorRef = { current: null } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 0, length: 0 }));
      const { result } = renderHook(() => useLinkDialog(editorRef, getSelectionOrEnd));

      act(() => result.current.apply());
    });
  });
});
