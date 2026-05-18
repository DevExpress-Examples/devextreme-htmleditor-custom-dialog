const ABSOLUTE_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const ALLOWED_EMBED_PROTOCOLS = new Set(['https:']);
const ALLOWED_EMBED_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'vimeo.com',
];

function isAllowedEmbedHost(hostname: string): boolean {
  return ALLOWED_EMBED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

export function normalizeAndValidateLinkUrl(rawUrl: string): string | null {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) {
    return null;
  }

  const candidateUrl = ABSOLUTE_SCHEME_REGEX.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(candidateUrl);
  } catch {
    return null;
  }

  if (!ALLOWED_LINK_PROTOCOLS.has(parsedUrl.protocol)) {
    return null;
  }

  if ((parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') && !parsedUrl.hostname) {
    return null;
  }

  if ((parsedUrl.protocol === 'mailto:' || parsedUrl.protocol === 'tel:') && !parsedUrl.pathname) {
    return null;
  }

  return parsedUrl.toString();
}

export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getSafeEmbedSrc(value: string | null): string | null {
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
  if (!ALLOWED_EMBED_PROTOCOLS.has(parsedUrl.protocol) || !isAllowedEmbedHost(hostname)) {
    return null;
  }

  return parsedUrl.toString();
}
