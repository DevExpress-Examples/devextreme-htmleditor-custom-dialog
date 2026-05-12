import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxFileUploaderModule } from 'devextreme-angular/ui/file-uploader';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';

const DIRECT_VIDEO_PATTERN = /\.(mp4|webm|ogg)$/i;

export interface VideoDialogData {
  index: number;
  length: number;
  existingUrl: string;
}

@Component({
  selector: 'app-video-dialog',
  imports: [DxButtonModule, DxFileUploaderModule, DxPopupModule, DxTextBoxModule],
  templateUrl: './video-dialog.component.html',
  styleUrls: ['./video-dialog.component.scss'],
})
export class VideoDialogComponent implements OnDestroy {
  @Input() visible = false;
  @Input() data: VideoDialogData = { index: 0, length: 0, existingUrl: '' };

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() videoApply = new EventEmitter<{ index: number; length: number; embedType: string; url: string }>();

  url = '';
  fileValue: File[] = [];
  popupTitle = 'Insert Video';
  applyText = 'Insert';

  private finalUrl = '';
  private createdBlobUrl: string | null = null;

  ngOnDestroy(): void {
    this.revokeBlob();
  }

  onShown(): void {
    this.url = this.data.existingUrl;
    this.finalUrl = this.data.existingUrl;
    this.fileValue = [];
    this.popupTitle = this.data.existingUrl ? 'Edit Video' : 'Insert Video';
    this.applyText = this.data.existingUrl ? 'Apply Changes' : 'Insert';
  }

  onHiding(): void {
    this.url = '';
    this.fileValue = [];
    this.finalUrl = '';
    this.revokeBlob();
    this.visibleChange.emit(false);
  }

  onUrlChanged(event: { value?: string }): void {
    const nextUrl = event.value ?? '';
    this.url = nextUrl;

    if (!nextUrl) {
      if (!this.fileValue.length) {
        this.finalUrl = '';
      }
      return;
    }

    this.revokeBlob();
    this.fileValue = [];
    this.finalUrl = nextUrl;
  }

  onFileChanged(event: { value?: File[] }): void {
    const file = event.value?.[0];

    if (!file) {
      if (!this.url) {
        this.finalUrl = '';
      }
      return;
    }

    this.revokeBlob();
    this.createdBlobUrl = URL.createObjectURL(file);
    this.finalUrl = this.createdBlobUrl;
    this.url = '';
    this.fileValue = [file];
  }

  apply(): void {
    if (!this.finalUrl) {
      return;
    }

    const isLocalBlob = this.finalUrl.startsWith('blob:');
    const videoPath = this.finalUrl.split(/[?#]/, 1)[0];
    const isDirectVideo = DIRECT_VIDEO_PATTERN.test(videoPath);
    const embedType = isLocalBlob || isDirectVideo ? 'nativeVideo' : 'video';

    this.videoApply.emit({
      index: this.data.index,
      length: this.data.length,
      embedType,
      url: this.finalUrl,
    });

    if (!isLocalBlob) {
      this.revokeBlob();
    } else {
      this.createdBlobUrl = null;
    }

    this.url = '';
    this.fileValue = [];
    this.finalUrl = '';
    this.visibleChange.emit(false);
  }

  private revokeBlob(): void {
    if (this.createdBlobUrl) {
      URL.revokeObjectURL(this.createdBlobUrl);
      this.createdBlobUrl = null;
    }
  }
}
