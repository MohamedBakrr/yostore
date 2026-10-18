import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import {
    ChevronDown,
    Heart,
    LogOut,
    Menu,
    Moon,
    Search,
    ShoppingBag,
    Sun,
    User,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectCartCount } from "../../store/cartSlice";
import { selectWishlistIds } from "../../store/wishlistSlice";
import { openCartDrawer, openMobileNav, openSearch } from "../../store/uiSlice";
import { logoutUser, selectUser } from "../../store/authSlice";
import { useCategories } from "../../hooks/useCategories";
import { useTheme } from "../../providers/ThemeProvider";
import { useToast } from "../../providers/ToastProvider";

/** Small accessible disclosure menu (click toggles, Escape/outside click closes). */
function Dropdown({ label, icon: Icon = null, textLabel = null, chevron = false, children, menuClassName = "" }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event) => {
            if (!containerRef.current?.contains(event.target)) setOpen(false);
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                className={
                    textLabel
                        ? "inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-accent"
                        : "icon-btn"
                }
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={textLabel ? undefined : label}
                onClick={() => setOpen((v) => !v)}
            >
                {Icon ? (
                    <Icon className="size-[1.15rem]" aria-hidden="true" />
                ) : null}
                {textLabel}
                {chevron ? (
                    <ChevronDown
                        className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                        aria-hidden="true"
                    />
                ) : null}
            </button>
            {open ? (
                <div
                    role="menu"
                    className={`absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-56 border border-hair bg-surface p-1.5 shadow-float ${menuClassName}`}
                    onClick={() => setOpen(false)}
                >
                    {children}
                </div>
            ) : null}
        </div>
    );
}

function menuLinkClass({ isActive }) {
    return [
        "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
        isActive ? "bg-sunken font-semibold text-ink" : "text-ink-soft hover:bg-sunken hover:text-ink",
    ].join(" ");
}

/**
 * Primary navigation. Desktop: links + collections/account disclosures.
 * Mobile: opens <MobileNavigation />. Cart/search/theme act via `uiSlice`.
 */
export default function Navbar() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const cartCount = useAppSelector(selectCartCount);
    const wishlistCount = useAppSelector(selectWishlistIds).length;
    const { theme, toggleTheme } = useTheme();
    const { notify } = useToast();
    const { data: categories } = useCategories();

    const signOut = () => {
        dispatch(logoutUser());
        notify("Signed out. Your demo data stays on this device.", "info");
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-40 border-b border-hair bg-[var(--header-bg)] backdrop-blur-md">
            <div className="page-frame flex h-16 items-center justify-between gap-4 md:h-20">
                {/* Left: menu + wordmark */}
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        className="icon-btn -ml-1.5 lg:hidden"
                        onClick={() => dispatch(openMobileNav())}
                        aria-label="Open navigation menu"
                    >
                        <Menu className="size-5" aria-hidden="true" />
                    </button>
                    <Link
                        to="/"
                        className="font-display text-xl leading-none tracking-tight md:text-2xl"
                        aria-label="YoStore home"
                    >
                        Yo<span className="text-accent">Store</span>
                    </Link>
                </div>

                {/* Center: primary links */}
                <nav
                    aria-label="Primary"
                    className="hidden items-center gap-7 text-sm font-medium lg:flex"
                >
                    <NavLink
                        to="/shop"
                        className={({ isActive }) =>
                            `transition-colors hover:text-accent ${isActive ? "text-accent" : "text-ink"}`
                        }
                    >
                        Shop
                    </NavLink>
                    <Dropdown
                        label="Collections"
                        textLabel="Collections"
                        chevron
                        menuClassName="left-0 right-auto"
                    >
                        <div className="mb-1 max-h-80 overflow-y-auto">
                            <Link
                                to="/shop"
                                role="menuitem"
                                className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-sunken"
                            >
                                All products
                                <span className="eyebrow">Shop</span>
                            </Link>
                            {(categories ?? []).map((category) => (
                                <Link
                                    key={category.slug}
                                    to={`/shop/${category.slug}`}
                                    role="menuitem"
                                    className="block px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    </Dropdown>
                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            `transition-colors hover:text-accent ${isActive ? "text-accent" : "text-ink"}`
                        }
                    >
                        About
                    </NavLink>
                    <NavLink
                        to="/contact"
                        className={({ isActive }) =>
                            `transition-colors hover:text-accent ${isActive ? "text-accent" : "text-ink"}`
                        }
                    >
                        Contact
                    </NavLink>
                    <NavLink
                        to="/faq"
                        className={({ isActive }) =>
                            `transition-colors hover:text-accent ${isActive ? "text-accent" : "text-ink"}`
                        }
                    >
                        FAQ
                    </NavLink>
                </nav>

                {/* Right: actions */}
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={() => dispatch(openSearch())}
                        aria-label="Search products"
                    >
                        <Search className="size-[1.15rem]" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        className="icon-btn"
                        onClick={toggleTheme}
                        aria-label={
                            theme === "dark"
                                ? "Switch to light theme"
                                : "Switch to dark theme"
                        }
                    >
                        {theme === "dark" ? (
                            <Sun className="size-[1.15rem]" aria-hidden="true" />
                        ) : (
                            <Moon className="size-[1.15rem]" aria-hidden="true" />
                        )}
                    </button>

                    <Link
                        to="/wishlist"
                        className="icon-btn hidden sm:inline-flex"
                        aria-label={`Wishlist (${wishlistCount} items)`}
                    >
                        <Heart className="size-[1.15rem]" aria-hidden="true" />
                        {wishlistCount > 0 ? (
                            <span className="badge-count">{wishlistCount}</span>
                        ) : null}
                    </Link>

                    {user ? (
                        <Dropdown label="Account" icon={User}>
                            <p className="truncate border-b border-hair px-3 py-2.5 text-xs text-muted">
                                Signed in as{" "}
                                <strong className="font-semibold text-ink">
                                    {user.name}
                                </strong>
                            </p>
                            <Link to="/profile" role="menuitem" className={menuLinkClass}>
                                Profile
                            </Link>
                            <Link to="/orders" role="menuitem" className={menuLinkClass}>
                                Orders
                            </Link>
                            <Link to="/wishlist" role="menuitem" className={menuLinkClass}>
                                Wishlist
                            </Link>
                            <Link to="/tracking" role="menuitem" className={menuLinkClass}>
                                Track an order
                            </Link>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={signOut}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger-tint"
                            >
                                <LogOut className="size-4" aria-hidden="true" />
                                Sign out
                            </button>
                        </Dropdown>
                    ) : (
                        <Link
                            to="/auth/login"
                            className="icon-btn hidden sm:inline-flex"
                            aria-label="Sign in"
                        >
                            <User className="size-[1.15rem]" aria-hidden="true" />
                        </Link>
                    )}

                    <button
                        type="button"
                        className="icon-btn"
                        onClick={() => dispatch(openCartDrawer())}
                        aria-label={`Open cart (${cartCount} items)`}
                    >
                        <ShoppingBag className="size-[1.15rem]" aria-hidden="true" />
                        {cartCount > 0 ? (
                            <span className="badge-count">{cartCount}</span>
                        ) : null}
                    </button>
                </div>
            </div>
        </header>
    );
}
