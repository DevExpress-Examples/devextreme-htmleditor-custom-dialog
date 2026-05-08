import { useCallback, useRef } from 'react';
import type { HtmlEditorRef, HtmlEditorTypes } from 'devextreme-react/html-editor';
import { registerVideoBlots } from '../helpers/videoBlots';
import type { EditorRef, EditorSelection } from '../types/editor';

export type UseHtmlEditorInitializerResult = {
  editorRef: EditorRef;
  getSelectionOrEnd: () => EditorSelection;
  handleEditorInitialized: (event: HtmlEditorTypes.InitializedEvent) => void;
};

export function useHtmlEditorInitializer(): UseHtmlEditorInitializerResult {
  const editorRef = useRef<HtmlEditorRef | null>(null);
  const blotsRegisteredRef = useRef(false);

  const handleEditorInitialized = useCallback((event: HtmlEditorTypes.InitializedEvent) => {
    if (!event.component) return;

    if (!blotsRegisteredRef.current) {
      registerVideoBlots(event.component);
      blotsRegisteredRef.current = true;
    }
  }, []);

  const getSelectionOrEnd = useCallback((): EditorSelection => {
    const editor = editorRef.current?.instance();
    if (!editor) return { index: 0, length: 0 };

    return editor.getSelection() ?? { index: editor.getLength(), length: 0 };
  }, []);

  return { editorRef, handleEditorInitialized, getSelectionOrEnd };
}
