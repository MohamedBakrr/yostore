import { Drawer } from "@mui/material";
import { Heart, LogOut, Moon, Search, Sun, User } from "lucide-react";
import { Link, NavLink } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { closeMobileNav, selectMobileNavOpen, openSearch } from "../../store/uiSlice";
import { logoutUser, selectUser } from "../../store/authSlice";
import { useCategories } from "../../hooks/useCategories";
import { useTheme } from "../../providers/ThemeProvider";
import { useToast } from "../../providers/ToastProvider";

function linkClass({ isActive }) {
    return [
        "block py-2.5 font-display text-lg transition-colors",
        isActive ? "text-accent" : "text-ink hover:text-accent",
    ].join(" ");
}

function utilityClass({ isActive }) {
    return [
        "flex items-center gap-2.5 py-2 text-sm text-ink-soft transition-colors hover:text-ink",
        isActive ? "font-semibold text-ink" : "",
    ].join(" ");
}

/** Full-height navigation drawer for small screens. */
export default function MobileNavigation() {
    const open = useAppSelector(selectMobileNavOpen);
    const user = useAppSelector(selectUser);
    const dispatch = useAppDispatch();
    const { theme, toggleTheme } = useTheme();
    const { notify } = useToast();
    const { data: categories } = useCategories();

    const close = () => dispatch(closeMobileNav());

    const search = () => {
        close();
        dispatch(openSearch());
    };

    const signOut = () => {
        close();
        dispatch(logoutUser());
        notify("Signed out. Your demo data stays on this device.", "info");
    };

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={close}
            aria-label="Navigation menu"
            slotProps={{
                paper: {
                    sx: { width: "19rem", maxWidth: "85vw", borderRight: "1px solid", borderColor: "divider" },
                },
            }}
        >
            <div className="flex h-full flex-col overflow-y-auto bg-surface">
                <div className="flex items-center justify-between border-b border-hair px-5 py-4">
                    <Link
                        to="/"
                        onClick={close}
                        className="font-display text-xl tracking-tight"
                    >
                        Yo<span className="text-accent">Store</span>
                    </Link>
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
                            <Sun className="size-5" aria-hidden="true" />
                        ) : (
                            <Moon className="size-5" aria-hidden="true" />
                        )}
                    </button>
                </div>

                <nav aria-label="Mobile" className="flex-1 px-5 py-5">
                    <NavLink to="/shop" onClick={close} className={linkClass}>
                        Shop
                    </NavLink>

                    <p className="eyebrow mt-5 mb-1">Collections</p>
                    <div className="max-h-52 overflow-y-auto">
                        {(categories ?? []).map((category) => (
                            <NavLink
                                key={category.slug}
                                to={`/shop/${category.slug}`}
                                onClick={close}
                                className="block py-1.5 text-sm text-ink-soft transition-colors hover:text-accent"
                            >
                                {category.name}
                            </NavLink>
                        ))}
                    </div>

                    <p className="eyebrow mt-5 mb-1">Store</p>
                    <NavLink to="/about" onClick={close} className={linkClass}>
                        About
                    </NavLink>
                    <NavLink to="/contact" onClick={close} className={linkClass}>
                        Contact
                    </NavLink>
                    <NavLink to="/faq" onClick={close} className={linkClass}>
                        FAQ
                    </NavLink>
                    <NavLink to="/shipping" onClick={close} className={linkClass}>
                        Shipping
                    </NavLink>
                    <NavLink to="/tracking" onClick={close} className={linkClass}>
                        Track an order
                    </NavLink>

                    <p className="eyebrow mt-5 mb-1">Account</p>
                    {user ? (
                        <>
                            <NavLink to="/profile" onClick={close} className={utilityClass}>
                                <User className="size-4" aria-hidden="true" />
                                Profile
                            </NavLink>
                            <NavLink to="/orders" onClick={close} className={utilityClass}>
                                Orders
                            </NavLink>
                            <NavLink to="/wishlist" onClick={close} className={utilityClass}>
                                <Heart className="size-4" aria-hidden="true" />
                                Wishlist
                            </NavLink>
                            <button
                                type="button"
                                onClick={signOut}
                                className="flex w-full items-center gap-2.5 py-2 text-sm text-danger transition-colors hover:opacity-80"
                            >
                                <LogOut className="size-4" aria-hidden="true" />
                                Sign out
                            </button>
                        </>
                    ) : (
                        <div className="mt-1 flex flex-col gap-2.5">
                            <Link
                                to="/auth/login"
                                onClick={close}
                                className="btn btn-primary btn-sm"
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/auth/register"
                                onClick={close}
                                className="btn btn-secondary btn-sm"
                            >
                                Create account
                            </Link>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={search}
                        className="mt-5 flex w-full items-center gap-2.5 border border-hair px-3 py-2.5 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    >
                        <Search className="size-4" aria-hidden="true" />
                        Search products
                    </button>
                </nav>
            </div>
        </Drawer>
    );
}
