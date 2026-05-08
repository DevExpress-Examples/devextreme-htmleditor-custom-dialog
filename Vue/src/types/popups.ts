export interface LinkPopupComponent {
  show(cursorIndex: number, length: number): void;
}

export interface EmojiPopupComponent {
  show(cursorIndex: number, targetElement: HTMLElement): void;
}

export interface VideoPopupComponent {
  show(cursorIndex: number, length?: number): void;
}

export interface MarkupPopupComponent {
  show(): void;
}
