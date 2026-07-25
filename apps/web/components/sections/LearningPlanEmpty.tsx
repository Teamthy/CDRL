import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function LearningPlanEmpty() {
    return (
        <section className="learning-plan">
            <div className="wrap">
                <ShoppingBag className="plan-icon" aria-hidden="true" />
                <h2>Your learning journey starts here.</h2>
                <p>Explore the marketplace and add a program to your learning plan.</p>
                <Link href={'/training' as any} className="btn btn-primary">
                    <span>Explore Training</span>
                    <ArrowRight />
                </Link>
            </div>
        </section>
    );
}