import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useAppDispatch } from "../../store/hooks";
import { updateProfile } from "../../store/authSlice";
import { profileSchema } from "../../utils/validation/schemas";
import { useToast } from "../../providers/ToastProvider";
import { authErrorMessage } from "../../features/auth/authMessages";
import InlineValidationError from "../feedback/InlineValidationError";
import LoadingButton from "../feedback/LoadingButton";

const FIELDS = [
    {
        name: "name",
        label: "Full name",
        autoComplete: "name",
        span: "sm:col-span-2",
    },
    {
        name: "phone",
        label: "Phone",
        type: "tel",
        autoComplete: "tel",
        span: "",
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

/*
 * The shared `profileSchema` (SPEC §7 validators) requires a complete
 * address, but a freshly registered demo account has none — without this
 * step a new visitor could never save even a name change. The form variant
 * below keeps the shared schema's messages and rules; it only treats the
 * address block as all-or-nothing: every field blank means "no address
 * saved yet", while a partially completed block surfaces the original
 * per-field required messages.
 */
const ADDRESS_MESSAGES = {
    phone: "Enter a phone number we can reach you on.",
    address: "Street address is required.",
    city: "City is required.",
    postalCode: "Postal code is required.",
    country: "Country is required.",
};

const blankToUndefined = (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalAddressField = (field) =>
    z.preprocess(blankToUndefined, field.optional());

const profileFormSchema = z
    .object({
        name: profileSchema.shape.name,
        email: profileSchema.shape.email,
        phone: optionalAddressField(profileSchema.shape.phone),
        address: optionalAddressField(profileSchema.shape.address),
        city: optionalAddressField(profileSchema.shape.city),
        postalCode: optionalAddressField(profileSchema.shape.postalCode),
        country: optionalAddressField(profileSchema.shape.country),
    })
    .superRefine((values, ctx) => {
        const keys = Object.keys(ADDRESS_MESSAGES);
        const anyFilled = keys.some(
            (key) => blankToUndefined(values[key]) !== undefined,
        );
        if (!anyFilled) return;
        for (const key of keys) {
            if (blankToUndefined(values[key]) === undefined) {
                ctx.addIssue({
                    code: "custom",
                    path: [key],
                    message: ADDRESS_MESSAGES[key],
                });
            }
        }
    });

function toFormValues(user) {
    return {
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        address: user?.address ?? "",
        city: user?.city ?? "",
        postalCode: user?.postalCode ?? "",
        country: user?.country ?? "",
    };
}

/**
 * Profile editor (SPEC §14 — account-scoped address book). Validates against
 * the shared `profileSchema`; the email stays in the values (so validation
 * runs) but is rendered read-only because the mock repository never changes
 * an account's email.
 */
export default function ProfileForm({ user }) {
    const dispatch = useAppDispatch();
    const { notify } = useToast();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm({
        defaultValues: toFormValues(user),
        resolver: zodResolver(profileFormSchema),
        mode: "onBlur",
    });

    // Keep the fields aligned with the stored account after a successful save.
    useEffect(() => {
        reset(toFormValues(user));
    }, [user, reset]);

    const onSubmit = async (values) => {
        if (!isDirty) {
            notify("Nothing has changed yet.", "info");
            return;
        }
        // Blank optional address fields arrive as `undefined` (see
        // `profileFormSchema`); store them as empty strings so the account
        // record keeps plain string fields.
        const payload = Object.fromEntries(
            Object.entries(values).map(([key, value]) => [key, value ?? ""]),
        );
        try {
            const updated = await dispatch(updateProfile(payload)).unwrap();
            notify(
                `Profile saved for ${updated.name} — stored in this browser only.`,
                "success",
            );
        } catch (code) {
            notify(authErrorMessage(code), "error");
        }
    };

    return (
        <section
            aria-labelledby="profile-details-heading"
            className="card-flat p-6 md:p-8"
        >
            <h2
                id="profile-details-heading"
                className="font-display text-2xl leading-tight"
            >
                Your details
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
                Used to prefill checkout and to label your demo orders. Nothing
                here is transmitted anywhere.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="email" className="field-label">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="field bg-sunken text-ink-soft"
                            value={user?.email ?? ""}
                            readOnly
                            aria-readonly="true"
                            autoComplete="email"
                            aria-invalid={errors.email ? "true" : undefined}
                            aria-describedby="email-readonly"
                        />
                        <p
                            id="email-readonly"
                            className="mt-1.5 text-xs leading-relaxed text-muted"
                        >
                            The email identifies your demo account and cannot be
                            changed here.
                        </p>
                        <InlineValidationError id="email-error">
                            {errors.email?.message}
                        </InlineValidationError>
                    </div>

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
                                <InlineValidationError
                                    id={`${field.name}-error`}
                                >
                                    {error?.message}
                                </InlineValidationError>
                            </div>
                        );
                    })}
                </div>

                <LoadingButton
                    type="submit"
                    className="mt-6"
                    loading={isSubmitting}
                    icon={Save}
                >
                    Save changes
                </LoadingButton>
            </form>
        </section>
    );
}
