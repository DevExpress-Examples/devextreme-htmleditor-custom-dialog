class VideoPopupHelper {

  static hostnameMatches(hostname, domain) {
    const normalizedHostname = (hostname || "").toLowerCase().replace(/\.$/, "");
    const normalizedDomain = domain.toLowerCase();
    return normalizedHostname === normalizedDomain
      || normalizedHostname.endsWith(`.${normalizedDomain}`);
  }

  static normalizeYouTubeEmbedUrl(parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase().replace(/\.$/, "");
    let videoId = null;

    if (VideoPopupHelper.hostnameMatches(hostname, "youtu.be")) {
      videoId = parsedUrl.pathname.split("/").filter(Boolean)[0] || null;
    } else if (VideoPopupHelper.hostnameMatches(hostname, "youtube.com")) {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v");
      } else {
        const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
        if (pathParts[0] === "embed" || pathParts[0] === "shorts" || pathParts[0] === "live" || pathParts[0] === "v") {
          videoId = pathParts[1] || null;
        }
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  static normalizeVimeoEmbedUrl(parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase().replace(/\.$/, "");
    let videoId = null;

    if (VideoPopupHelper.hostnameMatches(hostname, "player.vimeo.com")) {
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      if (pathParts[0] === "video") {
        videoId = pathParts[1] || null;
      }
    } else if (VideoPopupHelper.hostnameMatches(hostname, "vimeo.com")) {
      const match = parsedUrl.pathname.match(/^\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/|album\/\d+\/video\/)?(\d+)(?:$|\/)/);
      videoId = match ? match[1] : null;
    }

    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }

  static normalizeEmbedVideoUrl(url) {
    try {
      const parsedUrl = new URL(url, window.location.href);
      const hostname = parsedUrl.hostname.toLowerCase().replace(/\.$/, "");

      if (VideoPopupHelper.hostnameMatches(hostname, "youtu.be")
        || VideoPopupHelper.hostnameMatches(hostname, "youtube.com")) {
        return VideoPopupHelper.normalizeYouTubeEmbedUrl(parsedUrl);
      }

      if (VideoPopupHelper.hostnameMatches(hostname, "vimeo.com")
        || VideoPopupHelper.hostnameMatches(hostname, "player.vimeo.com")) {
        return VideoPopupHelper.normalizeVimeoEmbedUrl(parsedUrl);
      }
    } catch (e) {
      return null;
    }

    return null;
  }

  static setupClipboard(cfg) {
    cfg.clipboard.matchers.push([
      "a",
      (node, delta) => {
        const url = node.href;
        const embedUrl = VideoPopupHelper.normalizeEmbedVideoUrl(url);

        let videoUrlForDetection = url;
        try {
          videoUrlForDetection = new URL(url, window.location.href).pathname;
        } catch (e) {
          videoUrlForDetection = url.split(/[?#]/, 1)[0];
        }
        const isDirectVideo = /\.(mp4|webm|ogg)$/i.test(videoUrlForDetection);

        if (embedUrl) {
          delta.ops = [{ insert: { video: embedUrl } }, { insert: "\n" }];
        } else if (isDirectVideo) {
          delta.ops = [{ insert: { nativeVideo: url } }, { insert: "\n" }];
        }
        return delta;
      },
    ]);

    cfg.clipboard.matchers.push([
      "iframe",
      (node, delta) => {
        delta.ops = [{ insert: { video: node.src } }, { insert: "\n" }];
        return delta;
      },
    ]);

    cfg.clipboard.matchers.push([
      "video",
      (node, delta) => {
        delta.ops = [{ insert: { nativeVideo: node.src } }, { insert: "\n" }];
        return delta;
      },
    ]);
  }

  static registerBlot(editorInstance) {
    const VideoFormat = editorInstance.get("formats/video");

    class EnhancedVideoBlot extends VideoFormat {
      static sanitizeIframeSrc(src) {
        if (typeof src !== "string" || src.trim() === "") {
          return "";
        }

        try {
          const parsed = new URL(src, window.location.href);
          return /^(https?:)$/i.test(parsed.protocol) ? parsed.href : "";
        } catch (e) {
          return "";
        }
      }

      html() {
        const src = typeof this.value() === "string"
          ? this.value()
          : this.domNode.getAttribute("src");
        const sanitizedSrc = EnhancedVideoBlot.sanitizeIframeSrc(src);

        const ATTRS = ["width", "height", "frameborder", "allow", "allowfullscreen"];
        const iframe = document.createElement("iframe");

        if (sanitizedSrc) {
          iframe.setAttribute("src", sanitizedSrc);
        }

        ATTRS.forEach((attr) => {
          const value = this.domNode.getAttribute(attr);
          if (value !== undefined && value !== null) {
            iframe.setAttribute(attr, value);
          }
        });

        return iframe.outerHTML;
      }
    }

    EnhancedVideoBlot.blotName = "video";
    EnhancedVideoBlot.tagName = "IFRAME";
    EnhancedVideoBlot.className = undefined;

    editorInstance.register({ "formats/video": EnhancedVideoBlot });

    const BlockEmbed = editorInstance.get("blots/block/embed");

    class NativeVideoBlot extends BlockEmbed {
      static create(value) {
        const node = super.create(value);
        node.setAttribute("src", value);
        node.setAttribute("controls", "true");
        node.setAttribute("contenteditable", "false");
        node.setAttribute("tabindex", "0");
        node.setAttribute(
          "style",
          "max-width: 100%; border-radius: 8px; margin: 15px 0; max-height: 150px;"
        );
        return node;
      }

      static value(node) {
        return node.getAttribute("src");
      }
    }

    NativeVideoBlot.blotName = "nativeVideo";
    NativeVideoBlot.tagName = "video";

    editorInstance.register({ "formats/nativeVideo": NativeVideoBlot });
  }

  // Called by onEditorInitialized to bind to Razor-rendered widgets
  constructor(editorInstance) {
    this.editor = editorInstance;
    this.insertIndex = 0;
    this.selectionLength = 0;
    this.finalVideoUrl = "";

    this.popup = $("#video-popup").dxPopup("instance");
    this.urlBox = $("#video-url-box").dxTextBox("instance");
    this.fileUploader = $("#video-file-uploader").dxFileUploader("instance");
    this.applyBtn = $("#video-apply-btn").dxButton("instance");
  }

  // Static event handlers referenced from Razor
  static onUrlChanged(e) {
    const self = ctx.videoHelper;
    if (e.value) {
      self.finalVideoUrl = e.value;
      self.fileUploader.option("value", []);
    } else if (!self.fileUploader.option("value").length) {
      self.finalVideoUrl = "";
    }
  }

  static onFileChanged(e) {
    const self = ctx.videoHelper;
    const file = e.value?.[0];
    if (file) {
      self.finalVideoUrl = URL.createObjectURL(file);
      self.urlBox.option("value", "");
    } else if (!self.urlBox.option("value")) {
      self.finalVideoUrl = "";
    }
  }

  static onApplyClick() {
    ctx.videoHelper._applyVideo();
  }

  show(cursorIndex, length = 0) {
    this.insertIndex = cursorIndex;
    this.selectionLength = length;
    this.finalVideoUrl = "";

    let existingUrl = "";

    if (this.selectionLength === 1) {
      const content = this.editor.getQuillInstance().getContents(cursorIndex, 1);
      const insertObj = content?.ops?.[0]?.insert;

      if (insertObj?.video) {
        existingUrl = insertObj.video;
      } else if (insertObj?.nativeVideo) {
        existingUrl = insertObj.nativeVideo;
      }
    }

    this.urlBox.option("value", "");
    this.fileUploader.option("value", []);

    if (existingUrl) {
      this.finalVideoUrl = existingUrl;
      this.urlBox.option("value", existingUrl);
      this.popup.option("title", "Edit Video");
      this.applyBtn.option("text", "Apply Changes");
    } else {
      this.popup.option("title", "Insert Video");
      this.applyBtn.option("text", "Insert Video");
    }

    this.popup.show();
  }

  _applyVideo() {
    if (!this.finalVideoUrl) return;

    const isLocalBlob = this.finalVideoUrl.startsWith("blob:");
    let embedType;
    let videoUrl;

    if (isLocalBlob) {
      embedType = "nativeVideo";
      videoUrl = this.finalVideoUrl;
    } else {
      const normalized = VideoPopupHelper.normalizeEmbedVideoUrl(this.finalVideoUrl);
      if (normalized) {
        embedType = "video";
        videoUrl = normalized;
      } else {
        embedType = "video";
        videoUrl = this.finalVideoUrl;
      }
    }

    if (this.selectionLength > 0) {
      this.editor.delete(this.insertIndex, this.selectionLength);
    }

    this.editor.insertEmbed(this.insertIndex, embedType, videoUrl);
    this.editor.insertText(this.insertIndex + 1, "\n");
    this.editor.setSelection(this.insertIndex + 2, 0);

    this.urlBox.option("value", "");
    this.fileUploader.option("value", []);
    this.finalVideoUrl = "";

    this.popup.hide();
  }
}
