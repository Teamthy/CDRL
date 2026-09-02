import type { Course } from '../../lib/content';

type Props = { course: Course };

/** Sticky in-page table of contents for the long-form course body (PECB-style). */
export default function CourseToc({ course }: Props) {
    const sections: { id: string; label: string }[] = [];
    if (course.details) {
        // Pull "## Heading" anchors out of the markdown-lite body — matches ModuleText rendering.
        for (const line of course.details.split('\n')) {
            if (line.startsWith('## ')) {
                const label = line.slice(3).trim();
                const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                sections.push({ id, label });
            }
        }
    }
    const toc = [
        { id: 'overview', label: 'Course overview' },
        ...(sections.length ? sections : []),
        { id: 'what-you-receive', label: 'What you receive' },
        { id: 'delivery', label: 'Delivery & flexibility' },
        { id: 'enrol', label: 'Apply & enrol' },
        { id: 'related', label: 'Related programmes' },
    ];
    if (toc.length < 3) return null;

    return (
        <nav className="course-toc" aria-label="On this page">
            <span className="toc-label">On this page</span>
            <ol>
                {toc.map((s) => (
                    <li key={s.id}>
                        <a href={`#${s.id}`}>{s.label}</a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
