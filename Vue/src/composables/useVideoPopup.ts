import { ref } from 'vue';

const DIRECT_VIDEO_EXTENSION_REGEX = /\.(mp4|webm|ogg)$/i;

function isDirectVideoUrl(url: string) {
  const normalizedUrl = url.split(/[?#]/, 1)[0];
  return DIRECT_VIDEO_EXTENSION_REGEX.test(normalizedUrl);
}

export function useVideoPopup(editor: () => any) {
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
      const content = editor().getQuillInstance().getContents(cursorIndex, 1);
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

  function onUrlChanged(e: { value?: string }) {
    if (e.value) {
      finalVideoUrl = e.value;
      fileValue.value = [];
    } else if (!fileValue.value.length) {
      finalVideoUrl = '';
    }
  }

  function onFileChanged(e: { value?: File[] }) {
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
    const isDirectVideo = isDirectVideoUrl(finalVideoUrl);
    const embedType = isLocalBlob || isDirectVideo ? 'nativeVideo' : 'video';

    if (selectionLength.value > 0) {
      editor().delete(insertIndex.value, selectionLength.value);
    }

    editor().insertEmbed(insertIndex.value, embedType, finalVideoUrl);
    editor().insertText(insertIndex.value + 1, '\n');
    editor().setSelection(insertIndex.value + 2, 0);

    urlValue.value = '';
    fileValue.value = [];
    finalVideoUrl = '';
    visible.value = false;
  }

  return {
    visible,
    urlValue,
    fileValue,
    insertIndex,
    selectionLength,
    show,
    onUrlChanged,
    onFileChanged,
    applyVideo,
  };
}

export function setupClipboard(config: any) {
  config.clipboard.matchers.push([
    'a',
    (node: HTMLAnchorElement, delta: any) => {
      const url = node.href;
      const isEmbedVideo = /youtu[.]?be|youtube\.com|vimeo\.com/i.test(node.hostname);
      const isDirectVideo = isDirectVideoUrl(url);

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

export function registerBlot(editorInstance: any) {
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
