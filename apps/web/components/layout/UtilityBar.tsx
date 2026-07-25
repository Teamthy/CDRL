import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function UtilityBar() {
    return (
        <div className="topline">
            <div className="wrap">
                <span>Advancing Trust in the Digital Age</span>
                <div className="spacer">
                    <Link href={'/partnerships' as any}>Partner With Us</Link>
                    <Link href={'/learning-plan' as any}>Learning Portal</Link>
                    <span>
                        EN <ChevronDown />
                    </span>
                </div>
            </div>
        </div>
    );
}