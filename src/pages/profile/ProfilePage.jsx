import { Link } from "react-router";
import {
    Heart,
    LogOut,
    MapPin,
    Package,
    ScrollText,
    Truck,
} from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser, selectUser } from "../../store/authSlice";
import { selectWishlistIds } from "../../store/wishlistSlice";
import { useToast } from "../../providers/ToastProvider";
import { formatDate } from "../../utils/formatting";
import ProfileForm from "../../components/forms/ProfileForm";
import MockAuthNotice from "../../features/auth/MockAuthNotice";
import {
    formatSavedAddress,
    formatSavedCount,
} from "../../features/profile/accountSummary";

const QUICK_LINKS = [
    { to: "/orders", icon: Package, label: "Your orders" },
    { to: "/wishlist", icon: Heart, label: "Wishlist" },
    { to: "/tracking", icon: Truck, label: "Track an order" },
];

/**
 * Account home (SPEC §14). The route is guarded by `RequireAuth`; this page
 * only handles profile editing, the account summary, and demo sign-out.
 */
export default function ProfilePage() {
    useDocumentTitle("Your account", {
        description:
            "Manage the details of your YoStore demo account — a browser-local record used for this demonstration storefront.",
    });

    const dispatch = useAppDispatch();
    const { notify } = useToast();
    const user = useAppSelector(selectUser);
    const wishlistCount = useAppSelector(selectWishlistIds).length;

    // Leave the guarded route *before* the auth state flips: `flushSync`
    // commits the navigation synchronously, so `RequireAuth` never re-renders
    // `/profile` as a guest and bounces the visitor to the login screen.
    const signOut = async () => {
        await dispatch(logoutUser()).unwrap();
        notify(
            "Signed out. The guest cart and wishlist start fresh for the next visitor.",
            "success",
        );
        window.location.replace("/");
    };

    return (
        <div className="page-frame py-12 md:py-16">
            <header>
                <p className="eyebrow">Account</p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-balance-tight md:text-5xl">
                    Your account
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
                    Signed in as{" "}
                    <span className="font-medium text-ink">{user.email}</span>.
                    Everything on this page is a demo record stored in this
                    browser.
                </p>
            </header>

            <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-7">
                    <ProfileForm user={user} />
                </div>

                <aside
                    aria-labelledby="account-summary-heading"
                    className="lg:col-span-5"
                >
                    <div className="card-flat p-6 md:p-8">
                        <h2
                            id="account-summary-heading"
                            className="font-display text-2xl leading-tight"
                        >
                            Account summary
                        </h2>

                        <dl className="mt-5 space-y-4">
                            <div className="flex items-baseline justify-between gap-4 border-b border-hair pb-3">
                                <dt className="eyebrow">Email</dt>
                                <dd className="truncate text-sm text-ink">
                                    {user.email}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-4 border-b border-hair pb-3">
                                <dt className="eyebrow">Member since</dt>
                                <dd className="text-sm text-ink">
                                    {formatDate(user.createdAt)}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-4 border-b border-hair pb-3">
                                <dt className="eyebrow">Saved items</dt>
                                <dd className="text-sm text-ink">
                                    {formatSavedCount(wishlistCount)}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="eyebrow">Session</dt>
                                <dd className="text-sm text-ink">
                                    Active in this browser
                                </dd>
                            </div>
                        </dl>

                        <h3 className="mt-8 font-display text-lg">
                            Keep exploring
                        </h3>
                        <ul className="mt-3 space-y-2">
                            {QUICK_LINKS.map(({ to, icon: Icon, label }) => (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        className="flex items-center gap-3 border border-hair bg-sunken px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-hair-strong hover:text-accent"
                                    >
                                        <Icon
                                            className="size-4 shrink-0 text-muted"
                                            aria-hidden="true"
                                        />
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <h3 className="mt-8 font-display text-lg">
                            Shipping address
                        </h3>
                        <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted">
                            <MapPin
                                className="mt-0.5 size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <span>
                                {formatSavedAddress(user) ||
                                    "No address saved yet — add one in \u201cYour details\u201d and checkout will prefill it."}
                            </span>
                        </p>
                    </div>

                    <MockAuthNotice className="mt-6" />

                    <div className="mt-6 border border-hair p-6">
                        <h2 className="flex items-center gap-2 font-display text-lg">
                            <ScrollText
                                className="size-4 text-muted"
                                aria-hidden="true"
                            />
                            Done for now?
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                            Signing out clears the guest scope and hands this
                            browser a fresh cart and wishlist — your demo
                            account record stays behind.
                        </p>
                        <button
                            type="button"
                            className="btn btn-secondary mt-4 w-full"
                            onClick={signOut}
                        >
                            <LogOut className="size-4" aria-hidden="true" />
                            Sign out
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
