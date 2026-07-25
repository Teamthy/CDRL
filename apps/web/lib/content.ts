export type Course = {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    track: 'Cybersecurity' | 'GRC' | 'AI Governance' | 'Executive Leadership';
    level: string;
    mode: string;
    overview: string;
};

export const courses: Course[] = [
    { id: '1', slug: 'iso-iec-27001-foundation', title: 'ISO/IEC 27001', subtitle: 'Foundation', track: 'Cybersecurity', level: 'Foundation', mode: 'Self-paced', overview: 'Build practical competence across the fundamentals of information security management.' },
    { id: '2', slug: 'iso-iec-27001-lead-implementer', title: 'ISO/IEC 27001', subtitle: 'Lead Implementer', track: 'Cybersecurity', level: 'Advanced', mode: 'Hybrid', overview: 'Advance into implementation planning and operational delivery for ISO 27001.' },
    { id: '3', slug: 'iso-iec-27001-lead-auditor', title: 'ISO/IEC 27001', subtitle: 'Lead Auditor', track: 'Cybersecurity', level: 'Advanced', mode: 'Virtual', overview: 'Develop the knowledge to audit and assess information security management systems.' },
    { id: '4', slug: 'cybersecurity-fundamentals', title: 'Cybersecurity', subtitle: 'Fundamentals', track: 'Cybersecurity', level: 'Foundation', mode: 'Self-paced', overview: 'A practical introduction to an evolving security landscape and threat awareness.' },
    { id: '5', slug: 'enterprise-risk-management', title: 'Enterprise Risk', subtitle: 'Management', track: 'GRC', level: 'Professional', mode: 'Virtual', overview: 'Apply structured approaches to enterprise risk identification and management.' },
    { id: '6', slug: 'iso-31000-risk-management', title: 'ISO 31000', subtitle: 'Risk Management', track: 'GRC', level: 'Professional', mode: 'Hybrid', overview: 'Develop confidence in governance and risk management using ISO 31000 principles.' },
    { id: '7', slug: 'compliance-regulatory-governance', title: 'Compliance & Regulatory', subtitle: 'Governance', track: 'GRC', level: 'Professional', mode: 'Virtual', overview: 'Connect governance, compliance, and regulatory priorities into practical action.' },
    { id: '8', slug: 'ai-governance-fundamentals', title: 'AI Governance', subtitle: 'Fundamentals', track: 'AI Governance', level: 'Foundation', mode: 'Self-paced', overview: 'Understand the ethical, legal, and governance dimensions of AI adoption.' },
    { id: '9', slug: 'responsible-ai-leadership', title: 'Responsible AI', subtitle: 'Leadership', track: 'AI Governance', level: 'Executive', mode: 'Virtual', overview: 'Prepare leaders to guide responsible AI adoption across the organization.' },
    { id: '10', slug: 'ai-risk-management', title: 'AI Risk', subtitle: 'Management', track: 'AI Governance', level: 'Professional', mode: 'Hybrid', overview: 'Translate AI risks into practical governance and control frameworks.' },
    { id: '11', slug: 'iso-iec-42001-ai-management-systems', title: 'ISO/IEC 42001', subtitle: 'AI Management Systems', track: 'AI Governance', level: 'Advanced', mode: 'Virtual', overview: 'Develop capability in implementing AI Management Systems aligned to emerging standards.' },
    { id: '12', slug: 'cybersecurity-for-executives', title: 'Cybersecurity', subtitle: 'for Executives', track: 'Executive Leadership', level: 'Executive', mode: 'In-person', overview: 'Equip executives to understand cyber risk and lead with confidence.' },
    { id: '13', slug: 'digital-risk-for-board-leaders', title: 'Digital Risk', subtitle: 'for Board Leaders', track: 'Executive Leadership', level: 'Executive', mode: 'In-person', overview: 'Support boards in navigating digital risk and governance obligations.' },
    { id: '14', slug: 'technology-governance-leadership', title: 'Technology Governance', subtitle: '& Leadership', track: 'Executive Leadership', level: 'Executive', mode: 'Hybrid', overview: 'Build executive capability around technology governance and leadership decision-making.' },
];

