import type { HtmlEditorTypes } from 'devextreme-react/html-editor';

export type LinkDialogProps = {
  isVisible: boolean;
  url: string;
  onApply: () => void;
  onHide: () => void;
  onLinkEditorInitialized: (event: HtmlEditorTypes.InitializedEvent) => void;
  onUrlChange: (url: string) => void;
};
