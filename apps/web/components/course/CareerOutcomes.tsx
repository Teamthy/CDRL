import { TrendingUp, Users, Briefcase } from 'lucide-react';
import type { Course } from '../../lib/content';

type Props = { course: Course };

const ROLE_BY_TRACK: Record<string, string[]> = {
    'Information Security': ['Information Security Officer', 'ISMS Lead', 'Security Consultant'],
    'Cybersecurity Management': ['Cybersecurity Manager', 'Security Governance Lead', 'CISO track'],
    'Technical Cybersecurity': ['SOC Analyst', 'Penetration Tester', 'Forensics/Response Specialist'],
    'Continuity & Resilience': ['BCM Coordinator', 'Resilience Lead', 'DR Manager'],
    'Privacy & Data Protection': ['Data Protection Officer', 'Privacy Analyst', 'Compliance Officer'],
    'Artificial Intelligence': ['AI Governance Lead', 'AI Risk Manager', 'ML Security Specialist'],
    'Digital Transformation': ['Digital Transformation Officer', 'Program Manager', 'Change Lead'],
    'Governance, Risk & Compliance': ['GRC Manager', 'Chief Risk Officer track', 'Compliance Lead'],
    'Quality & Management': ['Quality Manager', 'Process Improvement Lead', 'Operations Excellence'],
    'Health & Safety': ['HSE Manager', 'Safety Systems Auditor', 'Compliance Auditor'],
    Sustainability: ['Sustainability Manager', 'ESG Analyst', 'Environmental Systems Lead'],
    Cybersecurity: ['Cybersecurity Analyst', 'Security Engineer', 'Incident Response Lead'],
    GRC: ['GRC Analyst', 'Internal Auditor', 'Risk Officer'],
    'AI Governance': ['AI Governance Officer', 'AI Policy Analyst', 'Responsible AI Lead'],
    'Executive Leadership': ['Executive risk sponsor', 'Board advisory roles', 'Digital Programme Sponsor'],
};

/** PECB-style "career development" slot on course pages (elective #7). */
export default function CareerOutcomes({ course }: Props) {
    const roles = ROLE_BY_TRACK[course.track] ?? ROLE_BY_TRACK['Information Security'];
    return (
        <section className="career-outcomes" aria-label="Career outcomes">
            <div className="wrap outcomes-grid">
                <div>
                    <span className="kicker">CAREER DEVELOPMENT</span>
                    <h2>Where this takes you</h2>
                    <p>
                        Certified-alumni frequently move into roles such as:
                        {roles.map((r) => (
                            <span key={r} className="role-pill">
                                {r}
                            </span>
                        ))}
                    </p>
                </div>
                <div className="outcome-cards">
                    <div className="outcome-card">
                        <TrendingUp aria-hidden="true" />
                        <strong>Progression</strong>
                        <span>{course.level} level → senior practitioner tracks across your organization</span>
                    </div>
                    <div className="outcome-card">
                        <Users aria-hidden="true" />
                        <strong>Community</strong>
                        <span>Join a pan-African network of certified professionals</span>
                    </div>
                    <div className="outcome-card">
                        <Briefcase aria-hidden="true" />
                        <strong>Verified credential</strong>
                        <span>
                            {course.subtitle.includes('PECB')
                                ? 'Certification issued by PECB, verifiable by employers online'
                                : 'Completion credential retained in your CDRL learner record'}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
