import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DxPopoverModule } from 'devextreme-angular/ui/popover';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { EMOJI_LIST, EmojiItem } from '../../data';

@Component({
  selector: 'app-emoji-popover',
  imports: [DxPopoverModule, DxTextBoxModule],
  templateUrl: './emoji-popover.component.html',
  styleUrls: ['./emoji-popover.component.scss'],
})
export class EmojiPopoverComponent {
  @Input() visible = false;
  @Input() target: Element | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() emojiInsert = new EventEmitter<string>();

  searchTerm = '';

  get filteredEmojis(): readonly EmojiItem[] {
    const term = this.searchTerm.toLowerCase().trim();
    return EMOJI_LIST.filter((emoji) => emoji.terms.includes(term));
  }

  onSearchChanged(event: { value?: string }): void {
    this.searchTerm = event.value ?? '';
  }

  onEmojiClick(char: string): void {
    this.emojiInsert.emit(char);
  }

  onHiding(): void {
    this.searchTerm = '';
    this.visibleChange.emit(false);
  }
}
