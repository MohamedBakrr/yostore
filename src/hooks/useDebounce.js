import { useEffect, useState } from "react";

/**
 * Debounced mirror of a value. Used for search inputs so we issue one request
 * per pause instead of one per keystroke.
 */
export function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

export default useDebounce;
