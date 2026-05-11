import { ref } from 'vue';

const ABSOLUTE_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function normalizeAndValidateLinkUrl(rawUrl: string) {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) {
    return null;
  }

  const candidateUrl = ABSOLUTE_SCHEME_REGEX.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(candidateUrl);
  } catch {
    return null;
  }

  if (!ALLOWED_LINK_PROTOCOLS.has(parsedUrl.protocol)) {
    return null;
  }

  if ((parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') && !parsedUrl.hostname) {
    return null;
  }

  if ((parsedUrl.protocol === 'mailto:' || parsedUrl.protocol === 'tel:') && !parsedUrl.pathname) {
    return null;
  }

  return parsedUrl.toString();
}

export function useLinkPopup(editor: () => any) {
  const visible = ref(false);
  const urlValue = ref('');
  const insertIndex = ref(0);
  const selectionLength = ref(0);
  const isTextEditorReady = ref(false);

  let textEditorInstance: any = null;

  function setTextEditorInstance(instance: any) {
    textEditorInstance = instance;
    isTextEditorReady.value = !!instance;
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
    if (!textEditorInstance) return;

    const normalizedUrl = normalizeAndValidateLinkUrl(urlValue.value);
    if (!normalizedUrl) return;
    urlValue.value = normalizedUrl;

    const rawText = textEditorInstance.getText().replace(/\n$/, '');
    const newText = rawText || normalizedUrl;

    const textLength = textEditorInstance.getLength() - 1;
    const appliedFormats = textLength > 0
      ? textEditorInstance.getFormat(0, textLength)
      : {};
    const formatsForEditor = { ...appliedFormats, link: normalizedUrl };

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
    isTextEditorReady,
    setTextEditorInstance,
    show,
    applyLink,
  };
}
