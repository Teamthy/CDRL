import HomePage from '../components/HomePage';
import SiteLayout from '../components/SiteLayout';
import { getCourses } from '../lib/api';
import { courses as fallbackCourses, type Course } from '../lib/content';

export const revalidate = 1800;

async function loadCourses(): Promise<Course[]> {
    try {
        const result = await getCourses();
        if (Array.isArray(result) && result.length > 0) return result as Course[];
    } catch {
        /* fall through */
    }
    return fallbackCourses;
}

export default async function Page() {
    const courses = await loadCourses();
    return (
        <SiteLayout>
            <HomePage courses={courses} />
        </SiteLayout>
    );
}