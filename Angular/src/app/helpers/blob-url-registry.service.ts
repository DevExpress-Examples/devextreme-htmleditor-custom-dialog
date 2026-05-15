import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BlobUrlRegistryService {
  private readonly urls = new Set<string>();

  register(url: string): void {
    this.urls.add(url);
  }

  revokeAll(): void {
    this.urls.forEach((url) => URL.revokeObjectURL(url));
    this.urls.clear();
  }
}
