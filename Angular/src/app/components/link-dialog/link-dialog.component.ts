import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxHtmlEditorModule, type DxHtmlEditorTypes } from 'devextreme-angular/ui/html-editor';
import type dxHtmlEditor from 'devextreme/ui/html_editor';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { normalizeAndValidateLinkUrl } from '../../helpers';
import { LinkDialogData } from './link-dialog.types';

@Component({
  selector: 'app-link-dialog',
  imports: [DxButtonModule, DxHtmlEditorModule, DxPopupModule, DxTextBoxModule],
  templateUrl: './link-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./link-dialog.component.scss'],
})
export class LinkDialogComponent {
  @Input() visible = false;
  @Input() data: LinkDialogData = { index: 0, length: 0, selectedText: '', selectedFormats: {}, url: '' };

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() linkApply = new EventEmitter<{ index: number; length: number; text: string; formats: Record<string, unknown> }>();

  url = '';

  private textEditorInstance: dxHtmlEditor | null = null;

  onUrlChanged(event: { value?: string }): void {
    this.url = event.value ?? '';
  }

  onTextEditorInitialized(event: DxHtmlEditorTypes.InitializedEvent): void {
    this.textEditorInstance = event.component || null;
  }

  onShown(): void {
    this.url = this.data.url;
    this.seedTextEditor();
  }

  onHiding(): void {
    this.visibleChange.emit(false);
  }

  apply(): void {
    if (!this.textEditorInstance || !this.url) {
      return;
    }

    const normalizedUrl = normalizeAndValidateLinkUrl(this.url);
    if (!normalizedUrl) {
      return;
    }

    this.url = normalizedUrl;

    const rawText = this.textEditorInstance
      .getText(0, this.textEditorInstance.getLength())
      .replace(/\n$/, '');
    const text = rawText || normalizedUrl;
    const textLength = Math.max(this.textEditorInstance.getLength() - 1, 0);
    const appliedFormats = textLength > 0
      ? this.textEditorInstance.getFormat(0, textLength)
      : {};
    const formats = { ...appliedFormats, link: normalizedUrl };

    this.linkApply.emit({ index: this.data.index, length: this.data.length, text, formats });
    this.visibleChange.emit(false);
  }

  private seedTextEditor(): void {
    if (!this.textEditorInstance) {
      return;
    }

    this.textEditorInstance.option('value', '');

    if (this.data.selectedText) {
      this.textEditorInstance.insertText(0, this.data.selectedText, this.data.selectedFormats);
    }
  }
}
