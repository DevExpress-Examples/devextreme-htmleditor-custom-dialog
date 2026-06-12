import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DxHtmlEditorModule } from 'devextreme-angular/ui/html-editor';
import { InitializedEvent } from 'devextreme/ui/html_editor';
import {
  EmojiPopoverComponent,
  LinkDialogComponent,
  LinkDialogData,
  MarkupPopupComponent,
  VideoDialogComponent,
  VideoDialogData,
} from './components';
import { INITIAL_MARKUP } from './data';
import { BlobUrlRegistryService, setupClipboard, registerVideoBlots } from './helpers';

interface SelectionRange {
  index: number;
  length: number;
}

@Component({
  selector: 'app-root',
  imports: [
    DxHtmlEditorModule,
    EmojiPopoverComponent,
    LinkDialogComponent,
    MarkupPopupComponent,
    VideoDialogComponent,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  readonly headerAcceptedValues = [false, 1, 2, 3, 4, 5];

  constructor(private readonly blobRegistry: BlobUrlRegistryService) {}

  ngOnDestroy(): void {
    this.blobRegistry.revokeAll();
  }
  readonly initialMarkup = INITIAL_MARKUP;
  readonly customizeModules = setupClipboard;

  private editorInstance: any;

  emojiPopoverVisible = false;
  emojiTarget: Element | null = null;
  private emojiInsertIndex = 0;

  linkDialogVisible = false;
  linkDialogData: LinkDialogData = { index: 0, length: 0, selectedText: '', selectedFormats: {}, url: '' };

  videoDialogVisible = false;
  videoDialogData: VideoDialogData = { index: 0, length: 0, existingUrl: '' };

  markupPopupVisible = false;
  markupValue = INITIAL_MARKUP;

  readonly linkButtonOptions = {
    icon: 'link',
    hint: 'Insert Custom Link',
    stylingMode: 'text',
    onClick: () => this.openLinkDialog(),
  };

  readonly emojiButtonOptions = {
    text: '😀',
    hint: 'Insert Emoji',
    focusStateEnabled: false,
    stylingMode: 'text',
    onClick: (event: { element: Element }) => this.openEmojiPopover(event),
  };

  readonly videoButtonOptions = {
    icon: 'video',
    hint: 'Insert/Edit Video',
    stylingMode: 'text',
    onClick: () => this.openVideoDialog(),
  };

  readonly markupButtonOptions = {
    text: 'Display Markup',
    stylingMode: 'text',
    onClick: () => this.openMarkupPopup(),
  };

  onEditorInitialized(event: InitializedEvent): void {
    this.editorInstance = event.component;
    registerVideoBlots(this.editorInstance);
  }

  onEmojiInsert(char: string): void {
    if (!this.editorInstance) {
      return;
    }

    this.editorInstance.insertText(this.emojiInsertIndex, char, {});
    this.editorInstance.setSelection(this.emojiInsertIndex + char.length, 0);
    this.emojiPopoverVisible = false;
  }

  onLinkApply(event: { index: number; length: number; text: string; formats: Record<string, unknown> }): void {
    if (!this.editorInstance) {
      return;
    }

    if (event.length > 0) {
      this.editorInstance.delete(event.index, event.length);
    }

    this.editorInstance.insertText(event.index, event.text, event.formats);
    this.editorInstance.setSelection(event.index + event.text.length, 0);
  }

  onVideoApply(event: { index: number; length: number; embedType: string; url: string }): void {
    if (!this.editorInstance) {
      return;
    }

    if (event.length > 0) {
      this.editorInstance.delete(event.index, event.length);
    }

    this.editorInstance.insertEmbed(event.index, event.embedType, event.url);
    this.editorInstance.insertText(event.index + 1, '\n', {});
    this.editorInstance.setSelection(event.index + 2, 0);
  }

  private openEmojiPopover(event: { element: Element }): void {
    if (!this.editorInstance) {
      return;
    }

    this.emojiInsertIndex = this.getSelectionOrEnd().index;
    this.emojiTarget = event.element;
    this.emojiPopoverVisible = true;
  }

  private openLinkDialog(): void {
    if (!this.editorInstance) {
      return;
    }

    const { index, length } = this.getSelectionOrEnd();
    const selectedText = length > 0 ? this.editorInstance.getText(index, length) : '';
    const selectedFormats = length > 0 ? this.editorInstance.getFormat(index, length) : {};
    const url = typeof selectedFormats.link === 'string' ? selectedFormats.link : '';

    delete selectedFormats.link;

    this.linkDialogData = { index, length, selectedText, selectedFormats, url };
    this.linkDialogVisible = true;
  }

  private openVideoDialog(): void {
    if (!this.editorInstance) {
      return;
    }

    const { index, length } = this.getSelectionOrEnd();
    let existingUrl = '';

    if (length === 1) {
      const content = this.editorInstance.getQuillInstance().getContents(index, 1);
      const insertObj = content?.ops?.[0]?.insert;
      existingUrl = insertObj?.video ?? insertObj?.nativeVideo ?? '';
    }

    this.videoDialogData = { index, length, existingUrl };
    this.videoDialogVisible = true;
  }

  private openMarkupPopup(): void {
    if (!this.editorInstance) {
      return;
    }

    this.markupValue = this.editorInstance.option('value') ?? INITIAL_MARKUP;
    this.markupPopupVisible = true;
  }

  private getSelectionOrEnd(): SelectionRange {
    const selection = this.editorInstance?.getSelection();
    return {
      index: selection?.index ?? this.editorInstance?.getLength() ?? 0,
      length: selection?.length ?? 0,
    };
  }
}
