import { ShieldCheck } from "lucide-react";

/**
 * Honest disclosure shown on every authentication surface (SPEC §14, §22):
 * accounts and sessions live in this browser's storage, so this is a demo
 * convenience — never identity verification or a security boundary.
 */
export default function MockAuthNotice({ className = "" }) {
    return (
        <p
            className={`flex items-start gap-2.5 border border-dashed border-hair-strong bg-sunken px-4 py-3 text-xs leading-relaxed text-muted ${className}`}
        >
            <ShieldCheck
                className="mt-px size-4 shrink-0 text-accent"
                aria-hidden="true"
            />
            <span>
                <span className="font-semibold text-ink-soft">
                    Mock authentication — local only, not secure identity
                    verification.{" "}
                </span>
                Accounts and sessions are stored in this browser. Passwords are
                kept as a salted digest and never sent anywhere, but anyone with
                access to this browser can read or edit them.
            </span>
        </p>
    );
}
