class LinkPopupHelper {
  constructor(editorInstance) {
    this.editor = editorInstance;
    this.insertIndex = 0;
    this.selectionLength = 0;

    this.popup = $("#link-popup").dxPopup("instance");
    this.urlBox = $("#link-url-box").dxTextBox("instance");
    this.textEditor = $("#link-text-editor").dxHtmlEditor("instance");
  }

  // Static event handler referenced from Razor
  static onApplyClick() {
    ctx.linkHelper._applyLink();
  }

  show(cursorIndex, length) {
    this.textEditor.option("value", "");
    this.urlBox.option("value", "");

    this.insertIndex = cursorIndex;
    this.selectionLength = length || 0;

    const selectedText = length > 0
      ? this.editor.getText(cursorIndex, length)
      : "";
    const selectedFormats = length > 0
      ? this.editor.getFormat(cursorIndex, length)
      : {};
    const link = selectedFormats.link;

    delete selectedFormats.link;

    if (selectedText) {
      this.textEditor.insertText(0, selectedText, selectedFormats);
    }

    if (typeof link === "string" && link.length > 0) {
      this.urlBox.option("value", link);
    }

    this.popup.show();
  }

  _applyLink() {
    const url = this.urlBox.option("value");
    if (!url) return;

    const rawText = this.textEditor.getText().replace(/\n$/, "");
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
