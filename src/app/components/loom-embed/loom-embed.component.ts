import { Component, input, inject, computed } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'loom-embed',
  templateUrl: './loom-embed.component.html',
  styleUrl: './loom-embed.component.scss'
})
export class LoomEmbedComponent {

  loomLink = input<string>('');

  private sanitizer = inject(DomSanitizer);

  private toEmbedUrl(raw: string): string {
    if (!raw) return '';
    try {
      // If only ID provided
      if (/^[a-z0-9]{10,}$/i.test(raw)) {
        return `https://www.loom.com/embed/${raw}`;
      }
      const url = new URL(raw);
      // Already embed
      if (url.hostname.includes('loom.com') && url.pathname.startsWith('/embed/')) {
        return url.toString();
      }
      // Convert share -> embed
      if (url.hostname.includes('loom.com') && url.pathname.startsWith('/share/')) {
        url.pathname = url.pathname.replace('/share/', '/embed/');
        return url.toString();
      }
      return raw;
    } catch {
      return raw;
    }
  }

  safeUrl = computed<SafeResourceUrl>(() => {
    const url = this.toEmbedUrl(this.loomLink());
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}


