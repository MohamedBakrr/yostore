import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from "motion/react";
import { useFinePointer } from "../hooks/useFinePointer";
import { useTopRatedProducts } from "../hooks/useHomeData";

const SPRING = { stiffness: 140, damping: 18, mass: 0.5 };

/**
 * One mounted-print frame in the hero composition. While the catalog loads
 * (or if it fails) the frame renders as a branded well, so the art direction
 * is intact with zero animation and zero data.
 */
function HeroFrame({ product, eager = false, className = "", style }) {
    const thumbnail = product?.thumbnail || product?.images?.[0] || "";

    return (
        <motion.div style={style} className={`absolute group ${className}`}>
            <div className="size-full border border-hair bg-surface p-1.5 transition-transform duration-700 group-hover:scale-[1.02] md:p-2">
                <div className="relative size-full overflow-hidden bg-sunken">
                    {product && thumbnail ? (
                        <Link
                            to={`/product/${product.id}`}
                            className="block size-full"
                        >
                            <img
                                src={thumbnail}
                                alt={product.title}
                                loading={eager ? "eager" : "lazy"}
                                decoding="async"
                                fetchPriority={eager ? "high" : undefined}
                                className="size-full object-cover"
                            />
                        </Link>
                    ) : (
                        <span
                            className="grid size-full place-items-center font-display text-3xl text-muted"
                            aria-hidden="true"
                        >
                            Y
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Immersive editorial hero: display-serif headline, thin rule, two CTAs, and
 * an asymmetric cluster of overlapping product frames.
 *
 * Pointer parallax runs entirely through Motion values (motion value →
 * spring → transforms) — no React state per pointermove — and is attached
 * only for fine pointers without reduced-motion. Static, it is finished.
 */
export default function Hero() {
    const { data } = useTopRatedProducts();
    const reduced = useReducedMotion();
    const finePointer = useFinePointer();

    const offsetX = useMotionValue(0);
    const offsetY = useMotionValue(0);
    const springX = useSpring(offsetX, SPRING);
    const springY = useSpring(offsetY, SPRING);

    const midX = useTransform(springX, (value) => value * 8);
    const midY = useTransform(springY, (value) => value * 6);
    const backX = useTransform(springX, (value) => value * -14);
    const backY = useTransform(springY, (value) => value * -10);
    const frontX = useTransform(springX, (value) => value * 22);
    const frontY = useTransform(springY, (value) => value * 16);

    const parallaxEnabled = finePointer && !reduced;

    const handlePointerMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        offsetX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
        offsetY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const handlePointerLeave = () => {
        offsetX.set(0);
        offsetY.set(0);
    };

    const products = Array.isArray(data?.products) ? data.products : [];

    return (
        <section aria-labelledby="hero-heading" className="rule-b">
            <div className="page-frame grid items-center gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
                <div className="lg:col-span-5">
                    <p className="eyebrow">Issue 04 — The Autumn Edit</p>
                    <span
                        className="mt-5 block h-px w-20 bg-hair-strong"
                        aria-hidden="true"
                    />
                    <h1
                        id="hero-heading"
                        className="mt-6 font-display text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[1.03] text-balance-tight"
                    >
                        A slower edit of things worth keeping.
                    </h1>
                    <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft md:text-lg">
                        Furniture, watches, wardrobe and small daily rituals —
                        chosen one piece at a time, photographed properly,
                        priced honestly. Every product, price and rating on
                        this page arrives live from the DummyJSON demo catalog.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Link to="/shop" className="btn btn-primary">
                            Shop the collection
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                        <a href="#collections" className="btn btn-secondary">
                            Explore categories
                        </a>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div
                        className="relative aspect-[4/3] w-full"
                        onPointerMove={
                            parallaxEnabled ? handlePointerMove : undefined
                        }
                        onPointerLeave={
                            parallaxEnabled ? handlePointerLeave : undefined
                        }
                    >
                        <HeroFrame
                            eager
                            product={products[0]}
                            style={{ x: midX, y: midY }}
                            className="right-0 top-0 aspect-4/5 w-[60%]"
                        />
                        <HeroFrame
                            product={products[1]}
                            style={{ x: backX, y: backY }}
                            className="bottom-0 left-0 z-10 aspect-3/4 w-[46%]"
                        />
                        <HeroFrame
                            product={products[2]}
                            style={{ x: frontX, y: frontY }}
                            className="left-[36%] top-[4%] z-20 hidden aspect-square w-[26%] sm:block"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
