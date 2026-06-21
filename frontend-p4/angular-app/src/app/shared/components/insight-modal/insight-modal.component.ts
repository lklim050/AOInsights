import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

interface InsightItem {
  label: string;
  content: string;
  type:
    | 'critical'
    | 'positive'
    | 'neutral'
    | 'high'
    | 'medium'
    | 'low'
    | 'recommendation'
    | 'normal';
}
interface InsightSection {
  title: string;
  items: InsightItem[];
}

@Component({
  selector: 'app-insight-modal',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  templateUrl: './insight-modal.component.html',
  styleUrl: './insight-modal.component.css',
})
export class InsightModalComponent {
  // @Input() means from parent
  @Input() isVisible = false;
  @Input() summary = '';
  @Input() submissionCount = 0;
  @Input() generatedAt = '';
  @Input() isLoading = false;
  @Input() insightMsg = '';
  @Input() aiModel = '';
  // @Output() means from child
  // void means no data passed back
  @Output() close = new EventEmitter<void>();

  sections: InsightSection[] = [];
  viewMode: 'cards' | 'full' = 'cards';

  ngOnChanges() {
    if (this.summary) {
      this.sections = this.parseIntoSections(this.summary);
      // ↑ ngOnChanges fires whenever @Input() values change
      //   so we re-parse whenever summary updates
    }
  }

  setViewMode(mode: 'cards' | 'full') {
    this.viewMode = mode;
  }

  // parseIntoSections(markdown: string): InsightSection[] {
  //   const cleaned = markdown.replace(/\\n/g, '\n');

  //   const parts = cleaned.split(/^####\s/m).filter((p) => p.trim().length > 0);

  //   return parts.map((part) => {
  //     const lines = part.trim().split('\n');
  //     const title = lines[0].replace(/^#+\s*/, '').trim();
  //     const body = lines.slice(1).join('\n');

  //     const itemMatches = [
  //       ...body.matchAll(/\*+\s+\*\*(.+?)\*\*[:\s]*([^*]+?)(?=\n\*|\n\n|$)/gs),
  //     ];

  //     const items: InsightItem[] = itemMatches.map((m) => {
  //       const label = m[1].trim();
  //       const content = m[2]
  //         .trim()
  //         .replace(/\*\*/g, '')
  //         .replace(/\n/g, ' ')
  //         .trim();

  //       return {
  //         label,
  //         content,
  //         type: this.classifyItem(label, title),
  //       };
  //     });

  //     // Handle plain paragraphs (no bullet points)
  //     if (items.length === 0 && body.trim()) {
  //       const plainContent = body
  //         .replace(/\*\*/g, '')
  //         .replace(/^\*+\s/gm, '')
  //         .trim();

  //       if (plainContent) {
  //         items.push({
  //           label: '',
  //           content: plainContent,
  //           type: 'normal',
  //         });
  //       }
  //     }

  //     return { title, items, isOpen: true };
  //   });
  // }

  parseIntoSections(markdown: string): InsightSection[] {
    const cleaned = markdown.replace(/\\n/g, '\n');

    const parts = cleaned
      .split(/^#{2,4}\s/m)
      .filter((p) => p.trim().length > 0);

    return parts.map((part) => {
      const lines = part.trim().split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim();
      const body = lines.slice(1).join('\n');

      const items: InsightItem[] = [];

      // Process line by line instead of one big regex
      // This is more reliable for your AI's format
      const bodyLines = body.split('\n');

      for (const line of bodyLines) {
        const trimmed = line.trim();

        const bulletMatch = trimmed.match(/^\*\s+\*\*(.+?):\*\*\s*(.+)$/);

        if (bulletMatch) {
          let label = bulletMatch[1].trim();
          let content = bulletMatch[2].trim();

          // Try to find keyword in the LABEL first: "Title (NEUTRAL)"
          let keyword = '';
          const labelKeywordMatch = label.match(/\((\w+)\)\s*$/);
          if (labelKeywordMatch) {
            keyword = labelKeywordMatch[1];
            // Remove the (KEYWORD) from label so it displays cleanly
            label = label.replace(/\s*\(\w+\)\s*$/, '').trim();
          }

          // If not in label, try the END of content: "...**(NEUTRAL)**"
          if (!keyword) {
            const contentKeywordMatch = content.match(/\*\*\((\w+)\)\*\*\s*$/);
            if (contentKeywordMatch) {
              keyword = contentKeywordMatch[1];
            }
          }

          // Clean content of any keyword tags and stray **
          content = content
            .replace(/\*\*\(\w+\)\*\*\s*$/, '')
            .replace(/\*\*/g, '')
            .trim();

          console.log(
            'Label:',
            label,
            '| Keyword:',
            keyword,
            '| Type:',
            this.classifyByKeyword(keyword, title),
          );

          items.push({
            label,
            content,
            type: this.classifyByKeyword(keyword, title),
          });
        }
      }

      // Plain paragraph fallback (intro text, no bullets)
      if (items.length === 0 && body.trim()) {
        const plainContent = body
          .replace(/\*\*/g, '')
          .replace(/^---$/gm, '')
          .replace(/^\*+\s/gm, '')
          .trim();

        if (plainContent) {
          items.push({ label: '', content: plainContent, type: 'normal' });
        }
      }

      return { title, items };
    });
  }

  classifyByKeyword(
    keyword: string,
    sectionTitle: string,
  ): InsightItem['type'] {
    const k = keyword.toUpperCase();

    // Direct keyword matching — your AI returns these exact words
    if (k === 'POSITIVE') return 'positive';
    if (k === 'NEGATIVE') return 'critical';
    if (k === 'NEUTRAL') return 'neutral';
    if (k === 'HIGH') return 'high';
    if (k === 'MEDIUM') return 'medium';
    if (k === 'LOW') return 'low';

    // Section fallback
    const s = sectionTitle.toLowerCase();
    if (s.includes('recommend')) return 'recommendation';

    return 'normal';
  }

  getTypeBadge(type: string): string {
    const badges: Record<string, string> = {
      positive: '✅ Positive',
      critical: '🔴 Negative',
      neutral: '⚪ Neutral',
      high: '🔴 High',
      medium: '🟡 Medium',
      low: '🟢 Low',
      recommendation: '💡 Tip',
      normal: '',
    };
    return badges[type] || '';
  }

  onClose() {
    this.close.emit();
  }
}
