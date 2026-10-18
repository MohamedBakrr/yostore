import { useEffect, useState } from "react";

const QUERY = "(pointer: fine)";

function matches() {
    try {
        return window.matchMedia?.(QUERY).matches ?? false;
    } catch {
        return false;
    }
}

/**
 * Live `pointer: fine` flag. Pointer-parallax effects are gated on it (and on
 * reduced motion) so touch devices never pay for desktop-only choreography.
 */
export function useFinePointer() {
    const [fine, setFine] = useState(matches);

    useEffect(() => {
        let media;
        try {
            media = window.matchMedia?.(QUERY);
        } catch {
            return undefined;
        }
        if (!media) return undefined;
        const onChange = (event) => setFine(event.matches);
        media.addEventListener?.("change", onChange);
        return () => media.removeEventListener?.("change", onChange);
    }, []);

    return fine;
}

export default useFinePointer;
