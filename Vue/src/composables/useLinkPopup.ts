import { ref } from 'vue';

export function useLinkPopup(editor: () => any) {
  const visible = ref(false);
  const urlValue = ref('');
  const insertIndex = ref(0);
  const selectionLength = ref(0);

  let textEditorInstance: any = null;

  function setTextEditorInstance(instance: any) {
    textEditorInstance = instance;
  }

  function show(cursorIndex: number, length: number) {
    urlValue.value = '';
    insertIndex.value = cursorIndex;
    selectionLength.value = length || 0;

    if (textEditorInstance) {
      textEditorInstance.clear();
    }

    const selectedText = length > 0
      ? editor().getText(cursorIndex, length)
      : '';
    const selectedFormats = length > 0
      ? editor().getFormat(cursorIndex, length)
      : {};
    const link = selectedFormats.link;

    delete selectedFormats.link;

    if (selectedText && textEditorInstance) {
      textEditorInstance.insertText(0, selectedText, selectedFormats);
    }

    if (typeof link === 'string' && link.length > 0) {
      urlValue.value = link;
    }

    visible.value = true;
  }

  function applyLink() {
    const url = urlValue.value;
    if (!url) return;

    const rawText = textEditorInstance.getText().replace(/\n$/, '');
    const newText = rawText || url;

    const textLength = textEditorInstance.getLength() - 1;
    const appliedFormats = textLength > 0
      ? textEditorInstance.getFormat(0, textLength)
      : {};
    const formatsForEditor = { ...appliedFormats, link: url };

    if (selectionLength.value > 0) {
      editor().delete(insertIndex.value, selectionLength.value);
    }

    editor().insertText(insertIndex.value, newText, formatsForEditor);
    editor().setSelection(insertIndex.value + newText.length, 0);

    visible.value = false;
  }

  return {
    visible,
    urlValue,
    insertIndex,
    selectionLength,
    setTextEditorInstance,
    show,
    applyLink,
  };
}
