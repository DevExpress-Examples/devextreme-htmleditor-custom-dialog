import { ref } from 'vue';

export function useMarkupPopup(editor: () => any) {
  const visible = ref(false);
  const markupContent = ref('');

  function show() {
    markupContent.value = editor()?.option('value') || '';
    visible.value = true;
  }

  return {
    visible,
    markupContent,
    show,
  };
}
