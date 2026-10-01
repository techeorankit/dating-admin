"use client";

import Button from "@/extra/Button";
import {
  getSingleLanguageTranslations,
  updateTranslationsOfSingleLanguage,
} from "@/store/languageSlice";
import { useAppDispatch } from "@/store/store";
import { usePermission } from "@/context/PermissionContext";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TranslationsTableShimmer from "@/component/Shimmer/TranslationsTableShimmer";
import { normalizeTranslations } from "./languageTranslationsUtils";

const SEARCH_DEBOUNCE_MS = 300;

const MODULE_NAME = "Language Management";

export type LanguageTranslationsSaveToolbar = {
  hasChanges: boolean;
  saving: boolean;
  save: () => void;
  canEdit: boolean;
};

type Props = {
  languageCode: string;
  languageTitle: string;
  /** Scroll area for the key/value table */
  tableMaxHeight?: string;
  /** When set (e.g. in dialog), keeps table area height stable when switching App/Web or loading */
  tableMinHeight?: string;
  /** When `footer`, Save is not shown in the header — parent should render it (e.g. dialog footer). */
  saveButtonPlacement?: "header" | "footer";
  /** Called when `saveButtonPlacement` is `footer` so the parent can render Save + Cancel together. */
  onSaveToolbarChange?: (state: LanguageTranslationsSaveToolbar | null) => void;
};

