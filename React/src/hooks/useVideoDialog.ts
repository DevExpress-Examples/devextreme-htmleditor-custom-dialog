import { useCallback, useRef, useState } from 'react';
import type {
  EditorRef, EditorSelection, DeltaContent, VideoDialogState,
} from '../types/editor';

export type UseVideoDialogResult = {
  state: VideoDialogState;
  videoFile: File | null;
  apply: () => void;
  handleFileChange: (file: File | null) => void;
  hide: () => void;
  setUrl: (url: string) => void;
  show: () => void;
};

const INITIAL_STATE: VideoDialogState = {
  index: 0,
  isVisible: false,
  length: 0,
  mode: 'insert',
  url: '',
};

export function useVideoDialog(
  editorRef: EditorRef,
  getSelectionOrEnd: () => EditorSelection,
): UseVideoDialogResult {
  const [state, setState] = useState<VideoDialogState>(INITIAL_STATE);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const videoFileRef = useRef(videoFile);
  videoFileRef.current = videoFile;

  const pendingBlobUrlRef = useRef<string | null>(null);

  const revokePendingBlobUrl = useCallback(() => {
    if (pendingBlobUrlRef.current) {
      URL.revokeObjectURL(pendingBlobUrlRef.current);
      pendingBlobUrlRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const { index, length } = getSelectionOrEnd();
    let existingUrl = '';

    if (length === 1) {
      const quill = editor.getQuillInstance() as { getContents: (i: number, l: number) => DeltaContent };
      const content = quill.getContents(index, 1);
      const insertObj = content.ops?.[0]?.insert;
      existingUrl = insertObj?.video ?? insertObj?.nativeVideo ?? '';
    }

    setState({
      index,
      isVisible: true,
      length,
      mode: existingUrl ? 'edit' : 'insert',
      url: existingUrl,
    });
    setVideoFile(null);
    revokePendingBlobUrl();
  }, [editorRef, getSelectionOrEnd, revokePendingBlobUrl]);

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: false }));
    setVideoFile(null);
    revokePendingBlobUrl();
  }, [revokePendingBlobUrl]);

  const setUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, url }));
    if (url) {
      setVideoFile(null);
      revokePendingBlobUrl();
    }
  }, [revokePendingBlobUrl]);

  const handleFileChange = useCallback((file: File | null) => {
    setVideoFile(file);
    revokePendingBlobUrl();
    if (file) {
      setState((prev) => ({ ...prev, url: '' }));
    }
  }, [revokePendingBlobUrl]);

  const apply = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentState = stateRef.current;
    const currentFile = videoFileRef.current;

    let finalUrl = currentState.url;
    if (currentFile) {
      finalUrl = URL.createObjectURL(currentFile);
      pendingBlobUrlRef.current = null;
    }

    if (!finalUrl) return;

    const embedType = finalUrl.startsWith('blob:') ? 'nativeVideo' : 'video';

    if (currentState.length > 0) {
      editor.delete(currentState.index, currentState.length);
    }

    editor.insertEmbed(currentState.index, embedType, finalUrl);
    editor.insertText(currentState.index + 1, '\n', {});
    editor.setSelection(currentState.index + 2, 0);

    setState(INITIAL_STATE);
    setVideoFile(null);
  }, [editorRef]);

  return {
    state, videoFile, apply, handleFileChange, hide, setUrl, show,
  };
}
