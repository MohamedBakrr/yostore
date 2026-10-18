import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "../../../utils/formatting";
import { unitPriceFor } from "../../../utils/pricing";
import { pickProducts, useTopRatedProducts } from "../hooks/useHomeData";
import Reveal from "../Reveal";
import ParallaxImage from "../ParallaxImage";

const CAMPAIGN_CATEGORIES = [
    "mens-watches",
    "watches",
    "sunglasses",
    "furniture",
];

/**
 * Campaign 01 — "Material study": a full-bleed inverse band with copy left
 * and a scroll-drifting photograph right. Uses real top-rated products; if
 * the catalog is still loading the composition falls back to a reserved
 * well and the CTA simply points at `/shop`.
 */
export default function CampaignMaterialStudy() {
    const { data } = useTopRatedProducts();
    const picks = pickProducts(data?.products, CAMPAIGN_CATEGORIES, 2);
    const lead = picks[0];
    const feature = picks[1] ?? picks[0];
    const shopHref = lead ? `/shop/${lead.category}` : "/shop";

    return (
        <section
            aria-labelledby="campaign-material-heading"
            className="bg-ink text-paper"
        >
            <div className="page-frame grid items-center gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-14">
                <Reveal className="lg:col-span-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/70">
                        Campaign 01 — Material study
                    </p>
                    <h2
                        id="campaign-material-heading"
                        className="mt-4 font-display text-4xl leading-[1.05] text-balance-tight md:text-6xl"
                    >
                        Steel, leather, and the light they hold.
                    </h2>
                    <p className="mt-5 max-w-md leading-relaxed text-paper/80">
                        A closer look at pieces chosen for how they age —
                        brushed metal, tinted glass, straps that crease
                        honestly. Shot in daylight and left alone.
                    </p>

                    {feature ? (
                        <Link
                            to={`/product/${feature.id}`}
                            className="group mt-8 flex items-center gap-4 border-t border-paper/20 pt-5"
                        >
                            <img
                                src={
                                    feature.thumbnail ||
                                    feature.images?.[0] ||
                                    ""
                                }
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="size-14 shrink-0 object-cover"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="line-clamp-1 text-sm font-semibold group-hover:underline">
                                    {feature.title}
                                </span>
                                <span className="mt-0.5 block text-xs text-paper/70">
                                    {formatCurrency(
                                        unitPriceFor(
                                            feature.price,
                                            feature.discountPercentage,
                                        ),
                                    )}{" "}
                                    · rated {feature.rating} of 5
                                </span>
                            </span>
                            <ArrowRight
                                className="size-4 shrink-0 transition-transform group-hover:translate-x-1"
                                aria-hidden="true"
                            />
                        </Link>
                    ) : null}

                    <Link to={shopHref} className="btn btn-primary mt-8">
                        Shop the material study
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </Reveal>

                <Reveal delay={0.08} className="lg:col-span-7">
                    {lead ? (
                        <ParallaxImage
                            eager
                            src={lead.thumbnail || lead.images?.[0] || ""}
                            alt={`${lead.title}, photographed for the material study`}
                            aspect="aspect-[4/3] lg:aspect-[16/10]"
                        />
                    ) : (
                        <div
                            className="skeleton aspect-[4/3] lg:aspect-[16/10]"
                            aria-hidden="true"
                        />
                    )}
                </Reveal>
            </div>
        </section>
    );
}
