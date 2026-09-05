/**
 * Markdown-lite parser for LMS module bodies (patch-21).
 * Supported, deliberately small surface:
 *   ## Heading 2 / ### Heading 3
 *   - bullet list (consecutive - lines become one <ul>)
 *   **bold** and [label](https://url) inline
 *   a block containing ONLY a YouTube URL becomes an embed
 *   anything else = paragraph
 * No raw HTML is ever emitted — React escapes everything.
 */

export type ModuleBlock =
    | { kind: 'heading'; level: 2 | 3; text: string }
    | { kind: 'list'; items: string[] }
    | { kind: 'paragraph'; text: string }
    | { kind: 'youtube'; videoId: string };

export type InlineToken = { kind: 'text' | 'bold' | 'link'; text: string; href?: string };

const YT_RE = /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s]*v=([\w-]{6,})|youtu\.be\/([\w-]{6,}))/;

export function youtubeId(text: string): string | null {
    const m = text.trim().match(YT_RE);
    return m ? m[1] ?? m[2] ?? null : null;
}

/** Parse inline **bold** and [label](href); everything else stays text. */
export function inlineTokens(text: string): InlineToken[] {
    const out: InlineToken[] = [];
    let rest = text;
    // Pattern: **bold** or [label](url)
    const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(rest)) !== null) {
        if (m.index > last) out.push({ kind: 'text', text: rest.slice(last, m.index) });
        if (m[1] !== undefined) {
            out.push({ kind: 'bold', text: m[1] });
        } else {
            out.push({ kind: 'link', text: m[2] ?? '', href: m[3] });
        }
        last = m.index + m[0].length;
    }
    if (last < rest.length) out.push({ kind: 'text', text: rest.slice(last) });
    return out.filter((t) => t.text.length > 0);
}

export function parseModuleText(raw: string): ModuleBlock[] {
    const blocks: ModuleBlock[] = [];
    // Normalize Windows/mac line endings (CRLF/CR) so content authored or
    // migrated on Windows parses identically to Unix-authored content.
    const normalized = raw.replace(/\r\n?/g, '\n');
    for (const chunk of normalized.split(/\n{2,}/)) {
        const trimmed = chunk.trim();
        if (!trimmed) continue;

        const yt = youtubeId(trimmed);
        if (yt) {
            blocks.push({ kind: 'youtube', videoId: yt });
            continue;
        }
        if (trimmed.startsWith('### ')) {
            blocks.push({ kind: 'heading', level: 3, text: trimmed.slice(4).trim() });
            continue;
        }
        if (trimmed.startsWith('## ')) {
            blocks.push({ kind: 'heading', level: 2, text: trimmed.slice(3).trim() });
            continue;
        }
        const lines = trimmed.split(/\n/).map((l) => l.trim());
        if (lines.every((l) => l.startsWith('- '))) {
            blocks.push({ kind: 'list', items: lines.map((l) => l.slice(2).trim()).filter(Boolean) });
            continue;
        }
        blocks.push({ kind: 'paragraph', text: lines.join(' ') });
    }
    return blocks;
}
