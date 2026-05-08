import { describe, expect, it } from 'vitest';
import { setupClipboard, type ClipboardConfig, type ClipboardMatcher } from './clipboardMatchers';

function createAnchor(href: string, hostname: string): HTMLElement {
  return { href, hostname } as unknown as HTMLElement;
}

function createIframe(src: string): HTMLElement {
  return { src } as unknown as HTMLElement;
}

function createVideo(src: string): HTMLElement {
  return { src } as unknown as HTMLElement;
}

describe('setupClipboard', () => {
  it('does nothing when config has no clipboard property', () => {
    const config = {};
    setupClipboard(config as Parameters<typeof setupClipboard>[0]);
    expect(config).toEqual({});
  });

  it('adds three matchers to the clipboard config', () => {
    const config: ClipboardConfig = { clipboard: { matchers: [] } };
    setupClipboard(config);
    expect(config.clipboard?.matchers).toHaveLength(3);
  });

  it('preserves existing matchers', () => {
    const existing: ClipboardMatcher = ['p', (_, delta) => delta];
    const config: ClipboardConfig = { clipboard: { matchers: [existing] } };
    setupClipboard(config);
    expect(config.clipboard?.matchers).toHaveLength(4);
    expect(config.clipboard?.matchers?.[0]).toBe(existing);
  });

  describe('anchor matcher', () => {
    function getAnchorMatcher(config: ClipboardConfig) {
      setupClipboard(config);
      const match = config.clipboard!.matchers!.find(
        (m) => m[0] === 'a',
      )!;
      return match[1];
    }

    it('converts YouTube link to video embed', () => {
      const config: ClipboardConfig = { clipboard: { matchers: [] } };
      const matcher = getAnchorMatcher(config);
      const node = createAnchor('https://www.youtube.com/watch?v=abc', 'www.youtube.com');
      const delta = { ops: [] as { insert: string | Record<string, string> }[] };

      const result = matcher(node, delta);

      expect(result.ops).toEqual([
        { insert: { video: 'https://www.youtube.com/watch?v=abc' } },
        { insert: '\n' },
      ]);
    });

    it('converts youtu.be link to video embed', () => {
      const config: ClipboardConfig = { clipboard: { matchers: [] } };
      const matcher = getAnchorMatcher(config);
      const node = createAnchor('https://youtu.be/abc123', 'youtu.be');
      const delta = { ops: [] as { insert: string | Record<string, string> }[] };

      const result = matcher(node, delta);

      expect(result.ops[0]).toEqual({ insert: { video: 'https://youtu.be/abc123' } });
    });

    it('converts Vimeo link to video embed', () => {
      const config: ClipboardConfig = { clipboard: { matchers: [] } };
      const matcher = getAnchorMatcher(config);
      const node = createAnchor('https://vimeo.com/12345', 'vimeo.com');
      const delta = { ops: [] as { insert: string | Record<string, string> }[] };

      const result = matcher(node, delta);

      expect(result.ops[0]).toEqual({ insert: { video: 'https://vimeo.com/12345' } });
    });

    it('converts .mp4 link to nativeVideo', () => {
      const config: ClipboardConfig = { clipboard: { matchers: [] } };
      const matcher = getAnchorMatcher(config);
      const node = createAnchor('https://example.com/video.mp4', 'example.com');
      const delta = { ops: [] as { insert: string | Record<string, string> }[] };

      const result = matcher(node, delta);

      expect(result.ops[0]).toEqual({ insert: { nativeVideo: 'https://example.com/video.mp4' } });
    });

    it('converts .webm link to nativeVideo', () => {
      const config: ClipboardConfig = { clipboard: { matchers: [] } };
      const matcher = getAnchorMatcher(config);
      const node = createAnchor('https://example.com/clip.webm', 'example.com');
      const delta = { ops: [] as { insert: string | Record<string, string> }[] };

      const result = matcher(node, delta);

      expect(result.ops[0]).toEqual({ insert: { nativeVideo: 'https://example.com/clip.webm' } });
    });

    it('does not modify delta for regular links', () => {
      const config: ClipboardConfig = { clipboard: { matchers: [] } };
      const matcher = getAnchorMatcher(config);
      const node = createAnchor('https://google.com', 'google.com');
      const originalOps: { insert: string | Record<string, string> }[] = [{ insert: 'Google' }];
      const delta = { ops: [...originalOps] };

      const result = matcher(node, delta);

      expect(result.ops).toEqual(originalOps);
    });
  });

  describe('iframe matcher', () => {
    it('converts iframe src to video embed', () => {
      const config: ClipboardConfig = { clipboard: { matchers: [] } };
      setupClipboard(config);
      const match = config.clipboard!.matchers!.find((m) => m[0] === 'iframe')!;
      const matcher = match[1];

      const node = createIframe('https://www.youtube.com/embed/abc');
      const delta = { ops: [] as { insert: string | Record<string, string> }[] };

      const result = matcher(node, delta);

      expect(result.ops).toEqual([
        { insert: { video: 'https://www.youtube.com/embed/abc' } },
        { insert: '\n' },
      ]);
    });
  });

  describe('video matcher', () => {
    it('converts video src to nativeVideo embed', () => {
      const config: ClipboardConfig = { clipboard: { matchers: [] } };
      setupClipboard(config);
      const match = config.clipboard!.matchers!.find((m) => m[0] === 'video')!;
      const matcher = match[1];

      const node = createVideo('https://example.com/local.mp4');
      const delta = { ops: [] as { insert: string | Record<string, string> }[] };

      const result = matcher(node, delta);

      expect(result.ops).toEqual([
        { insert: { nativeVideo: 'https://example.com/local.mp4' } },
        { insert: '\n' },
      ]);
    });
  });
});
