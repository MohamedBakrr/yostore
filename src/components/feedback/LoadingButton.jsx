import { Loader2 } from "lucide-react";

const VARIANTS = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    inverse: "btn-inverse",
    ghost: "btn-ghost",
    danger: "btn-danger",
};

/**
 * Button with a built-in busy indicator. Disables itself while loading so
 * double submissions cannot happen.
 */
export default function LoadingButton({
    loading = false,
    disabled = false,
    variant = "primary",
    size = null,
    icon: Icon = null,
    children,
    className = "",
    type = "button",
    ...rest
}) {
    return (
        <button
            type={type}
            className={[
                "btn",
                VARIANTS[variant] ?? VARIANTS.primary,
                size === "sm" ? "btn-sm" : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : Icon ? (
                <Icon className="size-4" aria-hidden="true" />
            ) : null}
            {children}
        </button>
    );
}
