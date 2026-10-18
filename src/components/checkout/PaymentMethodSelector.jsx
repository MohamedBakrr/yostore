import { useEffect, useRef, useState } from "react";
import { BadgeCheck, CircleX, Wallet } from "lucide-react";
import LoadingButton from "../feedback/LoadingButton";

const OPTIONS = [
    {
        id: "cod",
        name: "Cash on delivery",
        description:
            "Pay in cash when your demo order arrives. The order is created with payment due.",
    },
    {
        id: "online",
        name: "Simulated online payment",
        description:
            "Run a local payment simulation — approve or cancel it to see both outcomes.",
    },
];

/**
 * Step 3 — payment method selection.
 *
 * Deliberately renders NO card fields of any kind (no number, expiry, or CVV,
 * ever) and never claims a real transaction. The online path is an explicit
 * local simulation offering both a demo-success and a demo-cancellation
 * outcome; cancellation keeps the cart and contact data intact.
 */
export default function PaymentMethodSelector({
    value,
    onChange,
    outcome,
    onApproved,
    onCancelled,
}) {
    const [simulating, setSimulating] = useState(false);
    const timerRef = useRef(null);

    // Never let an in-flight simulation outlive this step.
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const runSimulation = () => {
        if (simulating) return;
        setSimulating(true);
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            setSimulating(false);
            onApproved();
        }, 900);
    };

    const cancelSimulation = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setSimulating(false);
        onCancelled();
    };

    return (
        <fieldset>
            <legend className="field-label">Choose a payment method</legend>
            <div className="space-y-3">
                {OPTIONS.map((option) => {
                    const checked = value === option.id;
                    return (
                        <div key={option.id}>
                            <label
                                className={`flex cursor-pointer items-start gap-3.5 border px-4 py-4 transition-colors ${
                                    checked
                                        ? "border-accent bg-accent-tint"
                                        : "border-hair bg-surface hover:border-hair-strong"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment-method"
                                    value={option.id}
                                    checked={checked}
                                    onChange={() => onChange(option.id)}
                                    className="mt-1 size-4 shrink-0 accent-accent"
                                />
                                <span className="min-w-0 flex-1">
                                    <span className="font-display text-base font-semibold text-ink">
                                        {option.name}
                                        {checked ? (
                                            <span className="ml-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-accent">
                                                Selected
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="mt-1 block text-sm text-muted">
                                        {option.description}
                                    </span>
                                </span>
                            </label>

                            {checked && option.id === "cod" ? (
                                <p className="mt-2 ml-8 border border-dashed border-hair-strong bg-sunken px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft">
                                    <Wallet
                                        className="mr-1.5 -mt-0.5 inline size-3.5 text-accent"
                                        aria-hidden="true"
                                    />
                                    The order is stored with payment status{" "}
                                    <strong className="font-semibold">
                                        Due
                                    </strong>{" "}
                                    — “pay on delivery” is a demo concept; no
                                    courier will collect money.
                                </p>
                            ) : null}

                            {checked && option.id === "online" ? (
                                <div className="mt-2 ml-8 space-y-3">
                                    <p
                                        role="status"
                                        className="border border-accent bg-accent-tint px-3.5 py-2.5 text-xs leading-relaxed text-ink"
                                    >
                                        <strong className="font-semibold">
                                            Simulation only — no real charge.
                                        </strong>{" "}
                                        No card number, expiry date, or CVV is
                                        ever requested, transmitted, or stored.
                                        This demo has no payment provider.
                                    </p>

                                    {outcome === "paid" ? (
                                        <p className="flex items-start gap-2 border border-success bg-success-tint px-3.5 py-2.5 text-sm text-ink">
                                            <BadgeCheck
                                                className="mt-0.5 size-4 shrink-0 text-success"
                                                aria-hidden="true"
                                            />
                                            <span>
                                                Payment approved{" "}
                                                <strong className="font-semibold">
                                                    (simulated)
                                                </strong>{" "}
                                                — no money moved. You can
                                                continue to review.
                                            </span>
                                        </p>
                                    ) : null}

                                    {outcome === "cancelled" ? (
                                        <p
                                            role="alert"
                                            className="flex items-start gap-2 border border-danger bg-danger-tint px-3.5 py-2.5 text-sm text-ink"
                                        >
                                            <CircleX
                                                className="mt-0.5 size-4 shrink-0 text-danger"
                                                aria-hidden="true"
                                            />
                                            <span>
                                                <strong className="font-semibold">
                                                    Simulation cancelled —
                                                    nothing was charged.
                                                </strong>{" "}
                                                Your cart and details are
                                                intact. Run it again or choose
                                                cash on delivery.
                                            </span>
                                        </p>
                                    ) : null}

                                    <div className="flex flex-wrap gap-2.5">
                                        <LoadingButton
                                            loading={simulating}
                                            onClick={runSimulation}
                                            icon={
                                                simulating ? undefined : BadgeCheck
                                            }
                                        >
                                            {simulating
                                                ? "Running simulation…"
                                                : "Simulate payment — approve"}
                                        </LoadingButton>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={cancelSimulation}
                                            disabled={simulating}
                                        >
                                            Simulate payment — cancel
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted">
                                        Demo controls — both buttons produce a
                                        scripted local outcome.
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </fieldset>
    );
}
