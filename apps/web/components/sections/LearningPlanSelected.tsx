'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLearningPlan, removeLearningPlanItem } from '../../lib/learningPlanClient';
import type { Course } from '../../lib/content';

type Props = { courses: Course[] };

export default function LearningPlanSelected({ courses }: Props) {
    const [ids, setIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const plan = await getLearningPlan();
                const items: Array<{ courseId: string }> = plan?.items ?? [];
                setIds(items.map((it) => it.courseId));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function remove(id: string) {
        setIds((prev) => prev.filter((x) => x !== id));
        try {
            await removeLearningPlanItem(id);
        } catch {
            /* silent */
        }
    }

    const selected = courses.filter((c) => ids.includes(c.id));
    const count = selected.length;

    if (loading) {
        return (
            <section className="learning-plan">
                <div className="wrap">
                    <p>Loading your plan…</p>
                </div>
            </section>
        );
    }

    if (count === 0) {
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

    return (
        <section className="learning-plan">
            <div className="wrap">
                <ShoppingBag className="plan-icon" aria-hidden="true" />
                <h2>
                    {count} program{count > 1 ? 's' : ''} selected.
                </h2>
                <p>Ready to speak with an enrollment advisor? We will help you confirm delivery options, dates, and enrollment.</p>
                <div className="plan-items">
                    {selected.map((c) => (
                        <div key={c.id} className="plan-item">
                            <div>
                                <div className="title">
                                    {c.title} — {c.subtitle}
                                </div>
                                <div className="meta">
                                    {c.track} · {c.level} · {c.mode}
                                </div>
                            </div>
                            <button type="button" onClick={() => remove(c.id)} aria-label={`Remove ${c.title} ${c.subtitle}`}>
                                <X />
                            </button>
                        </div>
                    ))}
                </div>
                <Link href={'/contact' as any} className="btn btn-primary">
                    <span>Complete Enquiry</span>
                    <ArrowRight />
                </Link>
            </div>
        </section>
    );
}