const LanguageTranslationsPanel = ({
  languageCode,
  languageTitle,
  tableMaxHeight = "min(60vh, 520px)",
  tableMinHeight,
  saveButtonPlacement = "header",
  onSaveToolbarChange,
}: Props) => {
  const dispatch = useAppDispatch();
  const { can } = usePermission();

  const [module, setModule] = useState<"app" | "web">("app");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [baseline, setBaseline] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const onSaveToolbarChangeRef = useRef(onSaveToolbarChange);
  onSaveToolbarChangeRef.current = onSaveToolbarChange;

  const displayTitle =
    String(languageTitle || "").trim() || languageCode || "";

  const load = useCallback(() => {
    if (!languageCode) return;
    setLoading(true);
    setDraft({});
    setBaseline({});
    dispatch(
      getSingleLanguageTranslations({ languageCode, module })
    ).then((action: any) => {
      setLoading(false);
      if (action.error) return;
      const map = normalizeTranslations(action.payload);
      setDraft(map);
      setBaseline(JSON.parse(JSON.stringify(map)));
    });
  }, [dispatch, languageCode, module]);

  useEffect(() => {
    if (languageCode) {
      load();
    }
  }, [languageCode, module, load]);

  useEffect(() => {
    setSearch("");
    setDebouncedSearch("");
  }, [module]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const totalKeys = Object.keys(draft).length;

  const filteredEntries = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    const entries = Object.entries(draft);
    if (!q) return entries.sort(([a], [b]) => a.localeCompare(b));
    return entries
      .filter(
        ([k, v]) =>
          k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)
      )
      .sort(([a], [b]) => a.localeCompare(b));
  }, [draft, debouncedSearch]);

  const pendingPatch = useMemo(() => {
    const out: Record<string, string> = {};
    for (const k of Object.keys(draft)) {
      if (draft[k] !== baseline[k]) {
        out[k] = draft[k];
      }
    }
    return out;
  }, [draft, baseline]);

  const hasChanges = Object.keys(pendingPatch).length > 0;

  const handleSave = useCallback(() => {
    if (!languageCode || !hasChanges) return;
    if (!can(MODULE_NAME, "Edit")) return;
    setSaving(true);
    dispatch(
      updateTranslationsOfSingleLanguage({
        languageCode,
        module,
        translations: pendingPatch,
      })
    ).then((action: any) => {
      setSaving(false);
      if (!action.error && action.payload?.status !== false) {
        setBaseline(JSON.parse(JSON.stringify(draft)));
      }
    });
  }, [languageCode, hasChanges, can, dispatch, module, pendingPatch, draft]);

  useEffect(() => {
    if (saveButtonPlacement !== "footer" || !onSaveToolbarChange) {
      return;
    }
    onSaveToolbarChange({
      hasChanges,
      saving,
      save: handleSave,
      canEdit: can(MODULE_NAME, "Edit"),
    });
  }, [
    saveButtonPlacement,
    onSaveToolbarChange,
    hasChanges,
    saving,
    handleSave,
    can,
  ]);

  useEffect(() => {
    return () => {
      onSaveToolbarChangeRef.current?.(null);
    };
  }, []);

  const setValue = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  if (!languageCode) {
    return null;
  }

  return (
    <div
      className="d-flex flex-column"
      style={{
        minHeight: 0,
        ...(tableMinHeight
          ? { flex: 1, height: "100%", overflow: "hidden" }
          : {}),
      }}
    >
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div
          className="fw-600"
          style={{ color: "#404040", fontSize: "1.1rem" }}
        >
          Translations: {displayTitle}{" "}
          <span className="text-muted fw-normal">({languageCode})</span>
        </div>
        {saveButtonPlacement === "header" && can(MODULE_NAME, "Edit") && (
          <Button
            className="bg-button p-10 text-white"
            text={saving ? "Saving…" : "Save changes"}
            disabled={!hasChanges || saving}
            onClick={handleSave}
          />
        )}
      </div>

      {/* <div className="d-flex gap-3 border-bottom mb-2 flex-shrink-0">
        <button
          type="button"
          className="btn btn-link text-decoration-none p-2"
          style={{
            borderBottom:
              module === "app" ? "2px solid #9F5AFF" : "2px solid transparent",
            color: module === "app" ? "#9F5AFF" : "#6c757d",
            borderRadius: 0,
          }}
          onClick={() => setModule("app")}
        >
          App
        </button>
        <button
          type="button"
          className="btn btn-link text-decoration-none p-2"
          style={{
            borderBottom:
              module === "web" ? "2px solid #9F5AFF" : "2px solid transparent",
            color: module === "web" ? "#9F5AFF" : "#6c757d",
            borderRadius: 0,
          }}
          onClick={() => setModule("web")}
        >
          Web
        </button>
      </div> */}

      <div className="mb-3 flex-shrink-0">
        <div
          className="position-relative d-flex align-items-center w-100"
          style={{
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            backgroundColor: "#fff",
            minHeight: "44px",
            paddingLeft: "14px",
            paddingRight: search.trim() ? "38px" : "14px",
            boxShadow: searchFocused
              ? "0 0 0 2px rgba(159, 90, 255, 0.2)"
              : "none",
            transition: "box-shadow 0.15s ease",
          }}
        >
          <i
            className="ri-search-line flex-shrink-0 me-2"
            style={{ color: "#9ca3af", fontSize: "18px" }}
            aria-hidden
          />
          <input
            type="search"
            className="border-0 shadow-none flex-grow-1 py-2 pe-1"
            style={{
              outline: "none",
              background: "transparent",
              fontSize: "0.95rem",
              color: "#495057",
            }}
            placeholder={
              module === "app"
                ? "Search app translation keys or values..."
                : "Search web translation keys or values..."
            }
            value={search}
            autoComplete="off"
            spellCheck={false}
            aria-label="Search translation keys or values"
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearch("");
                setDebouncedSearch("");
              }
            }}
          />
          {search.trim() ? (
            <button
              type="button"
              className="position-absolute border-0 bg-transparent p-1 rounded-circle"
              style={{
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                lineHeight: 1,
              }}
              title="Clear search"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
              }}
            >
              <i className="ri-close-line fs-5" />
            </button>
          ) : null}
        </div>
        {/* {totalKeys > 0 && (
          <div className="mt-2 small text-muted ">
            {debouncedSearch.trim() ? (
              <>
                Showing <strong>{filteredEntries.length}</strong> of{" "}
                <strong>{totalKeys}</strong> keys
                {search !== debouncedSearch && (
                  <span className="ms-1">(typing…)</span>
                )}
              </>
            ) : (
              <>
                <strong>{totalKeys}</strong> keys
              </>
            )}
          </div>
        )} */}
      </div>

      <div
        className="table-responsive rounded border flex-grow-1 position-relative"
        style={{
          minHeight: tableMinHeight ?? undefined,
          maxHeight: tableMaxHeight,
          overflow: "auto",
        }}
      >
        {loading ? (
          <table className="table table-hover mb-0 align-middle w-100">
            <TranslationsTableShimmer />
          </table>
        ) : (
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light sticky-top">
              <tr>
                <th className="text-uppercase text-nowrap small text-muted">
                  Key
                </th>
                <th className="text-uppercase text-nowrap small text-muted">
                  Translation value
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center text-muted py-4">
                    {totalKeys === 0
                      ? "No translation keys for this module."
                      : debouncedSearch.trim()
                        ? "No keys match your search. Try another term or clear the filter."
                        : "No translation keys found."}
                  </td>
                </tr>
              ) : (
                filteredEntries.map(([k, v]) => (
                  <tr key={k}>
                    <td
                      style={{ width: "35%", verticalAlign: "middle" }}
                      className="small"
                    >
                      <span
                        className="badge bg-light text-dark fw-normal"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {k}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={v}
                        disabled={!can(MODULE_NAME, "Edit")}
                        onChange={(e) => setValue(k, e.target.value)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LanguageTranslationsPanel;
