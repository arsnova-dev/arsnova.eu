import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import type { MotdArchiveItemDTO } from '@arsnova/shared-types';
import { splitMotdArchiveFirstAtxHeading } from '../core/motd-archive-split.util';
import { renderMarkdownWithoutKatex } from './markdown-katex.util';

export type BuildMotdArchiveItemDisplayOptions = {
  /**
   * z. B. Archiv-Dialog: Panel-Titel nutzt oft Ellipse — gleiche ATX-Überschrift im Rumpf wiederholen.
   * Öffentliche Archiv-Seite zeigt den Titel bereits vollständig im Eintragskopf — typ. false.
   */
  repeatTitleInMarkdownBody?: boolean;
};

/**
 * Titel (erstes ATX-Heading) + sanitisiertes HTML für Archiv-Einträge (Dialog + öffentliche Seite).
 */
export function buildMotdArchiveItemDisplay(
  it: MotdArchiveItemDTO,
  sanitizer: DomSanitizer,
  fallbackTitle: string,
  options?: BuildMotdArchiveItemDisplayOptions,
): { title: string; html: SafeHtml } {
  const repeatTitle = options?.repeatTitleInMarkdownBody === true;
  const { title: atxTitle, bodyMarkdown } = splitMotdArchiveFirstAtxHeading(it.markdown);
  const displayTitle = atxTitle ?? fallbackTitle;
  let mdForBody: string;
  if (atxTitle === null) {
    mdForBody = it.markdown;
  } else {
    const bodyTrim = bodyMarkdown.trim();
    const bodyOnly = bodyTrim.length > 0 ? bodyMarkdown : '';
    if (repeatTitle) {
      mdForBody = bodyOnly ? `# ${displayTitle}\n\n${bodyOnly}` : `# ${displayTitle}\n`;
    } else {
      mdForBody = bodyOnly ? bodyOnly : '\n';
    }
  }
  return {
    title: displayTitle,
    html: sanitizer.bypassSecurityTrustHtml(renderMarkdownWithoutKatex(mdForBody)),
  };
}
