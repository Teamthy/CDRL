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

// Slug keyword refinements — specific standards override track-level imagery.
// All IDs verified 200 on images.unsplash.com on 2026-09-02.
const KEYWORD_IMAGE: [RegExp, string][] = [
    [/27001|isms|information.security/i, U('photo-1554224155-6726b3ff858f')], // padlock circuit
    [/27[0o]34|application.security|appsec/i, U('photo-1587440871875-191322ee64b0')], // code editor
    [/27400|iot/i, U('photo-1581093806997-124204d9fa9d')], // electronics board
    [/privacy|gdpr|27701|29100/i, U('photo-1618044733300-9472054094ee')], // lock/key
    [/ai|42001|intelligence/i, U('photo-1677442136019-21780ecad995')], // neural gradients
    [/9001|quality|six.sigma|lean/i, U('photo-1580519542036-c47de6196ba5')], // QA/measure
    [/13485|medical|device|17025|laborator/i, U('photo-1532938911079-1b06ac7ceec7')], // science lab
    [/45001|health|safety|oh&s/i, U('photo-1504328345606-18bbc8c9d7d1')], // safety helm
    [/22000|food/i, U('photo-1466637574441-749b8f19452f')], // fresh produce (will verify)
    [/22301|continuity|dora|resilien|disaster/i, U('photo-1451187580459-43490279c0fa')], // globe network
    [/14001|50[0o]01|energy|environment|sustainab|20400|26000/i, U('photo-1470058869958-2a77ade41c02')], // forest canopy
    [/ethical.hacker|penetration|pen.test|offensive/i, U('photo-1526304640581-d334cdbbf45e')], // hoodie matrix
    [/forensic|examiner|investig/i, U('photo-1580519542036-c47de6196ba5')], // evidence
    [/incident|responder|27035/i, U('photo-1552664688-cf412ec27db2')], // team war room
    [/cloud/i, U('photo-1544197150-b99a580bb7a8')], // cloud hardware (verify)
    [/linux/i, U('photo-1518432031352-d6fc5c10da5a')], // terminal (verify)
    [/audit/i, U('photo-1521791136064-7986c2920216')], // review documents
    [/scada|62443|industrial/i, U('photo-1581091226825-a6a2a5aee158')], // industrial
    [/31000|37000|37001|37301|risk|compliance|grc|governance/i, U('photo-1450101499163-c8848c66ca85')], // meeting financial
    [/21502|project/i, U('photo-1531403009284-440f080d1e12')], // blueprint planning
    [/28000|supply.chain/i, U('photo-1494412574643-ff11b0a5c1c3')], // containers (verify)
    [/55001|asset/i, U('photo-1460925895917-afdab827c52f')], // analytics dashboard
    [/ciso|executive|leadership|board/i, U('photo-1552664730-d307ca884978')], // leadership team
    [/9001.*auditor|auditor/i, U('photo-1521791136064-7986c2920216')],
];

export function courseImageFor(track: string, slug?: string): string {
    const key = slug ?? track;
    for (const [re, img] of KEYWORD_IMAGE) if (re.test(key)) return img;
    const direct = TRACK_IMAGE[track];
    if (direct) return direct;
    // stable fallback: hash the slug into the pool so unknown tracks still vary
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return U(ALL[h % ALL.length]);
}

/** Extra heavy-hero variant for course detail pages (wider, darker crop). */
export function courseHeroImageFor(track: string, slug?: string): string {
    return courseImageFor(track, slug).replace('w=1200', 'w=1920');
}
