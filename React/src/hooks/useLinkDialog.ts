import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import type { HtmlEditorTypes } from 'devextreme-react/html-editor';
import type {
  EditorInstance,
  EditorRef,
  EditorSelection,
  LinkDialogState,
} from '../types/editor';

export type UseLinkDialogResult = {
  state: LinkDialogState;
  apply: () => void;
  handleLinkEditorInitialized: (event: HtmlEditorTypes.InitializedEvent) => void;
  hide: () => void;
  setUrl: (url: string) => void;
  show: () => void;
};

const INITIAL_STATE: LinkDialogState = {
  index: 0,
  isVisible: false,
  length: 0,
  selectedFormats: {},
  selectedText: '',
  url: '',
};

export function useLinkDialog(
  editorRef: EditorRef,
  getSelectionOrEnd: () => EditorSelection,
): UseLinkDialogResult {
  const [state, setState] = useState<LinkDialogState>(INITIAL_STATE);
  const linkTextEditorRef = useRef<EditorInstance | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const show = useCallback(() => {
    const editor = editorRef.current?.instance();
    if (!editor) return;

    const { index, length } = getSelectionOrEnd();
    const selectedText = length > 0 ? editor.getText(index, length) : '';
    const selectedFormats = length > 0 ? editor.getFormat(index, length) : {};
    const link = typeof selectedFormats.link === 'string' ? selectedFormats.link : '';

    delete selectedFormats.link;

    setState({
      index, isVisible: true, length, selectedFormats, selectedText, url: link,
    });
  }, [editorRef, getSelectionOrEnd]);

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const setUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, url }));
  }, []);

  const handleLinkEditorInitialized = useCallback((event: HtmlEditorTypes.InitializedEvent) => {
    if (event.component) {
      linkTextEditorRef.current = event.component;
    }
  }, []);

  const apply = useCallback(() => {
    const editor = editorRef.current?.instance();
    const linkEditor = linkTextEditorRef.current;
    const currentState = stateRef.current;

    if (!editor || !linkEditor || !currentState.url) return;

    const rawText = linkEditor.getText(0, linkEditor.getLength()).replace(/\n$/, '');
    const newText = rawText || currentState.url;
    const textLength = Math.max(linkEditor.getLength() - 1, 0);
    const appliedFormats = textLength > 0 ? linkEditor.getFormat(0, textLength) : {};
    const formats = { ...appliedFormats, link: currentState.url };

    if (currentState.length > 0) {
      editor.delete(currentState.index, currentState.length);
    }

    editor.insertText(currentState.index, newText, formats);
    editor.setSelection(currentState.index + newText.length, 0);

    hide();
  }, [editorRef, hide]);

  useEffect(() => {
    if (!state.isVisible || !linkTextEditorRef.current) return;

    const editor = linkTextEditorRef.current;
    editor.option('value', '');

    if (state.selectedText) {
      editor.insertText(0, state.selectedText, state.selectedFormats);
    }
  }, [state.isVisible, state.selectedText, state.selectedFormats]);

  return {
    state, apply, handleLinkEditorInitialized, hide, setUrl, show,
  };
}
