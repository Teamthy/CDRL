import type { LucideIcon } from 'lucide-react';

type Props = {
    icon: LucideIcon;
    title: string;
    hint: string;
};

/** Reusable console empty-state: soft radial artwork + centred copy. */
export default function EmptyArt({ icon: Icon, title, hint }: Props) {
    return (
        <div className="admin-empty" role="status">
            <div className="admin-empty-art" aria-hidden="true">
                <svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="emptyGlow" cx="50%" cy="45%" r="60%">
                            <stop offset="0%" stopColor="#70F250" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#70F250" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <ellipse cx="60" cy="46" rx="58" ry="40" fill="url(#emptyGlow)" />
                    <circle cx="60" cy="46" r="26" fill="#0c1a12" stroke="#70F250" strokeOpacity="0.45" />
                    <circle cx="60" cy="46" r="17" fill="none" stroke="#70F250" strokeOpacity="0.25" />
                </svg>
                <Icon />
            </div>
            <strong>{title}</strong>
            <p>{hint}</p>
        </div>
    );
}
