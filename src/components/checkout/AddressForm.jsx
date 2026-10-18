import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useAppDispatch } from "../../store/hooks";
import { setCheckoutContact } from "../../store/checkoutSlice";
import { checkoutContactSchema } from "../../utils/validation/schemas";
import InlineValidationError from "../feedback/InlineValidationError";
import LoadingButton from "../feedback/LoadingButton";

const FIELDS = [
    {
        name: "fullName",
        label: "Full name",
        autoComplete: "name",
        span: "",
    },
    {
        name: "phone",
        label: "Phone",
        type: "tel",
        autoComplete: "tel",
        span: "",
    },
    {
        name: "email",
        label: "Email",
        type: "email",
        autoComplete: "email",
        span: "sm:col-span-2",
    },
    {
        name: "address",
        label: "Street address",
        autoComplete: "street-address",
        span: "sm:col-span-2",
    },
    {
        name: "city",
        label: "City",
        autoComplete: "address-level2",
        span: "",
    },
    {
        name: "postalCode",
        label: "Postal code",
        autoComplete: "postal-code",
        span: "",
    },
    {
        name: "country",
        label: "Country",
        autoComplete: "country-name",
        span: "sm:col-span-2",
    },
];

/**
 * Step 1 — contact & delivery address (React Hook Form + shared
 * `checkoutContactSchema`). Every keystroke is mirrored into the checkout
 * slice so back/forward navigation and a page reload never lose input; all
 * fields must validate before `onContinue` fires.
 */
export default function AddressForm({ defaultValues, onContinue }) {
    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues,
        resolver: zodResolver(checkoutContactSchema),
        mode: "onBlur",
    });

    // Mirror the live form into the persisted checkout draft.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/incompatible-library -- RHF's watch() subscription is the canonical way to observe a form; skipping memoization is safe because this callback only forwards to the Redux store.
        const subscription = watch((values) =>
            dispatch(setCheckoutContact(values)),
        );
        return () => subscription.unsubscribe();
    }, [watch, dispatch]);

    return (
        <form onSubmit={handleSubmit(onContinue)} noValidate>
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
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
                These details are stored only in this browser for the demo
                order — nothing is sent to a server.
            </p>

            <LoadingButton type="submit" className="mt-5" icon={ArrowRight}>
                Continue to shipping
            </LoadingButton>
        </form>
    );
}
