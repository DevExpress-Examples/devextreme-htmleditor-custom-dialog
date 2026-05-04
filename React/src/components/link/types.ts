import type { InitializedEvent } from 'devextreme/ui/html_editor';

export type LinkDialogProps = {
  isVisible: boolean;
  url: string;
  onApply: () => void;
  onHide: () => void;
  onLinkEditorInitialized: (event: InitializedEvent) => void;
  onUrlChange: (url: string) => void;
};
