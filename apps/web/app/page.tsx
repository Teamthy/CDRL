import HomePage from '../components/HomePage';
import SiteLayout from '../components/SiteLayout';
import { getCourses } from '../lib/data';

export const revalidate = 1800;

export default async function Page() {
    const courses = await getCourses();
    return (
        <SiteLayout>
            <HomePage courses={courses} />
        </SiteLayout>
    );
}