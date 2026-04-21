import { EmojiPopupHelper, VideoPopupHelper, LinkPopupHelper } from './helpers/index.js';

import { getToolbarItems } from './toolbarConfig.js';
import markup from './data/markup.js';

$(() => {
  const editorInstance = $('.html-editor')
    .dxHtmlEditor({
      value: markup,
      customizeModules(config) {
        VideoPopupHelper.setupClipboard(config);
      },
      toolbar: { items: [] },
    })
    .dxHtmlEditor('instance');

  VideoPopupHelper.registerBlot(editorInstance);

  const emojiHelper = new EmojiPopupHelper('#emoji-popup', editorInstance);
  const videoHelper = new VideoPopupHelper('#video-popup', editorInstance);
  const linkHelper = new LinkPopupHelper('#link-popup', editorInstance);

  const markupPopup = $('#markup-popup')
    .dxPopup({
      showTitle: true,
      title: 'Markup',
      showCloseButton: true,
      onShowing() {
        $('.value-content').text(editorInstance.option('value'));
      },
    })
    .dxPopup('instance');

  const toolbarItems = getToolbarItems(editorInstance, {
    linkHelper,
    emojiHelper,
    videoHelper,
    markupPopup,
  });

  editorInstance.option('toolbar.items', toolbarItems);
});
