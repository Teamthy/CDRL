/**
 * PECB catalogue — production import (patch-27).
 *
 * Mirrors the public PECB categories as of September 2026:
 *   Information Security · Cybersecurity Management · Technical Cybersecurity ·
 *   Continuity, Resilience & Recovery · Privacy & Data Protection · Artificial Intelligence ·
 *   Digital Transformation · Governance, Risk & Compliance · Quality & Management ·
 *   Health & Safety · Sustainability
 *
 * Content policy (PECB brand guidelines):
 *   - We state Ykay delivers the course and the official PECB certification exam closes it.
 *   - We never imply PECB endorses beyond the Authorized Partner scope.
 *   - Overview here is a sales one-liner; `details` is the long-form body rendered
 *     on /training/<slug> by ModuleText (markdown-lite).
 *
 * Every row upserts by slug — re-running the seed is always safe, and edits made
 * in the console stay (seed only writes rows whose slug it owns; console edits
 * persist because the admin update path is per-field, not row-replace).
 */

export type SeedCourse = {
    slug: string;
    title: string;
    subtitle: string; // must contain "PECB" to surface in the /partnerships portfolio grid
    track: string;
    level: string;
    deliveryMode: string;
    overview: string;
    details: string;
    sortOrder: number;
};

const OPEN = 'A PECB Certified course delivered by Ykay Consulting Hub.';

// ── Level outcome blocks (reused so every page is accurate to its level) ────

const LEVELS = {
    Foundation: {
        level: 'Foundation',
        days: 'Two training days plus the certification exam',
        objectives: [
            'Understand the fundamental concepts, principles, and structure of the discipline',
            'Know the key terms, requirements, and professional vocabulary used on audits and projects',
            'Relate the framework to your organization\u2019s context and obligations',
            'Sit the certification exam with confidence and plan your next certification step',
        ],
    },
    LI: {
        level: 'Advanced',
        days: 'Five training days: knowledge transfer, practical case work, and the certification exam on day five',
        objectives: [
            'Plan, implement, manage, monitor, and continually improve the management system or control set end to end',
            'Scope the programme, perform gap and risk analysis, and define policies, objectives, and controls',
            'Prepare the organization for certification and external audits, including evidence and documentation',
            'Measure performance, handle nonconformities, and drive corrective action cycles',
        ],
    },
    LA: {
        level: 'Advanced',
        days: 'Five training days: audit principles, on-site simulation, and the certification exam on day five',
        objectives: [
            'Plan, conduct, report, and follow up on audits per ISO 19011 guidance and ISO/IEC 17021-1 context',
            'Evaluate conformity, gather and validate evidence, and write defensible findings',
            'Lead an audit team and manage the audit programme',
            'Advise organizations on findings without compromising auditor independence',
        ],
    },
    Manager: {
        level: 'Professional',
        days: 'Five training days: methodology, tooling practice, and the certification exam on day five',
        objectives: [
            'Operate the role end to end: scope, plan, execute, measure, and report',
            'Apply the methodology to live scenarios through case studies and exercises',
            'Coordinate stakeholders, resources, and suppliers across the programme',
            'Prepare for the certification exam and the responsibilities that follow',
        ],
    },
    Professional: {
        level: 'Professional',
        days: 'Multi-day programme with hands-on labs, concluding with the certification exam',
        objectives: [
            'Build role-ready, hands-on capability through structured labs and scenarios',
            'Apply the discipline\u2019s tools and techniques to realistic organizational situations',
            'Demonstrate competence in the certification exam',
            'Leave with a repeatable playbook you can apply immediately at work',
        ],
    },
} as const;

type LevelKey = keyof typeof LEVELS;

interface Row {
    code: string; // course code / family title, e.g. "ISO/IEC 27001"
    titleSuffix?: string; // extra on the family title line
    level: LevelKey;
    levelLabel: string; // the PECB credential line, e.g. "Lead Implementer"
    track: string;
    about: string; // what the standard/discipline is — first paragraph
    audience: string[]; // who should attend bullets
    extraObjectives?: string[]; // standard-specific objectives appended to the level block
    focus?: string; // one-line scope/why for the overview
}

