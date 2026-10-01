import React, { forwardRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import type { SlideProps } from "@mui/material/Slide";

const Transition = forwardRef(function Transition(props: SlideProps, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface PaymentRestrictionsDialogProps {
  open: boolean;
  onClose: () => void;
}

const PaymentRestrictionsDialog = ({ open, onClose }: PaymentRestrictionsDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      TransitionComponent={Transition}
      aria-labelledby="payment-restriction-dialog-heading"
      fullWidth
      maxWidth="sm"
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
        },
      }}
      PaperProps={{
        className: "payment-restriction-dialog-paper",
        elevation: 0,
      }}
    >
      <DialogTitle className="payment-restriction-dialog-title" sx={{ p: 0 }}>
        <IconButton
          aria-label="Close dialog"
          onClick={onClose}
          className="payment-restriction-dialog-close"
          size="small"
        >
          <i className="ri-close-line" style={{ fontSize: "1.25rem" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent className="payment-restriction-dialog-body" sx={{ p: 0 }}>
        <div className="payment-restriction-dialog-icon" aria-hidden>
          <i className="ri-lock-line" />
        </div>

        <h2 id="payment-restriction-dialog-heading" className="payment-restriction-dialog-heading">
          Extended License Required
        </h2>

        <p className="payment-restriction-dialog-text">
          If you want to charge end users by any way, you are required to purchase an Extended License as per
          CodeCanyon/Envato policy.
        </p>

        <hr className="payment-restriction-dialog-divider" />

        <p className="payment-restriction-dialog-subtext">Contact us to upgrade license</p>

        <div className="payment-restriction-dialog-actions">
          <button
            type="button"
            className="payment-restriction-dialog-cta"
            onClick={() => window.open("https://wa.me/+919909515320", "_blank", "noopener,noreferrer")}
          >
            <i className="ri-whatsapp-line" style={{ fontSize: "1.125rem" }} />
            +91 9909515320
          </button>

          <a
            href="https://codecanyon.net/licenses/faq#main-differences-licenses-a"
            target="_blank"
            rel="noopener noreferrer"
            className="payment-restriction-dialog-link"
          >
            View Envato License Policy
            <i className="ri-external-link-line" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRestrictionsDialog;
