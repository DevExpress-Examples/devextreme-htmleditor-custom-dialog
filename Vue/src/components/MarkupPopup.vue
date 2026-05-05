<script setup lang="ts">
import { ref } from 'vue';
import DxPopup from 'devextreme-vue/popup';

const props = defineProps<{
  editor: any;
}>();

const visible = ref(false);
const markupContent = ref('');

function show() {
  markupContent.value = props.editor?.option('value') || '';
  visible.value = true;
}

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
