import {
  describe, expect, it, vi, beforeEach,
} from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useVideoDialog } from './useVideoDialog';
import type { EditorRef } from '../types/editor';

function createMockEditor(contentOverride?: unknown) {
  return {
    delete: vi.fn(),
    getQuillInstance: vi.fn(() => ({
      getContents: vi.fn(() => contentOverride ?? { ops: [] }),
    })),
    insertEmbed: vi.fn(),
    insertText: vi.fn(),
    setSelection: vi.fn(),
  };
}

function setup(editorOverrides = {}, selectionOverride = { index: 5, length: 0 }) {
  const editor = { ...createMockEditor(), ...editorOverrides };
  const editorRef = { current: editor } as unknown as EditorRef;
  const getSelectionOrEnd = vi.fn(() => selectionOverride);

  const { result } = renderHook(() => useVideoDialog(editorRef, getSelectionOrEnd));
  return { result, editor, getSelectionOrEnd };
}

describe('useVideoDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('starts hidden with insert mode', () => {
      const { result } = setup();
      expect(result.current.state.isVisible).toBe(false);
      expect(result.current.state.mode).toBe('insert');
    });

    it('starts with no video file', () => {
      const { result } = setup();
      expect(result.current.videoFile).toBeNull();
    });
  });

  describe('show', () => {
    it('opens dialog in insert mode when no video selected', () => {
      const { result } = setup();

      act(() => result.current.show());

      expect(result.current.state.isVisible).toBe(true);
      expect(result.current.state.mode).toBe('insert');
      expect(result.current.state.url).toBe('');
    });

    it('captures cursor index', () => {
      const { result } = setup({}, { index: 12, length: 0 });

      act(() => result.current.show());

      expect(result.current.state.index).toBe(12);
    });

    it('opens in edit mode when an existing video is selected', () => {
      const content = { ops: [{ insert: { video: 'https://youtube.com/watch?v=abc' } }] };
      const editor = createMockEditor(content);
      const editorRef = { current: editor } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 3, length: 1 }));

      const { result } = renderHook(() => useVideoDialog(editorRef, getSelectionOrEnd));

      act(() => result.current.show());

      expect(result.current.state.mode).toBe('edit');
      expect(result.current.state.url).toBe('https://youtube.com/watch?v=abc');
    });

    it('opens in edit mode for nativeVideo', () => {
      const content = { ops: [{ insert: { nativeVideo: 'blob:http://localhost/abc' } }] };
      const editor = createMockEditor(content);
      const editorRef = { current: editor } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 0, length: 1 }));

      const { result } = renderHook(() => useVideoDialog(editorRef, getSelectionOrEnd));

      act(() => result.current.show());

      expect(result.current.state.mode).toBe('edit');
      expect(result.current.state.url).toBe('blob:http://localhost/abc');
    });

    it('does nothing when editor is null', () => {
      const editorRef = { current: null } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 0, length: 0 }));
      const { result } = renderHook(() => useVideoDialog(editorRef, getSelectionOrEnd));

      act(() => result.current.show());

      expect(result.current.state.isVisible).toBe(false);
    });
  });

  describe('hide', () => {
    it('closes dialog', () => {
      const { result } = setup();

      act(() => result.current.show());
      act(() => result.current.hide());

      expect(result.current.state.isVisible).toBe(false);
    });

    it('clears the video file', () => {
      const { result } = setup();
      const file = new File(['data'], 'test.mp4', { type: 'video/mp4' });

      act(() => result.current.show());
      act(() => result.current.handleFileChange(file));
      act(() => result.current.hide());

      expect(result.current.videoFile).toBeNull();
    });
  });

  describe('setUrl', () => {
    it('updates the URL in state', () => {
      const { result } = setup();

      act(() => result.current.show());
      act(() => result.current.setUrl('https://youtube.com/watch?v=test'));

      expect(result.current.state.url).toBe('https://youtube.com/watch?v=test');
    });

    it('clears the video file when URL is set', () => {
      const { result } = setup();
      const file = new File(['data'], 'test.mp4', { type: 'video/mp4' });

      act(() => result.current.show());
      act(() => result.current.handleFileChange(file));
      act(() => result.current.setUrl('https://example.com/vid.mp4'));

      expect(result.current.videoFile).toBeNull();
    });
  });

  describe('handleFileChange', () => {
    it('stores the selected file', () => {
      const { result } = setup();
      const file = new File(['data'], 'video.mp4', { type: 'video/mp4' });

      act(() => result.current.show());
      act(() => result.current.handleFileChange(file));

      expect(result.current.videoFile).toBe(file);
    });

    it('clears the URL when a file is selected', () => {
      const { result } = setup();
      const file = new File(['data'], 'video.mp4', { type: 'video/mp4' });

      act(() => result.current.show());
      act(() => result.current.setUrl('https://youtube.com/watch?v=x'));
      act(() => result.current.handleFileChange(file));

      expect(result.current.state.url).toBe('');
    });

    it('does not clear URL when file is null', () => {
      const { result } = setup();

      act(() => result.current.show());
      act(() => result.current.setUrl('https://youtube.com/watch?v=x'));
      act(() => result.current.handleFileChange(null));

      expect(result.current.state.url).toBe('https://youtube.com/watch?v=x');
    });
  });

  describe('apply', () => {
    it('inserts a video embed for a URL', () => {
      const { result, editor } = setup({}, { index: 4, length: 0 });

      act(() => result.current.show());
      act(() => result.current.setUrl('https://youtube.com/watch?v=abc'));
      act(() => result.current.apply());

      expect(editor.insertEmbed).toHaveBeenCalledWith(4, 'video', 'https://youtube.com/watch?v=abc');
      expect(editor.insertText).toHaveBeenCalledWith(5, '\n', {});
      expect(editor.setSelection).toHaveBeenCalledWith(6, 0);
    });

    it('inserts a nativeVideo embed for blob URLs (local file)', () => {
      const mockBlobUrl = 'blob:http://localhost:5173/test-id';
      URL.createObjectURL = vi.fn(() => mockBlobUrl);

      const { result, editor } = setup({}, { index: 0, length: 0 });
      const file = new File(['data'], 'video.mp4', { type: 'video/mp4' });

      act(() => result.current.show());
      act(() => result.current.handleFileChange(file));
      act(() => result.current.apply());

      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
      expect(editor.insertEmbed).toHaveBeenCalledWith(0, 'nativeVideo', mockBlobUrl);
    });

    it('deletes existing content when replacing', () => {
      const { result, editor } = setup({}, { index: 2, length: 1 });

      act(() => result.current.show());
      act(() => result.current.setUrl('https://vimeo.com/123'));
      act(() => result.current.apply());

      expect(editor.delete).toHaveBeenCalledWith(2, 1);
    });

    it('does not delete when inserting fresh', () => {
      const { result, editor } = setup({}, { index: 2, length: 0 });

      act(() => result.current.show());
      act(() => result.current.setUrl('https://vimeo.com/123'));
      act(() => result.current.apply());

      expect(editor.delete).not.toHaveBeenCalled();
    });

    it('resets state after applying', () => {
      const { result } = setup();

      act(() => result.current.show());
      act(() => result.current.setUrl('https://youtube.com/watch?v=abc'));
      act(() => result.current.apply());

      expect(result.current.state.isVisible).toBe(false);
      expect(result.current.state.url).toBe('');
      expect(result.current.videoFile).toBeNull();
    });

    it('does nothing when URL is empty and no file', () => {
      const { result, editor } = setup();

      act(() => result.current.show());
      act(() => result.current.apply());

      expect(editor.insertEmbed).not.toHaveBeenCalled();
    });

    it('does nothing when editor is null', () => {
      const editorRef = { current: null } as unknown as EditorRef;
      const getSelectionOrEnd = vi.fn(() => ({ index: 0, length: 0 }));
      const { result } = renderHook(() => useVideoDialog(editorRef, getSelectionOrEnd));

      act(() => result.current.apply());
    });
  });
});
