import { memo, useCallback, useMemo } from 'react';
import Button from 'devextreme-react/button';
import FileUploader from 'devextreme-react/file-uploader';
import Popup from 'devextreme-react/popup';
import TextBox from 'devextreme-react/text-box';
import type { ValueChangedEvent as TextBoxValueChangedEvent } from 'devextreme/ui/text_box';
import type { ValueChangedEvent as FileUploaderValueChangedEvent } from 'devextreme/ui/file_uploader';
import type { VideoDialogProps } from './types';

const EMPTY_FILE_ARRAY: File[] = [];

const videoApplyButtonAttrs = { class: 'video-apply-button' };

function VideoDialog({
  isVisible,
  url,
  videoFile,
  onApply,
  onFileChange,
  onHide,
  onUrlChange,
}: VideoDialogProps): JSX.Element {
  const uploaderValue = useMemo(
    () => (videoFile ? [videoFile] : EMPTY_FILE_ARRAY),
    [videoFile],
  );

  const handleUrlChange = useCallback(
    (event: TextBoxValueChangedEvent) => onUrlChange(event.value ?? ''),
    [onUrlChange],
  );

  const handleFileChange = useCallback(
    (event: FileUploaderValueChangedEvent) => onFileChange(event.value?.[0] ?? null),
    [onFileChange],
  );

  return (
    <Popup
      showTitle
      title="Insert Video"
      width={450}
      height={320}
      deferRendering={false}
      visible={isVisible}
      showCloseButton
      onHiding={onHide}
    >
      <div className="popup-content">
        <TextBox
          placeholder="Enter video URL..."
          showClearButton
          value={url}
          onValueChanged={handleUrlChange}
        />
        <div className="or-separator">— OR —</div>
        <FileUploader
          selectButtonText="Upload a Video File"
          labelText=""
          accept="video/*"
          uploadMode="useForm"
          value={uploaderValue}
          onValueChanged={handleFileChange}
        />
        <Button
          elementAttr={videoApplyButtonAttrs}
          text="Insert"
          type="default"
          width="100%"
          onClick={onApply}
        />
      </div>
    </Popup>
  );
}

export default memo(VideoDialog);
