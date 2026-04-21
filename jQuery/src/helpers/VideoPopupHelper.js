class VideoPopupHelper {
  static setupClipboard(config) {
    config.clipboard.matchers.push([
      'a',
      (node, delta) => {
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
      (node, delta) => {
        delta.ops = [{ insert: { video: node.src } }, { insert: '\n' }];
        return delta;
      },
    ]);

    config.clipboard.matchers.push([
      'video',
      (node, delta) => {
        delta.ops = [{ insert: { nativeVideo: node.src } }, { insert: '\n' }];
        return delta;
      },
    ]);
  }

  static registerBlot(editorInstance) {
    const VideoFormat = editorInstance.get('formats/video');

    class EnhancedVideoBlot extends VideoFormat {
      html() {
        const src = typeof this.value() === 'string'
          ? this.value()
          : this.domNode.getAttribute('src');

        const ATTRS = ['width', 'height', 'frameborder', 'allow', 'allowfullscreen'];
        let attrStr = '';

        ATTRS.forEach((attr) => {
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
      static create(value) {
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

      static value(node) {
        return node.getAttribute('src');
      }
    }

    NativeVideoBlot.blotName = 'nativeVideo';
    NativeVideoBlot.tagName = 'video';

    editorInstance.register({ 'formats/nativeVideo': NativeVideoBlot });
  }

  constructor(selector, editorInstance) {
    this.editor = editorInstance;
    this.insertIndex = 0;
    this.selectionLength = 0;
    this.finalVideoUrl = '';

    this.popup = $(selector)
      .dxPopup({
        showTitle: true,
        title: 'Insert Video',
        width: 450,
        height: 320,
        deferRendering: false,
        showCloseButton: true,
        contentTemplate: (contentElement) => this._renderContent(contentElement),
      })
      .dxPopup('instance');
  }

  show(cursorIndex, length = 0) {
    this.insertIndex = cursorIndex;
    this.selectionLength = length;
    this.finalVideoUrl = '';

    let existingUrl = '';

    if (this.selectionLength === 1) {
      const content = this.editor.getQuillInstance().getContents(cursorIndex, 1);
      const insertObj = content?.ops?.[0]?.insert;

      if (insertObj?.video) {
        existingUrl = insertObj.video;
      } else if (insertObj?.nativeVideo) {
        existingUrl = insertObj.nativeVideo;
      }
    }

    this.urlBox?.option('value', '');
    this.fileUploader?.option('value', []);

    if (existingUrl) {
      this.finalVideoUrl = existingUrl;
      this.urlBox?.option('value', existingUrl);
      this.popup.option('title', 'Edit Video');
      this.applyBtn?.option('text', 'Apply Changes');
    } else {
      this.popup.option('title', 'Insert Video');
      this.applyBtn?.option('text', 'Insert Video');
    }

    this.popup.show();
  }

  _renderContent(contentElement) {
    const container = $('<div>').css('padding', '10px').appendTo(contentElement);

    this.urlBox = $('<div>')
      .dxTextBox({
        placeholder: 'Enter YouTube or external URL...',
        showClearButton: true,
        onValueChanged: (e) => {
          if (e.value) {
            this.finalVideoUrl = e.value;
            this.fileUploader.option('value', []);
          } else if (!this.fileUploader.option('value').length) {
            this.finalVideoUrl = '';
          }
        },
      })
      .appendTo(container)
      .dxTextBox('instance');

    $('<div style="text-align: center; margin: 15px 0; font-weight: bold; color: #888;">— OR —</div>')
      .appendTo(container);

    this.fileUploader = $('<div>')
      .dxFileUploader({
        selectButtonText: 'Select Local Video File',
        labelText: '',
        accept: 'video/*',
        uploadMode: 'useForm',
        onValueChanged: (e) => {
          const file = e.value[0];
          if (file) {
            this.finalVideoUrl = URL.createObjectURL(file);
            this.urlBox.option('value', '');
          } else if (!this.urlBox.option('value')) {
            this.finalVideoUrl = '';
          }
        },
      })
      .appendTo(container)
      .dxFileUploader('instance');

    this.applyBtn = $('<div>')
      .dxButton({
        text: 'Insert Video',
        type: 'default',
        width: '100%',
        onClick: () => this._applyVideo(),
      })
      .appendTo(container)
      .css('margin-top', '25px')
      .dxButton('instance');
  }

  _applyVideo() {
    if (!this.finalVideoUrl) return;

    const isLocalBlob = this.finalVideoUrl.startsWith('blob:');
    const embedType = isLocalBlob ? 'nativeVideo' : 'video';

    if (this.selectionLength > 0) {
      this.editor.delete(this.insertIndex, this.selectionLength);
    }

    this.editor.insertEmbed(this.insertIndex, embedType, this.finalVideoUrl);
    this.editor.insertText(this.insertIndex + 1, '\n');
    this.editor.setSelection(this.insertIndex + 2, 0);

    this.urlBox.option('value', '');
    this.fileUploader.option('value', []);
    this.finalVideoUrl = '';

    this.popup.hide();
  }
}

export default VideoPopupHelper;