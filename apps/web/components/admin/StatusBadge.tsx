import { CheckCircle2, CircleDashed, Clock4, Mail, XCircle } from 'lucide-react';

const MAP: Record<string, { label: string; tone: string; icon: typeof Clock4 }> = {
    new: { label: 'New', tone: 'amber', icon: CircleDashed },
    contacted: { label: 'Contacted', tone: 'sky', icon: Mail },
    reviewing: { label: 'Reviewing', tone: 'sky', icon: Clock4 },
    admitted: { label: 'Admitted', tone: 'violet', icon: CheckCircle2 },
    enrolled: { label: 'Enrolled', tone: 'green', icon: CheckCircle2 },
    closed: { label: 'Closed', tone: 'slate', icon: XCircle },
};

/** Coloured status pill (industry-standard) for admin lists. */
export default function StatusBadge({ status }: { status: string }) {
    const def = MAP[status] ?? { label: status, tone: 'slate', icon: CircleDashed };
    const Icon = def.icon;
    return (
        <span className={`status-badge st-${def.tone}`}>
            <Icon aria-hidden="true" />
            {def.label}
        </span>
    );
}
