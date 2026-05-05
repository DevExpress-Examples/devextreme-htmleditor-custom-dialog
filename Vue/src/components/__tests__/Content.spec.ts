import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import EmojiPopup from '../EmojiPopup.vue';
import VideoPopup from '../VideoPopup.vue';
import LinkPopup from '../LinkPopup.vue';
import MarkupPopup from '../MarkupPopup.vue';
import HomeContent from '../HomeContent.vue';
import { EMOJI_LIST } from '../../data/emojiList';

function createMockEditor() {
  return {
    insertText: vi.fn(),
    insertEmbed: vi.fn(),
    setSelection: vi.fn(),
    getSelection: vi.fn(() => ({ index: 5, length: 0 })),
    getLength: vi.fn(() => 10),
    getText: vi.fn(() => 'hello'),
    getFormat: vi.fn(() => ({})),
    delete: vi.fn(),
    getQuillInstance: vi.fn((): any => ({
      getContents: vi.fn(() => ({ ops: [{ insert: 'text' }] })),
    })),
    option: vi.fn((key: string) => {
      if (key === 'value') return '<p>Test markup</p>';
      return null;
    }),
  };
}

describe('HomeContent', () => {
  it('renders the demo container', () => {
    const wrapper = shallowMount(HomeContent);
    expect(wrapper.find('.demo-container').exists()).toBe(true);
  });

  it('renders all popup components', () => {
    const wrapper = shallowMount(HomeContent);
    expect(wrapper.findComponent(EmojiPopup).exists()).toBe(true);
    expect(wrapper.findComponent(VideoPopup).exists()).toBe(true);
    expect(wrapper.findComponent(LinkPopup).exists()).toBe(true);
    expect(wrapper.findComponent(MarkupPopup).exists()).toBe(true);
  });
});

describe('EmojiPopup', () => {
  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    editor = createMockEditor();
  });

  it('is hidden by default', () => {
    const wrapper = shallowMount(EmojiPopup, { props: { editor } });
    expect((wrapper.vm as any).visible).toBe(false);
  });

  it('show() sets visible and stores cursor index', () => {
    const wrapper = shallowMount(EmojiPopup, { props: { editor } });
    const targetEl = document.createElement('button');

    (wrapper.vm as any).show(7, targetEl);

    expect((wrapper.vm as any).visible).toBe(true);
    expect((wrapper.vm as any).insertIndex).toBe(7);
  });

  it('show() resets the search value', () => {
    const wrapper = shallowMount(EmojiPopup, { props: { editor } });
    (wrapper.vm as any).searchValue = 'fire';

    (wrapper.vm as any).show(0, document.createElement('button'));

    expect((wrapper.vm as any).searchValue).toBe('');
  });

  it('filteredEmojis returns all emojis when search is empty', () => {
    const wrapper = shallowMount(EmojiPopup, { props: { editor } });
    expect((wrapper.vm as any).filteredEmojis).toHaveLength(EMOJI_LIST.length);
  });

  it('filteredEmojis filters by search term', () => {
    const wrapper = shallowMount(EmojiPopup, { props: { editor } });
    (wrapper.vm as any).searchValue = 'fire';
    expect((wrapper.vm as any).filteredEmojis).toHaveLength(1);
    expect((wrapper.vm as any).filteredEmojis[0].char).toBe('🔥');
  });

  it('insertEmoji calls editor.insertText and setSelection', () => {
    const wrapper = shallowMount(EmojiPopup, { props: { editor } });
    (wrapper.vm as any).show(3, document.createElement('button'));

    (wrapper.vm as any).insertEmoji({ char: '🚀', terms: 'rocket' });

    expect(editor.insertText).toHaveBeenCalledWith(3, '🚀');
    expect(editor.setSelection).toHaveBeenCalledWith(3 + '🚀'.length, 0);
    expect((wrapper.vm as any).visible).toBe(false);
  });
});

