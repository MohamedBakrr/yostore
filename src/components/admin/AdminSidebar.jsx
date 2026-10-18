import { NavLink, Link } from "react-router";
import {
    ArrowLeft,
    LayoutDashboard,
    PackageSearch,
    ReceiptText,
} from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { selectUser } from "../../store/authSlice";

const NAV_ITEMS = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/products", label: "Products", icon: PackageSearch },
    { to: "/admin/orders", label: "Orders", icon: ReceiptText },
];

function itemClass({ isActive }) {
    return [
        "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
        isActive
            ? "bg-sunken font-semibold text-ink"
            : "text-ink-soft hover:bg-sunken hover:text-ink",
    ].join(" ");
}

/**
 * Sidebar for the demo admin area. Client-side navigation only — React route
 * guards are a convenience, never an authorization boundary.
 */
export default function AdminSidebar() {
    const user = useAppSelector(selectUser);

    return (
        <aside className="flex w-full flex-col border-b border-hair bg-surface lg:h-full lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
            <div className="border-b border-hair px-4 py-5">
                <Link
                    to="/"
                    className="font-display text-lg tracking-tight"
                    aria-label="YoStore home"
                >
                    Yo<span className="text-accent">Store</span>
                </Link>
                <p className="eyebrow mt-1.5">Admin (demo)</p>
            </div>

            <nav aria-label="Admin" className="flex gap-1 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:overflow-visible">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={itemClass}
                    >
                        <item.icon className="size-4 shrink-0" aria-hidden="true" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="hidden border-t border-hair px-4 py-4 lg:block">
                <p className="truncate text-xs text-muted">
                    Signed in as{" "}
                    <strong className="font-semibold text-ink">{user?.name}</strong>
                </p>
                <Link
                    to="/"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to store
                </Link>
            </div>
        </aside>
    );
}
