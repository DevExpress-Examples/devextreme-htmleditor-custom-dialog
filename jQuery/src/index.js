import { EmojiPopupHelper, VideoPopupHelper, LinkPopupHelper } from './helpers/index.js';

import { getToolbarItems } from './toolbarConfig.js';
import markup from './data/markup.js';

$(() => {
  const ctx = {};

  const editorInstance = $('.html-editor')
    .dxHtmlEditor({
      value: markup,
      customizeModules(config) {
        VideoPopupHelper.setupClipboard(config);
      },
      toolbar: {
        items: getToolbarItems(ctx),
      },
    })
    .dxHtmlEditor('instance');

  VideoPopupHelper.registerBlot(editorInstance);

  ctx.editor = editorInstance;
  ctx.emojiHelper = new EmojiPopupHelper('#emoji-popup', editorInstance);
  ctx.videoHelper = new VideoPopupHelper('#video-popup', editorInstance);
  ctx.linkHelper = new LinkPopupHelper('#link-popup', editorInstance);
  ctx.markupPopup = $('#markup-popup')
    .dxPopup({
      showTitle: true,
      title: 'Markup',
      showCloseButton: true,
      onShowing() {
        $('.value-content').text(editorInstance.option('value'));
      },
    })
    .dxPopup('instance');
});
