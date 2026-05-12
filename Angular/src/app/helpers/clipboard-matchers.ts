const DIRECT_VIDEO_PATTERN = /\.(mp4|webm|ogg)$/i;

type DeltaOp = { insert: string | Record<string, string> };
type ClipboardDelta = { ops: DeltaOp[] };

function matchAnchorNode(node: HTMLAnchorElement, delta: ClipboardDelta): ClipboardDelta {
  const url = node.href;
  const isEmbedVideo = /youtu[.]?be|youtube\.com|vimeo\.com/i.test(node.hostname);
  const isDirectVideo = DIRECT_VIDEO_PATTERN.test(url.split(/[?#]/, 1)[0]);

  if (isEmbedVideo) {
    delta.ops = [{ insert: { video: url } }, { insert: '\n' }];
  } else if (isDirectVideo) {
    delta.ops = [{ insert: { nativeVideo: url } }, { insert: '\n' }];
  }

  return delta;
}

function matchIframeNode(node: HTMLIFrameElement, delta: ClipboardDelta): ClipboardDelta {
  delta.ops = [{ insert: { video: node.src } }, { insert: '\n' }];
  return delta;
}

function matchVideoNode(node: HTMLVideoElement, delta: ClipboardDelta): ClipboardDelta {
  delta.ops = [{ insert: { nativeVideo: node.src } }, { insert: '\n' }];
  return delta;
}

export function setupClipboard(config: any): void {
  const matchers = config.clipboard?.matchers ?? [];

  matchers.push(['a', matchAnchorNode]);
  matchers.push(['iframe', matchIframeNode]);
  matchers.push(['video', matchVideoNode]);

  if (config.clipboard) {
    config.clipboard.matchers = matchers;
  }
}
