import { normalizeAndValidateLinkUrl, escapeHtmlAttribute, getSafeEmbedSrc } from './sanitizers';

describe('normalizeAndValidateLinkUrl', () => {
  it('should return null for empty string', () => {
    expect(normalizeAndValidateLinkUrl('')).toBeNull();
    expect(normalizeAndValidateLinkUrl('   ')).toBeNull();
  });

  it('should prepend https:// when no scheme is present', () => {
    const result = normalizeAndValidateLinkUrl('example.com');
    expect(result).toBe('https://example.com/');
  });

  it('should accept http URLs', () => {
    const result = normalizeAndValidateLinkUrl('http://example.com');
    expect(result).toBe('http://example.com/');
  });

  it('should accept https URLs', () => {
    const result = normalizeAndValidateLinkUrl('https://example.com/path');
    expect(result).toBe('https://example.com/path');
  });

  it('should accept mailto URLs', () => {
    const result = normalizeAndValidateLinkUrl('mailto:user@example.com');
    expect(result).toBe('mailto:user@example.com');
  });

  it('should accept tel URLs', () => {
    const result = normalizeAndValidateLinkUrl('tel:+1234567890');
    expect(result).toBe('tel:+1234567890');
  });

  it('should reject disallowed protocols', () => {
    expect(normalizeAndValidateLinkUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeAndValidateLinkUrl('ftp://example.com')).toBeNull();
  });

  it('should reject invalid URLs', () => {
    expect(normalizeAndValidateLinkUrl('https://')).toBeNull();
  });

  it('should reject mailto with empty pathname', () => {
    expect(normalizeAndValidateLinkUrl('mailto:')).toBeNull();
  });
});

describe('escapeHtmlAttribute', () => {
  it('should escape all special characters', () => {
    expect(escapeHtmlAttribute('&"\'<>')).toBe('&amp;&quot;&#39;&lt;&gt;');
  });

  it('should return plain text unchanged', () => {
    expect(escapeHtmlAttribute('hello')).toBe('hello');
  });
});

describe('getSafeEmbedSrc', () => {
  it('should return null for null/empty input', () => {
    expect(getSafeEmbedSrc(null)).toBeNull();
    expect(getSafeEmbedSrc('')).toBeNull();
  });

  it('should allow youtube.com embed', () => {
    const url = 'https://www.youtube.com/embed/abc123';
    expect(getSafeEmbedSrc(url)).toBe(url);
  });

  it('should allow vimeo.com embed', () => {
    const url = 'https://player.vimeo.com/video/123';
    expect(getSafeEmbedSrc(url)).toBe(url);
  });

  it('should allow subdomains of allowed embed domains', () => {
    const url = 'https://music.youtube.com/watch?v=abc123';
    expect(getSafeEmbedSrc(url)).toBe(url);
  });

  it('should reject non-https embeds', () => {
    expect(getSafeEmbedSrc('http://www.youtube.com/embed/abc')).toBeNull();
  });

  it('should reject disallowed hosts', () => {
    expect(getSafeEmbedSrc('https://evil.com/video')).toBeNull();
  });

  it('should reject lookalike domains', () => {
    expect(getSafeEmbedSrc('https://notyoutube.com/watch?v=abc')).toBeNull();
  });

  it('should reject invalid URLs', () => {
    expect(getSafeEmbedSrc('not-a-url')).toBeNull();
  });
});
