import { motion, useReducedMotion } from "motion/react";

/**
 * Restrained page transition: a short fade + 8px rise. Disabled entirely under
 * `prefers-reduced-motion`. Kept inside a fixed-key wrapper so it never
 * animates individual page internals.
 */
export default function PageTransition({ children }) {
    const reduced = useReducedMotion();

    if (reduced) return <>{children}</>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}
