import { PageSkeleton } from "../feedback/Skeletons";

/** Suspense fallback for lazily loaded routes. */
export default function RouteFallback() {
    return <PageSkeleton />;
}
