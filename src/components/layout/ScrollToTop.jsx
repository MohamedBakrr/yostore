import { useEffect } from "react";
import { useLocation } from "react-router";

/** Reset scroll position on path changes (browser back/forward preserved). */
export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ block: "start" });
                return;
            }
        }
        window.scrollTo(0, 0);
    }, [pathname, hash]);

    return null;
}
