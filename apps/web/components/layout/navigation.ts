export const navigationLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Training', href: '/training' },
    { label: 'Corporate Training', href: '/corporate-training' },
    { label: 'Advisory', href: '/advisory' },
    { label: 'Research', href: '/research' },
    { label: 'Events', href: '/events' },
    { label: 'Partnerships', href: '/partnerships' },
    { label: 'Leadership', href: '/leadership' },
    { label: 'Contact', href: '/contact' },
] as const;

export type NavigationLink = (typeof navigationLinks)[number];