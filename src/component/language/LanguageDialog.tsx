import { basePath } from "@/utils/config";
import Button from "@/extra/Button";
import { ExInput } from "@/extra/Input";
import { closeDialog } from "@/store/dialogSlice";
import {
  createSingleLanguage,
  updateSingleLanguage,
} from "@/store/languageSlice";
import { RootStore, useAppDispatch } from "@/store/store";

import { getImageUrl } from "@/utils/getImageUrl";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

type Props = {
  onSuccess: () => void;
};

const LanguageDialog = ({ onSuccess }: Props) => {
  
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const isEdit = Boolean(dialogueData);

  const [languageTitle, setLanguageTitle] = useState("");
  const [languageCode, setLanguageCode] = useState("");
  const [localLanguageTitle, setLocalLanguageTitle] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);

  const [error, setError] = useState({
    languageTitle: "",
    languageCode: "",
    localLanguageTitle: "",
    languageIcon: "",
  });

  useEffect(() => {
    if (dialogueData) {
      setLanguageTitle(dialogueData?.languageTitle ?? "");
      setLanguageCode(dialogueData?.languageCode ?? "");
      setLocalLanguageTitle(dialogueData?.localLanguageTitle ?? "");
    } else {
      setLanguageTitle("");
      setLanguageCode("");
      setLocalLanguageTitle("");
    }
    setIconFile(null);
    setIconPreviewUrl(null);
    setError({
      languageTitle: "",
      languageCode: "",
      localLanguageTitle: "",
      languageIcon: "",
    });
  }, [dialogueData]);

  useEffect(() => {
    if (!iconFile) {
      setIconPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(iconFile);
    setIconPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [iconFile]);

  const dispatch = useAppDispatch();

  const resolvedPreviewSrc =
    iconPreviewUrl ||
    (isEdit && dialogueData?.languageIcon && !iconFile
      ? getImageUrl(dialogueData.languageIcon)
      : null);

  const originalLanguageTitle = String(dialogueData?.languageTitle ?? "").trim();
  const originalLocalLanguageTitle = String(
    dialogueData?.localLanguageTitle ?? ""
  ).trim();
  const hasChanges =
    !isEdit ||
    languageTitle.trim() !== originalLanguageTitle ||
    localLanguageTitle.trim() !== originalLocalLanguageTitle ||
    Boolean(iconFile);

  const validate = () => {
    const next = {
      languageTitle: "",
      languageCode: "",
      localLanguageTitle: "",
      languageIcon: "",
    };
    let ok = true;
    if (!languageTitle.trim()) {
      next.languageTitle = "Language name is required";
      ok = false;
    }
    if (!languageCode.trim()) {
      next.languageCode = "Language code is required";
      ok = false;
    }
    if (!localLanguageTitle.trim()) {
      next.localLanguageTitle = "Localized title is required";
      ok = false;
    }
    const hasIcon =
      Boolean(iconFile) ||
      (isEdit && String(dialogueData?.languageIcon ?? "").trim() !== "");
    if (!hasIcon) {
      next.languageIcon = "Language icon is required";
      ok = false;
    }
    setError(next);
    return ok;
  };

  const handleSubmit = () => {
    
    if (isEdit && !hasChanges) return;
    if (!validate()) return;

    if (isEdit) {
      const formData = new FormData();
      formData.append("languageCode", languageCode.trim().toLowerCase());
      if (languageTitle.trim() !== originalLanguageTitle) {
        formData.append("languageTitle", languageTitle.trim());
      }
      if (localLanguageTitle.trim() !== originalLocalLanguageTitle) {
        formData.append("localLanguageTitle", localLanguageTitle.trim());
      }
      if (iconFile) {
        formData.append("languageIcon", iconFile);
      }
      dispatch(updateSingleLanguage(formData)).then((action: any) => {
        if (!action.error && action.payload?.status !== false) {
          dispatch(closeDialog());
          onSuccess();
        }
      });
    } else {
      const formData = new FormData();
      formData.append("languageTitle", languageTitle.trim());
      formData.append("languageCode", languageCode.trim().toLowerCase());
      formData.append("localLanguageTitle", localLanguageTitle.trim());
      formData.append("languageIcon", iconFile!);
      dispatch(createSingleLanguage(formData)).then((action: any) => {
        if (!action.error && action.payload?.status !== false) {
          dispatch(closeDialog());
          onSuccess();
        }
      });
    }
  };

  return (
    <div className="dialog">
      <div style={{ width: "1100px" }}>
        <div className="row justify-content-center">
          <div className="col-xl-5 col-md-8 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme fs-26 m0">
                    {isEdit ? "Edit Language" : "Add Language"}
                  </h2>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => dispatch(closeDialog())}
                    style={{ fontSize: "20px" }}
                  >
                    ✖
                  </div>
                </div>
              </div>

              <div className="row formFooter mt-3">
                <div className="col-12 mb-3">
                  <ExInput
                    type="text"
                    id="languageTitle"
                    name="languageTitle"
                    value={languageTitle}
                    label="Language Name"
                    placeholder="e.g. Chinese"
                    errorMessage={error.languageTitle}
                    onChange={(e: any) => {
                      setLanguageTitle(e.target.value);
                      setError({ ...error, languageTitle: "" });
                    }}
                  />
                </div>
                <div className="col-12 mb-3">
                  <ExInput
                    type="text"
                    id="languageCode"
                    name="languageCode"
                    value={languageCode}
                    label="Language Code"
                    placeholder="e.g. zh"
                    disabled={isEdit}
                    errorMessage={error.languageCode}
                    onChange={(e: any) => {
                      setLanguageCode(e.target.value);
                      setError({ ...error, languageCode: "" });
                    }}
                  />
                </div>
                <div className="col-12 mb-3">
                  <ExInput
                    type="text"
                    id="localLanguageTitle"
                    name="localLanguageTitle"
                    value={localLanguageTitle}
                    label="Localized Language Title"
                    placeholder="Native name"
                    errorMessage={error.localLanguageTitle}
                    onChange={(e: any) => {
                      setLocalLanguageTitle(e.target.value);
                      setError({ ...error, localLanguageTitle: "" });
                    }}
                  />
                </div>

                <div className="col-12 mb-3">
                  <label className="d-block mb-1">Language Icon</label>
                  <input
                    type="file"
                    accept="image/*"
                    className={`form-control rounded-2${
                      error.languageIcon ? " is-invalid" : ""
                    }`}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setIconFile(f ?? null);
                      setError({ ...error, languageIcon: "" });
                      if (!f) {
                        e.target.value = "";
                      }
                    }}
                  />
                  {error.languageIcon ? (
                    <div className="text-danger small mt-1">{error.languageIcon}</div>
                  ) : null}
                  {resolvedPreviewSrc && (
                    <div className="mt-3">
                      <div className="small text-muted mb-2">Preview</div>
                      <div
                        className="d-inline-block rounded-circle overflow-hidden border bg-light"
                        style={{
                          width: 96,
                          height: 96,
                          borderColor: "#dee2e6",
                        }}
                      >
                        <img
                          src={resolvedPreviewSrc}
                          alt="Language icon preview"
                          width={96}
                          height={96}
                          style={{
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src = `${basePath}/default.jpg`;
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-12 text-end m0">
                  <Button
                    className="cancelButton text-light"
                    text="Cancel"
                    type="button"
                    onClick={() => dispatch(closeDialog())}
                  />
                  <Button
                    className="bg-button p-10 text-white ms-2"
                    text={isEdit ? "Submit" : "Submit"}
                    type="button"
                    onClick={handleSubmit}
                    disabled={isEdit && !hasChanges}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageDialog;
