import { useMemo } from "react";
import { Link } from "react-router";
import { ListOrdered, Receipt } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAppSelector } from "../../store/hooks";
import { selectUser } from "../../store/authSlice";
import { ordersRepository } from "../../repositories/ordersRepository";
import OrderList from "../../components/orders/OrderList";
import DemoNotice from "../../components/checkout/DemoNotice";
import EmptyState from "../../components/feedback/EmptyState";

/**
 * `/orders` (protected) — every demo order stored for the signed-in account
 * and nobody else's: `listByAccount(user.id)` only.
 */
export default function OrderHistoryPage() {
    useDocumentTitle("Order history", {
        description:
            "Every demo order placed with this account in this browser — status, date, and total at a glance.",
    });

    const user = useAppSelector(selectUser);
    const orders = useMemo(
        () => (user ? ordersRepository.listByAccount(user.id) : []),
        [user],
    );

    return (
        <div className="page-frame py-10 md:py-14">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-hair pb-6">
                <div>
                    <p className="eyebrow">Account</p>
                    <h1 className="mt-3 font-display text-4xl text-balance-tight md:text-5xl">
                        Order history
                    </h1>
                    <p className="mt-3 text-sm text-muted">
                        {orders.length === 0
                            ? "Orders you place will collect here."
                            : `${orders.length} ${
                                  orders.length === 1 ? "order" : "orders"
                              } placed with this account.`}
                    </p>
                </div>
                <Link to="/tracking" className="btn btn-secondary btn-sm">
                    Track an order
                </Link>
            </header>

            <div className="mt-6 max-w-3xl">
                <DemoNotice label="Demo orders.">
                    History is scoped to this mock account and stored in this
                    browser only — signing out hides it from the next visitor.
                </DemoNotice>
            </div>

            {orders.length === 0 ? (
                <div className="mt-10 max-w-2xl">
                    <EmptyState
                        icon={Receipt}
                        title="No orders yet"
                        description="When you place a demo order it appears here with its status, totals, and simulated timeline."
                        action={
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link to="/shop" className="btn btn-primary btn-sm">
                                    Start shopping
                                </Link>
                                <Link
                                    to="/shipping"
                                    className="btn btn-secondary btn-sm"
                                >
                                    How shipping works
                                </Link>
                            </div>
                        }
                    />
                </div>
            ) : (
                <section aria-labelledby="orders-list-title" className="mt-10">
                    <h2
                        id="orders-list-title"
                        className="flex items-center gap-2 font-display text-xl"
                    >
                        <ListOrdered className="size-5 text-accent" aria-hidden="true" />
                        Your orders
                    </h2>
                    <div className="mt-4">
                        <OrderList orders={orders} />
                    </div>
                </section>
            )}
        </div>
    );
}