export const pageData: Record<string, { kicker: string; title: string; description: string; blocks: Array<{ title: string; text: string; items?: string[] }> }> = {
    About: {
        kicker: 'ABOUT CDRL',
        title: 'Purpose-led. Practice-focused. Africa-ready.',
        description: 'We help professionals and organizations lead with confidence in a world defined by technology and risk.',
        blocks: [
            { title: 'Who We Are', text: 'The Centre for Digital Risk & Leadership is a professional education, certification, and advisory institution focused on cybersecurity, digital governance, AI risk, and leadership development.' },
            { title: 'Our Mission', text: 'To equip professionals and organizations with the knowledge, frameworks, and leadership required to manage digital risks in an evolving technological landscape.' },
            { title: 'Our Vision', text: 'To become a leading African hub for digital risk education, cybersecurity leadership, and governance excellence.' },
            { title: 'Our Core Values', text: 'The principles that shape every learning and advisory engagement.', items: ['Integrity', 'Excellence', 'Innovation', 'Professional Leadership', 'Digital Trust'] },
        ],
    },
    'Corporate Training': {
        kicker: 'CORPORATE TRAINING',
        title: 'Turn digital risk awareness into organizational resilience.',
        description: 'Tailored learning experiences for teams, executives, and boards.',
        blocks: [
            { title: 'Why Corporate Training Matters', text: 'Cyber attacks, insider threats, and regulatory risk now affect every function. Your people are your first line of resilience.', items: ['Cyber attacks', 'Insider threats', 'Regulatory exposure'] },
            { title: 'Our Services', text: 'Programs are adapted to your sector, workforce, and risk maturity.', items: ['Cybersecurity Awareness Training', 'Executive Cyber Risk Briefings', 'Digital Risk Assessments', 'Governance Workshops'] },
        ],
    },
    Advisory: {
        kicker: 'ADVISORY & CONSULTING',
        title: 'Practical guidance for stronger digital governance.',
        description: 'Translate standards and risk priorities into systems your organization can operate and sustain.',
        blocks: [{ title: 'Professional Services', text: 'Our advisory work combines internationally recognized frameworks with local operational context.', items: ['ISO 27001 Implementation', 'Cybersecurity Risk Assessment', 'Information Security Audits', 'Digital Governance Advisory', 'Business Continuity Planning'] }],
    },
    Research: {
        kicker: 'RESEARCH & INSIGHTS',
        title: 'Clear thinking for complex digital questions.',
        description: 'Analysis and practical commentary for decision-makers across Africa.',
        blocks: [
            { title: 'The Future of AI Governance in Africa', text: 'How leaders can build responsible, locally relevant governance for rapidly advancing AI systems.' },
            { title: 'Why Cybersecurity Leadership Matters', text: 'Cybersecurity is no longer a technical issue—it is an enterprise leadership mandate.' },
            { title: 'Understanding ISO 27001 for Organizations', text: 'A practical introduction to building a systematic approach to information security.' },
        ],
    },
    Events: {
        kicker: 'EVENTS & MASTERCLASSES',
        title: 'Learn live. Lead with confidence.',
        description: 'Join upcoming certification programs, briefings, and practitioner masterclasses.',
        blocks: [
            { title: 'ISO/IEC 27001 Lead Implementer', text: 'June 18–21, 2026 · Lagos / Virtual', items: ['Four-day intensive program', 'Official course materials', 'Certification exam preparation'] },
            { title: 'Cyber Risk Leadership Masterclass', text: 'August 2026 · Virtual', items: ['For senior leaders and board members', 'Executive briefing format'] },
        ],
    },
    Partnerships: {
        kicker: 'PARTNERSHIPS',
        title: 'Stronger ecosystems build greater digital trust.',
        description: 'We collaborate with institutions that share our commitment to capability, standards, and responsible innovation.',
        blocks: [
            { title: 'Certification Bodies', text: 'Collaborating to deliver credible, internationally aligned professional certifications.' },
            { title: 'Universities', text: 'Bridging academic knowledge with practical digital risk and leadership capabilities.' },
            { title: 'Corporate Partners', text: 'Co-creating workforce development programs that meet industry needs.' },
        ],
    },
};

export const navItems = ['Home', 'About', 'Training', 'Corporate Training', 'Advisory', 'Research', 'Events', 'Partnerships', 'Leadership', 'Contact'];
