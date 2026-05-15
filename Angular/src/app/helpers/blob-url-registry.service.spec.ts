import { BlobUrlRegistryService } from './blob-url-registry.service';

describe('BlobUrlRegistryService', () => {
  let service: BlobUrlRegistryService;

  beforeEach(() => {
    service = new BlobUrlRegistryService();
    spyOn(URL, 'revokeObjectURL');
  });

  it('should register and revoke a blob URL', () => {
    service.register('blob:http://localhost/abc');
    service.revokeAll();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/abc');
  });

  it('should revoke all registered URLs', () => {
    service.register('blob:http://localhost/1');
    service.register('blob:http://localhost/2');
    service.revokeAll();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it('should not revoke already-revoked URLs on a second revokeAll()', () => {
    service.register('blob:http://localhost/abc');
    service.revokeAll();
    service.revokeAll();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it('should not throw when revokeAll is called with no registered URLs', () => {
    expect(() => service.revokeAll()).not.toThrow();
  });
});
