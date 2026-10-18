import { Fragment } from "react";
import { Check } from "lucide-react";
import { CHECKOUT_STEPS } from "../../store/checkoutSlice";
import { CHECKOUT_STEP_LABELS } from "../../features/checkout/constants";

const BADGE_BASE =
    "grid size-6 shrink-0 place-items-center border text-[11px] font-semibold tabular-nums";

/**
 * Accessible checkout progress indicator (custom, Tailwind-styled).
 *
 * - The current step carries `aria-current="step"` plus a visible marker.
 * - Completed steps render as buttons and are clickable backwards only.
 * - Upcoming steps are spans marked `aria-disabled` — never focusable traps.
 * - Step numbers stay visible; labels reveal from `sr-only` on small screens.
 */
export default function CheckoutStepper({ step, onSelect }) {
    const total = CHECKOUT_STEPS.length;

    return (
        <nav aria-label="Checkout progress" className="mt-8 border-y border-hair py-4">
            <p className="text-xs text-muted">
                Step {step + 1} of {total} —{" "}
                <span className="font-semibold text-ink">
                    {CHECKOUT_STEP_LABELS[step]}
                </span>
            </p>
            <ol className="mt-3 flex flex-wrap items-center gap-y-1">
                {CHECKOUT_STEPS.map((key, index) => {
                    const completed = index < step;
                    const current = index === step;
                    const label = CHECKOUT_STEP_LABELS[index];

                    const badge = (
                        <span
                            className={[
                                BADGE_BASE,
                                completed
                                    ? "border-success bg-success-tint text-success"
                                    : current
                                      ? "border-accent bg-accent-tint text-accent"
                                      : "border-hair-strong text-muted",
                            ].join(" ")}
                            aria-hidden="true"
                        >
                            {completed ? (
                                <Check className="size-3.5" />
                            ) : (
                                index + 1
                            )}
                        </span>
                    );

                    const content = (
                        <>
                            {badge}
                            <span
                                className={`text-sm sr-only sm:not-sr-only ${
                                    current
                                        ? "font-semibold text-ink"
                                        : completed
                                          ? "text-ink-soft"
                                          : "text-muted"
                                }`}
                            >
                                {label}
                            </span>
                            {current ? (
                                <span className="sr-only"> (current step)</span>
                            ) : null}
                        </>
                    );

                    return (
                        <Fragment key={key}>
                            {index > 0 ? (
                                <li
                                    aria-hidden="true"
                                    className="hidden h-px w-8 bg-hair sm:block"
                                />
                            ) : null}
                            <li
                                aria-current={current ? "step" : undefined}
                                className="flex"
                            >
                                {completed ? (
                                    <button
                                        type="button"
                                        onClick={() => onSelect(index)}
                                        className="flex min-h-11 items-center gap-2 px-2 py-1.5 text-muted transition-colors hover:text-accent focus-visible:text-accent"
                                        aria-label={`Step ${index + 1}: ${label} — completed, go back`}
                                    >
                                        {content}
                                    </button>
                                ) : (
                                    <span
                                        aria-disabled={index > step ? "true" : undefined}
                                        className={`flex min-h-11 items-center gap-2 px-2 py-1.5 ${
                                            current
                                                ? "text-ink"
                                                : "text-muted"
                                        }`}
                                    >
                                        {content}
                                    </span>
                                )}
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