function buildDetails(r: Row): string {
    const L = LEVELS[r.level];
    const objectives = [...L.objectives, ...(r.extraObjectives ?? [])];
    return [
        '## About this training',
        r.about,
        `**Schedule:** ${L.days}. Delivered live (virtual or hybrid) by a certified Ykay Consulting Hub tutor, with official PECB course materials included.`,
        '## Who should attend',
        ...r.audience.map((a) => `- ${a}`),
        '## What you will learn',
        ...objectives.map((o) => `- ${o}`),
        '## Examination and certification',
        `The programme concludes with the official **PECB ${r.code} ${r.levelLabel}** certification exam. Passing earns the PECB Certified credential, issued directly by PECB and verifiable on the PECB website. Exam retake policy, credential maintenance, and upgrade paths follow the current PECB Certification Rules and Policies.`,
        '**Next step:** apply below or contact our admissions team for corporate groups, schedules, and pricing.',
    ].join('\n\n');
}

function course(r: Row, sortOrder: number): SeedCourse {
    const title = r.code + (r.titleSuffix ? ` ${r.titleSuffix}` : '');
    const subtitle = `${r.levelLabel} (PECB Certified)`;
    const focus = r.focus ?? r.about.split('. ')[0].replace(/\.$/, '') + '.';
    return {
        slug: slugOf(title, r.levelLabel),
        title,
        subtitle,
        track: r.track,
        level: LEVELS[r.level].level,
        deliveryMode: r.focus?.includes('Self-paced') ? 'Self-paced' : 'Virtual / Hybrid',
        overview: `${OPEN} ${focus}`,
        details: buildDetails(r),
        sortOrder,
    };
}

