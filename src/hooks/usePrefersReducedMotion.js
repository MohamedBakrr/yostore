import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function matches() {
    try {
        return window.matchMedia?.(QUERY).matches ?? false;
    } catch {
        return false;
    }
}

/**
 * Live `prefers-reduced-motion` flag for non-Motion logic
 * (scroll reveals, pointer parallax gating).
 */
export function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(matches);

    useEffect(() => {
        let media;
        try {
            media = window.matchMedia?.(QUERY);
        } catch {
            return undefined;
        }
        if (!media) return undefined;
        const onChange = (event) => setReduced(event.matches);
        media.addEventListener?.("change", onChange);
        return () => media.removeEventListener?.("change", onChange);
    }, []);

    return reduced;
}

export default usePrefersReducedMotion;
