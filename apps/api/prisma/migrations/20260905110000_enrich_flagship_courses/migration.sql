-- Patch-53: enrich the 22 flagship PECB course pages (overview + details).
-- Idempotent: re-running reapplies the same values harmlessly.
-- Details follow the canonical renderer format (## sections, blank-line
-- paragraphs, "-" bullets) so CourseBody/CourseToc render them nively.
-- NOTE: replaces the generic synthesized body with family-specific content.

UPDATE "Course" SET "overview" = 'Official PECB ISO/IEC 27001 Foundation training in Nigeria — learn the concepts of information security management systems (ISMS) and earn the PECB credential.', "details" = '## What is ISO/IEC 27001 Foundation?

ISO/IEC 27001 is the international standard for information security management systems (ISMS). It defines how an organisation scopes its security, assesses risk, selects controls, and proves continual improvement. This Foundation course gives you the standard''s structure, its core concepts, and the vocabulary the entire information security profession runs on.

## Why it matters in Nigeria

Banks, fintechs, telcos and their suppliers face security due diligence from regulators, international partners and enterprise customers. Understanding ISO/IEC 27001 at Foundation level means you can participate in — and speak the language of — an ISMS programme, whether you support it, audit it or manage teams around it.

## Who should attend

- Professionals moving into security, IT, audit or compliance roles
- Managers who need the vocabulary to oversee a security programme
- Staff joining an organisation that runs (or is adopting) an ISMS
- Anyone preparing for later Lead Implementer or Lead Auditor training

## What you will learn

- The ISO 27000 family and the structure of ISO/IEC 27001
- Core concepts: assets, threats, vulnerabilities, risk and controls
- The components of an ISMS: policy, objectives, processes and records
- The role of leadership commitment, internal audit and management review
- How organisational certification works, from audit to certificate

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO/IEC 27001 Foundation** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-iec-27001-foundation';

UPDATE "Course" SET "overview" = 'Official PECB ISO/IEC 27001 Lead Implementer training in Nigeria — learn to build, operate and certify an information security management system (ISMS).', "details" = '## What is ISO/IEC 27001 Lead Implementer?

ISO/IEC 27001 is the international standard for information security management systems. This Lead Implementer course trains the people who build the system: it walks the full implementation lifecycle from scoping and risk assessment through controls, documentation, operation and certification readiness.

## Why it matters in Nigeria

Organisations across Nigeria adopt ISO/IEC 27001 to win tenders, pass vendor due diligence and satisfy regulators — and the constraint is almost always people who can lead the implementation. A Lead Implementer credential is the evidence that you can take an organisation from ambition to certifiable ISMS.

## Who should attend

- Information security, risk and compliance officers leading ISMS adoption
- CISOs and security managers accountable for certification
- Consultants who implement ISMS programmes for clients
- Practitioners consolidating experience into a recognised credential

## What you will learn

- Initiating the ISMS: scope, context, leadership and policy
- Running a structured information security risk assessment
- Building the risk treatment plan and Statement of Applicability
- Selecting and implementing Annex A controls in real environments
- Policies, procedures, awareness and operational discipline
- Monitoring, measurement, internal audit and continual improvement
- Preparing the organisation for the certification audit

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO/IEC 27001 Lead Implementer** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-iec-27001-lead-implementer';

UPDATE "Course" SET "overview" = 'Official PECB ISO/IEC 27001 Lead Auditor training in Nigeria — learn to plan, conduct and report ISMS audits and earn the PECB credential.', "details" = '## What is ISO/IEC 27001 Lead Auditor?

ISO/IEC 27001 is the international standard for information security management systems. This Lead Auditor course trains the people who verify the system: audit principles and programmes, planning and conducting an ISMS audit, gathering evidence, reporting findings and following up corrective action.

## Why it matters in Nigeria

Every certified ISMS depends on auditors — internal auditors keeping the system honest, and external auditors attesting it. In Nigeria the demand spans banks, fintechs, telcos and the consultancies that serve them; the Lead Auditor credential is the recognised entry to that work.

## Who should attend

- Internal auditors and assurance staff
- Compliance and risk professionals with audit responsibility
- Consultants offering ISMS audit and gap assessment
- Practitioners building a career in certification auditing

