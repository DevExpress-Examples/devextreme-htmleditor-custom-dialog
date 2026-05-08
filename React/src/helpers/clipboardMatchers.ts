type DeltaOp = { insert: string | Record<string, string> };
type ClipboardDelta = { ops: DeltaOp[] };

export type ClipboardMatcher = [string, (node: HTMLElement, delta: ClipboardDelta) => ClipboardDelta];

export type ClipboardConfig = {
  clipboard?: { matchers?: ClipboardMatcher[] };
};

const VIDEO_EMBED_PATTERN = /youtu[.]?be|youtube\.com|vimeo\.com/i;
const DIRECT_VIDEO_PATTERN = /\.(mp4|webm|ogg)$/i;

function matchAnchorNode(node: HTMLElement, delta: ClipboardDelta): ClipboardDelta {
  const anchor = node as HTMLAnchorElement;
  const url = anchor.href;

  if (VIDEO_EMBED_PATTERN.test(anchor.hostname)) {
    delta.ops = [{ insert: { video: url } }, { insert: '\n' }];
  } else if (DIRECT_VIDEO_PATTERN.test(url)) {
    delta.ops = [{ insert: { nativeVideo: url } }, { insert: '\n' }];
  }

  return delta;
}

function matchIframeNode(node: HTMLElement, delta: ClipboardDelta): ClipboardDelta {
  delta.ops = [{ insert: { video: (node as HTMLIFrameElement).src } }, { insert: '\n' }];
  return delta;
}

function matchVideoNode(node: HTMLElement, delta: ClipboardDelta): ClipboardDelta {
  delta.ops = [{ insert: { nativeVideo: (node as HTMLVideoElement).src } }, { insert: '\n' }];
  return delta;
}

export function setupClipboard(config: ClipboardConfig): void {
  if (!config.clipboard) {
    return;
  }

  const matchers: ClipboardMatcher[] = config.clipboard.matchers ?? [];
  matchers.push(['a', matchAnchorNode]);
  matchers.push(['iframe', matchIframeNode]);
  matchers.push(['video', matchVideoNode]);
  config.clipboard.matchers = matchers;
}
