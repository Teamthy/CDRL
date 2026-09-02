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

function focusWhy(r: Row): string {
    return `${r.focus ?? 'Professional credentials open doors.'} Organizations that conform relentlessly win procurement, pass audits, and keep customers; professionals who carry the recognized credential get the mandate to lead that work. The certification exam closes the loop — you leave with evidence, not just attendance.`;
}

function buildDetails(r: Row): string {
    const L = LEVELS[r.level];
    const objectives = [...L.objectives, ...(r.extraObjectives ?? [])];
    const learnFallback = 'Build role-ready capability you can apply immediately at work.';
    return [
        // PECB canonical section flow
        `## What is ${r.code}?`,
        r.about,
        `## Why is ${r.code} important for you?`,
        focusWhy(r),
        `## Who should attend`,
        ...r.audience.map((a) => `- ${a}`),
        '## What you will learn',
        ...(objectives.length ? objectives.map((o) => `- ${o}`) : [`- ${learnFallback}`]),
        '## How do I get started with this training?',
        `Schedule: **${L.days}**. Delivered live (virtual or hybrid) by a certified Ykay Consulting Hub instructor with official PECB course materials. Sessions run throughout the year; corporate cohorts can be scheduled to order.`,
        '## Examination and certification',
        `The programme concludes with the official **PECB ${r.code} ${r.levelLabel}** certification exam. Passing earns the PECB Certified credential, issued directly by PECB and verifiable online. Exam format, retake policy, and credential maintenance all follow the current PECB Examination Rules and Policies.`,
        '**Next step:** [view all training events](https://pecb.com/en/events), then apply below — or contact our admissions team for corporate groups and bundle pricing.',
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

    // ── patch-29: full-catalogue gap closure (enumerated from PECB sitemap 2026-09-02) ──
    // Information Security
    {
        code: 'ISO/IEC 27002', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.InfoSec,
        about: 'The controls catalogue behind ISO/IEC 27001 Annex A: organizational, people, physical, and technological controls explained for practitioners.',
        audience: [...AUD.foundation],
        focus: 'Plain-language mastery of the Annex A control library.',
    },
    {
        code: 'ISO/IEC 27002', level: 'Manager', levelLabel: 'Manager', track: TRACK.InfoSec,
        about: 'Implement and manage ISO/IEC 27002 controls in a working ISMS: attribute-based control selection, implementation guidance, and effectiveness monitoring.',
        audience: [...AUD.managers],
        focus: 'Operate Annex A controls day to day with managerial accountability.',
    },
    {
        code: 'ISO/IEC 27005', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.InfoSec,
        about: 'Information security risk management fundamentals per ISO/IEC 27005: context, assessment, treatment, acceptance, and communication.',
        audience: [...AUD.foundation],
        focus: 'The risk process every ISMS decision runs through.',
    },
    {
        code: 'ISO/IEC 27034', level: 'Foundation', levelLabel: 'Application Security Foundation', track: TRACK.InfoSec,
        about: 'Application security management per ISO/IEC 27034: ONF/ANF concepts, application security in the lifecycle, and targeted controls.',
        audience: [...AUD.foundation, 'Software teams adopting secure development requirements'],
        focus: 'Structured application security for dev and procurement lifecycles.',
    },
    {
        code: 'ISO/IEC 27034', level: 'LI', levelLabel: 'Lead Application Security Implementer', track: TRACK.InfoSec,
        about: 'Implement an application security management system: ASC definition, organization normative frameworks, and lifecycle control integration per ISO/IEC 27034.',
        audience: [...AUD.implementers, 'AppSec leads and secure-SDLC owners'],
        focus: 'Stand up an auditable application security programme.',
    },
    {
        code: 'ISO/IEC 27034', level: 'LA', levelLabel: 'Lead Application Security Auditor', track: TRACK.InfoSec,
        about: 'Audit application security programmes against ISO/IEC 27034: evidence across the lifecycle, control adequacy, and defensible findings.',
        audience: [...AUD.auditors, 'Security assessors reviewing software development practices'],
        focus: 'Audit application security with ISO-grade method.',
    },
    {
        code: 'ISO/IEC 27400', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.InfoSec,
        about: 'IoT security and privacy per ISO/IEC 27400: device and ecosystem risks, controls, and lifecycle guidance for connected products.',
        audience: [...AUD.foundation, 'IoT product and platform teams'],
        focus: 'Secure the IoT estate from device to cloud.',
    },
    {
        code: 'ISO/IEC 27400', level: 'Manager', levelLabel: 'Lead Manager', track: TRACK.InfoSec,
        about: 'Govern IoT security programmes: risk management, controls across the device lifecycle, supply chain, and privacy-by-design duties.',
        audience: [...AUD.managers, 'IoT programme and product security leaders'],
        focus: 'Lead IoT security governance to an international standard.',
    },
    // Cybersecurity Management
    {
        code: 'NIS 2 Directive', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.CyberMgmt,
        about: 'Implement NIS 2 compliance end to end: scoping entities, risk-management measures, incident reporting duties, supply-chain security, and supervisory readiness.',
        audience: [...AUD.implementers, 'Compliance leads in EU essential/important entities'],
        focus: 'Build a defensible NIS 2 compliance programme.',
    },
    {
        code: 'DORA', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Continuity,
        about: 'DORA fundamentals for financial entities: ICT risk framework pillars, reporting duties, resilience testing tiers, and third-party register obligations.',
        audience: [...AUD.foundation, 'Financial-services staff with ICT risk duties'],
        focus: 'Grasp DORA\u2019s five pillars and what readiness demands.',
    },
    {
        code: 'NIST Cybersecurity', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.CyberMgmt,
        about: 'The NIST Cybersecurity Framework and key SP 800 publications: functions, tiers, profiles, and how US-style cybersecurity programmes are structured.',
        audience: [...AUD.foundation],
        focus: 'The CSF vocabulary global security teams share.',
    },
    {
        code: 'NIST Cybersecurity', level: 'Manager', levelLabel: 'Lead Implementer', track: TRACK.CyberMgmt,
        about: 'Implement a cybersecurity programme on the NIST CSF: current/target profiles, gap action plans, and continuous measurement.',
        audience: [...AUD.managers],
        focus: 'Run a NIST CSF programme from profile to proven improvement.',
    },
    {
        code: 'SOC 2', level: 'Manager', levelLabel: 'Lead Manager', track: TRACK.GRC,
        about: 'Trust Services Criteria and SOC 2 readiness: scoping, control mapping, evidence operation, and preparing for Type I/II examinations.',
        audience: [...AUD.managers, 'SaaS and service-organization compliance teams'],
        focus: 'Prepare a service organization for SOC 2.',
    },
    // Technical Cybersecurity
    {
        code: 'Advanced Penetration Tester', level: 'Professional', levelLabel: 'Certified Advanced Penetration Tester', track: TRACK.TechCyber,
        about: 'Beyond the basics of offensive security: advanced exploitation, evasion trade-craft, lateral movement discipline, and red-team reporting standards.',
        audience: [...AUD.specialists, 'Practising penetration testers leveling up'],
        focus: 'Practitioner-grade advanced offensive security.',
    },
    // Continuity
    {
        code: 'ISO 22301', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Continuity,
        about: 'Business continuity fundamentals per ISO 22301: BCMS structure, business impact analysis, and recovery strategy basics.',
        audience: [...AUD.foundation],
        focus: 'The foundation every resilience programme builds on.',
    },
    {
        code: 'Crisis Management', level: 'Manager', levelLabel: 'Lead Crisis Manager', track: TRACK.Continuity,
        about: 'Lead organizational crisis capability: crisis taxonomy, decision frameworks under pressure, communication, exercise design, and post-crisis learning.',
        audience: [...AUD.managers, 'Executives and resilience leaders owning crisis response'],
        focus: 'Command-ready crisis management capability.',
    },
    // Privacy
    {
        code: 'ISO/IEC 27701', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Privacy,
        about: 'Privacy information management fundamentals: PII controller/processor extensions to the ISMS and the privacy control set.',
        audience: [...AUD.foundation, 'Privacy-adjacent ISMS team members'],
        focus: 'How PIMS extends your ISMS for PII.',
    },
    {
        code: 'ISO/IEC 27701', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Privacy,
        about: 'Audit privacy information management systems: controller/processor roles, privacy evidence, and conformity judgment.',
        audience: [...AUD.auditors],
        focus: 'Audit PIMS implementations with authority.',
    },
    {
        code: 'ISO/IEC 27701', level: 'Manager', levelLabel: 'Transition', track: TRACK.Privacy,
        about: 'Transition an existing PIMS to the current ISO/IEC 27701 edition without losing certification continuity.',
        audience: [...AUD.managers],
        focus: 'Controlled PIMS transition to the current edition.',
    },
    {
        code: 'US Data Privacy', level: 'Professional', levelLabel: 'Certified US Data Privacy Officer', track: TRACK.Privacy,
        about: 'US state privacy regimes (CCPA/CPRA and peers): consumer rights, assessments, service-provider terms, and multi-state programme design.',
        audience: [...AUD.managers, 'Privacy officers with US market exposure'],
        focus: 'Operate a US multi-state privacy programme.',
    },
    // Artificial Intelligence
    {
        code: 'AI Security', level: 'Professional', levelLabel: 'Certified Artificial Intelligence Security Professional (CAISP)', track: TRACK.AI,
        about: 'Secure AI systems across the lifecycle: model and data threats (prompt injection, poisoning, extraction), AI/LLM security controls, monitoring, red teaming, and governance hooks.',
        audience: [...AUD.specialists, 'AI engineers, SOC analysts, and security architects touching AI systems'],
        focus: 'Security engineering for ML, LLM, and agentic systems.',
    },
    // Digital Transformation
    {
        code: 'Digital Transformation', level: 'Manager', levelLabel: 'Officer', track: TRACK.Digital,
        about: 'Operate as a Digital Transformation Officer: portfolio governance, capability and culture change, value tracking, and executive communication.',
        audience: [...AUD.managers, 'Transformation office members and sponsors'],
        focus: 'The operator credential for transformation programmes.',
    },
    // GRC
    {
        code: 'ISO 31000', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.GRC,
        about: 'Risk management principles, framework, and process per ISO 31000 — the universal risk vocabulary.',
        audience: [...AUD.foundation],
        focus: 'Risk management fundamentals on ISO 31000.',
    },
    {
        code: 'ISO 31000', level: 'Manager', levelLabel: 'Risk Manager', track: TRACK.GRC,
        about: 'Apply the ISO 31000 process professionally: context, criteria, assessment, treatment, recording, and communication cycles.',
        audience: [...AUD.managers],
        focus: 'Practitioner risk management under ISO 31000.',
    },
    {
        code: 'ISO 31000', level: 'Manager', levelLabel: 'Lead Risk Manager', track: TRACK.GRC,
        about: 'Design and lead an enterprise risk framework: integration into governance, risk appetite operation, and programme leadership per ISO 31000.',
        audience: [...AUD.managers, 'Heads of risk and ERM programme owners'],
        focus: 'Lead enterprise risk management, not just participate.',
    },
    {
        code: 'ISO 37000', level: 'Manager', levelLabel: 'Manager', track: TRACK.GRC,
        about: 'Governance of organizations per ISO 37000: purpose, principles, governing-body duties, and value-generating oversight.',
        audience: [...AUD.managers, 'Board secretaries and governance professionals'],
        focus: 'Organization-level governance on the ISO 37000 model.',
    },
    {
        code: 'ISO 37000', level: 'Manager', levelLabel: 'Lead Manager', track: TRACK.GRC,
        about: 'Lead governance transformation: climate of trust, strategy oversight, accountability structures, and governance effectiveness evaluation.',
        audience: [...AUD.managers, 'Senior governance advisors and board practitioners'],
        focus: 'The senior credential for organizational governance.',
    },
    {
        code: 'ISO 37001', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.GRC,
        about: 'Anti-bribery management fundamentals: ISO 37001 requirements, risk assessment, and control categories.',
        audience: [...AUD.foundation],
        focus: 'Anti-bribery fundamentals for compliance teams.',
    },
    {
        code: 'ISO 37001', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.GRC,
        about: 'Audit anti-bribery management systems: evidence, red-flag testing, and conformity reporting.',
        audience: [...AUD.auditors],
        focus: 'Audit ABMS implementations professionally.',
    },
    {
        code: 'ISO 37001', level: 'Manager', levelLabel: 'Transition (2025)', track: TRACK.GRC,
        about: 'Transition an existing anti-bribery management system to the 2025 edition of ISO 37001.',
        audience: [...AUD.managers],
        focus: 'Move your ABMS to ISO 37001:2025.',
    },
    {
        code: 'ISO 37301', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.GRC,
        about: 'Compliance management fundamentals: obligations registers, risk assessment, and the CMS structure per ISO 37301.',
        audience: [...AUD.foundation],
        focus: 'Compliance management grounded in ISO 37301.',
    },
    {
        code: 'ISO 37301', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.GRC,
        about: 'Audit compliance management systems against ISO 37301 with certification-grade method.',
        audience: [...AUD.auditors],
        focus: 'Audit CMS implementations with authority.',
    },
    {
        code: 'Management Systems Auditor', level: 'Professional', levelLabel: 'PECB Certified MS Auditor (CMSA)', track: TRACK.GRC,
        about: 'A cross-standard professional audit credential: auditing principles, evidence handling, and reporting across ISO management-system standards.',
        audience: [...AUD.auditors, 'Early-career auditors seeking a portable credential'],
        focus: 'Professional auditing across management-system standards.',
    },
    // Quality & Management
    {
        code: 'ISO 13485', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Health,
        about: 'Medical-device quality management per ISO 13485: regulatory harmonization, process documentation, and device-lifecycle controls.',
        audience: [...AUD.foundation, 'Medtech quality and regulatory staff'],
        focus: 'QMS for medical devices, ISO 13485 style.',
    },
    {
        code: 'ISO 13485', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Health,
        about: 'Implement a medical-device QMS: design controls, risk linkage (ISO 14971 context), supplier control, and audit readiness.',
        audience: [...AUD.implementers, 'Medtech operations and quality managers'],
        focus: 'Build a certifiable medical-device QMS.',
    },
    {
        code: 'ISO 13485', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Health,
        about: 'Audit medical-device quality systems against ISO 13485 and regulatory expectations.',
        audience: [...AUD.auditors, 'Notified-body-track auditors and supplier auditors'],
        focus: 'Audit medtech quality with professional method.',
    },
    {
        code: 'ISO 21001', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Quality,
        about: 'Educational organizations management systems per ISO 21001: learner-centred quality, and EOMS requirements.',
        audience: [...AUD.foundation, 'Academic administrators and education quality teams'],
        focus: 'Management systems for education providers.',
    },
    {
        code: 'ISO 21001', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Quality,
        about: 'Implement an educational organizations management system: curriculum governance, learner satisfaction, and performance evaluation.',
        audience: [...AUD.implementers, 'Registrars, deans, and education consultants'],
        focus: 'Run an EOMS that measurably serves learners.',
    },
    {
        code: 'ISO 21001', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Quality,
        about: 'Audit educational organizations management systems against ISO 21001.',
        audience: [...AUD.auditors],
        focus: 'Audit EOMS implementations professionally.',
    },
    {
        code: 'ISO 21502', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Quality,
        about: 'Project management fundamentals per ISO 21502: governance, lifecycle, and delivery vocabulary.',
        audience: [...AUD.foundation],
        focus: 'ISO-style project management basics.',
    },
    {
        code: 'ISO 22000', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Health,
        about: 'Food safety fundamentals: FSMS structure, PRPs, and hazard control basics per ISO 22000.',
        audience: [...AUD.foundation],
        focus: 'Food safety management fundamentals.',
    },
    {
        code: 'ISO 22000', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Health,
        about: 'Audit food safety management systems per ISO 22000: CCP evidence, PRP verification, and conformity reporting.',
        audience: [...AUD.auditors, 'Food industry auditors'],
        focus: 'Audit FSMS implementations with authority.',
    },
    {
        code: 'ISO/IEC 17025', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Quality,
        about: 'Laboratory competence fundamentals: impartiality, methods, traceability, and quality practice per ISO/IEC 17025.',
        audience: [...AUD.foundation, 'Lab analysts and quality assistants'],
        focus: 'Laboratory quality fundamentals.',
    },
    {
        code: 'ISO/IEC 17025', level: 'Manager', levelLabel: 'Lead Assessor', track: TRACK.Quality,
        about: 'Assess laboratories against ISO/IEC 17025: technical competence review, method validation evaluation, and assessment reporting.',
        audience: [...AUD.auditors, 'Accreditation-track assessors'],
        focus: 'Lead laboratory assessments to accreditation standard.',
    },
    {
        code: 'Lean Six Sigma', level: 'Professional', levelLabel: 'Yellow Belt', track: TRACK.Quality,
        about: 'Lean Six Sigma Yellow Belt: waste recognition, DMAIC basics, and supporting improvement projects.',
        audience: [...AUD.foundation, 'Team members joining improvement initiatives'],
        focus: 'Contribute to improvement projects with method.',
    },
    {
        code: 'Six Sigma', level: 'Foundation', levelLabel: 'Yellow Belt', track: TRACK.Quality,
        about: 'Six Sigma Yellow Belt: statistical-thinking basics and structured problem solving at team level.',
        audience: [...AUD.foundation],
        focus: 'Structured problem solving fundamentals.',
    },
    {
        code: 'ISO 55001', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Quality,
        about: 'Asset management fundamentals: value, lifecycle, and the AMS structure per ISO 55001.',
        audience: [...AUD.foundation],
        focus: 'Asset management fundamentals.',
    },
    {
        code: 'ISO 55001', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Quality,
        about: 'Audit asset management systems per ISO 55001: lifecycle evidence, decision frameworks, and improvement loops.',
        audience: [...AUD.auditors],
        focus: 'Audit AMS implementations professionally.',
    },
    {
        code: 'ISO 55001', level: 'Manager', levelLabel: 'Transition', track: TRACK.Quality,
        about: 'Transition an existing asset management system to the current ISO 55001 edition.',
        audience: [...AUD.managers],
        focus: 'Controlled AMS transition with certification continuity.',
    },
    {
        code: 'ISO 28000', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Quality,
        about: 'Supply chain security fundamentals: threats, controls, and SeMS structure per ISO 28000.',
        audience: [...AUD.foundation],
        focus: 'Supply chain security fundamentals.',
    },
    {
        code: 'ISO 28000', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Quality,
        about: 'Audit supply chain security management systems against ISO 28000.',
        audience: [...AUD.auditors],
        focus: 'Audit SeMS implementations with authority.',
    },
    {
        code: 'ISO 28000', level: 'Manager', levelLabel: 'Transition', track: TRACK.Quality,
        about: 'Transition an existing supply-chain security management system to the current ISO 28000 edition.',
        audience: [...AUD.managers],
        focus: 'Controlled SeMS transition.',
    },
    {
        code: 'ISO 56001', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Quality,
        about: 'Innovation management systems per ISO 56001: intent, portfolio, process, and culture requirements.',
        audience: [...AUD.foundation, 'Innovation and strategy teams'],
        focus: 'Manage innovation as a system, not a slogan.',
    },
    {
        code: 'ISO 56001', level: 'LI', levelLabel: 'Lead Implementer', track: TRACK.Quality,
        about: 'Implement an innovation management system: portfolio governance, opportunity-to-value process, and measurement.',
        audience: [...AUD.implementers, 'Innovation programme leaders'],
        focus: 'Build a repeatable innovation engine.',
    },
    {
        code: 'ISO 56001', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Quality,
        about: 'Audit innovation management systems against ISO 56001 with certification-grade method.',
        audience: [...AUD.auditors],
        focus: 'Audit IMS implementations professionally.',
    },
    // Health & Safety
    {
        code: 'ISO 45001', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Health,
        about: 'Audit occupational health and safety management systems per ISO 45001: hazard processes, worker participation evidence, and conformity judgment.',
        audience: [...AUD.auditors, 'HSE auditors'],
        focus: 'Audit OH&S management with authority.',
    },
    {
        code: 'ISO 18788', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Health,
        about: 'Private security operations fundamentals: ISO 18788 and the human-rights duty framework (Voluntary Principles context).',
        audience: [...AUD.foundation, 'Security service company staff'],
        focus: 'Professional standards for private security operations.',
    },
    {
        code: 'ISO 18788', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Health,
        about: 'Audit private security operations management systems against ISO 18788.',
        audience: [...AUD.auditors],
        focus: 'Audit SOMS implementations professionally.',
    },
    // Sustainability
    {
        code: 'ISO 14001', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Sustainability,
        about: 'Environmental management fundamentals: aspects, obligations, and improvement cycles per ISO 14001.',
        audience: [...AUD.foundation],
        focus: 'Environmental management fundamentals.',
    },
    {
        code: 'ISO 14001', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Sustainability,
        about: 'Audit environmental management systems: impact controls, compliance evidence, and performance evaluation.',
        audience: [...AUD.auditors],
        focus: 'Audit EMS implementations with authority.',
    },
    {
        code: 'ISO 14001', level: 'Manager', levelLabel: 'Transition (2026)', track: TRACK.Sustainability,
        about: 'Transition an existing environmental management system to the revised ISO 14001 edition.',
        audience: [...AUD.managers],
        focus: 'Move your EMS to the revised ISO 14001.',
    },
    {
        code: 'ISO 50001', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Sustainability,
        about: 'Energy management fundamentals: baselines, performance indicators, and the EnMS structure per ISO 50001.',
        audience: [...AUD.foundation],
        focus: 'Energy management fundamentals.',
    },
    {
        code: 'ISO 50001', level: 'LA', levelLabel: 'Lead Auditor', track: TRACK.Sustainability,
        about: 'Audit energy management systems: energy-review evidence, savings verification, and conformity reporting.',
        audience: [...AUD.auditors],
        focus: 'Audit EnMS implementations with authority.',
    },
    {
        code: 'ISO 26000', level: 'Foundation', levelLabel: 'Foundation', track: TRACK.Sustainability,
        about: 'Social responsibility fundamentals: the seven core subjects and stakeholder practice per ISO 26000.',
        audience: [...AUD.foundation, 'CSR/ESG team members'],
        focus: 'Social responsibility fundamentals.',
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
