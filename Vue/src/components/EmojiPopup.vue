<script setup lang="ts">
import DxPopover from 'devextreme-vue/popover';
import DxTextBox from 'devextreme-vue/text-box';
import { useEmojiPopup } from '../composables/useEmojiPopup';

const props = defineProps<{
  editor: any;
}>();

const {
  visible,
  searchValue,
  target,
  filteredEmojis,
  show,
  insertEmoji,
} = useEmojiPopup(() => props.editor);

defineExpose({ show });
</script>

<template>
  <DxPopover
    v-model:visible="visible"
    :width="320"
    :height="380"
    :show-title="false"
    position="top"
    :hide-on-outside-click="true"
    :hide-on-parent-scroll="false"
    :target="target"
  >
    <template #content>
      <div class="emoji-popup-content">
        <div class="emoji-search">
          <DxTextBox
            v-model:value="searchValue"
            placeholder="Find something fun"
            mode="search"
            styling-mode="filled"
            value-change-event="input"
          />
        </div>
        <div class="emoji-scroll-area">
          <div class="emoji-section-title">Emoji</div>
          <div class="emoji-grid">
            <button
            v-for="emoji in filteredEmojis"
            :key="emoji.char"
            type="button"
              class="emoji-item"
              @mousedown.prevent
              @click="insertEmoji(emoji)"
            >
              {{ emoji.char }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </DxPopover>
</template>

<style scoped>
.emoji-popup-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.emoji-search {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.emoji-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.emoji-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 10px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.emoji-item {
  font-size: 22px;
  cursor: pointer;
  user-select: none;
  text-align: center;
  padding: 8px 0;
  border-radius: 6px;
  border: none;
  background-color: transparent;
  transition: background-color 0.15s ease;
}

.emoji-item:hover {
  background-color: #f0f0f0;
}
</style>
