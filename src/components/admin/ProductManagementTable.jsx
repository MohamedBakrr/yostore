import { Link } from "react-router";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Eye, Package, Pencil, Trash2 } from "lucide-react";
import ProductPrice from "../products/ProductPrice";

/** Header cells: uppercase micro-labels mirroring the `eyebrow` utility. */
const HEAD_SX = {
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "text.secondary",
};

function thumbnailOf(product) {
    return product.thumbnail || product.images?.[0] || "";
}

function categoryLabel(category) {
    if (!category) return "—";
    return String(category).replace(/-/g, " ");
}

function Thumb({ product, className }) {
    const src = thumbnailOf(product);
    if (!src) {
        return (
            <span
                className={`grid shrink-0 place-items-center bg-sunken text-muted ${className}`}
                aria-hidden="true"
            >
                <Package className="size-5" />
            </span>
        );
    }
    return (
        <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            className={`shrink-0 bg-sunken object-cover ${className}`}
        />
    );
}

function StockValue({ stock }) {
    const value = Number(stock);
    if (!Number.isFinite(value)) return <span className="text-muted">—</span>;
    if (value <= 0) {
        return (
            <span className="text-sm font-semibold text-danger">
                Out of stock
            </span>
        );
    }
    return <span className="text-sm text-ink-soft">{value}</span>;
}

function LocalChips({ product }) {
    if (!product.locallyCreated && !product.locallyEdited) return null;
    return (
        <>
            {product.locallyCreated ? (
                <span className="chip border-accent text-accent">
                    Local demo
                </span>
            ) : null}
            {product.locallyEdited ? (
                <span className="chip border-accent bg-accent-tint text-accent">
                    Edited
                </span>
            ) : null}
        </>
    );
}

/**
 * Rows/cards for `/admin/products`: a MUI data table from `md` up and
 * stacked cards below, both fed from the same merged list (DummyJSON page +
 * local demo overlay). Every action has a label naming the product it acts on.
 */
export default function ProductManagementTable({ products, onEdit, onDelete }) {
    if (!products.length) return null;

    return (
        <>
            {/* md+ — data table */}
            <div className="hidden overflow-x-auto border border-hair bg-surface md:block">
                <Table
                    size="small"
                    aria-label="Products in the local demo overlay"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell scope="col" sx={HEAD_SX}>
                                Image
                            </TableCell>
                            <TableCell scope="col" sx={HEAD_SX}>
                                Title
                            </TableCell>
                            <TableCell scope="col" sx={HEAD_SX}>
                                Category
                            </TableCell>
                            <TableCell scope="col" sx={HEAD_SX}>
                                Price
                            </TableCell>
                            <TableCell scope="col" sx={HEAD_SX}>
                                Stock
                            </TableCell>
                            <TableCell scope="col" align="right" sx={HEAD_SX}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} hover>
                                <TableCell>
                                    <Thumb
                                        product={product}
                                        className="size-11"
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex min-w-44 flex-col gap-1.5">
                                        <Link
                                            to={`/product/${product.id}`}
                                            className="link-underline font-semibold text-ink"
                                        >
                                            {product.title}
                                        </Link>
                                        <div className="flex flex-wrap gap-1.5">
                                            <LocalChips product={product} />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm capitalize text-ink-soft">
                                        {categoryLabel(product.category)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <ProductPrice
                                        price={product.price}
                                        discountPercentage={
                                            product.discountPercentage
                                        }
                                        size="sm"
                                    />
                                </TableCell>
                                <TableCell>
                                    <StockValue stock={product.stock} />
                                </TableCell>
                                <TableCell align="right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link
                                            to={`/product/${product.id}`}
                                            className="icon-btn"
                                            aria-label={`View ${product.title} in the store`}
                                        >
                                            <Eye
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            onClick={() => onEdit(product)}
                                            aria-label={`Edit ${product.title}`}
                                        >
                                            <Pencil
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            className="icon-btn text-danger hover:text-danger"
                                            onClick={() => onDelete(product)}
                                            aria-label={`Delete ${product.title}`}
                                        >
                                            <Trash2
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* below md — stacked cards */}
            <ul className="space-y-3 md:hidden">
                {products.map((product) => (
                    <li key={product.id} className="card-flat p-4">
                        <div className="flex gap-3">
                            <Thumb product={product} className="size-14" />
                            <div className="min-w-0 flex-1">
                                <Link
                                    to={`/product/${product.id}`}
                                    className="link-underline break-words font-semibold text-ink"
                                >
                                    {product.title}
                                </Link>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    <LocalChips product={product} />
                                </div>
                            </div>
                        </div>

                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hair pt-3">
                            <div>
                                <dt className="eyebrow">Category</dt>
                                <dd className="mt-1 text-sm capitalize text-ink-soft">
                                    {categoryLabel(product.category)}
                                </dd>
                            </div>
                            <div>
                                <dt className="eyebrow">Price</dt>
                                <dd className="mt-1">
                                    <ProductPrice
                                        price={product.price}
                                        discountPercentage={
                                            product.discountPercentage
                                        }
                                        size="sm"
                                    />
                                </dd>
                            </div>
                            <div>
                                <dt className="eyebrow">Stock</dt>
                                <dd className="mt-1">
                                    <StockValue stock={product.stock} />
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                to={`/product/${product.id}`}
                                className="btn btn-secondary min-h-11"
                            >
                                View
                            </Link>
                            <button
                                type="button"
                                className="btn btn-secondary min-h-11"
                                onClick={() => onEdit(product)}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger min-h-11"
                                onClick={() => onDelete(product)}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
