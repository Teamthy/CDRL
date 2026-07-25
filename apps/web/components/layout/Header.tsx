'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, Menu, Search, ShoppingBag, X } from 'lucide-react';
import Logo from '../brand/Logo';
import { navigationLinks } from './navigation';
import SearchPanel from './SearchPanel';
import MobileNavigation from './MobileNavigation';
import { getLearningPlan } from '../../lib/learningPlanClient';

export default function Header({ initialCount = 0 }: { initialCount?: number }) {
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const plan = await getLearningPlan();
                if (mounted) setCount(plan?.items?.length ?? 0);
            } catch {
                /* silent */
            }
        })();
        return () => {
            mounted = false;
        };
    }, [pathname]);

    useEffect(() => {
        setMenuOpen(false);
        setSearchOpen(false);
    }, [pathname]);

    return (
        <header className="site-header">
            <div className="wrap mainnav">
                <div className="header-inner">
                    <Link href={'/'} className="logo-btn" aria-label="YKAY Consult home">
                        <Logo />
                    </Link>
                    <nav className="header-nav" aria-label="Primary navigation">
                        {navigationLinks.map((item) => {
                            const active = pathname === item.href;
                            const isTraining = item.label === 'Training';
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${active ? 'active' : ''} ${isTraining ? 'with-drop' : ''}`.trim()}
                                >
                                    {item.label}
                                    {isTraining && <ChevronDown />}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="nav-actions">
                        <button
                            aria-label="Toggle search"
                            aria-expanded={searchOpen}
                            aria-controls="site-search-panel"
                            onClick={() => setSearchOpen((v) => !v)}
                        >
                            <Search />
                        </button>
                        <Link
                            href={'/learning-plan'}
                            className="bag"
                            aria-label={`Learning plan (${count} ${count === 1 ? 'item' : 'items'})`}
                        >
                            <ShoppingBag />
                            <span className="badge">{count}</span>
                        </Link>
                        <button
                            className="menu"
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-navigation"
                            onClick={() => setMenuOpen((v) => !v)}
                        >
                            {menuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>
            <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
            <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} />
        </header>
    );
}