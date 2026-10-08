'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { addLearningPlanItem } from '../../lib/learningPlanClient';

type Props = {
    courseId: string;
    label?: string;
    className?: string;
};

export default function AddToPlanButton({ courseId, label = 'Add to Learning Plan', className = '' }: Props) {
    const router = useRouter();
    const [state, setState] = useState<'idle' | 'saving' | 'added' | 'error' | 'throttled'>('idle');

    async function handleClick() {
        if (state === 'saving') return;
        setState('saving');
        try {
            // The server can refuse (429 from the learning-plan limiter, 4xx/5xx
            // otherwise). This used to be discarded, so a rejected add still said
            // "Added to plan" and redirected to an empty plan. (audit P1-9)
            const result = await addLearningPlanItem(courseId);
            if (!result.ok) {
                setState(result.reason === 'rate-limited' ? 'throttled' : 'error');
                setTimeout(() => setState('idle'), 2500);
                return;
            }
            setState('added');
            setTimeout(() => router.push('/learning-plan'), 550);
        } catch {
            setState('error');
            setTimeout(() => setState('idle'), 2000);
        }
    }

    const isAdded = state === 'added';
    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={state === 'saving'}
            className={`btn btn-primary ${className}`.trim()}
            aria-label={label}
        >
            <span>
                {state === 'saving' && 'Adding…'}
                {state === 'idle' && label}
                {state === 'added' && 'Added to plan'}
                {state === 'error' && 'Try again'}
                {state === 'throttled' && 'Slow down a moment'}
            </span>
            {isAdded ? <Check aria-hidden="true" /> : state === 'saving' ? <ArrowRight aria-hidden="true" /> : <ShoppingBag aria-hidden="true" />}
        </button>
    );
}