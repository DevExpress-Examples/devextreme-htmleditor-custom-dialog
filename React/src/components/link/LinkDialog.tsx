import { memo, useCallback } from 'react';
import Button from 'devextreme-react/button';
import HtmlEditor, { Item, Toolbar } from 'devextreme-react/html-editor';
import Popup from 'devextreme-react/popup';
import TextBox, {type TextBoxTypes} from 'devextreme-react/text-box';
import type { LinkDialogProps } from './types';

const linkApplyButtonAttrs = { class: 'link-apply-button' };

function LinkDialog({
  isVisible,
  url,
  onApply,
  onHide,
  onLinkEditorInitialized,
  onUrlChange,
}: LinkDialogProps): JSX.Element {
  const handleUrlChange = useCallback(
    (event: TextBoxTypes.ValueChangedEvent) => onUrlChange(event.value ?? ''),
    [onUrlChange],
  );

  return (
    <Popup
      showTitle
      title="Insert Formatted Link"
      width={450}
      height={380}
      deferRendering={false}
      visible={isVisible}
      showCloseButton
      onHiding={onHide}
    >
      <div className="popup-content">
        <TextBox
          placeholder="Enter URL (e.g., https://google.com)..."
          showClearButton
          label="URL:"
          labelMode="outside"
          value={url}
          onValueChanged={handleUrlChange}
        />
        <div className="link-text-title">Link Text:</div>
        <HtmlEditor height={120} onInitialized={onLinkEditorInitialized}>
          <Toolbar>
            <Item name="bold" />
            <Item name="italic" />
            <Item name="underline" />
            <Item name="strike" />
            <Item name="color" />
          </Toolbar>
        </HtmlEditor>
        <Button
          elementAttr={linkApplyButtonAttrs}
          text="Insert"
          type="default"
          width="100%"
          onClick={onApply}
        />
      </div>
    </Popup>
  );
}

export default memo(LinkDialog);
