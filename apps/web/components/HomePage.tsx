import HomeHero from './hero/HomeHero';
import WhoWeAre from './sections/WhoWeAre';
import TrainingTracks from './sections/TrainingTracks';
import FeaturedCertifications from './sections/FeaturedCertifications';
import CorporateBand from './sections/CorporateBand';
import UpcomingProgram from './sections/UpcomingProgram';
import Insights from './sections/Insights';
import LeadershipPreview from './sections/LeadershipPreview';
import PecbPartner from './sections/PecbPartner';
import type { Course } from '../lib/content';

type Props = { courses: Course[] };

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
            <LeadershipPreview />
        </>
    );
}