import { useEffect } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, ShieldAlert } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    clearAuthError,
    loginUser,
    selectAuthError,
    selectIsAuthenticated,
} from "../../store/authSlice";
import { loginSchema } from "../../utils/validation/schemas";
import { useToast } from "../../providers/ToastProvider";
import InlineValidationError from "../../components/feedback/InlineValidationError";
import LoadingButton from "../../components/feedback/LoadingButton";
import MockAuthNotice from "../../features/auth/MockAuthNotice";
import { authErrorMessage } from "../../features/auth/authMessages";

/**
 * Sign-in for the mock account system (SPEC §14).
 *
 * Visitors who arrive from a protected route are sent back to it after a
 * successful login (`location.state.from`, captured by `RequireAuth`); anyone
 * already signed in never sees this form. Failures from the thunk are mapped
 * to plain copy instead of echoing codes.
 */
export default function LoginPage() {
    useDocumentTitle("Sign in", {
        description:
            "Sign in to a YoStore demo account — a local, browser-only mock session for this demonstration storefront.",
    });

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { notify } = useToast();
    const authenticated = useAppSelector(selectIsAuthenticated);
    const authError = useAppSelector(selectAuthError);

    const from = location.state?.from ?? "/";
    const destination = String(from).split("?")[0];

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { email: "", password: "" },
        resolver: zodResolver(loginSchema),
        mode: "onBlur",
    });

    /** Editing the form invalidates the previous submit failure. */
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

    // Never carry a stale error into the register page or back to the store.
    useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

    const onSubmit = async ({ email, password }) => {
        try {
            await dispatch(loginUser({ email, password })).unwrap();
            notify(
                "Signed in — this session exists only in this browser.",
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
                Sign in
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
                {destination !== "/"
                    ? `Sign in to pick up where you left off at ${destination}.`
                    : "Sign in to keep your cart and wishlist attached to your demo account instead of this browser."}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8">
                <div className="grid gap-4">
                    <div>
                        <label htmlFor="email" className="field-label">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="field"
                            autoComplete="email"
                            aria-invalid={errors.email ? "true" : undefined}
                            aria-describedby={
                                errors.email ? "email-error" : undefined
                            }
                            {...registerField("email")}
                        />
                        <InlineValidationError id="email-error">
                            {errors.email?.message}
                        </InlineValidationError>
                    </div>

                    <div>
                        <label htmlFor="password" className="field-label">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="field"
                            autoComplete="current-password"
                            aria-invalid={
                                errors.password ? "true" : undefined
                            }
                            aria-describedby={
                                errors.password ? "password-error" : undefined
                            }
                            {...registerField("password")}
                        />
                        <InlineValidationError id="password-error">
                            {errors.password?.message}
                        </InlineValidationError>
                    </div>
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
                    icon={LogIn}
                >
                    Sign in
                </LoadingButton>
            </form>

            <p className="mt-6 text-sm text-muted">
                No demo account yet?{" "}
                <Link
                    to="/auth/register"
                    state={destination !== "/" ? { from } : undefined}
                    className="link-underline font-medium text-ink"
                >
                    Create one in this browser
                </Link>
                .
            </p>
            <p className="mt-2 text-sm text-muted">
                Prefer to look around first?{" "}
                <Link
                    to="/shop"
                    className="link-underline font-medium text-ink"
                >
                    Back to the store
                </Link>
                .
            </p>

            <p className="mt-4 text-xs leading-relaxed text-muted">
                No password recovery here: demo credentials never leave this
                browser, so they cannot be reset or emailed. If you forget
                them, create a new demo account — or clear this site&apos;s
                data to start over.
            </p>

            <MockAuthNotice className="mt-6" />
        </div>
    );
}
