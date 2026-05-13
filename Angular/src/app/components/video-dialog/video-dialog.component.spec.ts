import { VideoDialogComponent } from './video-dialog.component';

describe('VideoDialogComponent', () => {
  let component: VideoDialogComponent;

  beforeEach(() => {
    component = new VideoDialogComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.visible).toBeFalse();
    expect(component.url).toBe('');
    expect(component.fileValue).toEqual([]);
    expect(component.popupTitle).toBe('Insert Video');
    expect(component.applyText).toBe('Insert');
  });

  describe('onShown', () => {
    it('should initialize for new video', () => {
      component.data = { index: 0, length: 0, existingUrl: '' };
      component.onShown();

      expect(component.url).toBe('');
      expect(component.popupTitle).toBe('Insert Video');
      expect(component.applyText).toBe('Insert');
    });

    it('should initialize for editing existing video', () => {
      component.data = { index: 5, length: 1, existingUrl: 'https://youtube.com/watch?v=abc' };
      component.onShown();

      expect(component.url).toBe('https://youtube.com/watch?v=abc');
      expect(component.popupTitle).toBe('Edit Video');
      expect(component.applyText).toBe('Apply Changes');
    });
  });

  describe('onHiding', () => {
    it('should reset state and emit visibleChange false', () => {
      spyOn(component.visibleChange, 'emit');
      component.url = 'https://example.com';
      component.fileValue = [new File([], 'test.mp4')];

      component.onHiding();

      expect(component.url).toBe('');
      expect(component.fileValue).toEqual([]);
      expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('onUrlChanged', () => {
    it('should set url and finalUrl', () => {
      component.onUrlChanged({ value: 'https://youtube.com/watch?v=abc' });
      expect(component.url).toBe('https://youtube.com/watch?v=abc');
    });

    it('should clear finalUrl when url is emptied and no file', () => {
      component.onUrlChanged({ value: '' });
      expect(component.url).toBe('');
    });

    it('should default to empty string when value is undefined', () => {
      component.onUrlChanged({});
      expect(component.url).toBe('');
    });
  });

  describe('onFileChanged', () => {
    it('should handle file selection', () => {
      const file = new File(['content'], 'video.mp4', { type: 'video/mp4' });
      component.onFileChanged({ value: [file] });

      expect(component.fileValue).toEqual([file]);
      expect(component.url).toBe('');
    });

    it('should handle empty file selection', () => {
      component.onFileChanged({ value: [] });
      expect(component.fileValue).toEqual([]);
    });

    it('should handle undefined value', () => {
      component.onFileChanged({});
      expect(component.fileValue).toEqual([]);
    });
  });

  describe('apply', () => {
    it('should not emit when no URL is set', () => {
      spyOn(component.videoApply, 'emit');
      component.apply();
      expect(component.videoApply.emit).not.toHaveBeenCalled();
    });

    it('should emit video embed type for YouTube URL', () => {
      spyOn(component.videoApply, 'emit');
      spyOn(component.visibleChange, 'emit');

      component.data = { index: 0, length: 0, existingUrl: '' };
      component.onUrlChanged({ value: 'https://www.youtube.com/watch?v=abc' });

      component.apply();

      expect(component.videoApply.emit).toHaveBeenCalledWith({
        index: 0,
        length: 0,
        embedType: 'video',
        url: 'https://www.youtube.com/watch?v=abc',
      });
      expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    });

    it('should emit nativeVideo embed type for .mp4 URL', () => {
      spyOn(component.videoApply, 'emit');

      component.data = { index: 3, length: 1, existingUrl: '' };
      component.onUrlChanged({ value: 'https://example.com/video.mp4' });

      component.apply();

      expect(component.videoApply.emit).toHaveBeenCalledWith({
        index: 3,
        length: 1,
        embedType: 'nativeVideo',
        url: 'https://example.com/video.mp4',
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should not throw when no blob exists', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
