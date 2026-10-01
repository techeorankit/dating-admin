"use client";

import Button from "@/extra/Button";
import { closeDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import LanguageTranslationsPanel, {
  LanguageTranslationsSaveToolbar,
} from "./LanguageTranslationsPanel";

const LanguageTranslationsDialog = () => {
  const dispatch = useAppDispatch();
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const [saveToolbar, setSaveToolbar] =
    useState<LanguageTranslationsSaveToolbar | null>(null);

  const languageCode = String(dialogueData?.languageCode ?? "").trim();
  const languageTitle = String(
    dialogueData?.languageTitle ?? dialogueData?.languageCode ?? ""
  ).trim();

  /** Same min/max keeps the table viewport height stable when switching App ↔ Web */
  const tableViewport = "min(48vh, 440px)";

  return (
    <div className="dialog">
      <div
        style={{
          width: "min(960px, 96vw)",
          minHeight: "min(72vh, 560px)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="mainDiaogBox"
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            padding: "16px 20px",
            overflow: "hidden",
          }}
        >
          <div className="d-flex justify-content-end flex-shrink-0 mb-1">
            <div
              className="closeButton"
              onClick={() => dispatch(closeDialog())}
              style={{ fontSize: "18px" }}
              title="Close"
            >
              ✖
            </div>
          </div>

          <div className="flex-grow-1" style={{ minHeight: 0, overflow: "hidden" }}>
            <LanguageTranslationsPanel
              languageCode={languageCode}
              languageTitle={languageTitle}
              tableMaxHeight={tableViewport}
              tableMinHeight={tableViewport}
              saveButtonPlacement="footer"
              onSaveToolbarChange={setSaveToolbar}
            />
          </div>

          <div className="d-flex justify-content-end align-items-center gap-2 flex-wrap pt-3 border-top mt-2 flex-shrink-0">
            <Button
              className="cancelButton text-light"
              text="Cancel"
              type="button"
              onClick={() => dispatch(closeDialog())}
            />
            {saveToolbar?.canEdit && (
              <Button
                className="bg-button p-10 text-white"
                text={saveToolbar.saving ? "Saving…" : "Save changes"}
                type="button"
                disabled={!saveToolbar.hasChanges || saveToolbar.saving}
                onClick={() => saveToolbar.save()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTranslationsDialog;
