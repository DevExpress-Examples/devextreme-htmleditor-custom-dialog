<script setup lang="ts">
import DxPopup from 'devextreme-vue/popup';
import DxTextBox from 'devextreme-vue/text-box';
import DxFileUploader from 'devextreme-vue/file-uploader';
import DxButton from 'devextreme-vue/button';
import { useVideoPopup, setupClipboard, registerBlot } from '../composables/useVideoPopup';

const props = defineProps<{
  editor: any;
}>();

const {
  visible,
  urlValue,
  fileValue,
  show,
  onUrlChanged,
  onFileChanged,
  applyVideo,
} = useVideoPopup(() => props.editor);

defineExpose({ show, setupClipboard, registerBlot });
</script>

<template>
  <DxPopup
    v-model:visible="visible"
    :show-title="true"
    title="Insert Video"
    :width="450"
    :height="320"
    :defer-rendering="false"
    :show-close-button="true"
  >
    <template #content>
      <div class="video-popup-content">
        <DxTextBox
          :value="urlValue"
          placeholder="Enter video URL..."
          :show-clear-button="true"
          @value-changed="onUrlChanged"
        />

        <div class="video-separator">— OR —</div>

        <DxFileUploader
          :value="fileValue"
          select-button-text="Upload a Video File"
          label-text=""
          accept="video/*"
          upload-mode="useForm"
          @value-changed="onFileChanged"
        />

        <DxButton
          text="Insert"
          type="default"
          width="100%"
          class="video-apply-btn"
          @click="applyVideo"
        />
      </div>
    </template>
  </DxPopup>
</template>

<style scoped>
.video-popup-content {
  padding: 10px;
}

.video-separator {
  text-align: center;
  margin: 15px 0;
  font-weight: bold;
  color: #888;
}

.video-apply-btn {
  margin-top: 25px;
}
</style>
