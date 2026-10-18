import { Link } from "react-router";
import { useCategories } from "../../hooks/useCategories";

const COMPANY_LINKS = [
    { to: "/about", label: "About YoStore" },
    { to: "/contact", label: "Contact" },
    { to: "/faq", label: "FAQ" },
];

const HELP_LINKS = [
    { to: "/shipping", label: "Shipping policy" },
    { to: "/tracking", label: "Order tracking" },
    { to: "/cart", label: "Cart" },
    { to: "/wishlist", label: "Wishlist" },
];

const ACCOUNT_LINKS = [
    { to: "/auth/login", label: "Sign in" },
    { to: "/auth/register", label: "Create account" },
    { to: "/profile", label: "Profile" },
    { to: "/orders", label: "Order history" },
];

function LinkColumn({ title, links }) {
    return (
        <div>
            <h2 className="eyebrow mb-4">{title}</h2>
            <ul className="space-y-2.5">
                {links.map((link) => (
                    <li key={link.to}>
                        <Link
                            to={link.to}
                            className="text-sm text-ink-soft transition-colors hover:text-accent"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Site footer: navigation columns, dynamic categories, demo disclaimer. */
export default function Footer() {
    const { data: categories } = useCategories();

    const categoryLinks = (categories ?? []).slice(0, 6).map((category) => ({
        to: `/shop/${category.slug}`,
        label: category.name,
    }));

    return (
        <footer className="rule-t bg-sunken">
            <div className="page-frame py-14">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
                    <div className="max-w-xs">
                        <Link to="/" className="font-display text-2xl tracking-tight">
                            Yo<span className="text-accent">Store</span>
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed text-muted">
                            An editorial commerce demo: considered objects,
                            honest materials, and a storefront built to be
                            enjoyed.
                        </p>
                        <p className="chip mt-5">Demo storefront</p>
                    </div>

                    <LinkColumn title="Collections" links={categoryLinks} />
                    <LinkColumn title="Company" links={COMPANY_LINKS} />
                    <LinkColumn title="Account" links={ACCOUNT_LINKS} />
                    <LinkColumn title="Help" links={HELP_LINKS} />
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-hair pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} YoStore — a demonstration project.</p>
                    <p>
                        No real orders, payments, or accounts are processed.
                        Data stays in your browser.
                    </p>
                </div>
            </div>
        </footer>
    );
}
