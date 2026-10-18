import { useMemo } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { ArrowRight, PackageSearch, ReceiptText, Store } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppSelector } from "../../store/hooks";
import { selectUser } from "../../store/authSlice";
import { productsApi } from "../../services";
import { queryKeys } from "../../app/queryClient";
import { formatCurrency, formatDateTime } from "../../utils/formatting";
import DemoDataNotice from "../../components/admin/DemoDataNotice";
import AdminMetrics from "../../components/admin/AdminMetrics";
import EmptyState from "../../components/feedback/EmptyState";
import {
    buildBuyerLabels,
    statusLabel,
    statusToneClass,
    summarizeOrders,
} from "../../features/admin/orderSummary";
import { useDemoOrders } from "../../features/admin/useDemoOrders";
import { useDemoOverlay } from "../../features/admin/useDemoOverlay";

const HEAD_SX = {
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "text.secondary",
};

const QUICK_LINKS = [
    {
        to: "/admin/products",
        title: "Manage products",
        description:
            "Create, edit, hide, or reset products in the local demo overlay.",
        icon: PackageSearch,
    },
    {
        to: "/admin/orders",
        title: "Review demo orders",
        description:
            "Every order stored in this browser, with simulated status updates.",
        icon: ReceiptText,
    },
    {
        to: "/shop",
        title: "Open the storefront",
        description:
            "What customers see — the public DummyJSON catalog, read-only.",
        icon: Store,
    },
];

export default function AdminDashboardPage() {
    useDocumentTitle("Admin dashboard", {
        description:
            "YoStore demo admin overview — catalog size, local demo product changes, and demo orders stored in this browser.",
    });

    const user = useAppSelector(selectUser);
    const { orders } = useDemoOrders();
    const overlay = useDemoOverlay();

    const summary = useMemo(() => summarizeOrders(orders), [orders]);
    const recent = useMemo(() => orders.slice(0, 5), [orders]);
    const buyers = useMemo(() => buildBuyerLabels(recent), [recent]);

    const catalogQuery = useQuery({
        queryKey: queryKeys.products({ limit: 1, view: "admin-total" }),
        queryFn: ({ signal }) => productsApi.getProducts({ limit: 1, signal }),
    });

    const detailLink = (orderId) =>
        `/admin/orders?order=${encodeURIComponent(orderId)}`;

    return (
        <div className="page-frame py-10 md:py-14">
            <p className="eyebrow">Admin (demo)</p>
            <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-5xl">
                Admin dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                Welcome back{user?.name ? `, ${user.name}` : ""}. Every figure
                below is derived from the public catalog and from demo data
                stored in this browser.
            </p>

            <DemoDataNotice className="mt-6" />

            <AdminMetrics
                catalog={{
                    total: catalogQuery.data?.total,
                    isLoading: catalogQuery.isPending,
                    error: catalogQuery.error,
                    onRetry: () => catalogQuery.refetch(),
                }}
                stats={overlay.stats}
                summary={summary}
            />

            <section
                aria-labelledby="recent-orders-heading"
                className="rule-t mt-10 pt-8"
            >
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2
                            id="recent-orders-heading"
                            className="font-display text-2xl"
                        >
                            Recent demo orders
                        </h2>
                        <p className="mt-1 text-sm text-muted">
                            Newest first, across every account and guest
                            checkout in this browser.
                        </p>
                    </div>
                    <Link to="/admin/orders" className="btn btn-secondary btn-sm">
                        View all orders
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>

                {recent.length === 0 ? (
                    <EmptyState
                        className="mt-5"
                        icon={ReceiptText}
                        title="No demo orders yet"
                        description="Complete a checkout to create one — orders are stored locally in this browser."
                        action={
                            <Link to="/shop" className="btn btn-primary">
                                Start shopping
                            </Link>
                        }
                    />
                ) : (
                    <div className="mt-5 overflow-x-auto border border-hair bg-surface">
                        <Table size="small" aria-label="Recent demo orders">
                            <TableHead>
                                <TableRow>
                                    <TableCell scope="col" sx={HEAD_SX}>
                                        Order
                                    </TableCell>
                                    <TableCell scope="col" sx={HEAD_SX}>
                                        Created
                                    </TableCell>
                                    <TableCell scope="col" sx={HEAD_SX}>
                                        Buyer
                                    </TableCell>
                                    <TableCell scope="col" sx={HEAD_SX}>
                                        Total (demo)
                                    </TableCell>
                                    <TableCell scope="col" sx={HEAD_SX}>
                                        Status
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recent.map((order) => (
                                    <TableRow
                                        key={`${order.accountId ?? "guest"}-${order.orderId}`}
                                        hover
                                    >
                                        <TableCell>
                                            <Link
                                                to={detailLink(order.orderId)}
                                                className="link-underline font-semibold"
                                            >
                                                {order.orderId}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {formatDateTime(order.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            {buyers.get(order.orderId) ?? "Guest"}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(order.totals?.total)}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`chip ${statusToneClass(order.status)}`}
                                            >
                                                {statusLabel(order.status)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>

            <section
                aria-labelledby="quick-links-heading"
                className="rule-t mt-10 pt-8"
            >
                <h2 id="quick-links-heading" className="font-display text-2xl">
                    Quick links
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {QUICK_LINKS.map((link) => (
                        <li key={link.to}>
                            <Link
                                to={link.to}
                                className="card-flat group flex h-full flex-col gap-2 p-5 transition-colors hover:border-hair-strong focus-visible:border-hair-strong"
                            >
                                <link.icon
                                    className="size-5 text-accent"
                                    aria-hidden="true"
                                />
                                <h3 className="font-display text-lg">
                                    {link.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted">
                                    {link.description}
                                </p>
                                <span className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-semibold text-ink-soft transition-transform group-hover:translate-x-0.5">
                                    Open
                                    <ArrowRight
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
