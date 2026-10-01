"use client";

import React, { useEffect } from "react";

export type SimpleDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** When false, clicking the backdrop does not close the dialog */
  closeOnBackdrop?: boolean;
};

export default function SimpleDialog({
  open,
  title,
  onClose,
  children,
  closeOnBackdrop = true,
}: SimpleDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="dialog"
      role="presentation"
      onClick={() => closeOnBackdrop && onClose()}
    >
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-4 col-md-6 col-11">
            <div
              className="mainDiaogBox"
              role="dialog"
              aria-modal="true"
              aria-labelledby="simple-dialog-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2
                    id="simple-dialog-title"
                    className="text-theme fs-22 m0 fw-semibold"
                  >
                    {title}
                  </h2>
                </div>
                <div className="col-4">
                  <button
                    type="button"
                    className="closeButton border-0"
                    onClick={onClose}
                    aria-label="Close dialog"
                  >
                    ✖
                  </button>
                </div>
              </div>
              <div className="formBody mt-3">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
