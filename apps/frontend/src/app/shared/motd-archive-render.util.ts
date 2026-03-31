import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import type { MotdArchiveItemDTO } from '@arsnova/shared-types';
import { splitMotdArchiveFirstAtxHeading } from '../core/motd-archive-split.util';
import { renderMarkdownWithoutKatex } from './markdown-katex.util';

/**
 * Titel (erstes ATX-Heading) + sanitisiertes HTML für Archiv-Einträge (Dialog + öffentliche Seite).
 */
export function buildMotdArchiveItemDisplay(
  it: MotdArchiveItemDTO,
  sanitizer: DomSanitizer,
  fallbackTitle: string,
): { title: string; html: SafeHtml } {
  const { title: atxTitle, bodyMarkdown } = splitMotdArchiveFirstAtxHeading(it.markdown);
  const displayTitle = atxTitle ?? fallbackTitle;
  const mdForBody =
    atxTitle !== null ? (bodyMarkdown.trim().length > 0 ? bodyMarkdown : '\n') : it.markdown;
  return {
    title: displayTitle,
    html: sanitizer.bypassSecurityTrustHtml(renderMarkdownWithoutKatex(mdForBody)),
  };
}
