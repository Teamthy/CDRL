import { Wallet, Users, PackageOpen } from 'lucide-react';
import type { Course } from '../../lib/content';

type Props = { course: Course };

/** "Investment" block (elective #5) — ROI framing pulled from course.priceBand. */
export default function PriceBandCard({ course }: Props) {
    const band = course.priceBand;
    if (!band || (!band.individual && !band.corporate && !band.bundle)) return null;
    return (
        <div className="price-band">
            <span className="price-band-kicker">INVESTMENT</span>
            <h5>What it costs, three ways</h5>
            {band.individual && (
                <p>
                    <Wallet aria-hidden="true" /> <strong>Self-funded</strong>
                    <br />
                    {band.individual}
                </p>
            )}
            {band.corporate && (
                <p>
                    <Users aria-hidden="true" /> <strong>Employer / group</strong>
                    <br />
                    {band.corporate}
                </p>
            )}
            {band.bundle && (
                <p>
                    <PackageOpen aria-hidden="true" /> <strong>As part of a bundle</strong>
                    <br />
                    {band.bundle}
                </p>
            )}
        </div>
    );
}
