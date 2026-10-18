import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * One-shot scroll reveal (whileInView, once, transform + opacity only).
 * With `prefers-reduced-motion` the children render immediately with no
 * animation wrapper at all — content is never held behind motion.
 */
export default function Reveal({
    children,
    className = "",
    delay = 0,
    y = 24,
    amount = 0.25,
}) {
    const reduced = useReducedMotion();

    if (reduced) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount }}
            transition={{ duration: 0.55, ease: EASE, delay }}
        >
            {children}
        </motion.div>
    );
}
