import { useState } from "react";
import { ImageOff } from "lucide-react";

/** Deduplicated image list: thumbnail first, then API images. */
function collectImages(product) {
    const list = [
        product?.thumbnail,
        ...(Array.isArray(product?.images) ? product.images : []),
    ].filter((src) => typeof src === "string" && src.trim() !== "");
    return [...new Set(list)];
}

/**
 * PDP image gallery: one large main image plus a clickable thumbnail rail.
 * Thumbnails are real buttons — keyboard operable by default — and the active
 * one carries `aria-current`, so state is never conveyed by styling alone.
 * Products with no imagery (e.g. locally created demo products) render a
 * labeled placeholder instead of a broken image.
 *
 * State resets on product change: the page renders this with `key={product.id}`.
 */
export default function ProductGallery({ product, className = "" }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const images = collectImages(product);
    const index =
        images.length > 0 ? Math.min(activeIndex, images.length - 1) : 0;
    const current = images[index] ?? null;
    const title = product?.title ?? "Product";

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <div className="aspect-square overflow-hidden border border-hair bg-sunken">
                {current ? (
                    <img
                        src={current}
                        alt={
                            images.length > 1
                                ? `${title} — view ${index + 1} of ${images.length}`
                                : title
                        }
                        className="size-full object-cover"
                        decoding="async"
                    />
                ) : (
                    <div className="grid size-full place-items-center px-6 text-center">
                        <div>
                            <ImageOff
                                className="mx-auto size-6 text-muted"
                                aria-hidden="true"
                            />
                            <p className="mt-3 text-sm text-muted">
                                No image available for this product.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {images.length > 1 ? (
                <ul
                    className="flex flex-wrap gap-3"
                    role="list"
                    aria-label="Product images"
                >
                    {images.map((src, imageIndex) => {
                        const isActive = imageIndex === index;
                        return (
                            <li key={src}>
                                <button
                                    type="button"
                                    onClick={() => setActiveIndex(imageIndex)}
                                    aria-current={isActive ? "true" : undefined}
                                    aria-label={`Show view ${imageIndex + 1} of ${images.length} for ${title}`}
                                    className={`block w-20 overflow-hidden border bg-sunken transition-colors ${
                                        isActive
                                            ? "border-ink"
                                            : "border-hair hover:border-hair-strong"
                                    }`}
                                >
                                    <img
                                        src={src}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="aspect-square size-full object-cover"
                                    />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
}
