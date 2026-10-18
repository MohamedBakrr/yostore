import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { adminProductSchema } from "../../utils/validation/schemas";
import InlineValidationError from "../feedback/InlineValidationError";
import LoadingButton from "../feedback/LoadingButton";

function buildValues(product) {
    return {
        title: product?.title ?? "",
        description: product?.description ?? "",
        price: product?.price ?? "",
        category: product?.category ?? "",
        stock: product?.stock ?? "",
        discountPercentage: product?.discountPercentage ?? "",
    };
}

/**
 * Create/edit dialog for the local demo overlay (RHF + `adminProductSchema`).
 * The parent owns the open state and performs the repository write, returning
 * `{ ok }` — the dialog only closes itself through `onClose` on success paths
 * handled by the parent, and stays open when a save reports failure.
 */
export default function ProductFormDialog({
    open,
    product,
    categories,
    onClose,
    onSubmit,
}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(adminProductSchema),
        defaultValues: buildValues(product),
    });

    useEffect(() => {
        if (open) reset(buildValues(product));
    }, [open, product, reset]);

    const hasCategoryOptions =
        Array.isArray(categories) && categories.length > 0;
    const currentCategory = product?.category ?? "";
    const currentCategoryMissing =
        hasCategoryOptions &&
        Boolean(currentCategory) &&
        !categories.some((item) => item.slug === currentCategory);
    const selectOptions = currentCategoryMissing
        ? [{ slug: currentCategory, name: `${currentCategory} (not in catalog)` }, ...categories]
        : (categories ?? []);

    return (
        <Dialog
            open={open}
            onClose={isSubmitting ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            aria-labelledby="product-form-title"
            slotProps={{
                paper: {
                    sx: { maxWidth: 560, border: "1px solid", borderColor: "divider" },
                },
            }}
        >
            <DialogTitle
                id="product-form-title"
                sx={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
                {product ? "Edit demo product" : "New demo product"}
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent className="space-y-4">
                    <p className="text-xs leading-relaxed text-muted">
                        Saved to this browser&apos;s local demo overlay only —
                        the public DummyJSON dataset is never modified.
                    </p>

                    <div>
                        <label className="field-label" htmlFor="admin-product-title">
                            Title
                        </label>
                        <input
                            id="admin-product-title"
                            type="text"
                            className="field"
                            aria-invalid={!!errors.title}
                            aria-describedby={
                                errors.title ? "admin-product-title-error" : undefined
                            }
                            {...register("title")}
                        />
                        <InlineValidationError id="admin-product-title-error">
                            {errors.title?.message}
                        </InlineValidationError>
                    </div>

                    <div>
                        <label
                            className="field-label"
                            htmlFor="admin-product-description"
                        >
                            Description
                        </label>
                        <textarea
                            id="admin-product-description"
                            className="field"
                            aria-invalid={!!errors.description}
                            aria-describedby={
                                errors.description
                                    ? "admin-product-description-error"
                                    : undefined
                            }
                            {...register("description")}
                        />
                        <InlineValidationError id="admin-product-description-error">
                            {errors.description?.message}
                        </InlineValidationError>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                className="field-label"
                                htmlFor="admin-product-price"
                            >
                                Price (USD)
                            </label>
                            <input
                                id="admin-product-price"
                                type="number"
                                step="0.01"
                                min="0"
                                inputMode="decimal"
                                className="field"
                                aria-invalid={!!errors.price}
                                aria-describedby={
                                    errors.price
                                        ? "admin-product-price-error"
                                        : undefined
                                }
                                {...register("price")}
                            />
                            <InlineValidationError id="admin-product-price-error">
                                {errors.price?.message}
                            </InlineValidationError>
                        </div>

                        <div>
                            <label
                                className="field-label"
                                htmlFor="admin-product-discount"
                            >
                                Discount %
                            </label>
                            <input
                                id="admin-product-discount"
                                type="number"
                                step="0.1"
                                min="0"
                                max="90"
                                inputMode="decimal"
                                className="field"
                                aria-invalid={!!errors.discountPercentage}
                                aria-describedby={
                                    errors.discountPercentage
                                        ? "admin-product-discount-error"
                                        : undefined
                                }
                                {...register("discountPercentage")}
                            />
                            <InlineValidationError id="admin-product-discount-error">
                                {errors.discountPercentage?.message}
                            </InlineValidationError>
                        </div>

                        <div>
                            <label
                                className="field-label"
                                htmlFor="admin-product-stock"
                            >
                                Stock
                            </label>
                            <input
                                id="admin-product-stock"
                                type="number"
                                step="1"
                                min="0"
                                inputMode="numeric"
                                className="field"
                                aria-invalid={!!errors.stock}
                                aria-describedby={
                                    errors.stock
                                        ? "admin-product-stock-error"
                                        : undefined
                                }
                                {...register("stock")}
                            />
                            <InlineValidationError id="admin-product-stock-error">
                                {errors.stock?.message}
                            </InlineValidationError>
                        </div>

                        <div>
                            <label
                                className="field-label"
                                htmlFor="admin-product-category"
                            >
                                Category
                            </label>
                            {hasCategoryOptions ? (
                                <select
                                    id="admin-product-category"
                                    className="field"
                                    aria-invalid={!!errors.category}
                                    aria-describedby={
                                        errors.category
                                            ? "admin-product-category-error"
                                            : undefined
                                    }
                                    {...register("category")}
                                >
                                    <option value="">Select a category</option>
                                    {selectOptions.map((item) => (
                                        <option
                                            key={item.slug}
                                            value={item.slug}
                                        >
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    id="admin-product-category"
                                    type="text"
                                    className="field"
                                    placeholder="e.g. beauty"
                                    aria-invalid={!!errors.category}
                                    aria-describedby={
                                        errors.category
                                            ? "admin-product-category-error"
                                            : undefined
                                    }
                                    {...register("category")}
                                />
                            )}
                            <InlineValidationError id="admin-product-category-error">
                                {errors.category?.message}
                            </InlineValidationError>
                        </div>
                    </div>
                </DialogContent>

                <DialogActions className="gap-2 px-4 pb-4">
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <LoadingButton type="submit" size="sm" loading={isSubmitting}>
                        {product ? "Save changes" : "Create product"}
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
}
