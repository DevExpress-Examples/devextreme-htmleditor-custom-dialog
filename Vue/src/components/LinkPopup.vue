<script setup lang="ts">
import { ref } from 'vue';
import DxPopup from 'devextreme-vue/popup';
import DxTextBox from 'devextreme-vue/text-box';
import DxHtmlEditor, { DxToolbar, DxItem } from 'devextreme-vue/html-editor';
import DxButton from 'devextreme-vue/button';

const props = defineProps<{
  editor: any;
}>();

const visible = ref(false);
const urlValue = ref('');
const insertIndex = ref(0);
const selectionLength = ref(0);

let textEditorInstance: any = null;

function show(cursorIndex: number, length: number) {
  urlValue.value = '';
  insertIndex.value = cursorIndex;
  selectionLength.value = length || 0;

  if (textEditorInstance) {
    textEditorInstance.clear();
  }

  const selectedText = length > 0
    ? props.editor.getText(cursorIndex, length)
    : '';
  const selectedFormats = length > 0
    ? props.editor.getFormat(cursorIndex, length)
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

function onTextEditorInitialized(e: any) {
  textEditorInstance = e.component;
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
    props.editor.delete(insertIndex.value, selectionLength.value);
  }

  props.editor.insertText(insertIndex.value, newText, formatsForEditor);
  props.editor.setSelection(insertIndex.value + newText.length, 0);

  visible.value = false;
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
            <DxItem name="bold" />
            <DxItem name="italic" />
            <DxItem name="underline" />
            <DxItem name="strike" />
            <DxItem name="color" />
          </DxToolbar>
        </DxHtmlEditor>

        <DxButton
          text="Insert"
          type="default"
          width="100%"
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
