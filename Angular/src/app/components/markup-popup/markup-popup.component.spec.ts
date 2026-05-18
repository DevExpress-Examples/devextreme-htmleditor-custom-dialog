import { MarkupPopupComponent } from './markup-popup.component';

describe('MarkupPopupComponent', () => {
  let component: MarkupPopupComponent;

  beforeEach(() => {
    component = new MarkupPopupComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.visible).toBeFalse();
    expect(component.value).toBe('');
  });

  describe('onHiding', () => {
    it('should emit visibleChange false', () => {
      spyOn(component.visibleChange, 'emit');
      component.onHiding();
      expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    });
  });
});
