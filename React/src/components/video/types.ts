export type VideoDialogProps = {
  isVisible: boolean;
  mode: 'edit' | 'insert';
  url: string;
  videoFile: File | null;
  onApply: () => void;
  onFileChange: (file: File | null) => void;
  onHide: () => void;
  onUrlChange: (url: string) => void;
};