## What you will learn

- Audit principles, audit programmes and auditor competence in line with ISO 19011 guidance
- Initiating and planning an ISMS audit: scope, criteria, checklists
- Conducting the audit: interviews, sampling and objective evidence
- Evaluating conformity, classifying findings and writing the audit report
- Corrective action, follow-up and closing nonconformities
- Leading an audit team and managing audit communication

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO/IEC 27001 Lead Auditor** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-iec-27001-lead-auditor';

UPDATE "Course" SET "overview" = 'Official PECB ISO/IEC 42001 Foundation training in Nigeria — learn the concepts of AI management systems (AIMS) and earn the PECB credential.', "details" = '## What is ISO/IEC 42001 Foundation?

ISO/IEC 42001 is the international standard for artificial intelligence management systems (AIMS) — the governance framework organisations use to adopt AI responsibly. This Foundation course covers what an AIMS is, the AI lifecycle concepts behind it, and the structure and vocabulary of the standard.

## Why it matters in Nigeria

Nigerian organisations are deploying AI in credit, service and operations faster than they are governing it. Foundation-level knowledge of ISO/IEC 42001 puts you ahead of almost everyone in the market: able to explain responsible AI governance, and ready to support or oversee an AIMS programme.

## Who should attend

- Managers and executives whose teams adopt or use AI systems
- Risk, compliance and governance professionals extending their scope to AI
- Product and technology managers building AI features
- Anyone preparing for Lead Implementer or Lead Auditor training

## What you will learn

- What an AI management system is and why governance of AI matters
- AI lifecycle concepts, roles and terminology
- The structure and requirements of ISO/IEC 42001
- The basics of AI impact assessment
- The role of leadership, oversight and continual improvement in an AIMS

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO/IEC 42001 Foundation** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-iec-42001-foundation';

UPDATE "Course" SET "overview" = 'Official PECB ISO/IEC 42001 Lead Implementer training in Nigeria — learn to build and operate an AI management system (AIMS) aligned to ISO/IEC 42001.', "details" = '## What is ISO/IEC 42001 Lead Implementer?

ISO/IEC 42001 is the international standard for artificial intelligence management systems. This Lead Implementer course trains the people who build the governance: scoping the AIMS, running AI impact and risk assessments, implementing controls over data, models and operations, and preparing the organisation for certification.

## Why it matters in Nigeria

As AI adoption accelerates across Nigerian financial services, telecoms and the public sector, organisations need people who can turn responsible-AI intent into an operating management system. Lead Implementer is the credential for that person — and holders are still rare.

## Who should attend

- Risk, compliance and governance officers extending frameworks to AI
- CIOs, CTOs and heads of AI or data leading AI programmes
- Information security and data protection professionals whose scope now includes AI
- Consultants advising organisations on responsible AI adoption

## What you will learn

- Scoping the AIMS: context, stakeholders and AI system inventory
- AI risk management and AI impact assessment methods
- Controls for data, models, development and operations
- Policies, roles, documentation and oversight mechanisms
- Monitoring, measurement and continual improvement of the AIMS
- Preparing the organisation for AIMS certification

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO/IEC 42001 Lead Implementer** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-iec-42001-lead-implementer';

UPDATE "Course" SET "overview" = 'Official PECB ISO/IEC 42001 Lead Auditor training in Nigeria — learn to audit AI management systems against ISO/IEC 42001 and earn the PECB credential.', "details" = '## What is ISO/IEC 42001 Lead Auditor?

ISO/IEC 42001 is the international standard for artificial intelligence management systems. This Lead Auditor course trains the people who assure AI governance: planning and conducting audits against the standard, gathering evidence on controls that are often procedural rather than technical, and reporting findings management can act on.

## Why it matters in Nigeria

Boards and regulators are beginning to ask not whether an organisation uses AI, but whether it governs it. Auditors who can assess an AIMS against ISO/IEC 42001 are among the scarcest practitioners in the market today — in Nigeria and internationally.

## Who should attend

- Internal auditors extending their remit to AI governance
- Assurance and compliance professionals
- Information security and data protection auditors
- Consultants offering AIMS audit and readiness reviews

## What you will learn

