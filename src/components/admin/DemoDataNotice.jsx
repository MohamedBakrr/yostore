import { Info } from "lucide-react";

/**
 * Honest, prominent disclosure for every admin surface: this dashboard is a
 * browser-only demonstration. Product changes live in a local storage overlay
 * (never written to DummyJSON), orders are locally stored demo records, and
 * React route guards are navigation convenience — not authorization.
 */
export default function DemoDataNotice({ className = "" }) {
    return (
        <aside
            aria-labelledby="demo-data-notice-title"
            className={`border border-hair border-l-4 border-l-warning bg-warning-tint px-5 py-4 ${className}`}
        >
            <div className="flex gap-3">
                <Info
                    className="mt-0.5 size-5 shrink-0 text-warning"
                    aria-hidden="true"
                />
                <div>
                    <h2
                        id="demo-data-notice-title"
                        className="font-display text-base font-semibold text-ink"
                    >
                        Demonstration dashboard — nothing here is real
                    </h2>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                        <li>
                            Everything runs in your browser. Product
                            create/edit/delete is saved as a{" "}
                            <strong className="font-semibold text-ink">
                                local overlay
                            </strong>{" "}
                            in this browser&apos;s storage — the public
                            DummyJSON dataset is never modified.
                        </li>
                        <li>
                            Local product changes can be reset at any time, and
                            a future refresh of the external catalog does not
                            transfer them: they exist only in this browser.
                        </li>
                        <li>
                            Orders are locally stored demo orders (accounts and
                            guest checkouts); payment and timeline events are
                            simulated.
                        </li>
                        <li>
                            Route guards in React are a navigation convenience,
                            not authorization — no server checks anything on
                            this page.
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
    );
}
