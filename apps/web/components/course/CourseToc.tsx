import type { Course } from '../../lib/content';
import { richDetailsFor } from '../../lib/courseDetails';

type Props = { course: Course };

/** Sticky in-page table of contents (PECB-style). Anchors mirror ModuleText's
 *  anchorIds output over richDetailsFor(course). */
export default function CourseToc({ course }: Props) {
    const sections: { id: string; label: string }[] = [];
    for (const line of richDetailsFor(course).split('\n')) {
        if (line.startsWith('## ')) {
            const label = line.slice(3).trim();
            const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            sections.push({ id, label });
        }
    }
    const toc = [
        ...sections,
        { id: 'what-you-receive', label: 'What you receive' },
        { id: 'delivery', label: 'Delivery & flexibility' },
        { id: 'enrol', label: 'Apply & enrol' },
        { id: 'related', label: 'Related programmes' },
    ];

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