- Audit principles and programmes applied to an AIMS
- Planning an ISO/IEC 42001 audit: scope, criteria and checkpoints
- Auditing AI impact assessments and risk treatment
- Gathering objective evidence on AI governance controls
- Findings, reports, corrective action and follow-up

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO/IEC 42001 Lead Auditor** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-iec-42001-lead-auditor';

UPDATE "Course" SET "overview" = 'Official PECB ISO 9001 Foundation training in Nigeria — learn the concepts of quality management systems (QMS) and earn the PECB credential.', "details" = '## What is ISO 9001 Foundation?

ISO 9001 is the world''s most established quality management standard — the framework organisations use to deliver consistent products and services, satisfy customers and improve continuously. This Foundation course covers the quality concepts, the process approach and the structure of the standard.

## Why it matters in Nigeria

ISO 9001 certification opens tenders. From manufacturing to public-sector suppliers, Nigerian organisations are asked for quality management evidence — and that evidence starts with people who understand how a QMS works. Foundation level gives managers and teams the shared language to run one.

## Who should attend

- Operations, production and service delivery managers
- Quality team members and new quality officers
- Internal staff supporting a QMS or preparing for certification
- Anyone building toward Lead Implementer or Lead Auditor training

## What you will learn

- Quality management concepts and the seven quality management principles
- The process approach and the Plan-Do-Check-Act cycle
- The structure and requirements of ISO 9001
- Documented information and its role in the QMS
- How internal audit and management review keep the system alive

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO 9001 Foundation** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-9001-foundation';

UPDATE "Course" SET "overview" = 'Official PECB ISO 9001 Lead Implementer training in Nigeria — learn to build and certify a quality management system (QMS) and earn the PECB credential.', "details" = '## What is ISO 9001 Lead Implementer?

ISO 9001 is the world''s most established quality management standard. This Lead Implementer course trains the people who build the system: scoping the QMS, mapping processes, embedding risk-based thinking, and operating the monitor-measure-improve cycle that keeps certification genuine rather than ceremonial.

## Why it matters in Nigeria

Nigerian organisations pursue ISO 9001 to qualify for tenders, retain enterprise customers and fix the cost of poor quality. The constraint is champions who can lead implementation — a Lead Implementer credential marks you as the person who can take an organisation from intention to certificate.

## Who should attend

- Quality managers and officers leading QMS implementation
- Operations and production leaders accountable for consistency
- Consultants implementing quality systems for clients
- Professionals consolidating quality experience into a credential

## What you will learn

- Scoping the QMS and mapping core processes
- Risk-based thinking and its practical application
- Quality policy, objectives and documented information
- Monitoring, measurement, analysis and evaluation
- Internal audit, management review and continual improvement
- Preparing the organisation for certification audit

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO 9001 Lead Implementer** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-9001-lead-implementer';

UPDATE "Course" SET "overview" = 'Official PECB ISO 9001 Lead Auditor training in Nigeria — learn to plan, conduct and report quality management system audits and earn the PECB credential.', "details" = '## What is ISO 9001 Lead Auditor?

ISO 9001 is the world''s most established quality management standard. This Lead Auditor course trains the people who verify it: audit principles and programmes, planning and conducting QMS audits, evaluating conformity against the standard''s requirements, and reporting findings that drive improvement.

## Why it matters in Nigeria

Every certified quality system depends on auditors. Nigerian suppliers face second-party audits from customers, certification bodies need local auditors, and strong internal audit is what keeps a QMS honest between surveillance visits. The Lead Auditor credential is the recognised qualification for all three.

## Who should attend

- Internal auditors and quality assurance staff
- Certification-body and second-party auditors (or those pursuing that path)
- Quality managers who must run internal audit programmes
- Consultants offering QMS audit and gap assessment

## What you will learn

- Audit principles, programmes and auditor competence
- Initiating and planning a QMS audit
- Conducting the audit: sampling, interviews and objective evidence
- Evaluating conformity and classifying findings
- Audit reports, corrective action and follow-up
- Leading an audit team professionally

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO 9001 Lead Auditor** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-9001-lead-auditor';

UPDATE "Course" SET "overview" = 'Official PECB ISO 22301 Foundation training in Nigeria — learn the concepts of business continuity management systems (BCMS) and earn the PECB credential.', "details" = '## What is ISO 22301 Foundation?

