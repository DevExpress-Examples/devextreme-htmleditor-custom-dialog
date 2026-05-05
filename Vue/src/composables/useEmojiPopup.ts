import { ref, computed } from 'vue';
import { EMOJI_LIST, type EmojiItem } from '../data/emojiList';

export function useEmojiPopup(editor: () => any) {
  const visible = ref(false);
  const searchValue = ref('');
  const insertIndex = ref(0);
  const target = ref<HTMLElement | null>(null);

  const filteredEmojis = computed(() => {
    const term = searchValue.value.toLowerCase().trim();
    if (!term) return EMOJI_LIST;
    return EMOJI_LIST.filter((e) => e.terms.includes(term));
  });

  function show(cursorIndex: number, targetElement: HTMLElement) {
    insertIndex.value = cursorIndex;
    searchValue.value = '';
    target.value = targetElement;
    visible.value = true;
  }

  function insertEmoji(emoji: EmojiItem) {
    visible.value = false;
    editor().insertText(insertIndex.value, emoji.char);
    editor().setSelection(insertIndex.value + emoji.char.length, 0);
  }

  return {
    visible,
    searchValue,
    insertIndex,
    target,
    filteredEmojis,
    show,
    insertEmoji,
  };
}
