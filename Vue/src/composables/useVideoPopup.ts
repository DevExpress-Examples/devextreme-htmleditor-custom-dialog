import { ref, watch } from 'vue';

const DIRECT_VIDEO_EXTENSION_REGEX = /\.(mp4|webm|ogg)$/i;
const ALLOWED_EMBED_PROTOCOLS = new Set(['https:']);
const ALLOWED_EMBED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  'www.vimeo.com',
]);

function isDirectVideoUrl(url: string) {
  const normalizedUrl = url.split(/[?#]/, 1)[0];
  return DIRECT_VIDEO_EXTENSION_REGEX.test(normalizedUrl);
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getSafeEmbedSrc(value: string | null) {
  if (!value) {
    return null;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    return null;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  if (!ALLOWED_EMBED_PROTOCOLS.has(parsedUrl.protocol) || !ALLOWED_EMBED_HOSTS.has(hostname)) {
    return null;
  }

  return parsedUrl.toString();
}

export function useVideoPopup(editor: () => any) {
  const visible = ref(false);
  const urlValue = ref('');
  const fileValue = ref<File[]>([]);
  const insertIndex = ref(0);
  const selectionLength = ref(0);
  let finalVideoUrl = '';
  let createdBlobUrl: string | null = null;
  let shouldRevokeOnClose = true;

  function revokeCreatedBlobUrl() {
    if (createdBlobUrl) {
      URL.revokeObjectURL(createdBlobUrl);
      createdBlobUrl = null;
    }
  }

  function show(cursorIndex: number, length = 0) {
    revokeCreatedBlobUrl();
    shouldRevokeOnClose = true;
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
      revokeCreatedBlobUrl();
      finalVideoUrl = e.value;
      fileValue.value = [];
    } else if (!fileValue.value.length) {
      finalVideoUrl = '';
    }
  }

  function onFileChanged(e: { value?: File[] }) {
    const file = e.value?.[0];
    if (file) {
      revokeCreatedBlobUrl();
      createdBlobUrl = URL.createObjectURL(file);
      finalVideoUrl = createdBlobUrl;
      urlValue.value = '';
    } else if (!urlValue.value) {
      revokeCreatedBlobUrl();
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

    const insertedCreatedBlobUrl = createdBlobUrl !== null && finalVideoUrl === createdBlobUrl;
    if (insertedCreatedBlobUrl) {
      // Keep the URL alive because the editor content now references it.
      shouldRevokeOnClose = false;
      createdBlobUrl = null;
    } else {
      shouldRevokeOnClose = true;
      revokeCreatedBlobUrl();
    }

    urlValue.value = '';
    fileValue.value = [];
    finalVideoUrl = '';
    visible.value = false;
  }

  watch(visible, (isVisible) => {
    if (!isVisible) {
      if (shouldRevokeOnClose) {
        revokeCreatedBlobUrl();
      }
      shouldRevokeOnClose = true;
      fileValue.value = [];
      finalVideoUrl = '';
    }
  });

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
      const srcValue = typeof this.value() === 'string'
        ? this.value()
        : this.domNode.getAttribute('src');

      const safeSrc = getSafeEmbedSrc(srcValue);
      if (!safeSrc) {
        return '';
      }

      const ATTRS = ['width', 'height', 'frameborder', 'allow', 'allowfullscreen'];
      let attrStr = '';

      ATTRS.forEach((attr: string) => {
        const value = this.domNode.getAttribute(attr);
        if (value !== undefined && value !== null) {
          attrStr += ` ${attr}="${escapeHtmlAttribute(value)}"`;
        }
      });

      return `<iframe src="${escapeHtmlAttribute(safeSrc)}"${attrStr}></iframe>`;
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