ISO 22301 is the international standard for business continuity management systems — how an organisation identifies its critical functions, sets recovery objectives, and plans to keep operating through disruption. This Foundation course covers the discipline''s concepts and the structure of the standard.

## Why it matters in Nigeria

Power cuts, fibre damage, cyber incidents, supplier failure: in Nigeria, disruption is a when, not an if. Regulators increasingly expect documented, exercised continuity arrangements — and that expectation lands on people who understand what a real BCMS involves. Foundation level builds that understanding.

## Who should attend

- Operations, IT and facilities managers who own critical functions
- Risk and compliance staff extending into operational resilience
- Team members supporting a continuity programme
- Anyone preparing for Lead Implementer or Lead Auditor training

## What you will learn

- Business continuity concepts and terminology
- The structure and requirements of ISO 22301
- What a business impact analysis is and what it produces
- The role of continuity strategies, plans and exercises
- How certification of a BCMS works

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO 22301 Foundation** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-22301-foundation';

UPDATE "Course" SET "overview" = 'Official PECB ISO 22301 Lead Implementer training in Nigeria — learn to build and operate a business continuity management system (BCMS) and earn the PECB credential.', "details" = '## What is ISO 22301 Lead Implementer?

ISO 22301 is the international standard for business continuity management systems. This Lead Implementer course trains the people who build the capability: running the business impact analysis, setting recovery objectives, designing continuity strategies and plans, and embedding exercising so the system would actually work on a bad day.

## Why it matters in Nigeria

Financial regulators, enterprise customers and international partners increasingly ask Nigerian organisations to prove operational resilience — not with documents, but with exercised plans. A Lead Implementer credential marks the professional who can take an organisation from an untested binder to a living BCMS.

## Who should attend

- Business continuity and operational risk leads
- Operations, IT and technology managers accountable for recovery
- Risk and compliance officers building resilience programmes
- Consultants implementing BCMS programmes for clients

## What you will learn

- Scoping the BCMS and winning leadership commitment
- Running a business impact analysis and setting RTOs and RPOs
- Designing continuity strategies and building response plans
- Embedding: awareness, training and a realistic exercise programme
- Monitoring, review and continual improvement
- Preparing the organisation for BCMS certification

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO 22301 Lead Implementer** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-22301-lead-implementer';

UPDATE "Course" SET "overview" = 'Official PECB ISO 22301 Lead Auditor training in Nigeria — learn to audit business continuity management systems and earn the PECB credential.', "details" = '## What is ISO 22301 Lead Auditor?

ISO 22301 is the international standard for business continuity management systems. This Lead Auditor course trains the people who verify continuity capability: planning and conducting BCMS audits, testing whether plans and exercises are real, gathering evidence, and reporting findings that strengthen resilience.

## Why it matters in Nigeria

A continuity plan that has never been exercised is a hope, not a control. Auditors who can distinguish the two are what regulators, certification bodies and boards rely on. In Nigeria''s financial sector and among its enterprise suppliers, that audit competence is in short supply and steady demand.

## Who should attend

- Internal auditors taking on operational resilience scope
- Assurance and risk professionals
- Certification-body auditors (or those pursuing that path)
- Consultants offering BCMS audit and readiness reviews

## What you will learn

- Audit principles applied to a BCMS
- Planning a business continuity audit: scope, criteria, checkpoints
- Auditing BIAs, strategies, plans and exercise records
- Gathering objective evidence on preparedness
- Findings, reports, corrective action and follow-up

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB ISO 22301 Lead Auditor** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'iso-22301-lead-auditor';

UPDATE "Course" SET "overview" = 'Official PECB GDPR Foundation training in Nigeria — learn the core concepts of data protection law and practice, and earn the PECB credential.', "details" = '## What is GDPR Foundation?

The EU General Data Protection Regulation (GDPR) is the global benchmark for data protection — the reference point behind privacy laws worldwide, including Nigeria''s own data protection framework. This Foundation course covers the regulation''s concepts, obligations and vocabulary.

## Why it matters in Nigeria

