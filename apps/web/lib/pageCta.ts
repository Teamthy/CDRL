import type { Route } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { Children, isValidElement } from 'react';
import CTASection, { DEFAULT_CTA_HREF } from '../components/sections/CTASection';

/**
 * Single-CTA policy.
 *
 * A page must never ask the visitor to contact us twice. The global footer
 * button ("Talk to our team") steps aside whenever the page already renders a
 * primary contact CTA of its own ("Get in touch", "Request a proposal", …), so
 * every page ends with exactly one contact call-to-action — the one written for
 * that page. Pages without one keep the footer button.
 */

const CONTACT_ROUTE: Route = '/contact';

export type FooterCta = { label: string; href: Route } | false;

/** Global footer CTA, used when a page has no contact CTA of its own. */
export const DEFAULT_FOOTER_CTA: { label: string; href: Route } = {
    label: 'Talk to our team',
    href: CONTACT_ROUTE,
};

type UnknownProps = Record<string, unknown>;

function propsOf(node: ReactElement): UnknownProps {
    return (node.props ?? {}) as UnknownProps;
}

/** True for `/contact`, `/contact?interest=…` and `/contact#form`. */
function hrefIsContact(href: string): boolean {
    return href === CONTACT_ROUTE || href.startsWith(`${CONTACT_ROUTE}?`) || href.startsWith(`${CONTACT_ROUTE}#`);
}

/** True for button-styled links that compete with the footer CTA. */
function isPrimaryContactButton(node: ReactElement): boolean {
    const props = propsOf(node);
    const className = typeof props.className === 'string' ? props.className : '';
    const isButton = className.includes('btn-primary') || className.includes('btn-white');
    if (!isButton) return false;

    const href = props.href;
    return typeof href === 'string' && hrefIsContact(href);
}

function walk(nodes: ReactNode, depth: number, found: { value: boolean }): void {
    if (found.value || depth > 12) return;

    for (const node of Children.toArray(nodes)) {
        if (!isValidElement(node)) continue;

        const props = propsOf(node);

        if (node.type === CTASection) {
            const href = props.ctaHref;
            if (href === undefined || href === DEFAULT_CTA_HREF || (typeof href === 'string' && hrefIsContact(href))) {
                found.value = true;
                return;
            }
        }

        if (typeof node.type === 'string' && isPrimaryContactButton(node)) {
            found.value = true;
            return;
        }

        if (props.children !== undefined) {
            walk(props.children as ReactNode, depth + 1, found);
            if (found.value) return;
        }
    }
}

/**
 * Does this page content already carry a primary CTA that sends the visitor to
 * the contact page? Client-only components are opaque here, so pages whose
 * contact CTA is rendered inside one pass `footerCta={false}` explicitly.
 */
export function hasPageContactCta(children: ReactNode): boolean {
    const found = { value: false };
    walk(children, 0, found);
    return found.value;
}