function slugOf(title: string, levelLabel: string): string {
    return `${title} ${levelLabel}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Tracks follow PECB's own categories so /training filter chips mirror their site.
const TRACK = {
    InfoSec: 'Information Security',
    CyberMgmt: 'Cybersecurity Management',
    TechCyber: 'Technical Cybersecurity',
    Continuity: 'Continuity & Resilience',
    Privacy: 'Privacy & Data Protection',
    AI: 'Artificial Intelligence',
    Digital: 'Digital Transformation',
    GRC: 'Governance, Risk & Compliance',
    Quality: 'Quality & Management',
    Health: 'Health & Safety',
    Sustainability: 'Sustainability',
} as const;

const AUD = {
    implementers: [
        'Managers and consultants responsible for implementation or improvement projects',
        'Team members contributing to the management system in scope',
        'Compliance, risk, or quality officers who need implementation depth',
    ],
    auditors: [
        'Internal and external auditors who assess against the standard',
        'Audit programme managers and lead auditor candidates',
        'Consultants preparing clients for certification audits',
    ],
    managers: [
        'Managers and technical leads who own this discipline in their organization',
        'Consultants and advisors supporting clients on the topic',
        'Professionals broadening into this domain from a related field',
    ],
    foundation: [
        'Professionals new to the discipline who need a structured grounding',
        'Team members who will support projects or audits in this area',
        'Anyone planning a certification pathway in this domain',
    ],
    specialists: [
        'Technical practitioners working hands-on in this specialty',
        'Security or operations engineers expanding their toolset',
        'Career switchers moving toward a specialist certification',
    ],
} as const;

// ── The catalogue ───────────────────────────────────────────────────────────
// Order follows PECB category order; sortOrder runs 30+ so it lands after the
// curated portfolio (patch-26 kept 15–25).

const ROWS: Row[] = [
    // ── Information Security ────────────────────────────────────────────────
    {
        code: 'ISO/IEC 27001', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.InfoSec,
        about: 'ISO/IEC 27001 is the internationally recognized standard for information security management systems (ISMS). This Foundation course builds a precise mental model of the standard: its clauses, Annex A controls, and the risk-based thinking behind it.',
        audience: [...AUD.foundation],
        focus: 'The entry point to information security management — clauses, controls, and how an ISMS actually works.',
    },
    // (27001 LI/LA already exist as curated rows — excluded here to avoid slug collisions)
    {
        code: 'ISO/IEC 27001', level: 'Manager', levelLabel: 'Transition', track: TRACK.InfoSec,
        about: 'Understand the differences between ISO/IEC 27001 editions and lead your ISMS through a controlled, auditable transition — documentation, controls, and evidence expectations.',
        audience: [...AUD.managers],
        focus: 'Move an existing ISMS to the current edition of ISO/IEC 27001 without losing certification continuity.',
    },
    {
        code: 'ISO/IEC 27002', level: 'Manager', levelLabel: 'Lead Manager', track: TRACK.InfoSec,
        about: 'ISO/IEC 27002 provides the detailed guidance for the Annex A controls of ISO/IEC 27001. This course turns control guidance into an implementable, measurable control programme.',
        audience: [...AUD.managers],
        focus: 'Deep command of Annex A controls — selection, implementation guidance, and measurement.',
    },
    {
        code: 'PECB CISO', level: 'Manager', levelLabel: 'Chief Information Security Officer', track: TRACK.InfoSec,
        about: 'A role certification for security leadership: strategy, governance, budgeting, team building, and board communication for the information security function.',
        audience: ['Security leaders and aspiring CISOs', 'IT directors taking on security mandates', 'Consultants advising executive security teams'],
        focus: 'The capstone credential for information security leadership.',
    },
    // ── Cybersecurity Management ────────────────────────────────────────────
    {
        code: 'Cybersecurity Management', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.CyberMgmt,
        about: 'A management-oriented grounding in cybersecurity: threat landscape, governance, risk treatment, and how to structure a defensible security programme.',
        audience: [...AUD.foundation],
        focus: 'Cybersecurity for decision-makers — governance, risk, and programme structure.',
    },
    {
        code: 'Cybersecurity Management', level: 'Manager', levelLabel: 'Lead Cybersecurity Manager', track: TRACK.CyberMgmt,
        about: 'Lead an organization\u2019s cybersecurity programme: governance structure, risk treatment, capability maturity, incident readiness, and executive reporting.',
        audience: [...AUD.managers],
        focus: 'Run a cybersecurity programme end to end, with the governance to prove it.',
    },
    {
        code: 'Cloud Security', level: 'Manager', levelLabel: 'Lead Cloud Security Manager', track: TRACK.CyberMgmt,
        about: 'Secure multi-cloud and hybrid environments: shared responsibility, identity, data protection, architecture review, and continuous assurance.',
        audience: [...AUD.managers, 'Cloud and platform engineers moving into architecture or security roles'],
        focus: 'Governance-grade cloud security across providers and deployment models.',
    },
    {
        code: 'Penetration Testing', level: 'Professional', levelLabel: 'Lead Pen Test Manager', track: TRACK.CyberMgmt,
        about: 'Govern and run professional penetration-testing engagements: scoping rules of engagement, methodology, evidence, reporting, and remediation tracking.',
        audience: ['Security managers overseeing pen-test programmes', 'Penetration testers moving into engagement leadership', 'Consultants providing offensive-security services'],
        focus: 'Manage penetration-testing engagements with professional rigour.',
    },
    {
        code: 'SCADA Security', level: 'Manager', levelLabel: 'Lead SCADA Security Manager', track: TRACK.CyberMgmt,
        about: 'Protect industrial control and SCADA environments: OT threat models, segmentation, monitoring, and safe change management in operational technology.',
        audience: [...AUD.managers, 'OT/ICS engineers facing new assurance requirements'],
        focus: 'Cybersecurity for industrial control systems and operational technology.',
    },
    {
        code: 'ISO/IEC 27033', level: 'Manager', levelLabel: 'Lead Network Security Manager', track: TRACK.CyberMgmt,
        about: 'ISO/IEC 27033 multi-part guidance for network security: architecture, risk analysis, design techniques, and secure gateway and interconnect controls.',
        audience: [...AUD.managers, 'Network and infrastructure security engineers'],
        focus: 'Network security architecture and controls grounded in the ISO/IEC 27033 series.',
    },
    {
        code: 'CMMC', level: 'Foundation', levelLabel: 'Foundations', track: TRACK.CyberMgmt,
        about: 'The US Department of Defense Cybersecurity Maturity Model Certification framework: levels, domains, assessment expectations, and how contractors prepare.',
        audience: [...AUD.foundation, 'Defence supply-chain organizations preparing for CMMC assessments'],
        focus: 'Understand CMMC levels, domains, and the assessment path for defence contractors.',
    },
    {
        code: 'CMMC', level: 'Professional', levelLabel: 'Certified Professional', track: TRACK.CyberMgmt,
        about: 'Full CMMC professional preparation: applying practices across domains, preparing evidence, and supporting organizations through assessment.',
        audience: [...AUD.specialists, 'Compliance professionals in the US defence supply chain'],
        focus: 'Practitioner certification for implementing and evidencing CMMC requirements.',
    },
    {
        code: 'NIS 2 Directive', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.CyberMgmt,
        about: 'The EU NIS 2 Directive raises cybersecurity obligations for essential and important entities. This course decodes scope, duties, and supervision for affected organizations.',
        audience: [...AUD.foundation, 'Organizations operating in or selling into the EU'],
        focus: 'EU NIS 2 obligations, enforcement, and what compliant readiness looks like.',
    },
    // ── Technical Cybersecurity ─────────────────────────────────────────────
    {
        code: 'Linux Foundations', level: 'Foundation', levelLabel: 'Linux Foundations', track: TRACK.TechCyber,
        about: 'Essential Linux skills for security and operations work: system navigation, permissions, processes, services, and hardening fundamentals.',
        audience: [...AUD.specialists, 'Beginners building a technical cybersecurity base'],
        focus: 'The Linux literacy every security and infrastructure role runs on.',
    },
    {
        code: 'Lead Ethical Hacker', level: 'Professional', levelLabel: 'Lead Ethical Hacker', track: TRACK.TechCyber,
        about: 'Structured, authorized offensive security: reconnaissance, exploitation frameworks, post-exploitation discipline, and professional reporting.',
        audience: [...AUD.specialists, 'Penetration testers and red-team members formalizing their craft'],
        focus: 'Professional offensive-security practice, from recon to report.',
    },
    {
        code: 'Cyber Threat Analyst', level: 'Professional', levelLabel: 'Cyber Threat Analyst', track: TRACK.TechCyber,
        about: 'Threat intelligence and analysis operations: collection, indicators, actor profiling, and converting intelligence into defensive action.',
        audience: [...AUD.specialists, 'SOC and threat-intelligence team members'],
        focus: 'Turn raw threat data into decisions a SOC can act on.',
    },
    {
        code: 'Cloud Security Analyst', level: 'Professional', levelLabel: 'Cloud Security Analyst', track: TRACK.TechCyber,
        about: 'Hands-on cloud security operations: misconfiguration discovery, workload protection, logging, and incident containment in cloud estates.',
        audience: [...AUD.specialists],
        focus: 'Day-to-day cloud security operations, hands-on.',
    },
    {
        code: 'Incident Responder', level: 'Professional', levelLabel: 'Incident Responder', track: TRACK.TechCyber,
        about: 'Incident response practice: triage, containment, eradication, recovery, communication, and post-incident learning.',
        audience: [...AUD.specialists, 'SOC analysts and IT responders'],
        focus: 'Respond to real incidents with a proven playbook.',
    },
    {
        code: 'Digital Forensics Examiner', level: 'Professional', levelLabel: 'Digital Forensics Examiner', track: TRACK.TechCyber,
        about: 'Forensically sound investigation: acquisition, preservation, analysis, and reporting that stands scrutiny.',
        audience: [...AUD.specialists, 'Investigators and auditors handling digital evidence'],
        focus: 'Collect and analyse digital evidence defensibly.',
    },
    // ── Continuity, Resilience & Recovery ───────────────────────────────────
    {
        code: 'Disaster Recovery', level: 'Manager', levelLabel: 'Lead Disaster Recovery Manager', track: TRACK.Continuity,
        about: 'Plan and test IT disaster recovery: recovery objectives, replication and backup strategy, failover runbooks, and exercise programmes that prove recovery works.',
        audience: [...AUD.managers, 'IT operations and infrastructure managers with DR responsibility'],
        focus: 'Recovery you can demonstrate — RTOs, RPOs, and tested runbooks.',
    },
    {
        code: 'DORA', level: 'Manager', levelLabel: 'Lead Manager', track: TRACK.Continuity,
        about: 'The EU Digital Operational Resilience Act for financial entities: ICT risk management, incident reporting, resilience testing, and third-party oversight.',
        audience: [...AUD.managers, 'Financial-services risk, compliance, and ICT leaders'],
        focus: 'Meet DORA duties for financial-sector digital resilience.',
    },
    {
        code: 'Operational Resilience', level: 'Manager', levelLabel: 'Lead Operational Resilience Manager', track: TRACK.Continuity,
        about: 'Build organization-wide operational resilience: important business services, impact tolerances, scenario testing, and continual improvement.',
        audience: [...AUD.managers],
        focus: 'From business continuity plans to demonstrable operational resilience.',
    },
    // ── Privacy & Data Protection ───────────────────────────────────────────
    {
        code: 'GDPR', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Privacy,
        about: 'Core GDPR knowledge: principles, lawful bases, data-subject rights, records of processing, breaches, and the supervisory landscape.',
        audience: [...AUD.foundation, 'Anyone who handles personal data in or about the EU'],
        focus: 'GDPR fundamentals every data-handling role should carry.',
    },
    {
        code: 'GDPR', level: 'Manager', levelLabel: 'Data Protection Officer (CDPO)', track: TRACK.Privacy,
        about: 'Perform the DPO role: advising on privacy governance, running DPIAs, liaison with supervisory authorities, and sustaining organizational accountability.',
        audience: ['Current and aspiring Data Protection Officers', 'Privacy and compliance managers', 'Legal and risk professionals extending into data protection'],
        focus: 'Qualify and operate as a Data Protection Officer.',
    },
    // ── Artificial Intelligence ─────────────────────────────────────────────
    {
        code: 'ISO/IEC 42001', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.AI,
        about: 'ISO/IEC 42001 is the first international standard for AI management systems (AIMS). This Foundation course builds command of its structure, requirements, and governance intent.',
        audience: [...AUD.foundation, 'Governance, risk, and compliance professionals meeting AI obligations'],
        focus: 'The entry credential for AI management systems — clauses, controls, and purpose.',
    },
    {
        code: 'ISO/IEC 42001', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.AI,
        about: 'Design and operate an AI management system per ISO/IEC 42001: AI policy and objectives, risk and impact assessment, lifecycle controls, supplier management, and performance evaluation.',
        audience: [...AUD.implementers, 'AI programme and governance leads'],
        focus: 'Implement an AIMS that makes AI trustworthy, auditable, and governable.',
    },
    {
        code: 'ISO/IEC 42001', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.AI,
        about: 'Audit AI management systems against ISO/IEC 42001: evidence expectations across the AI lifecycle, governance conformity, and findings that stand review.',
        audience: [...AUD.auditors, 'AI assurance and model-governance professionals'],
        focus: 'Audit AI management with certification-grade method.',
    },
    {
        code: 'AI Professional', level: 'Professional', levelLabel: 'Certified Artificial Intelligence Professional (CAIP)', track: TRACK.AI,
        about: 'PECB\u2019s comprehensive AI professional certification: AI systems, lifecycle, data practice, evaluation, deployment, and responsible operation.',
        audience: [...AUD.specialists, 'Engineers and analysts building or operating AI systems'],
        focus: 'Practical, certification-backed AI professionalism across the lifecycle.',
    },
    {
        code: 'AI Risk Management', level: 'Manager', levelLabel: 'Lead AI Risk Manager', track: TRACK.AI,
        about: 'Identify, assess, treat, and monitor AI risks across the lifecycle — connecting ISO/IEC 23894 guidance with day-to-day AI governance practice.',
        audience: [...AUD.managers, 'Risk and compliance professionals facing AI adoption'],
        focus: 'Structured AI risk management you can defend to boards and regulators.',
    },
    {
        code: 'AI Manager', level: 'Manager', levelLabel: 'Lead AI Manager', track: TRACK.AI,
        about: 'Lead an organization\u2019s AI programme: strategy, portfolio governance, capability building, delivery assurance, and value measurement.',
        audience: [...AUD.managers, 'Product and technology leaders accountable for AI outcomes'],
        focus: 'The executive-technical bridge credential for AI programmes.',
    },
    // ── Digital Transformation ─────────────────────────────────────────────
    {
        code: 'Digital Transformation', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Digital,
        about: 'Digital transformation concepts without the buzzword fog: models, enablers, change practice, and how initiatives deliver measurable value.',
        audience: [...AUD.foundation, 'Leaders sponsoring or contributing to transformation programmes'],
        focus: 'A decision-grade understanding of digital transformation.',
    },
    // ── Governance, Risk & Compliance ───────────────────────────────────────
    {
        code: 'ISO/IEC 38500', level: 'Manager', levelLabel: 'Lead IT Governance Manager', track: TRACK.GRC,
        about: 'ISO/IEC 38500 principles for governance of IT: directing, monitoring, and evaluating IT use so it serves organizational purpose and risk appetite.',
        audience: [...AUD.managers, 'CIOs, IT governance officers, and board-facing technology leaders'],
        focus: 'Board-grade IT governance on the ISO/IEC 38500 model.',
    },
    {
        code: 'MS Internal Auditor', level: 'Manager', levelLabel: 'Management Systems Internal Auditor', track: TRACK.GRC,
        about: 'A cross-standard internal-audit certification: audit principles, programme management, evidence handling, and reporting that drives corrective action in any ISO management system.',
        audience: [...AUD.auditors, 'Internal auditors working across ISMS/BCMS/QMS/SMS programmes'],
        focus: 'One credential covering internal audit across management-system standards.',
    },
    // ── Quality & Management ────────────────────────────────────────────────
    {
        code: 'ISO 9001', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Quality,
        about: 'The quality management standard behind certified organizations worldwide: process approach, risk-based thinking, and the PDCA cycle.',
        audience: [...AUD.foundation],
        focus: 'Quality management fundamentals on ISO 9001.',
    },
    {
        code: 'ISO 9001', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Quality,
        about: 'Implement and operate a quality management system aligned to ISO 9001: context, leadership, planning, support measures, operational controls, and performance evaluation.',
        audience: [...AUD.implementers],
        focus: 'Build a working, certifiable quality management system.',
    },
    {
        code: 'ISO 9001', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Quality,
        about: 'Audit quality management systems against ISO 9001 with methods that stand up to certification-body scrutiny.',
        audience: [...AUD.auditors],
        focus: 'Plan and lead ISO 9001 audits professionally.',
    },
    {
        code: 'ISO 21502', level: 'Manager', levelLabel: 'Lead Project Manager', track: TRACK.Quality,
        about: 'Project management per ISO 21502: governance, roles, lifecycle control, benefits, and disciplined delivery.',
        audience: [...AUD.managers, 'Project and programme managers formalizing their method'],
        focus: 'ISO-aligned project governance and delivery discipline.',
    },
    {
        code: 'ISO/IEC 17025', level: 'Manager', levelLabel: 'Lead Implementer', track: TRACK.Quality,
        about: 'Laboratory competence per ISO/IEC 17025: impartiality, methods, equipment, metrological traceability, and quality management for testing and calibration labs.',
        audience: [...AUD.implementers, 'Laboratory managers and quality officers'],
        focus: 'Implement lab quality and competence requirements for accreditation.',
    },
    {
        code: 'ISO/IEC 20000', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Quality,
        about: 'Service management fundamentals: the service lifecycle, service level obligations, and what running IT as a managed service actually requires.',
        audience: [...AUD.foundation],
        focus: 'Understand how professional IT service management works.',
    },
    {
        code: 'ISO/IEC 20000', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Quality,
        about: 'Audit service management systems against ISO/IEC 20000: conformity, service performance evidence, and continual service improvement.',
        audience: [...AUD.auditors, 'IT service managers preparing for external audits'],
        focus: 'Audit IT service management with authority.',
    },
    {
        code: 'Six Sigma', level: 'Professional', levelLabel: 'Green Belt', track: TRACK.Quality,
        about: 'Six Sigma Green Belt capability: DMAIC discipline, measurement systems, basic statistical analysis, and improvement project leadership.',
        audience: [...AUD.specialists, 'Process owners and improvement team members'],
        focus: 'Run measurable improvement projects with DMAIC.',
    },
    {
        code: 'ISO 55001', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Quality,
        about: 'Asset management per ISO 55001: value realization, lifecycle costing, risk- and performance-based asset decisions, and the asset management system itself.',
        audience: [...AUD.implementers, 'Asset-intensive organizations\u2019 engineering and finance leaders'],
        focus: 'Implement a value-centred asset management system.',
    },
    {
        code: 'ISO 28000', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Quality,
        about: 'Supply chain security management per ISO 28000: threat and vulnerability assessment across the chain, controls selection, and operational assurance.',
        audience: [...AUD.implementers, 'Logistics, trade, and supply-chain security professionals'],
        focus: 'Secure the supply chain end to end under ISO 28000.',
    },
    // ── Health & Safety ─────────────────────────────────────────────────────
    {
        code: 'ISO 45001', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Health,
        about: 'Occupational health and safety management per ISO 45001: hazard identification, worker participation, and incident prevention culture.',
        audience: [...AUD.foundation, 'HSE officers and line managers'],
        focus: 'OH&S fundamentals that keep people safe and organizations compliant.',
    },
    {
        code: 'ISO 45001', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Health,
        about: 'Build an OH&S management system: hazard and risk processes, operational controls, emergency readiness, worker consultation, and performance evaluation.',
        audience: [...AUD.implementers, 'HSE managers accountable for safety systems'],
        focus: 'Implement a certifiable occupational health & safety system.',
    },
    {
        code: 'ISO 22000', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Health,
        about: 'Food safety management across the chain: prerequisite programmes, hazard analysis, critical control points, and FSMS operation per ISO 22000.',
        audience: [...AUD.implementers, 'Food industry quality and operations professionals'],
        focus: 'Food safety management from farm-adjacent to fork.',
    },
    {
        code: 'ISO 18788', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Health,
        about: 'Private security operations management per ISO 18788, embedding human-rights obligations and professional conduct into security service operations.',
        audience: [...AUD.implementers, 'Private security company managers and clients of security services'],
        focus: 'Professionalize private security operations to an international standard.',
    },
    // ── Sustainability ──────────────────────────────────────────────────────
    {
        code: 'ISO 14001', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Sustainability,
        about: 'Environmental management per ISO 14001: aspects and impacts, compliance obligations, objectives and programmes, and monitoring that proves improvement.',
        audience: [...AUD.implementers, 'Environmental and sustainability officers'],
        focus: 'Implement an environmental management system that measurably improves performance.',
    },
    {
        code: 'ISO 50001', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Sustainability,
        about: 'Energy management per ISO 50001: energy review and baselines, performance indicators, action plans, and verification of savings.',
        audience: [...AUD.implementers, 'Facility, utility, and energy managers'],
        focus: 'Cut energy cost and carbon with a managed, measurable system.',
    },
    {
        code: 'ISO 26000', level: 'LI', levelLabel: 'Lead Manager', track: TRACK.Sustainability,
        about: 'Social responsibility per ISO 26000: the seven core subjects, stakeholder engagement, and integrating responsibility into decision-making and reporting.',
        audience: [...AUD.managers, 'CSR/ESG programme owners'],
        focus: 'Operationalize social responsibility across the organization.',
    },
    {
        code: 'ISO 20400', level: 'LI', levelLabel: 'Lead Manager', track: TRACK.Sustainability,
        about: 'Sustainable procurement per ISO 20400: policy, category strategies, supplier engagement, and integrating sustainability into sourcing decisions.',
        audience: [...AUD.managers, 'Procurement and supply-chain leaders'],
        focus: 'Make procurement a lever for sustainability performance.',
    },
    // ── EBIOS (Information Security, risk method) ───────────────────────────
    {
        code: 'EBIOS', level: 'Manager', levelLabel: 'Risk Manager', track: TRACK.InfoSec,
        about: 'The EBIOS risk analysis method (widely adopted in French-speaking markets): workshops, threat scenarios, security baselines, and treatment roadmaps.',
        audience: [...AUD.managers, 'Risk analysts working with francophone institutions'],
        focus: 'Run structured EBIOS risk workshops that produce decisions.',
    },
];

/** Full catalogue, PECB-category order. sortOrder starts at 30. */
export const pecbCatalogue: SeedCourse[] = ROWS.map((r, i) => course(r, 30 + i));