Nigerian organisations that serve EU customers, work with international partners, or process personal data at scale increasingly meet GDPR-level expectations. Understanding the regulation is now baseline knowledge for legal, compliance, IT and security roles — and the foundation for DPO-level work.

## Who should attend

- Legal, compliance, risk and audit professionals
- IT and security staff who handle personal data
- HR, marketing and operations teams that process customer data
- Anyone preparing for the Certified Data Protection Officer path

## What you will learn

- Data protection concepts, roles and terminology
- Controllers, processors and the allocation of responsibility
- Lawful bases for processing and the rights of data subjects
- Data protection by design and by default
- Accountability, records and breach notification basics

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB GDPR Foundation** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'gdpr-foundation';

UPDATE "Course" SET "overview" = 'Official PECB Certified Data Protection Officer (CDPO) training in Nigeria — learn to hold statutory responsibility for data protection compliance.', "details" = '## What is GDPR Certified Data Protection Officer (CDPO)?

The PECB Certified Data Protection Officer programme prepares professionals to carry formal responsibility for data protection compliance — advising the organisation, monitoring compliance, managing data protection impact assessments, and acting as the contact point for data subjects and supervisory authorities.

## Why it matters in Nigeria

Data protection regulation has arrived in force: the Nigeria Data Protection Act imposes real obligations and penalties, and GDPR extends to any Nigerian organisation handling EU residents'' data. Every organisation of consequence needs someone competent in the DPO role — and credible DPOs are scarce.

## Who should attend

- Current and aspiring Data Protection Officers
- Legal and compliance leads with privacy responsibility
- Information governance and records managers
- Consultants offering privacy programme services

## What you will learn

- The DPO role: tasks, position and independence
- Building and running a privacy compliance programme
- Data protection impact assessments in practice
- Handling data subject rights requests
- Breach response and notification duties
- Working with processors, vendors and cross-border transfers
- Acting as contact point for supervisory authorities

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB GDPR Certified Data Protection Officer (CDPO)** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'gdpr-data-protection-officer-cdpo';

UPDATE "Course" SET "overview" = 'Official PECB DORA Foundation training in Nigeria — learn the concepts of the EU Digital Operational Resilience Act and earn the PECB credential.', "details" = '## What is DORA Foundation?

DORA — the EU Digital Operational Resilience Act — sets comprehensive ICT risk, incident and resilience expectations for financial entities. This Foundation course covers what the regulation requires and how its five pillars fit together.

## Why it matters in Nigeria

DORA reaches beyond the EU: Nigerian financial groups, fintechs and service providers with EU exposure are meeting its expectations through counterparties and group policy — and its framework is becoming the reference for operational resilience everywhere. Understanding it is a fast-growing differentiator for risk and technology professionals.

## Who should attend

- Risk, compliance and IT staff at financial institutions
- Fintech and payment-services professionals
- Service providers to regulated financial entities
- Anyone preparing for the Lead Manager level

## What you will learn

- DORA''s scope, timeline and who it affects
- The five pillars: ICT risk, incident reporting, resilience testing, third-party risk and information sharing
- ICT risk management basics in a financial context
- Major incident classification and reporting duties
- How supervisory expectations are changing operational resilience

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB DORA Foundation** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'dora-foundation';

UPDATE "Course" SET "overview" = 'Official PECB DORA Lead Manager training in Nigeria — learn to build and lead a digital operational resilience programme under DORA.', "details" = '## What is DORA Lead Manager?

The PECB DORA Lead Manager programme trains the professionals who build operational resilience programmes: ICT risk management frameworks, incident management and reporting pipelines, resilience testing regimes and third-party risk oversight — aligned to the EU Digital Operational Resilience Act.

## Why it matters in Nigeria

For financial institutions and their ecosystems, operational resilience has moved from aspiration to supervision. Organisations need managers who can stand up the full DORA-aligned capability — and providers who can evidence it win the trust of regulated clients. That capability is exactly what this course builds.

## Who should attend

- Operational risk and resilience leads at financial institutions
- CIOs, CISOs and technology risk managers
- Third-party and vendor risk managers
- Consultants advising financial-sector clients on resilience

## What you will learn

