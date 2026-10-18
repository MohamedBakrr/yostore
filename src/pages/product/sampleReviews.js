import { addDays } from "../../utils/formatting";

/**
 * Generated local review content for the PDP reviews section (SPEC §10).
 *
 * DummyJSON has no per-product review collection, so these entries are
 * *deterministic demo content* — derived from the product id so the page never
 * varies between renders — and the section that renders them must label them
 * as demonstration content, never as verified customer feedback.
 */

const AUTHORS = [
    { name: "Maya R.", location: "Portland, OR" },
    { name: "Devin O.", location: "Austin, TX" },
    { name: "Priya S.", location: "Brooklyn, NY" },
    { name: "Tomas L.", location: "Chicago, IL" },
];

const BODIES = [
    (title) =>
        `I was skeptical about the ${title}, but it has quietly become one of those things I reach for every day. It feels considered, and it looks at home in our space.`,
    (title) =>
        `The ${title} arrived well packed and matched the photos. Setup took about ten minutes. I'd dock half a star only because the instructions could be clearer.`,
    (title) =>
        `We picked up the ${title} on a whim and ended up wanting a second one for the office. Genuinely useful, and at the demo price it felt fair.`,
    (title) =>
        `Three weeks in with the ${title} and still happy. It does exactly what the description says — nothing more, nothing less. That's what I wanted.`,
    (title) =>
        `Good everyday companion. The ${title} isn't perfect — I wish the finish showed fewer fingerprints — but I'd happily recommend it.`,
];

const REVIEW_BASE_DATE = "2026-08-01T12:00:00.000Z";

/** Three deterministic sample entries tied to a product. */
export function sampleReviewsFor(product) {
    const seed = Math.abs(Number(product?.id) || 0);
    return [0, 1, 2].map((index) => {
        const author = AUTHORS[(seed + index) % AUTHORS.length];
        const body = BODIES[(seed + index * 2) % BODIES.length];
        const title = String(product?.title ?? "this product");
        return {
            id: `${product?.id ?? "product"}-sample-${index}`,
            author: author.name,
            location: author.location,
            rating: 3 + ((seed + index) % 3),
            body: body(title),
            date: addDays(REVIEW_BASE_DATE, (seed + index * 13) % 60),
        };
    });
}

export default sampleReviewsFor;
