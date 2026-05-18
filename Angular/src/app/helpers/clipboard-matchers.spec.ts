import { setupClipboard } from './clipboard-matchers';

describe('setupClipboard', () => {
  it('should add matchers for a, iframe, and video tags', () => {
    const config: any = { clipboard: { matchers: [] } };
    setupClipboard(config);

    expect(config.clipboard.matchers.length).toBe(3);
    expect(config.clipboard.matchers[0][0]).toBe('a');
    expect(config.clipboard.matchers[1][0]).toBe('iframe');
    expect(config.clipboard.matchers[2][0]).toBe('video');
  });

  it('should append to existing matchers', () => {
    const existing = [['p', () => {}]];
    const config: any = { clipboard: { matchers: existing } };
    setupClipboard(config);

    expect(config.clipboard.matchers.length).toBe(4);
  });

  it('should handle missing clipboard config gracefully', () => {
    const config: any = {};
    expect(() => setupClipboard(config)).not.toThrow();
  });

  describe('anchor matcher', () => {
    let anchorMatcher: (node: any, delta: any) => any;

    beforeEach(() => {
      const config: any = { clipboard: { matchers: [] } };
      setupClipboard(config);
      anchorMatcher = config.clipboard.matchers[0][1];
    });

    it('should convert YouTube links to video embeds', () => {
      const node = { href: 'https://www.youtube.com/watch?v=abc', hostname: 'www.youtube.com' };
      const delta = { ops: [] };
      const result = anchorMatcher(node, delta);
      expect(result.ops[0].insert).toEqual({ video: 'https://www.youtube.com/watch?v=abc' });
    });

    it('should convert direct video links to nativeVideo embeds', () => {
      const node = { href: 'https://example.com/video.mp4', hostname: 'example.com' };
      const delta = { ops: [] };
      const result = anchorMatcher(node, delta);
      expect(result.ops[0].insert).toEqual({ nativeVideo: 'https://example.com/video.mp4' });
    });

    it('should not modify delta for regular links', () => {
      const node = { href: 'https://example.com/page', hostname: 'example.com' };
      const delta = { ops: [{ insert: 'text' }] };
      const result = anchorMatcher(node, delta);
      expect(result.ops).toEqual([{ insert: 'text' }]);
    });

    it('should not treat lookalike domains as embed providers', () => {
      const node = { href: 'https://notyoutube.com/watch?v=abc', hostname: 'notyoutube.com' };
      const delta = { ops: [{ insert: 'text' }] };
      const result = anchorMatcher(node, delta);
      expect(result.ops).toEqual([{ insert: 'text' }]);
    });
  });

  describe('iframe matcher', () => {
    it('should convert iframe src to video embed', () => {
      const config: any = { clipboard: { matchers: [] } };
      setupClipboard(config);
      const iframeMatcher = config.clipboard.matchers[1][1];

      const node = { src: 'https://www.youtube.com/embed/abc' };
      const delta = { ops: [] };
      const result = iframeMatcher(node, delta);
      expect(result.ops[0].insert).toEqual({ video: 'https://www.youtube.com/embed/abc' });
    });

    it('should ignore iframe src from disallowed domains', () => {
      const config: any = { clipboard: { matchers: [] } };
      setupClipboard(config);
      const iframeMatcher = config.clipboard.matchers[1][1];

      const node = { src: 'https://notyoutube.com/embed/abc' };
      const delta = { ops: [{ insert: 'text' }] };
      const result = iframeMatcher(node, delta);
      expect(result.ops).toEqual([{ insert: 'text' }]);
    });
  });

  describe('video matcher', () => {
    it('should convert video src to nativeVideo embed', () => {
      const config: any = { clipboard: { matchers: [] } };
      setupClipboard(config);
      const videoMatcher = config.clipboard.matchers[2][1];

      const node = { src: 'https://example.com/video.mp4' };
      const delta = { ops: [] };
      const result = videoMatcher(node, delta);
      expect(result.ops[0].insert).toEqual({ nativeVideo: 'https://example.com/video.mp4' });
    });
  });
});
