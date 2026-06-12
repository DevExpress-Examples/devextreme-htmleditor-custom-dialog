import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { DxPopupModule } from 'devextreme-angular/ui/popup';

@Component({
  selector: 'app-markup-popup',
  imports: [DxPopupModule],
  templateUrl: './markup-popup.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./markup-popup.component.scss'],
})
export class MarkupPopupComponent {
  @Input() visible = false;
  @Input() value = '';

  @Output() visibleChange = new EventEmitter<boolean>();

  onHiding(): void {
    this.visibleChange.emit(false);
  }
}