- Designing an ICT risk management framework
- Building incident classification, management and regulatory reporting
- Running resilience testing programmes, including threat-led testing
- Managing third-party and concentration risk, including register of information
- Governance, oversight and information-sharing arrangements
- Sustaining the programme through metrics and review

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB DORA Lead Manager** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'dora-lead-manager';

UPDATE "Course" SET "overview" = 'Official PECB Cybersecurity Management Foundation training in Nigeria — learn core cybersecurity concepts and how security is governed, and earn the PECB credential.', "details" = '## What is Cybersecurity Management Foundation?

Cybersecurity Management Foundation is the entry point to PECB''s management track: the threat landscape, core security concepts, and how organisations govern security — pairing technical grounding with the management perspective that careers in security eventually demand.

## Why it matters in Nigeria

Nigerian organisations are hiring for security roles faster than the talent pool is growing — and the roles increasingly blur technical and managerial. A management-oriented foundation lets you speak credibly to both sides: what the threats are, and how organisations organise to handle them.

## Who should attend

- Early-career IT professionals moving toward security
- Managers coordinating security within broader remits
- Governance, risk and compliance entrants
- Anyone building toward Lead Cybersecurity Manager

## What you will learn

- The current threat landscape and attacker motives
- Core concepts: confidentiality, integrity, availability and defence in depth
- Security controls, from technical to organisational
- Roles, responsibilities and security governance
- How frameworks and standards structure a security programme
- Security awareness and the human layer

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB Cybersecurity Management Foundation** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'cybersecurity-management-foundation';

UPDATE "Course" SET "overview" = 'Official PECB Lead Cybersecurity Manager training in Nigeria — learn to build, lead and report a cybersecurity programme and earn the PECB credential.', "details" = '## What is Lead Cybersecurity Manager?

The PECB Lead Cybersecurity Manager programme trains the people who run security programmes: setting strategy and policy, managing cyber risk, standing up controls and incident capability, and reporting to boards and regulators in language they can act on.

## Why it matters in Nigeria

Every sizable Nigerian organisation now owns cyber risk at board level — and the shortage is not tooling but leadership: managers who can convert threat into programme, programme into metrics, and metrics into board confidence. The Lead Cybersecurity Manager credential targets exactly that gap.

## Who should attend

- CISOs and security managers running or stepping into leadership
- IT directors accountable for security outcomes
- Risk and resilience managers consolidating cyber responsibility
- Consultants leading security programmes for clients

## What you will learn

- Building cybersecurity strategy, policy and governance
- Cyber risk management and control frameworks
- Standing up incident response and crisis management capability
- Supply chain and third-party security oversight
- Security metrics, reporting and board communication
- Leading security teams and embedding awareness culture

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB Lead Cybersecurity Manager** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'cybersecurity-management-lead-cybersecurity-manager';

UPDATE "Course" SET "overview" = 'Official PECB Lead AI Manager training in Nigeria — learn to manage AI initiatives and teams responsibly, and earn the PECB credential.', "details" = '## What is Lead AI Manager?

The PECB Lead AI Manager programme trains managers to lead AI initiatives responsibly: understanding what AI can and cannot do, governing AI projects through their lifecycle, managing the risks and ethics of automated systems, and delivering AI value without exporting unmanaged risk to the organisation.

## Why it matters in Nigeria

AI projects in Nigerian organisations rarely fail on models — they fail on management: unclear ownership, unassessed risk, unmanaged expectations. Organisations need managers fluent in both AI practice and governance. That dual fluency is precisely what this credential certifies.

## Who should attend

- Managers leading AI or data initiatives
- Product and operations managers whose teams use AI
- Executives sponsoring AI adoption
- Governance and risk partners to AI programmes

## What you will learn

- AI concepts, capabilities and realistic limitations
- Managing the AI lifecycle from use case to operation
- Risk, ethics and impact considerations in AI initiatives
- Roles, oversight and accountability structures
- Delivering and measuring AI value responsibly

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB Lead AI Manager** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'ai-manager-lead-ai-manager';

UPDATE "Course" SET "overview" = 'Official PECB Certified Artificial Intelligence Professional (CAIP) training in Nigeria — build verified, practical AI competence and earn the PECB credential.', "details" = '## What is Certified Artificial Intelligence Professional (CAIP)?

