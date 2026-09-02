import type { Route } from 'next';

export type NavigationChild = { label: string; href: Route };
export type NavigationLink = NavigationChild & { children?: NavigationChild[] };

export const navigationLinks: NavigationLink[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    {
        label: 'Training',
        href: '/training',
        children: [
            { label: 'Course Catalogue', href: '/training' },
            { label: 'Corporate Training', href: '/corporate-training' },
        ],
    },
    { label: 'Advisory', href: '/advisory' },
    { label: 'Research', href: '/research' },
    { label: 'Events', href: '/events' },
    { label: 'Partnerships', href: '/partnerships' },
    { label: 'Leadership', href: '/leadership' },
    { label: 'News', href: '/news' },
    { label: 'Contact', href: '/contact' },
];
