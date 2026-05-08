<script setup lang="ts">
import DxPopup from 'devextreme-vue/popup';
import DxTextBox from 'devextreme-vue/text-box';
import DxHtmlEditor, { DxToolbar, DxItem } from 'devextreme-vue/html-editor';
import DxButton from 'devextreme-vue/button';
import { useLinkPopup } from '../composables/useLinkPopup';

const props = defineProps<{
  editor: any;
}>();

const {
  visible,
  urlValue,
  isTextEditorReady,
  setTextEditorInstance,
  show,
  applyLink,
} = useLinkPopup(() => props.editor);

function onTextEditorInitialized(e: any) {
  setTextEditorInstance(e.component);
}

defineExpose({ show });
</script>

<template>
  <DxPopup
    v-model:visible="visible"
    :show-title="true"
    title="Insert Formatted Link"
    :width="450"
    :height="380"
    :defer-rendering="false"
    :show-close-button="true"
  >
    <template #content>
      <div class="link-popup-content">
        <DxTextBox
          v-model:value="urlValue"
          placeholder="Enter URL (e.g., https://google.com)..."
          :show-clear-button="true"
          label="URL:"
          label-mode="outside"
        />

        <div class="link-text-label">Link Text:</div>

        <DxHtmlEditor
          :height="120"
          @initialized="onTextEditorInitialized"
        >
          <DxToolbar>
            <DxItem name="bold"/>
            <DxItem name="italic"/>
            <DxItem name="underline"/>
            <DxItem name="strike"/>
            <DxItem name="color"/>
          </DxToolbar>
        </DxHtmlEditor>

        <DxButton
          text="Insert"
          type="default"
          width="100%"
          :disabled="!isTextEditorReady"
          class="link-apply-btn"
          @click="applyLink"
        />
      </div>
    </template>
  </DxPopup>
</template>

<style scoped>
.link-popup-content {
  padding: 10px;
}

.link-text-label {
  margin-top: 15px;
  font-size: 12px;
}

.link-apply-btn {
  margin-top: 20px;
}
</style>
