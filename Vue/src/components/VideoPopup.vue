<script setup lang="ts">
import { ref } from 'vue';
import DxPopup from 'devextreme-vue/popup';
import DxTextBox from 'devextreme-vue/text-box';
import DxFileUploader from 'devextreme-vue/file-uploader';
import DxButton from 'devextreme-vue/button';
import type { ValueChangedEvent as TextBoxValueChangedEvent } from 'devextreme/ui/text_box';
import type { ValueChangedEvent as FileUploaderValueChangedEvent } from 'devextreme/ui/file_uploader';

const props = defineProps<{
  editor: any;
}>();

const visible = ref(false);
const urlValue = ref('');
const fileValue = ref<File[]>([]);
const insertIndex = ref(0);
const selectionLength = ref(0);
let finalVideoUrl = '';

function show(cursorIndex: number, length = 0) {
  insertIndex.value = cursorIndex;
  selectionLength.value = length;
  finalVideoUrl = '';
  urlValue.value = '';
  fileValue.value = [];

  let existingUrl = '';

  if (length === 1) {
    const content = props.editor.getQuillInstance().getContents(cursorIndex, 1);
    const insertObj = content?.ops?.[0]?.insert;

    if (insertObj?.video) {
      existingUrl = insertObj.video;
    } else if (insertObj?.nativeVideo) {
      existingUrl = insertObj.nativeVideo;
    }
  }

  if (existingUrl) {
    finalVideoUrl = existingUrl;
    urlValue.value = existingUrl;
  }

  visible.value = true;
}

function onUrlChanged(e: TextBoxValueChangedEvent) {
  if (e.value) {
    finalVideoUrl = e.value;
    fileValue.value = [];
  } else if (!fileValue.value.length) {
    finalVideoUrl = '';
  }
}

function onFileChanged(e: FileUploaderValueChangedEvent) {
  const file = e.value?.[0];
  if (file) {
    finalVideoUrl = URL.createObjectURL(file);
    urlValue.value = '';
  } else if (!urlValue.value) {
    finalVideoUrl = '';
  }
}

function applyVideo() {
  if (!finalVideoUrl) return;

  const isLocalBlob = finalVideoUrl.startsWith('blob:');
  const embedType = isLocalBlob ? 'nativeVideo' : 'video';

  if (selectionLength.value > 0) {
    props.editor.delete(insertIndex.value, selectionLength.value);
  }

  props.editor.insertEmbed(insertIndex.value, embedType, finalVideoUrl);
  props.editor.insertText(insertIndex.value + 1, '\n');
  props.editor.setSelection(insertIndex.value + 2, 0);

  urlValue.value = '';
  fileValue.value = [];
  finalVideoUrl = '';
  visible.value = false;
}

function setupClipboard(config: any) {
  config.clipboard.matchers.push([
    'a',
    (node: HTMLAnchorElement, delta: any) => {
      const url = node.href;
      const isEmbedVideo = /youtu[.]?be|youtube\.com|vimeo\.com/i.test(node.hostname);
      const isDirectVideo = /\.(mp4|webm|ogg)$/i.test(url);

      if (isEmbedVideo) {
        delta.ops = [{ insert: { video: url } }, { insert: '\n' }];
      } else if (isDirectVideo) {
        delta.ops = [{ insert: { nativeVideo: url } }, { insert: '\n' }];
      }
      return delta;
    },
  ]);

  config.clipboard.matchers.push([
    'iframe',
    (node: HTMLIFrameElement, delta: any) => {
      delta.ops = [{ insert: { video: node.src } }, { insert: '\n' }];
      return delta;
    },
  ]);

  config.clipboard.matchers.push([
    'video',
    (node: HTMLVideoElement, delta: any) => {
      delta.ops = [{ insert: { nativeVideo: node.src } }, { insert: '\n' }];
      return delta;
    },
  ]);
}

function registerBlot(editorInstance: any) {
  const VideoFormat = editorInstance.get('formats/video');

  class EnhancedVideoBlot extends VideoFormat {
    html() {
      const src = typeof this.value() === 'string'
        ? this.value()
        : this.domNode.getAttribute('src');

      const ATTRS = ['width', 'height', 'frameborder', 'allow', 'allowfullscreen'];
      let attrStr = '';

      ATTRS.forEach((attr: string) => {
        const value = this.domNode.getAttribute(attr);
        if (value !== undefined && value !== null) {
          attrStr += ` ${attr}="${value}"`;
        }
      });

      return `<iframe src="${src}"${attrStr}></iframe>`;
    }
  }

  EnhancedVideoBlot.blotName = 'video';
  EnhancedVideoBlot.tagName = 'IFRAME';
  EnhancedVideoBlot.className = undefined;

  editorInstance.register({ 'formats/video': EnhancedVideoBlot });

  const BlockEmbed = editorInstance.get('blots/block/embed');

  class NativeVideoBlot extends BlockEmbed {
    static create(value: string) {
      const node = super.create(value);
      node.setAttribute('src', value);
      node.setAttribute('controls', 'true');
      node.setAttribute('contenteditable', 'false');
      node.setAttribute('tabindex', '0');
      node.setAttribute(
        'style',
        'max-width: 100%; border-radius: 8px; margin: 15px 0; max-height: 150px;',
      );
      return node;
    }

    static value(node: HTMLElement) {
      return node.getAttribute('src');
    }
  }

  NativeVideoBlot.blotName = 'nativeVideo';
  NativeVideoBlot.tagName = 'video';

  editorInstance.register({ 'formats/nativeVideo': NativeVideoBlot });
}

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
