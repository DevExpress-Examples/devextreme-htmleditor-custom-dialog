import { memo } from 'react';
import Popup from 'devextreme-react/popup';
import type { MarkupPopupProps } from './types';

function MarkupPopup({ isVisible, value, onHide }: MarkupPopupProps): JSX.Element {
  return (
    <Popup
      showTitle
      title="Markup"
      visible={isVisible}
      showCloseButton
      onHiding={onHide}
    >
      <div className="value-content">{value}</div>
    </Popup>
  );
}

export default memo(MarkupPopup);
