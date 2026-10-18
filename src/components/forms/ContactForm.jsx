import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Send } from "lucide-react";
import { contactSchema } from "../../utils/validation/schemas";
import { useToast } from "../../providers/ToastProvider";
import InlineValidationError from "../feedback/InlineValidationError";
import LoadingButton from "../feedback/LoadingButton";

const FIELDS = [
    { name: "name", label: "Your name", autoComplete: "name", span: "" },
    {
        name: "email",
        label: "Email",
        type: "email",
        autoComplete: "email",
        span: "",
    },
    {
        name: "subject",
        label: "Subject",
        type: "text",
        autoComplete: "off",
        span: "sm:col-span-2",
    },
];

const SIMULATED_DELAY_MS = 700;

/**
 * Contact form (SPEC §18). Validation, loading, error and success states all
 * behave like the real thing — but the "submission" is a local timer: nothing
 * leaves this browser, which the page states before the visitor types.
 */
export default function ContactForm() {
    const { notify } = useToast();
    const [sent, setSent] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { name: "", email: "", subject: "", message: "" },
        resolver: zodResolver(contactSchema),
        mode: "onBlur",
    });

    // The entire extent of "sending": a short, local wait, then success.
    const onSubmit = async () => {
        await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
        setSent(true);
        notify("Demo message composed — nothing was sent or stored.", "success");
    };

    const writeAnother = () => {
        reset();
        setSent(false);
    };

    if (sent) {
        return (
            <div
                role="status"
                className="card-flat flex flex-col items-start px-6 py-10 md:px-8"
            >
                <span className="grid size-11 place-items-center border border-success bg-success-tint text-success">
                    <Check className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-display text-2xl leading-tight">
                    Message simulated
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                    Your note passed validation and the form did everything a
                    real send would — except contact anyone. This demo stores
                    nothing and emails nothing. If you need a real reply, use{" "}
                    <span className="font-medium text-ink">
                        hello@yostore.example
                    </span>{" "}
                    from your own mail app.
                </p>
                <button
                    type="button"
                    className="btn btn-secondary mt-6"
                    onClick={writeAnother}
                >
                    Write another message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map((field) => {
                    const error = errors[field.name];
                    return (
                        <div key={field.name} className={field.span}>
                            <label
                                htmlFor={field.name}
                                className="field-label"
                            >
                                {field.label}
                            </label>
                            <input
                                id={field.name}
                                type={field.type ?? "text"}
                                className="field"
                                autoComplete={field.autoComplete}
                                aria-invalid={error ? "true" : undefined}
                                aria-describedby={
                                    error ? `${field.name}-error` : undefined
                                }
                                {...register(field.name)}
                            />
                            <InlineValidationError id={`${field.name}-error`}>
                                {error?.message}
                            </InlineValidationError>
                        </div>
                    );
                })}

                <div className="sm:col-span-2">
                    <label htmlFor="message" className="field-label">
                        Message
                    </label>
                    <textarea
                        id="message"
                        rows={6}
                        className="field"
                        aria-invalid={errors.message ? "true" : undefined}
                        aria-describedby={
                            errors.message ? "message-error" : undefined
                        }
                        {...register("message")}
                    />
                    <InlineValidationError id="message-error">
                        {errors.message?.message}
                    </InlineValidationError>
                </div>
            </div>

            <LoadingButton
                type="submit"
                className="mt-5"
                loading={isSubmitting}
                icon={Send}
            >
                Send message
            </LoadingButton>
        </form>
    );
}