describe('VideoPopup', () => {
  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    editor = createMockEditor();
  });

  it('is hidden by default', () => {
    const wrapper = shallowMount(VideoPopup, { props: { editor } });
    expect((wrapper.vm as any).visible).toBe(false);
  });

  it('show() opens in insert mode', () => {
    const wrapper = shallowMount(VideoPopup, { props: { editor } });

    (wrapper.vm as any).show(5, 0);

    expect((wrapper.vm as any).visible).toBe(true);
    expect((wrapper.vm as any).insertIndex).toBe(5);
    expect((wrapper.vm as any).selectionLength).toBe(0);
  });

  it('applyVideo does nothing when finalVideoUrl is empty', () => {
    const wrapper = shallowMount(VideoPopup, { props: { editor } });

    (wrapper.vm as any).show(0, 0);
    (wrapper.vm as any).applyVideo();

    expect(editor.insertEmbed).not.toHaveBeenCalled();
  });

  it('applyVideo inserts video embed for URLs', () => {
    const wrapper = shallowMount(VideoPopup, { props: { editor } });

    (wrapper.vm as any).show(3, 0);
    (wrapper.vm as any).onUrlChanged({ value: 'https://youtube.com/embed/test' });
    (wrapper.vm as any).applyVideo();

    expect(editor.insertEmbed).toHaveBeenCalledWith(3, 'video', 'https://youtube.com/embed/test');
    expect(editor.insertText).toHaveBeenCalledWith(4, '\n');
    expect(editor.setSelection).toHaveBeenCalledWith(5, 0);
    expect((wrapper.vm as any).visible).toBe(false);
  });

  it('applyVideo deletes existing selection before inserting', () => {
    const wrapper = shallowMount(VideoPopup, { props: { editor } });

    (wrapper.vm as any).show(2, 3);
    (wrapper.vm as any).onUrlChanged({ value: 'https://vimeo.com/123' });
    (wrapper.vm as any).applyVideo();

    expect(editor.delete).toHaveBeenCalledWith(2, 3);
    expect(editor.insertEmbed).toHaveBeenCalled();
  });

  it('setupClipboard adds clipboard matchers', () => {
    const wrapper = shallowMount(VideoPopup, { props: { editor } });
    const config = { clipboard: { matchers: [] as any[] } };

    (wrapper.vm as any).setupClipboard(config);

    expect(config.clipboard.matchers).toHaveLength(3);
  });

  it('clipboard matcher for anchor detects youtube links', () => {
    const wrapper = shallowMount(VideoPopup, { props: { editor } });
    const config = { clipboard: { matchers: [] as any[] } };

    (wrapper.vm as any).setupClipboard(config);

    const [, anchorHandler] = config.clipboard.matchers[0];
    const node = { href: 'https://www.youtube.com/watch?v=abc', hostname: 'www.youtube.com' };
    const delta = { ops: [] as any[] };

    const result = anchorHandler(node, delta);
    expect(result.ops[0].insert).toEqual({ video: 'https://www.youtube.com/watch?v=abc' });
  });

  it('clipboard matcher for anchor detects direct video files', () => {
    const wrapper = shallowMount(VideoPopup, { props: { editor } });
    const config = { clipboard: { matchers: [] as any[] } };

    (wrapper.vm as any).setupClipboard(config);

    const [, anchorHandler] = config.clipboard.matchers[0];
    const node = { href: 'https://example.com/video.mp4', hostname: 'example.com' };
    const delta = { ops: [] as any[] };

    const result = anchorHandler(node, delta);
    expect(result.ops[0].insert).toEqual({ nativeVideo: 'https://example.com/video.mp4' });
  });
});

describe('LinkPopup', () => {
  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    editor = createMockEditor();
  });

  it('is hidden by default', () => {
    const wrapper = shallowMount(LinkPopup, { props: { editor } });
    expect((wrapper.vm as any).visible).toBe(false);
  });

  it('show() sets insert index and selection length', () => {
    const wrapper = shallowMount(LinkPopup, { props: { editor } });

    (wrapper.vm as any).show(4, 3);

    expect((wrapper.vm as any).visible).toBe(true);
    expect((wrapper.vm as any).insertIndex).toBe(4);
    expect((wrapper.vm as any).selectionLength).toBe(3);
  });

  it('show() loads existing link URL from selection formats', () => {
    editor.getFormat.mockReturnValue({ link: 'https://example.com', bold: true });

    const wrapper = shallowMount(LinkPopup, { props: { editor } });

    (wrapper.vm as any).show(0, 5);

    expect((wrapper.vm as any).urlValue).toBe('https://example.com');
  });

  it('show() resets URL when no link in selection', () => {
    editor.getFormat.mockReturnValue({ bold: true });

    const wrapper = shallowMount(LinkPopup, { props: { editor } });
    (wrapper.vm as any).urlValue = 'old-url';

    (wrapper.vm as any).show(0, 0);

    expect((wrapper.vm as any).urlValue).toBe('');
  });
});

describe('MarkupPopup', () => {
  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    editor = createMockEditor();
  });

  it('is hidden by default', () => {
    const wrapper = shallowMount(MarkupPopup, { props: { editor } });
    expect((wrapper.vm as any).visible).toBe(false);
  });

  it('show() reads markup from editor and sets visible', () => {
    const wrapper = shallowMount(MarkupPopup, { props: { editor } });

    (wrapper.vm as any).show();

    expect((wrapper.vm as any).visible).toBe(true);
    expect((wrapper.vm as any).markupContent).toBe('<p>Test markup</p>');
    expect(editor.option).toHaveBeenCalledWith('value');
  });

  it('show() handles null editor gracefully', () => {
    const wrapper = shallowMount(MarkupPopup, { props: { editor: null } });

    (wrapper.vm as any).show();

    expect((wrapper.vm as any).visible).toBe(true);
    expect((wrapper.vm as any).markupContent).toBe('');
  });
});
