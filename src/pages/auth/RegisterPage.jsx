import { useEffect } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert, UserPlus } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    clearAuthError,
    registerUser,
    selectAuthError,
    selectIsAuthenticated,
} from "../../store/authSlice";
import { registerSchema } from "../../utils/validation/schemas";
import { useToast } from "../../providers/ToastProvider";
import InlineValidationError from "../../components/feedback/InlineValidationError";
import LoadingButton from "../../components/feedback/LoadingButton";
import MockAuthNotice from "../../features/auth/MockAuthNotice";
import { authErrorMessage } from "../../features/auth/authMessages";

const FIELDS = [
    {
        name: "name",
        label: "Full name",
        type: "text",
        autoComplete: "name",
    },
    {
        name: "email",
        label: "Email",
        type: "email",
        autoComplete: "email",
    },
    {
        name: "password",
        label: "Password",
        type: "password",
        autoComplete: "new-password",
        hint: "At least 8 characters, including one number.",
    },
    {
        name: "confirmPassword",
        label: "Confirm password",
        type: "password",
        autoComplete: "new-password",
    },
];

/**
 * Demo registration (SPEC §14). Creates a browser-local account, signs the
 * visitor in (guest cart and wishlist are merged into it by the thunk), and
 * continues to whatever route sent them here.
 */
export default function RegisterPage() {
    useDocumentTitle("Create an account", {
        description:
            "Create a YoStore demo account — a local, browser-only record used to demonstrate account-scoped carts, wishlists and orders.",
    });

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { notify } = useToast();
    const authenticated = useAppSelector(selectIsAuthenticated);
    const authError = useAppSelector(selectAuthError);

    const from = location.state?.from ?? "/";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        resolver: zodResolver(registerSchema),
        mode: "onBlur",
    });

    /** Editing the form invalidates the previous failure (e.g. "duplicate"). */
    const registerField = (name) => {
        const fieldProps = register(name);
        return {
            ...fieldProps,
            onChange: (event) => {
                fieldProps.onChange(event);
                dispatch(clearAuthError());
            },
        };
    };

    useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

    const onSubmit = async ({ name, email, password }) => {
        try {
            await dispatch(registerUser({ name, email, password })).unwrap();
            notify(
                `Welcome, ${name.trim()} — your demo account was created in this browser.`,
                "success",
            );
            navigate(from, { replace: true });
        } catch {
            // The slice keeps the rejected code; the alert maps it to copy.
        }
    };

    if (authenticated) return <Navigate to={from} replace />;

    return (
        <div>
            <p className="eyebrow">Your account</p>
            <h1 className="mt-3 font-display text-3xl leading-tight text-balance-tight md:text-4xl">
                Create an account
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
                A demo account keeps your cart, wishlist and orders attached to
                you — even after you close the tab. Everything is stored in
                this browser only.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8">
                <div className="grid gap-4">
                    {FIELDS.map((field) => (
                        <div key={field.name}>
                            <label
                                htmlFor={field.name}
                                className="field-label"
                            >
                                {field.label}
                            </label>
                            <input
                                id={field.name}
                                type={field.type}
                                className="field"
                                autoComplete={field.autoComplete}
                                aria-invalid={
                                    errors[field.name] ? "true" : undefined
                                }
                                aria-describedby={
                                    [
                                        errors[field.name]
                                            ? `${field.name}-error`
                                            : null,
                                        field.hint ? `${field.name}-hint` : null,
                                    ]
                                        .filter(Boolean)
                                        .join(" ") || undefined
                                }
                                {...registerField(field.name)}
                            />
                            {field.hint ? (
                                <p
                                    id={`${field.name}-hint`}
                                    className="mt-1.5 text-xs text-muted"
                                >
                                    {field.hint}
                                </p>
                            ) : null}
                            <InlineValidationError id={`${field.name}-error`}>
                                {errors[field.name]?.message}
                            </InlineValidationError>
                        </div>
                    ))}
                </div>

                {authError ? (
                    <p
                        role="alert"
                        className="mt-4 flex items-start gap-2.5 border border-hair border-l-4 border-l-danger bg-danger-tint px-4 py-3 text-sm leading-relaxed text-ink"
                    >
                        <ShieldAlert
                            className="mt-0.5 size-4 shrink-0 text-danger"
                            aria-hidden="true"
                        />
                        <span>{authErrorMessage(authError)}</span>
                    </p>
                ) : null}

                <LoadingButton
                    type="submit"
                    className="mt-5 w-full"
                    loading={isSubmitting}
                    icon={UserPlus}
                >
                    Create demo account
                </LoadingButton>
            </form>

            <p className="mt-6 text-sm text-muted">
                Already have one in this browser?{" "}
                <Link
                    to="/auth/login"
                    state={from !== "/" ? { from } : undefined}
                    className="link-underline font-medium text-ink"
                >
                    Sign in instead
                </Link>
                .
            </p>
            <p className="mt-2 text-sm text-muted">
                Just browsing?{" "}
                <Link
                    to="/shop"
                    className="link-underline font-medium text-ink"
                >
                    Back to the store
                </Link>
                .
            </p>

            <MockAuthNotice className="mt-6" />
        </div>
    );
}
