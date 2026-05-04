import { useCallback, useRef } from 'react';
import type dxHtmlEditor from 'devextreme/ui/html_editor';
import type { InitializedEvent } from 'devextreme/ui/html_editor';
import { registerVideoBlots } from '../helpers/videoBlots';
import type { EditorRef, EditorSelection } from '../types/editor';

export type UseEditorSetupResult = {
  editorRef: EditorRef;
  getSelectionOrEnd: () => EditorSelection;
  handleEditorInitialized: (event: InitializedEvent) => void;
};

export function useEditorSetup(): UseEditorSetupResult {
  const editorRef = useRef<dxHtmlEditor | null>(null);
  const blotsRegisteredRef = useRef(false);

  const handleEditorInitialized = useCallback((event: InitializedEvent) => {
    if (!event.component) return;

    editorRef.current = event.component;

    if (!blotsRegisteredRef.current) {
      registerVideoBlots(event.component);
      blotsRegisteredRef.current = true;
    }
  }, []);

  const getSelectionOrEnd = useCallback((): EditorSelection => {
    const editor = editorRef.current;
    if (!editor) return { index: 0, length: 0 };

    return editor.getSelection() ?? { index: editor.getLength(), length: 0 };
  }, []);

  return { editorRef, handleEditorInitialized, getSelectionOrEnd };
}
