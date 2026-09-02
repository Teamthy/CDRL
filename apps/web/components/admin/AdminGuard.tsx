'use client';

import Link from 'next/link';
import Logo from '../brand/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
    Activity,
    BadgeCheck,
    PackageOpen,
    UserRound,
    BookOpen,
    CalendarDays,
    ClipboardList,
    ExternalLink,
    FileText,
    GraduationCap,
    Inbox,
    LayoutDashboard,
    LogOut,
} from 'lucide-react';
import { clearToken, getToken } from '../../lib/adminClient';

const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Enquiries', href: '/admin/enquiries', icon: Inbox },
    { label: 'Applications', href: '/admin/applications', icon: ClipboardList },
    { label: 'LMS', href: '/admin/lms', icon: GraduationCap },
    { label: 'PECB Exams', href: '/admin/pecb-exams', icon: BadgeCheck },
    { label: 'Trainers', href: '/admin/trainers', icon: UserRound },
    { label: 'Bundles', href: '/admin/bundles', icon: PackageOpen },
    { label: 'Activity', href: '/admin/activity', icon: Activity },
    { label: 'Courses', href: '/admin/courses', icon: BookOpen },
    { label: 'Events', href: '/admin/events', icon: CalendarDays },
    { label: 'Posts', href: '/admin/posts', icon: FileText },
] as const;

/**
 * Client guard + console chrome. Unauthenticated visitors are bounced to
 * /admin/login; the login page itself renders without the shell.
 */
export default function AdminGuard({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [ready, setReady] = useState(false);

    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (isLoginPage) {
            setReady(true);
            return;
        }
        if (!getToken()) {
            router.replace('/admin/login');
            return;
        }
        setReady(true);
    }, [isLoginPage, router]);

    if (!ready) {
        return (
            <div className="admin-loading" role="status" aria-live="polite">
                Loading console…
            </div>
        );
    }

    if (isLoginPage) return <>{children}</>;

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand admin-brand-lockup">
                    <Logo size={40} />
                    <div>
                        <strong>YKAY Console</strong>
                        <span>Centre for Digital Risk & Leadership</span>
                    </div>
                </div>
                <nav aria-label="Console navigation">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <Link key={href} href={href} className={active ? 'active' : ''}>
                                <Icon />
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="admin-sidebar-foot">
                    <Link href="/" className="admin-sitelink">
                        <ExternalLink />
                        <span>View site</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            clearToken();
                            router.replace('/admin/login');
                        }}
                    >
                        <LogOut />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>
            <main className="admin-main">{children}</main>
        </div>
    );
}
