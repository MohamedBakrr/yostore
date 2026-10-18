import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Editorial image frame with a restrained scroll-linked drift (transform only,
 * driven by Motion values — no per-frame React state). The image is oversized
 * slightly so the drift never exposes an edge, and reduced-motion users get
 * the identical frame with the drift pinned to zero.
 */
export default function ParallaxImage({
    src,
    alt,
    aspect = "aspect-[4/3]",
    overscan = 1.12,
    eager = false,
    className = "",
}) {
    const frameRef = useRef(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({
        target: frameRef,
        offset: ["start end", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

    return (
        <div
            ref={frameRef}
            className={`relative overflow-hidden bg-sunken ${aspect} ${className}`}
        >
            <motion.img
                src={src}
                alt={alt}
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={eager ? "high" : undefined}
                className="absolute inset-0 size-full object-cover"
                style={{ y: reduced ? undefined : y, scale: overscan }}
            />
        </div>
    );
}
