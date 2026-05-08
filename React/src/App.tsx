import { useCallback, useMemo, useState } from 'react';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import HtmlEditor, { Item, Toolbar } from 'devextreme-react/html-editor';
import { setupClipboard } from './helpers/clipboardMatchers';
import { INITIAL_MARKUP } from './data/markup';
import { useHtmlEditorInitializer } from './hooks/useEditorSetup';
import { useEmojiPopover } from './hooks/useEmojiPopover';
import { useLinkDialog } from './hooks/useLinkDialog';
import { useVideoDialog } from './hooks/useVideoDialog';
import {
  EmojiPopover, LinkDialog, MarkupPopup, VideoDialog,
} from './components';

const HEADER_VALUES = [false, 1, 2, 3, 4, 5] as (boolean | number)[];
const HEADER_OPTIONS = { inputAttr: { 'aria-label': 'Header' } } as const;

function App(): JSX.Element {
  const [markupValue, setMarkupValue] = useState(INITIAL_MARKUP);
  const [isMarkupVisible, setIsMarkupVisible] = useState(false);

  const { editorRef, handleEditorInitialized, getSelectionOrEnd } = useHtmlEditorInitializer();
  const emojiPopover = useEmojiPopover(editorRef, getSelectionOrEnd);
  const linkDialog = useLinkDialog(editorRef, getSelectionOrEnd);
  const videoDialog = useVideoDialog(editorRef, getSelectionOrEnd);

  const openMarkupPopup = useCallback(() => {
    const currentEditorValue = editorRef.current?.instance().option('value');
    const nextMarkupValue = typeof currentEditorValue === 'string'
      ? currentEditorValue
      : INITIAL_MARKUP;

    setMarkupValue(nextMarkupValue);
    setIsMarkupVisible(true);
  }, [editorRef]);
  const closeMarkupPopup = useCallback(() => setIsMarkupVisible(false), []);

  const linkButtonOptions = useMemo(() => ({
    hint: 'Insert Custom Link',
    icon: 'link',
    onClick: linkDialog.show,
    stylingMode: 'text' as const,
  }), [linkDialog.show]);

  const emojiButtonOptions = useMemo(() => ({
    focusStateEnabled: false,
    hint: 'Insert Emoji',
    onClick: emojiPopover.show,
    stylingMode: 'text' as const,
    text: '😀',
  }), [emojiPopover.show]);

  const videoButtonOptions = useMemo(() => ({
    hint: 'Insert/Edit Video',
    icon: 'video',
    onClick: videoDialog.show,
    stylingMode: 'text' as const,
  }), [videoDialog.show]);

  const markupButtonOptions = useMemo(() => ({
    onClick: openMarkupPopup,
    stylingMode: 'text' as const,
    text: 'Display Markup',
  }), [openMarkupPopup]);

  return (
    <div className="demo-container">
      <HtmlEditor
        ref={editorRef}
        height={500}
        defaultValue={INITIAL_MARKUP}
        onInitialized={handleEditorInitialized}
        customizeModules={setupClipboard}
      >
        <Toolbar>
          <Item name="undo" />
          <Item name="redo" />
          <Item name="separator" />
          <Item name="header" acceptedValues={HEADER_VALUES} options={HEADER_OPTIONS} />
          <Item name="separator" />
          <Item name="bold" />
          <Item name="italic" />
          <Item name="strike" />
          <Item name="underline" />
          <Item name="separator" />
          <Item name="alignLeft" />
          <Item name="alignCenter" />
          <Item name="alignRight" />
          <Item name="alignJustify" />
          <Item name="separator" />
          <Item widget="dxButton" options={linkButtonOptions} />
          <Item widget="dxButton" options={emojiButtonOptions} />
          <Item widget="dxButton" options={videoButtonOptions} />
          <Item widget="dxButton" options={markupButtonOptions} />
        </Toolbar>
      </HtmlEditor>

      <EmojiPopover
        isVisible={emojiPopover.isVisible}
        target={emojiPopover.target}
        searchTerm={emojiPopover.searchTerm}
        filteredEmoji={emojiPopover.filteredEmoji}
        onHide={emojiPopover.hide}
        onSearchChange={emojiPopover.setSearch}
        onEmojiInsert={emojiPopover.insertEmoji}
      />

      <LinkDialog
        isVisible={linkDialog.state.isVisible}
        url={linkDialog.state.url}
        onHide={linkDialog.hide}
        onUrlChange={linkDialog.setUrl}
        onApply={linkDialog.apply}
        onLinkEditorInitialized={linkDialog.handleLinkEditorInitialized}
      />

      <VideoDialog
        isVisible={videoDialog.state.isVisible}
        mode={videoDialog.state.mode}
        url={videoDialog.state.url}
        videoFile={videoDialog.videoFile}
        onHide={videoDialog.hide}
        onUrlChange={videoDialog.setUrl}
        onFileChange={videoDialog.handleFileChange}
        onApply={videoDialog.apply}
      />

      <MarkupPopup
        isVisible={isMarkupVisible}
        value={markupValue}
        onHide={closeMarkupPopup}
      />
    </div>
  );
}

export default App;
