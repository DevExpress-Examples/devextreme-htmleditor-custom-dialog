import { LinkDialogComponent } from './link-dialog.component';

describe('LinkDialogComponent', () => {
  let component: LinkDialogComponent;

  beforeEach(() => {
    component = new LinkDialogComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.visible).toBeFalse();
    expect(component.url).toBe('');
    expect(component.data.index).toBe(0);
  });

  describe('onUrlChanged', () => {
    it('should update url from event value', () => {
      component.onUrlChanged({ value: 'https://example.com' });
      expect(component.url).toBe('https://example.com');
    });

    it('should default to empty string when value is undefined', () => {
      component.onUrlChanged({});
      expect(component.url).toBe('');
    });
  });

  describe('onHiding', () => {
    it('should emit visibleChange false', () => {
      spyOn(component.visibleChange, 'emit');
      component.onHiding();
      expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('apply', () => {
    it('should not emit when textEditorInstance is not set', () => {
      spyOn(component.linkApply, 'emit');
      component.url = 'https://example.com';
      component.apply();
      expect(component.linkApply.emit).not.toHaveBeenCalled();
    });

    it('should not emit when url is empty', () => {
      spyOn(component.linkApply, 'emit');
      component.url = '';
      component.apply();
      expect(component.linkApply.emit).not.toHaveBeenCalled();
    });

    it('should emit linkApply with correct data when valid', () => {
      spyOn(component.linkApply, 'emit');
      spyOn(component.visibleChange, 'emit');

      const mockEditor = {
        getText: jasmine.createSpy().and.returnValue('Link Text\n'),
        getLength: jasmine.createSpy().and.returnValue(10),
        getFormat: jasmine.createSpy().and.returnValue({ bold: true }),
      };

      component.onTextEditorInitialized({ component: mockEditor } as any);
      component.url = 'https://example.com';
      component.data = { index: 5, length: 3, selectedText: 'old', selectedFormats: {}, url: '' };

      component.apply();

      expect(component.linkApply.emit).toHaveBeenCalledWith({
        index: 5,
        length: 3,
        text: 'Link Text',
        formats: { bold: true, link: 'https://example.com/' },
      });
      expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    });

    it('should use normalized URL as text when editor text is empty', () => {
      spyOn(component.linkApply, 'emit');

      const mockEditor = {
        getText: jasmine.createSpy().and.returnValue('\n'),
        getLength: jasmine.createSpy().and.returnValue(1),
        getFormat: jasmine.createSpy().and.returnValue({}),
      };

      component.onTextEditorInitialized({ component: mockEditor } as any);
      component.url = 'https://example.com';
      component.data = { index: 0, length: 0, selectedText: '', selectedFormats: {}, url: '' };

      component.apply();

      expect(component.linkApply.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({ text: 'https://example.com/' })
      );
    });

    it('should not emit for invalid URL', () => {
      spyOn(component.linkApply, 'emit');

      const mockEditor = {
        getText: jasmine.createSpy().and.returnValue('text\n'),
        getLength: jasmine.createSpy().and.returnValue(5),
        getFormat: jasmine.createSpy().and.returnValue({}),
      };

      component.onTextEditorInitialized({ component: mockEditor } as any);
      component.url = 'javascript:alert(1)';
      component.data = { index: 0, length: 0, selectedText: '', selectedFormats: {}, url: '' };

      component.apply();

      expect(component.linkApply.emit).not.toHaveBeenCalled();
    });
  });

  describe('onShown', () => {
    it('should set url from data and seed text editor', () => {
      const mockEditor = {
        option: jasmine.createSpy(),
        insertText: jasmine.createSpy(),
      };

      component.onTextEditorInitialized({ component: mockEditor } as any);
      component.data = { index: 0, length: 5, selectedText: 'hello', selectedFormats: { bold: true }, url: 'https://example.com' };

      component.onShown();

      expect(component.url).toBe('https://example.com');
      expect(mockEditor.option).toHaveBeenCalledWith('value', '');
      expect(mockEditor.insertText).toHaveBeenCalledWith(0, 'hello', { bold: true });
    });
  });
});
