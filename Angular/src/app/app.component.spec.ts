import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should define header accepted values', () => {
    expect(app.headerAcceptedValues).toEqual([false, 1, 2, 3, 4, 5]);
  });

  it('should have initial markup value', () => {
    expect(app.initialMarkup).toBeTruthy();
    expect(typeof app.initialMarkup).toBe('string');
  });

  it('should initialize dialog visibility to false', () => {
    expect(app.emojiPopoverVisible).toBeFalse();
    expect(app.linkDialogVisible).toBeFalse();
    expect(app.videoDialogVisible).toBeFalse();
    expect(app.markupPopupVisible).toBeFalse();
  });

  it('should render the HtmlEditor host element', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('dx-html-editor')).not.toBeNull();
  });

  describe('onEditorInitialized', () => {
    it('should store editor instance', () => {
      const mockEditor = { register: jasmine.createSpy(), get: jasmine.createSpy().and.returnValue(null) };
      app.onEditorInitialized({ component: mockEditor } as any);
      // Editor instance is private, but we can verify via behavior
      expect(mockEditor.get).toHaveBeenCalled();
    });
  });

  describe('onEmojiInsert', () => {
    it('should do nothing when editor is not initialized', () => {
      expect(() => app.onEmojiInsert('😀')).not.toThrow();
    });

    it('should insert emoji and close popover', () => {
      const mockEditor = {
        insertText: jasmine.createSpy(),
        setSelection: jasmine.createSpy(),
        get: jasmine.createSpy().and.returnValue(null),
        register: jasmine.createSpy(),
      };
      app.onEditorInitialized({ component: mockEditor } as any);

      app.onEmojiInsert('😀');

      expect(mockEditor.insertText).toHaveBeenCalled();
      expect(mockEditor.setSelection).toHaveBeenCalled();
      expect(app.emojiPopoverVisible).toBeFalse();
    });
  });

  describe('onLinkApply', () => {
    it('should do nothing when editor is not initialized', () => {
      expect(() => app.onLinkApply({ index: 0, length: 0, text: 'test', formats: {} })).not.toThrow();
    });

    it('should insert text with formats', () => {
      const mockEditor = {
        insertText: jasmine.createSpy(),
        setSelection: jasmine.createSpy(),
        delete: jasmine.createSpy(),
        get: jasmine.createSpy().and.returnValue(null),
        register: jasmine.createSpy(),
      };
      app.onEditorInitialized({ component: mockEditor } as any);

      app.onLinkApply({ index: 5, length: 3, text: 'new link', formats: { link: 'https://example.com' } });

      expect(mockEditor.delete).toHaveBeenCalledWith(5, 3);
      expect(mockEditor.insertText).toHaveBeenCalledWith(5, 'new link', { link: 'https://example.com' });
      expect(mockEditor.setSelection).toHaveBeenCalledWith(13, 0);
    });

    it('should not delete when length is 0', () => {
      const mockEditor = {
        insertText: jasmine.createSpy(),
        setSelection: jasmine.createSpy(),
        delete: jasmine.createSpy(),
        get: jasmine.createSpy().and.returnValue(null),
        register: jasmine.createSpy(),
      };
      app.onEditorInitialized({ component: mockEditor } as any);

      app.onLinkApply({ index: 0, length: 0, text: 'text', formats: {} });

      expect(mockEditor.delete).not.toHaveBeenCalled();
    });
  });

  describe('onVideoApply', () => {
    it('should do nothing when editor is not initialized', () => {
      expect(() => app.onVideoApply({ index: 0, length: 0, embedType: 'video', url: '' })).not.toThrow();
    });

    it('should insert embed and newline', () => {
      const mockEditor = {
        insertEmbed: jasmine.createSpy(),
        insertText: jasmine.createSpy(),
        setSelection: jasmine.createSpy(),
        delete: jasmine.createSpy(),
        get: jasmine.createSpy().and.returnValue(null),
        register: jasmine.createSpy(),
      };
      app.onEditorInitialized({ component: mockEditor } as any);

      app.onVideoApply({ index: 10, length: 1, embedType: 'video', url: 'https://youtube.com/embed/abc' });

      expect(mockEditor.delete).toHaveBeenCalledWith(10, 1);
      expect(mockEditor.insertEmbed).toHaveBeenCalledWith(10, 'video', 'https://youtube.com/embed/abc');
      expect(mockEditor.insertText).toHaveBeenCalledWith(11, '\n', {});
      expect(mockEditor.setSelection).toHaveBeenCalledWith(12, 0);
    });
  });
});
