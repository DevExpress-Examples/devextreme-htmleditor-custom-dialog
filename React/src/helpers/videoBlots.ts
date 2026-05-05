import type dxHtmlEditor from 'devextreme/ui/html_editor';

type BlotBase = new () => Record<string, unknown>;

interface ParchmentBlot {
  blotName: string;
  className?: string;
  tagName: string;
  create(value: unknown): HTMLElement;
  value(node: HTMLElement): unknown;
}

const IFRAME_ATTRS = ['width', 'height', 'frameborder', 'allow', 'allowfullscreen'] as const;

function buildEnhancedVideoBlot(VideoFormat: ParchmentBlot): ParchmentBlot {
  class EnhancedVideoBlot extends (VideoFormat as unknown as BlotBase) {
    declare domNode: Element;

    declare value: () => string | Record<string, unknown>;

    html(): string {
      const blotValue = this.value();
      const src = typeof blotValue === 'string'
        ? blotValue
        : this.domNode.getAttribute('src') ?? '';

      const attrString = IFRAME_ATTRS
        .map((attr) => {
          const val = this.domNode.getAttribute(attr);
          return val !== null ? ` ${attr}="${val}"` : '';
        })
        .join('');

      return `<iframe src="${src}"${attrString}></iframe>`;
    }
  }

  const blot = EnhancedVideoBlot as unknown as ParchmentBlot;
  blot.blotName = 'video';
  blot.tagName = 'IFRAME';
  blot.className = undefined;

  return blot;
}

function buildNativeVideoBlot(BlockEmbed: ParchmentBlot): ParchmentBlot {
  class NativeVideoBlot extends (BlockEmbed as unknown as BlotBase) {}

  const blot = NativeVideoBlot as unknown as ParchmentBlot;
  blot.blotName = 'nativeVideo';
  blot.tagName = 'video';

  blot.create = function create(value: unknown): HTMLElement {
    const node = BlockEmbed.create.call(blot, value);
    node.setAttribute('src', String(value));
    node.setAttribute('controls', 'true');
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('tabindex', '0');
    node.setAttribute(
      'style',
      'max-width: 100%; border-radius: 8px; margin: 15px 0; max-height: 150px;',
    );
    return node;
  };

  blot.value = function value(node: HTMLElement): string {
    return node.getAttribute('src') ?? '';
  };

  return blot;
}

export function registerVideoBlots(editor: dxHtmlEditor): void {
  const VideoFormat = editor.get('formats/video') as unknown as ParchmentBlot | undefined;
  const BlockEmbed = editor.get('blots/block/embed') as unknown as ParchmentBlot | undefined;

  if (VideoFormat) {
    editor.register({ 'formats/video': buildEnhancedVideoBlot(VideoFormat) });
  }

  if (BlockEmbed) {
    editor.register({ 'formats/nativeVideo': buildNativeVideoBlot(BlockEmbed) });
  }
}
