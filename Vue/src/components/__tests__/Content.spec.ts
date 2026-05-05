import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import EmojiPopup from '../EmojiPopup.vue';
import VideoPopup from '../VideoPopup.vue';
import LinkPopup from '../LinkPopup.vue';
import MarkupPopup from '../MarkupPopup.vue';
import HomeContent from '../HomeContent.vue';
import { EMOJI_LIST } from '../../data/emojiList';
import { useEmojiPopup } from '../../composables/useEmojiPopup';
import { useVideoPopup, setupClipboard } from '../../composables/useVideoPopup';
import { useLinkPopup } from '../../composables/useLinkPopup';
import { useMarkupPopup } from '../../composables/useMarkupPopup';

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

describe('useEmojiPopup', () => {
  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    editor = createMockEditor();
  });

  it('starts with visible=false', () => {
    const { visible } = useEmojiPopup(() => editor);
    expect(visible.value).toBe(false);
  });

  it('show() sets visible and stores cursor index', () => {
    const { visible, insertIndex, show } = useEmojiPopup(() => editor);
    const targetEl = document.createElement('button');

    show(7, targetEl);

    expect(visible.value).toBe(true);
    expect(insertIndex.value).toBe(7);
  });

  it('show() resets the search value', () => {
    const { searchValue, show } = useEmojiPopup(() => editor);
    searchValue.value = 'fire';

    show(0, document.createElement('button'));

    expect(searchValue.value).toBe('');
  });

  it('filteredEmojis returns all emojis when search is empty', () => {
    const { filteredEmojis } = useEmojiPopup(() => editor);
    expect(filteredEmojis.value).toHaveLength(EMOJI_LIST.length);
  });

  it('filteredEmojis filters by search term', () => {
    const { filteredEmojis, searchValue } = useEmojiPopup(() => editor);
    searchValue.value = 'fire';
    expect(filteredEmojis.value).toHaveLength(1);
    expect(filteredEmojis.value[0].char).toBe('🔥');
  });

  it('insertEmoji calls editor.insertText and setSelection', () => {
    const { visible, show, insertEmoji } = useEmojiPopup(() => editor);
    show(3, document.createElement('button'));

    insertEmoji({ char: '🚀', terms: 'rocket' });

    expect(editor.insertText).toHaveBeenCalledWith(3, '🚀');
    expect(editor.setSelection).toHaveBeenCalledWith(3 + '🚀'.length, 0);
    expect(visible.value).toBe(false);
  });
});

describe('useVideoPopup', () => {
  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    editor = createMockEditor();
  });

  it('starts with visible=false', () => {
    const { visible } = useVideoPopup(() => editor);
    expect(visible.value).toBe(false);
  });

  it('show() opens and sets cursor position', () => {
    const { visible, insertIndex, selectionLength, show } = useVideoPopup(() => editor);

    show(5, 0);

    expect(visible.value).toBe(true);
    expect(insertIndex.value).toBe(5);
    expect(selectionLength.value).toBe(0);
  });

  it('applyVideo does nothing when no URL is set', () => {
    const { show, applyVideo } = useVideoPopup(() => editor);

    show(0, 0);
    applyVideo();

    expect(editor.insertEmbed).not.toHaveBeenCalled();
  });

  it('applyVideo inserts video embed for URLs', () => {
    const { visible, show, onUrlChanged, applyVideo } = useVideoPopup(() => editor);

    show(3, 0);
    onUrlChanged({ value: 'https://youtube.com/embed/test' });
    applyVideo();

    expect(editor.insertEmbed).toHaveBeenCalledWith(3, 'video', 'https://youtube.com/embed/test');
    expect(editor.insertText).toHaveBeenCalledWith(4, '\n');
    expect(editor.setSelection).toHaveBeenCalledWith(5, 0);
    expect(visible.value).toBe(false);
  });

  it('applyVideo deletes existing selection before inserting', () => {
    const { show, onUrlChanged, applyVideo } = useVideoPopup(() => editor);

    show(2, 3);
    onUrlChanged({ value: 'https://vimeo.com/123' });
    applyVideo();

    expect(editor.delete).toHaveBeenCalledWith(2, 3);
    expect(editor.insertEmbed).toHaveBeenCalled();
  });

  it('setupClipboard adds clipboard matchers', () => {
    const config = { clipboard: { matchers: [] as any[] } };

    setupClipboard(config);

    expect(config.clipboard.matchers).toHaveLength(3);
  });

  it('clipboard matcher for anchor detects youtube links', () => {
    const config = { clipboard: { matchers: [] as any[] } };

    setupClipboard(config);

    const [, anchorHandler] = config.clipboard.matchers[0];
    const node = { href: 'https://www.youtube.com/watch?v=abc', hostname: 'www.youtube.com' };
    const delta = { ops: [] as any[] };

    const result = anchorHandler(node, delta);
    expect(result.ops[0].insert).toEqual({ video: 'https://www.youtube.com/watch?v=abc' });
  });

  it('clipboard matcher for anchor detects direct video files', () => {
    const config = { clipboard: { matchers: [] as any[] } };

    setupClipboard(config);

    const [, anchorHandler] = config.clipboard.matchers[0];
    const node = { href: 'https://example.com/video.mp4', hostname: 'example.com' };
    const delta = { ops: [] as any[] };

    const result = anchorHandler(node, delta);
    expect(result.ops[0].insert).toEqual({ nativeVideo: 'https://example.com/video.mp4' });
  });
});

describe('useLinkPopup', () => {
  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    editor = createMockEditor();
  });

  it('starts with visible=false', () => {
    const { visible } = useLinkPopup(() => editor);
    expect(visible.value).toBe(false);
  });

  it('show() sets insert index and selection length', () => {
    const { visible, insertIndex, selectionLength, show } = useLinkPopup(() => editor);

    show(4, 3);

    expect(visible.value).toBe(true);
    expect(insertIndex.value).toBe(4);
    expect(selectionLength.value).toBe(3);
  });

  it('show() loads existing link URL from selection formats', () => {
    editor.getFormat.mockReturnValue({ link: 'https://example.com', bold: true });

    const { urlValue, show } = useLinkPopup(() => editor);

    show(0, 5);

    expect(urlValue.value).toBe('https://example.com');
  });

  it('show() resets URL when no link in selection', () => {
    editor.getFormat.mockReturnValue({ bold: true });

    const { urlValue, show } = useLinkPopup(() => editor);
    urlValue.value = 'old-url';

    show(0, 0);

    expect(urlValue.value).toBe('');
  });
});

describe('useMarkupPopup', () => {
  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    editor = createMockEditor();
  });

  it('starts with visible=false', () => {
    const { visible } = useMarkupPopup(() => editor);
    expect(visible.value).toBe(false);
  });

  it('show() reads markup from editor and sets visible', () => {
    const { visible, markupContent, show } = useMarkupPopup(() => editor);

    show();

    expect(visible.value).toBe(true);
    expect(markupContent.value).toBe('<p>Test markup</p>');
    expect(editor.option).toHaveBeenCalledWith('value');
  });

  it('show() handles null editor gracefully', () => {
    const { visible, markupContent, show } = useMarkupPopup(() => null);

    show();

    expect(visible.value).toBe(true);
    expect(markupContent.value).toBe('');
  });
});
