import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { newsletterSchema } from "../../../utils/validation/schemas";
import LoadingButton from "../../../components/feedback/LoadingButton";
import InlineValidationError from "../../../components/feedback/InlineValidationError";
import Reveal from "../Reveal";

/**
 * Newsletter demo: React Hook Form + the shared `newsletterSchema`, a
 * simulated round-trip (no network, no storage — stated plainly), loading
 * via `isSubmitting`, and an announced success state with a reset path.
 */
export default function NewsletterSection() {
    const [subscribed, setSubscribed] = useState(null);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(newsletterSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async ({ email }) => {
        // Simulated round-trip — nothing leaves the browser.
        await new Promise((resolve) => setTimeout(resolve, 700));
        setSubscribed(email);
    };

    return (
        <section
            aria-labelledby="newsletter-heading"
            className="bg-sunken"
        >
            <div className="page-frame grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-14">
                <Reveal className="lg:col-span-5">
                    <p className="eyebrow">Newsletter</p>
                    <h2
                        id="newsletter-heading"
                        className="mt-3 font-display text-3xl leading-tight text-balance-tight md:text-5xl"
                    >
                        One letter a month. Roughly.
                    </h2>
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
                        New edits, restocks and the occasional material study —
                        written like a note, not a blast. This demo validates
                        your address with the same schema as the account forms
                        and then stops there.
                    </p>
                    <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted">
                        <Mail
                            className="mt-px size-4 shrink-0 text-accent"
                            aria-hidden="true"
                        />
                        Demo form — nothing is sent, nothing is stored, and no
                        third party is involved.
                    </p>
                </Reveal>

                <Reveal delay={0.08} className="lg:col-span-7">
                    <div className="card-flat p-6 md:p-8">
                        {subscribed ? (
                            <div
                                role="status"
                                className="flex flex-col items-start"
                            >
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-success">
                                    Validated — demo only
                                </p>
                                <h3 className="mt-3 font-display text-2xl text-balance-tight">
                                    That address checks out.
                                </h3>
                                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                                    <span className="font-semibold">
                                        {subscribed}
                                    </span>{" "}
                                    passed validation and was acknowledged
                                    locally. This is a demo — the address was
                                    not stored or sent anywhere.
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm mt-5"
                                    onClick={() => {
                                        setSubscribed(null);
                                        reset();
                                    }}
                                >
                                    Use a different email
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                noValidate
                                className="flex flex-col gap-5"
                            >
                                <div>
                                    <label
                                        className="field-label"
                                        htmlFor="newsletter-email"
                                    >
                                        Email address
                                    </label>
                                    <input
                                        id="newsletter-email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="field"
                                        aria-invalid={!!errors.email}
                                        aria-describedby={
                                            errors.email
                                                ? "newsletter-email-error"
                                                : undefined
                                        }
                                        {...register("email")}
                                    />
                                    <InlineValidationError id="newsletter-email-error">
                                        {errors.email?.message}
                                    </InlineValidationError>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                                    <LoadingButton
                                        type="submit"
                                        loading={isSubmitting}
                                        icon={Send}
                                    >
                                        Join the list
                                    </LoadingButton>
                                    <p className="text-xs text-muted">
                                        Demo — your address never leaves this
                                        tab.
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
