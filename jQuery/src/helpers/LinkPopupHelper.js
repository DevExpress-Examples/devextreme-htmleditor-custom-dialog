class LinkPopupHelper {
  constructor(selector, editorInstance) {
    this.editor = editorInstance;
    this.insertIndex = 0;
    this.selectionLength = 0;

    this.popup = $(selector)
      .dxPopup({
        showTitle: true,
        title: 'Insert Custom Link',
        width: 450,
        height: 380,
        deferRendering: false,
        showCloseButton: true,
        contentTemplate: (contentElement) => this._renderContent(contentElement),
      })
      .dxPopup('instance');
  }

  show(cursorIndex, length) {
    this.textEditor.clear();
    this.urlBox?.option('value', '');

    this.insertIndex = cursorIndex;
    this.selectionLength = length || 0;

    const selectedText = length > 0
      ? this.editor.getText(cursorIndex, length)
      : '';
    const selectedFormats = length > 0
      ? this.editor.getFormat(cursorIndex, length)
      : {};
    const link = selectedFormats.link;

    delete selectedFormats.link;

    if (selectedText) {
      this.textEditor?.insertText(0, selectedText, selectedFormats);
    }

    if (typeof link === 'string' && link.length > 0) {
      this.urlBox?.option('value', link);
    }

    this.popup.show();
  }

  _renderContent(contentElement) {
    const container = $('<div>').css('padding', '10px').appendTo(contentElement);

    this.urlBox = $('<div>')
      .dxTextBox({
        placeholder: 'Enter URL (e.g., https://google.com)...',
        showClearButton: true,
      })
      .appendTo(container)
      .dxTextBox('instance');

    $('<div style="margin: 15px 0 5px 0; font-weight: bold; font-size: 13px; color: #555;">Link Text:</div>')
      .appendTo(container);

    this.textEditor = $('<div>')
      .dxHtmlEditor({
        height: 120,
        toolbar: {
          items: ['bold', 'italic', 'underline', 'strike', 'color'],
        },
      })
      .appendTo(container)
      .dxHtmlEditor('instance');

    $('<div>')
      .dxButton({
        text: 'Apply Link',
        type: 'default',
        width: '100%',
        onClick: () => this._applyLink(),
      })
      .appendTo(container)
      .css('margin-top', '20px');
  }

  _applyLink() {
    const url = this.urlBox.option('value');
    if (!url) return;

    const rawText = this.textEditor.getText().replace(/\n$/, '');
    const newText = rawText || url;

    const textLength = this.textEditor.getLength() - 1;
    const appliedFormats = textLength > 0
      ? this.textEditor.getFormat(0, textLength)
      : {};
    const formatsForEditor = { ...appliedFormats, link: url };

    if (this.selectionLength > 0) {
      this.editor.delete(this.insertIndex, this.selectionLength);
    }

    this.editor.insertText(this.insertIndex, newText, formatsForEditor);
    this.editor.setSelection(this.insertIndex + newText.length, 0);

    this.popup.hide();
  }
}

export default LinkPopupHelper;