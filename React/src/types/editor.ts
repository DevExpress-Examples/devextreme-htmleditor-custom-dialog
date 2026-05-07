import type { MutableRefObject } from 'react';
import type { HtmlEditorRef } from 'devextreme-react/html-editor';

export type EditorInstance = ReturnType<HtmlEditorRef['instance']>;
export type EditorRef = MutableRefObject<HtmlEditorRef | null>;

export type EditorSelection = {
  index: number;
  length: number;
};

export type VideoInsert = {
  nativeVideo?: string;
  video?: string;
};

export type DeltaContent = {
  ops?: Array<{ insert?: VideoInsert }>;
};

export type LinkDialogState = {
  index: number;
  isVisible: boolean;
  length: number;
  selectedFormats: Record<string, unknown>;
  selectedText: string;
  url: string;
};

export type VideoDialogState = {
  index: number;
  isVisible: boolean;
  length: number;
  mode: 'edit' | 'insert';
  url: string;
};
