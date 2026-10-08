import HomeHero from './hero/HomeHero';
import WhoWeAre from './sections/WhoWeAre';
import TrainingTracks from './sections/TrainingTracks';
import FeaturedCertifications from './sections/FeaturedCertifications';
import CorporateBand from './sections/CorporateBand';
import UpcomingProgram from './sections/UpcomingProgram';
import Insights from './sections/Insights';
import PecbPartner from './sections/PecbPartner';
import type { CourseCardView } from '../lib/content';

type Props = { courses: CourseCardView[] };

/**
 * Pure homepage content. No header / footer here — the surrounding
 * SiteLayout provides the chrome.
 */
export default function HomePage({ courses }: Props) {
    return (
        <>
            <HomeHero />
            <WhoWeAre />
            <TrainingTracks />
            <FeaturedCertifications courses={courses} />
            <PecbPartner />
            <CorporateBand />
            <UpcomingProgram />
            <Insights />
        </>
    );
}