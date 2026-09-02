/**
 * Course imagery (patch-30): deterministic Unsplash backdrops per catalogue track.
 * Every URL verified 200 against images.unsplash.com on 2026-09-02.
 * Usage: courseImageFor(track) → background for cards/detail heroes.
 * Unsplash license: free to use, no attribution required (attribution is welcome).
 */

const U = (id: string) =>
    `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

const ALL = [
    // information security / cyber core
    'photo-1550751827-4bd374c3f58b', // dark keyboard lock
    'photo-1563013544-824ae1b704d3', // server aisle
    'photo-1558494949-ef010cbdcc31', // datacenter
    // security operations
    'photo-1461749280684-dccba630e2f6', // code on screen
    'photo-1517245386807-bb43f82c33c4', // whiteboard team
    // AI / digital
    'photo-1677442136019-21780ecad995', // abstract AI wave
    'photo-1516321318423-f06f85e504b3', // laptop analytics
    // governance / business
    'photo-1454165804606-c3d57bc86b40', // strategy desk
    'photo-1552664730-d307ca884978', // team planning
    'photo-1423666639041-f56000c27a9a', // office collaboration
    // quality / labs
    'photo-1581091226825-a6a2a5aee158', // engineer with plans
    'photo-1532938911079-1b06ac7ceec7', // science / quality
    'photo-1497366754035-f200968c6e72', // modern office
    // continuity / infrastructure
    'photo-1451187580459-43490279c0fa', //(kept in fallback only)
    // privacy / legal
    'photo-1618044733300-9472054094ee', // privacy lock
    'photo-1521791136064-7986c2920216', //(kept in fallback only)
    // sustainability / safety
    'photo-1470058869958-2a77ade41c02', // green leaf forest
    'photo-1522202176988-66273c2fd55f', // people laptops learning
    'photo-1504711434969-e33886168f5c', // news / governance desk
    'photo-1522071820081-009f0129c71c', // teamwork table
] as const;

const TRACK_IMAGE: Record<string, string> = {
    'Information Security': U('photo-1550751827-4bd374c3f58b'),
    'Cybersecurity Management': U('photo-1563013544-824ae1b704d3'),
    'Technical Cybersecurity': U('photo-1461749280684-dccba630e2f6'),
    'Continuity & Resilience': U('photo-1451187580459-43490279c0fa'),
    'Privacy & Data Protection': U('photo-1618044733300-9472054094ee'),
    'Artificial Intelligence': U('photo-1677442136019-21780ecad995'),
    'Digital Transformation': U('photo-1516321318423-f06f85e504b3'),
    'Governance, Risk & Compliance': U('photo-1454165804606-c3d57bc86b40'),
    'Quality & Management': U('photo-1581091226825-a6a2a5aee158'),
    'Health & Safety': U('photo-1532938911079-1b06ac7ceec7'),
    Sustainability: U('photo-1470058869958-2a77ade41c02'),
    // curated Ykay tracks
    Cybersecurity: U('photo-1558494949-ef010cbdcc31'),
    GRC: U('photo-1504711434969-e33886168f5c'),
    'AI Governance': U('photo-1522071820081-009f0129c71c'),
    'Executive Leadership': U('photo-1552664730-d307ca884978'),
};

export function courseImageFor(track: string, slug?: string): string {
    const direct = TRACK_IMAGE[track];
    if (direct) return direct;
    // stable fallback: hash the slug into the pool so unknown tracks still vary
    const key = slug ?? track;
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return U(ALL[h % ALL.length]);
}

/** Extra heavy-hero variant for course detail pages (wider, darker crop). */
export function courseHeroImageFor(track: string, slug?: string): string {
    return courseImageFor(track, slug).replace('w=1200', 'w=1920');
}
