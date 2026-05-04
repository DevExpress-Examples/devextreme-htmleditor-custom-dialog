import type { RefObject } from 'react';
import type dxHtmlEditor from 'devextreme/ui/html_editor';

export type EditorRef = RefObject<dxHtmlEditor | null>;

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
