import { EmojiPopoverComponent } from './emoji-popover.component';

describe('EmojiPopoverComponent', () => {
  let component: EmojiPopoverComponent;

  beforeEach(() => {
    component = new EmojiPopoverComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.visible).toBeFalse();
    expect(component.target).toBeNull();
    expect(component.searchTerm).toBe('');
  });

  describe('filteredEmojis', () => {
    it('should return all emojis when search term is empty', () => {
      component.searchTerm = '';
      expect(component.filteredEmojis.length).toBeGreaterThan(0);
    });

    it('should filter emojis by search term', () => {
      component.searchTerm = 'happy';
      const results = component.filteredEmojis;
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(e => e.char === '😀')).toBeTrue();
    });

    it('should return empty array for non-matching term', () => {
      component.searchTerm = 'zzzznonexistent';
      expect(component.filteredEmojis.length).toBe(0);
    });

    it('should be case-insensitive', () => {
      component.searchTerm = 'HAPPY';
      expect(component.filteredEmojis.length).toBeGreaterThan(0);
    });
  });

  describe('onSearchChanged', () => {
    it('should update searchTerm', () => {
      component.onSearchChanged({ value: 'fire' });
      expect(component.searchTerm).toBe('fire');
    });

    it('should default to empty string when value is undefined', () => {
      component.onSearchChanged({});
      expect(component.searchTerm).toBe('');
    });
  });

  describe('onEmojiClick', () => {
    it('should emit emojiInsert event', () => {
      spyOn(component.emojiInsert, 'emit');
      component.onEmojiClick('😀');
      expect(component.emojiInsert.emit).toHaveBeenCalledWith('😀');
    });
  });

  describe('onHiding', () => {
    it('should reset searchTerm and emit visibleChange false', () => {
      component.searchTerm = 'test';
      spyOn(component.visibleChange, 'emit');

      component.onHiding();

      expect(component.searchTerm).toBe('');
      expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    });
  });
});
