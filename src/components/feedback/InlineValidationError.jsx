/**
 * Field-level validation message. `role="alert"` announces the error when it
 * appears; always referenced by the input via `aria-describedby`.
 */
export default function InlineValidationError({ id, children }) {
    if (!children) return null;
    return (
        <p
            id={id}
            role="alert"
            className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-danger"
        >
            <span aria-hidden="true" className="mt-px">
                !
            </span>
            {children}
        </p>
    );
}
