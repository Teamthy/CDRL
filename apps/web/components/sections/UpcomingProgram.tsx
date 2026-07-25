import type { Route } from 'next';
import EventCard from '../cards/EventCard';
import Reveal from '../motion/Reveal';



export default function UpcomingProgram() {
    return (
        <Reveal>
            <EventCard
                dates="18—21"
                monthYear="JUNE 2026"
                title="ISO/IEC 27001 Lead Implementer"
                location="Lagos / Virtual"
                duration="4-day intensive"
                href={'/training/iso-iec-27001-lead-implementer' as Route}
            />
        </Reveal>
    );
}

