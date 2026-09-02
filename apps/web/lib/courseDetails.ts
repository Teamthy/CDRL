import type { Course } from './content';

const LEVEL_META: Record<string, { days: string; exam: string; cpd: string }> = {
    Foundation: { days: '2 training days', exam: '1-hour exam', cpd: '14 CPD credits' },
    Transition: { days: '2 training days', exam: '1-hour exam', cpd: '14 CPD credits' },
    Professional: { days: '3 training days', exam: '2-hour exam', cpd: '21 CPD credits' },
    Advanced: { days: '5 training days', exam: '3-hour exam', cpd: '35 CPD credits' },
    Executive: { days: '2 training days', exam: 'Peer-reviewed assessment', cpd: '14 CPD credits' },
};

export function levelMetaFor(level: string) {
    return LEVEL_META[level] ?? LEVEL_META.Professional;
}

/** Guarantee a PECB-style body: if the seeded `details` lacks the canonical
 *  "## What is …?" sections (older rows before a patch-36 reseed), synthesize
 *  the canonical body from the rest of the record so every page always reads fully. */
export function richDetailsFor(course: Course): string {
    const d = course.details ?? '';
    if (/## What is/i.test(d) && /## What you will learn/i.test(d) && /## Examination/i.test(d)) return d;

    const name = course.title;
    const isPecb = /PECB/i.test(`${course.subtitle} ${d}`);
    const examLine = isPecb
        ? `The programme concludes with the official **PECB ${name}** certification exam. Passing earns a PECB Certified credential, issued directly by PECB and verifiable online. Exam format, retake policy, and credential maintenance follow the current PECB Examination Rules and Policies.`
        : 'The programme concludes with a proctored assessment. Passing earns the course credential, verifiable through Ykay Consulting Hub.';
    const about = course.overview || `${name} is a structured, practitioner-led programme designed to build immediately usable competence.`;

    const body = [
        `## What is ${name}?`,
        about,
        `## Why is ${name} important for you?`,
        'Organizations that conform to ratified practice win procurement, pass audits, and keep customers; professionals who carry the recognized credential get the mandate to lead that work. Certification closes the loop — you leave with evidence, not just attendance.',
        '## Who should attend',
        '- Practitioners and consultants who implement or audit in this domain',
        '- Managers and directors accountable for the function',
        '- Professionals preparing for the certification exam',
        `- Anyone building a ${course.track} career path`,
        '## What you will learn',
        '- Understand the domain and its concepts, frameworks, and terminology',
        '- Interpret the standard requirements in the context of an organization',
        '- Plan and run an implementation or audit, with practical documentation',
        '- Apply the competency to a real scenario through case-study exercises',
        '## How do I get started with this training?',
        `Schedule: **${levelMetaFor(course.level).days}**. Delivered live (virtual or hybrid) by a certified Ykay Consulting Hub instructor with official course materials. Corporate cohorts can be scheduled to order.`,
        '## Examination and certification',
        examLine,
        '**Next step:** apply below — or contact our admissions team for corporate groups and bundle pricing.',
    ].join('\n\n');
    return d ? `${body}\n\n${d}` : body;
}
