<script setup lang="ts">
import DxPopup from 'devextreme-vue/popup';
import { useMarkupPopup } from '../composables/useMarkupPopup';

const props = defineProps<{
  editor: any;
}>();

const { visible, markupContent, show } = useMarkupPopup(() => props.editor);

defineExpose({ show });
</script>

<template>
  <DxPopup
    v-model:visible="visible"
    :show-title="true"
    title="Markup"
    :show-close-button="true"
  >
    <template #content>
      <div class="markup-content">{{ markupContent }}</div>
    </template>
  </DxPopup>
</template>

<style scoped>
.markup-content {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
  padding: 10px;
  overflow: auto;
  height: 100%;
}
</style>
