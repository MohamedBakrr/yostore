import { Info } from "lucide-react";

/**
 * Inline disclosure used wherever YoStore fakes behavior (coupons, payments,
 * orders, tracking). Keeps the "this is a demo" wording consistent across
 * cart, checkout, orders, shipping, and tracking surfaces.
 */
export default function DemoNotice({
    label = "Demo behavior.",
    children,
    className = "",
}) {
    if (!children) return null;
    return (
        <p
            className={`flex items-start gap-2.5 border border-dashed border-hair-strong bg-sunken px-4 py-3 text-xs leading-relaxed text-muted ${className}`}
        >
            <Info className="mt-px size-4 shrink-0 text-accent" aria-hidden="true" />
            <span>
                <span className="font-semibold text-ink-soft">{label} </span>
                {children}
            </span>
        </p>
    );
}
