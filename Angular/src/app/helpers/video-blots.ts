import { escapeHtmlAttribute, getSafeEmbedSrc } from './sanitizers';

export function registerVideoBlots(editor: any): void {
  registerEnhancedVideoBlot(editor);
  registerNativeVideoBlot(editor);
}

function registerEnhancedVideoBlot(editor: any): void {
  const VideoFormat = editor.get('formats/video');

  if (!VideoFormat) {
    return;
  }

  class EnhancedVideoBlot extends VideoFormat {
    html(): string {
      const blotValue = (this as any)['value']();
      const rawSrc = typeof blotValue === 'string'
        ? blotValue
        : (this as any)['domNode'].getAttribute('src') ?? '';

      const safeSrc = getSafeEmbedSrc(rawSrc);
      if (!safeSrc) {
        return '';
      }

      const attrs = ['width', 'height', 'frameborder', 'allow', 'allowfullscreen'];
      const attrString = attrs
        .map((attr: string) => {
          const value = (this as any)['domNode'].getAttribute(attr);
          return value !== null ? ` ${attr}="${escapeHtmlAttribute(value)}"` : '';
        })
        .join('');

      return `<iframe src="${escapeHtmlAttribute(safeSrc)}"${attrString}></iframe>`;
    }
  }

  (EnhancedVideoBlot as any)['blotName'] = 'video';
  (EnhancedVideoBlot as any)['tagName'] = 'IFRAME';
  (EnhancedVideoBlot as any)['className'] = undefined;

  editor.register({ 'formats/video': EnhancedVideoBlot });
}

function registerNativeVideoBlot(editor: any): void {
  const BlockEmbed = editor.get('blots/block/embed');

  if (!BlockEmbed) {
    return;
  }

  class NativeVideoBlot extends BlockEmbed {
    static create(value: string): HTMLElement {
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

    static value(node: HTMLElement): string {
      return node.getAttribute('src') ?? '';
    }
  }

  (NativeVideoBlot as any)['blotName'] = 'nativeVideo';
  (NativeVideoBlot as any)['tagName'] = 'video';

  editor.register({ 'formats/nativeVideo': NativeVideoBlot });
}
