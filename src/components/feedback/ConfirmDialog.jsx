import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

/**
 * Accessible confirmation dialog (MUI) for destructive actions such as
 * deleting a demo product or clearing the cart.
 */
export default function ConfirmDialog({
    open,
    title = "Are you sure?",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
    onConfirm,
    onCancel,
    busy = false,
}) {
    return (
        <Dialog
            open={open}
            onClose={busy ? undefined : onCancel}
            aria-labelledby="confirm-dialog-title"
            slotProps={{
                paper: {
                    sx: { maxWidth: 440, border: "1px solid", borderColor: "divider" },
                },
            }}
        >
            <DialogTitle
                id="confirm-dialog-title"
                sx={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
                {title}
            </DialogTitle>
            <DialogContent>
                <p className="text-sm leading-relaxed text-muted">{message}</p>
            </DialogContent>
            <DialogActions className="gap-2 px-4 pb-4">
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onCancel}
                    disabled={busy}
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    className={`btn btn-sm ${destructive ? "btn-danger" : "btn-primary"}`}
                    onClick={onConfirm}
                    disabled={busy}
                >
                    {confirmLabel}
                </button>
            </DialogActions>
        </Dialog>
    );
}