The PECB Certified Artificial Intelligence Professional (CAIP) programme builds working AI competence for professionals: the concepts behind modern AI, how AI systems are built and used, and how to apply them responsibly in real organisational settings.

## Why it matters in Nigeria

AI skills are becoming baseline professional literacy — the CAIP credential verifies you actually have them. For Nigerian professionals it is a practical differentiator: evidence of structured, assessed AI understanding rather than tool familiarity alone.

## Who should attend

- Professionals incorporating AI into their work
- Analysts, specialists and team leads in AI-adopting organisations
- Consultants and advisors touching AI projects
- Anyone building a verified foundation for advanced AI credentials

## What you will learn

- Core AI concepts, techniques and application patterns
- How AI systems learn, and what makes them fail
- Use-case identification and responsible application
- Data, tooling and workflow fundamentals
- Ethical and risk awareness in day-to-day AI use

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB Certified Artificial Intelligence Professional (CAIP)** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'ai-professional-certified-artificial-intelligence-professional-caip';

UPDATE "Course" SET "overview" = 'Official PECB Lead AI Risk Manager training in Nigeria — learn to identify, assess and control AI risk, and earn the PECB credential.', "details" = '## What is Lead AI Risk Manager?

The PECB Lead AI Risk Manager programme trains specialists in AI risk: identifying how AI systems create exposure, assessing and prioritising that risk, designing controls across the AI lifecycle, and integrating AI risk into enterprise risk management.

## Why it matters in Nigeria

As AI spreads through Nigerian financial services, telecoms and the public sector, someone must own its risks — and generic risk training does not cover model failure, data poisoning, bias or opacity. AI risk management is emerging as a distinct, in-demand discipline; this credential certifies it.

## Who should attend

- Risk managers extending ERM frameworks to AI
- Compliance and governance officers with AI in scope
- Internal auditors assessing AI controls
- Security professionals covering AI systems

## What you will learn

- Mapping AI risk categories across the lifecycle
- AI risk assessment methodologies
- Controls for data, models, deployment and monitoring
- Bias, explainability and performance risk
- Integrating AI risk into enterprise risk management
- Ongoing monitoring and assurance of AI systems

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB Lead AI Risk Manager** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'ai-risk-management-lead-ai-risk-manager';

UPDATE "Course" SET "overview" = 'Official PECB Certified Artificial Intelligence Security Professional (CAISP) training in Nigeria — learn to secure AI systems end to end, and earn the PECB credential.', "details" = '## What is Certified Artificial Intelligence Security Professional (CAISP)?

The PECB Certified Artificial Intelligence Security Professional (CAISP) programme trains professionals to secure AI systems: the threats to models, data and pipelines, the controls that mitigate them, and secure practices for developing and deploying AI in production.

## Why it matters in Nigeria

AI expands the attack surface — adversarial inputs, model theft, data poisoning, supply-chain exposure in ML pipelines — and most security teams were trained before these threats existed. Nigerian organisations deploying AI need security professionals who speak model as well as network. CAISP certifies that overlap.

## Who should attend

- Security engineers and analysts covering AI systems
- DevOps and ML engineers responsible for secure deployment
- Security architects designing AI platforms
- Auditors and assessors reviewing AI security controls

## What you will learn

- Threats to AI: adversarial manipulation, data poisoning, model attacks
- Securing the ML pipeline from data to deployment
- AI-specific security controls and testing
- Secure deployment, monitoring and incident handling for AI
- Integrating AI security into organisational security programmes

## How do I get started with this training?

This programme is **delivered live virtually or in person, by arrangement** with official PECB course materials. Scheduled dates are announced on our events page; **corporate cohorts can be arranged in-house** around your calendar — contact our admissions team for group and bundle pricing.

## Examination and certification

The programme concludes with the official **PECB Certified Artificial Intelligence Security Professional (CAISP)** certification exam. Passing earns a PECB Certified credential, issued and verifiable by PECB. Exam format, retake policy and credential maintenance follow the current PECB Examination Rules and Policies — confirmed in full at registration.

**Next step:** enrol on this page — or contact our admissions team for corporate groups, in-house scheduling and bundle pricing.', "updatedAt" = NOW() WHERE "slug" = 'ai-security-certified-artificial-intelligence-security-professional-caisp';
