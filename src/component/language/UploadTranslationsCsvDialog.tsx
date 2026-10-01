"use client";

import Button from "@/extra/Button";
import { closeDialog } from "@/store/dialogSlice";
import { uploadMultipleTranslations } from "@/store/languageSlice";
import { RootStore, useAppDispatch } from "@/store/store";

import { usePermission } from "@/context/PermissionContext";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const MODULE_NAME = "Language Management";

type Props = {
  onSuccess: () => void;
};

type ActiveLang = { title: string; code: string };

const UploadTranslationsCsvDialog = ({ onSuccess }: Props) => {
  const dispatch = useAppDispatch();
  const { can } = usePermission();
  
  const { languages, isSkeleton } = useSelector(
    (state: RootStore) => state.language
  );
  const activeLanguages = useMemo(() => {
    return languages
      .filter((l: any) => Boolean(l?.isActive))
      .map((l: any) => ({
        title:
          String(l?.languageTitle ?? "").trim() ||
          String(l?.languageCode ?? ""),
        code: String(l?.languageCode ?? "").trim(),
      }))
      .filter((l: ActiveLang) => l.code);
  }, [languages]);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const count = activeLanguages.length;

  const handleSubmit = () => {
    if (!file) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("file", file);
    dispatch(uploadMultipleTranslations(fd)).then((action: any) => {
      setSubmitting(false);
      if (!action.error && action.payload?.status !== false) {
        dispatch(closeDialog());
        setFile(null);
        onSuccess();
      }
    });
  };

  return (
    <div className="dialog">
      <div style={{ width: "min(520px, 96vw)" }}>
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead mb-2">
                <div className="col-9">
                  <h2 className="text-theme fs-22 m0 fw-600">Upload CSV File</h2>
                </div>
                <div className="col-3 text-end">
                  <div
                    className="closeButton"
                    onClick={() => {
                      dispatch(closeDialog());
                      setFile(null);
                    }}
                    style={{ fontSize: "18px" }}
                  >
                    ✖
                  </div>
                </div>
              </div>

              <p className="text-muted small mb-3" style={{ lineHeight: 1.5 }}>
                You currently have{" "}
                <strong className="text-dark">{count}</strong> active{" "}
                {count === 1 ? "language" : "languages"}. Please upload a CSV
                file that includes all these languages.
              </p>

              <div
                className="border rounded-2 bg-white mb-3"
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  borderColor: "#dee2e6",
                }}
              >
                {isSkeleton ? (
                  <div className="p-3 text-muted small">Loading languages…</div>
                ) : activeLanguages.length === 0 ? (
                  <div className="p-3 text-muted small">
                    No active languages found.
                  </div>
                ) : (
                  <ul className="list-unstyled m-0 p-0">
                    {activeLanguages.map((lang) => (
                      <li
                        key={lang.code}
                        className="px-3 py-2 border-bottom"
                        style={{ borderColor: "#eee" }}
                      >
                        <span className="text-capitalize">{lang.title}</span>{" "}
                        <span className="text-muted">({lang.code})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div
                className="rounded-2 px-3 py-2 mb-3 small"
                style={{
                  backgroundColor: "#e7f5ff",
                  border: "1px solid #b8daff",
                  color: "#004085",
                }}
              >
                <strong>Note:</strong> The language code must exist inside the
                CSV file being uploaded.
              </div>

              <div className="mb-3">
                <label
                  htmlFor="uploadTranslationsCsvFile"
                  className="form-label mb-1 d-block fw-500"
                >
                  Select CSV File
                </label>
                <input
                  id="uploadTranslationsCsvFile"
                  type="file"
                  accept=".csv,text/csv"
                  className="form-control form-control-sm"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setFile(f ?? null);
                  }}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  className="cancelButton text-light"
                  text="Cancel"
                  type="button"
                  onClick={() => {
                    dispatch(closeDialog());
                    setFile(null);
                  }}
                />
                <Button
                  className="bg-button p-10 text-white"
                  text={submitting ? "Uploading…" : "Submit"}
                  type="button"
                  disabled={!file || submitting}
                  onClick={handleSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTranslationsCsvDialog;
