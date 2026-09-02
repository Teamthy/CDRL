import { parseModuleText, inlineTokens, type InlineToken } from '../../lib/moduleText';

function Inline({ tokens }: { tokens: InlineToken[] }) {
    return (
        <>
            {tokens.map((t, i) =>
                t.kind === 'bold' ? (
                    <strong key={i}>{t.text}</strong>
                ) : t.kind === 'link' ? (
                    <a key={i} href={t.href} target="_blank" rel="noopener noreferrer">
                        {t.text}
                    </a>
                ) : (
                    <span key={i}>{t.text}</span>
                ),
            )}
        </>
    );
}

/** Renders a module body parsed by lib/moduleText (markdown-lite). */
export default function ModuleText({ text }: { text: string }) {
    const blocks = parseModuleText(text);
    return (
        <>
            {blocks.map((b, i) => {
                switch (b.kind) {
                    case 'heading':
                        return b.level === 2 ? (
                            <h3 key={i} className="mod-h2">
                                <Inline tokens={inlineTokens(b.text)} />
                            </h3>
                        ) : (
                            <h4 key={i} className="mod-h3">
                                <Inline tokens={inlineTokens(b.text)} />
                            </h4>
                        );
                    case 'list':
                        return (
                            <ul key={i} className="mod-ul">
                                {b.items.map((item, j) => (
                                    <li key={j}>
                                        <Inline tokens={inlineTokens(item)} />
                                    </li>
                                ))}
                            </ul>
                        );
                    case 'youtube':
                        return (
                            <div key={i} className="mod-yt">
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${b.videoId}`}
                                    title="Module video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                />
                            </div>
                        );
                    default:
                        return (
                            <p key={i}>
                                <Inline tokens={inlineTokens(b.text)} />
                            </p>
                        );
                }
            })}
        </>
    );
}
