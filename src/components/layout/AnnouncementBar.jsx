import { useState } from "react";
import { Link } from "react-router";
import { X } from "lucide-react";
import { read, storageKeys, write } from "../../utils/storage";

/** Dismissible promo strip. Dismissal persists across visits. */
export default function AnnouncementBar() {
    const [visible, setVisible] = useState(
        () =>
            read(
                storageKeys.announcementDismissed,
                (value) => value === true,
                false,
            ) === true
            ? false
            : true,
    );

    if (!visible) return null;

    const dismiss = () => {
        setVisible(false);
        write(storageKeys.announcementDismissed, true);
    };

    return (
        <div className="relative bg-accent text-accent-contrast">
            <div className="page-frame flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-10 py-2 text-center text-xs leading-relaxed">
                <p>
                    Free standard shipping over $100 · 10% off with code{" "}
                    <strong className="font-bold">WELCOME10</strong>
                </p>
                <Link
                    to="/shipping"
                    className="hidden underline underline-offset-2 hover:opacity-80 sm:inline"
                >
                    Shipping details
                </Link>
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Dismiss announcement"
                    className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center transition-opacity hover:opacity-70"
                >
                    <X className="size-3.5" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
