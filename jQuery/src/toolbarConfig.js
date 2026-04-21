export function getToolbarItems(ctx) {
  return [
    'undo',
    'redo',
    'separator',
    {
      name: 'header',
      acceptedValues: [false, 1, 2, 3, 4, 5],
      options: { inputAttr: { 'aria-label': 'Header' } },
    },
    'separator',
    'bold',
    'italic',
    'strike',
    'underline',
    'separator',
    'alignLeft',
    'alignCenter',
    'alignRight',
    'alignJustify',
    'separator',
    {
      widget: 'dxButton',
      options: {
        icon: 'link',
        hint: 'Insert Custom Link',
        stylingMode: 'text',
        onClick() {
          const range = ctx.editor.getSelection();
          const index = range ? range.index : ctx.editor.getLength();
          const length = range ? range.length : 0;
          ctx.linkHelper.show(index, length);
        },
      },
    },
    {
      widget: 'dxButton',
      options: {
        text: '😀',
        hint: 'Insert Emoji',
        focusStateEnabled: false,
        stylingMode: 'text',
        onClick(e) {
          const range = ctx.editor.getSelection();
          const index = range ? range.index : ctx.editor.getLength();
          ctx.emojiHelper.show(index, e.element);
        },
      },
    },
    {
      widget: 'dxButton',
      options: {
        icon: 'video',
        hint: 'Insert/Edit Video',
        stylingMode: 'text',
        onClick() {
          const range = ctx.editor.getSelection();
          const index = range ? range.index : ctx.editor.getLength();
          const length = range ? range.length : 0;
          ctx.videoHelper.show(index, length);
        },
      },
    },
    {
      widget: 'dxButton',
      options: {
        text: 'Show markup',
        stylingMode: 'text',
        onClick() {
          ctx.markupPopup.show();
        },
      },
    },
  ];
}
