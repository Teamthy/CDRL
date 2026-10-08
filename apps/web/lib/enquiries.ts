import { submitContact, type ContactResult } from '../services/contact';
import type { Course } from './content';

/**
 * Submissions from the waitlist and corporate-quote forms. Both go through
 * `submitContact`, the one client for POST /api/v1/contact, so the endpoint
 * and the failure messages live in one place. These forms used to post to a
 * public enquiries route that the API does not serve, so every submission failed.
 */

/** "Notify me when this runs next". Lands in the CRM as a contact enquiry. */
export function submitWaitlist(course: Pick<Course, 'title' | 'subtitle' | 'slug'>, email: string): Promise<ContactResult> {
    return submitContact({
        name: 'Waitlist subscriber',
        email: email.trim(),
        interest: 'Professional Training',
        message: `WAITLIST: ${course.title} ${course.subtitle} (${course.slug})`,
    });
}

export type CorporateQuoteRequest = {
    name: string;
    organization: string;
    email: string;
    teamSize: string;
    focus: string;
};

/** Corporate training quote request. The organisation has its own field in the API schema. */
export function submitCorporateQuote(req: CorporateQuoteRequest): Promise<ContactResult> {
    return submitContact({
        name: req.name.trim(),
        organization: req.organization.trim(),
        email: req.email.trim(),
        interest: 'Corporate Training',
        message: `Team size: ${req.teamSize}. Training focus: ${req.focus.trim()}`,
    });
}
