import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { ExInput } from "@/extra/Input";
import Button from "@/extra/Button";

import {
  createReportReason,
  updateReportReason,
} from "@/store/reportReasonSlice";

interface ErrorState {
  title: string;
}

const ReportReasonDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  

  const dispatch = useAppDispatch();
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<ErrorState>({
    title: "",
  });

  useEffect(() => {
    if (dialogueData) {
      setTitle(dialogueData?.title || "");
    } else {
      setTitle("");
    }
  }, [dialogueData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    

    if (!title.trim()) {
      const err: ErrorState = { title: "Title is required" };
      return setError(err);
    }

    if (dialogueData && dialogueData?._id) {
      const payload = {
        title: title.trim(),
        reportReasonId: dialogueData?._id as string,
      };
      dispatch(updateReportReason(payload));
    } else {
      dispatch(createReportReason({ title: title.trim() }));
    }

    dispatch(closeDialog());
  };

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-3 col-md-4 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h4 className="text-theme m0">
                    {dialogueData ? "Edit Report Reason" : "Add Report Reason"}
                  </h4>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => {
                      dispatch(closeDialog());
                    }}
                    style={{ fontSize: "20px" }}
                  >
                    ✖
                  </div>
                </div>
              </div>
              <form id="reportReasonForm">
                <div className="row align-items-start formBody">
                  <div className="col-12">
                    <ExInput
                      type="text"
                      id="title"
                      name="title"
                      value={title}
                      label="Title"
                      placeholder="Title"
                      errorMessage={error.title}
                      onChange={(e: any) => {
                        const value = e.target.value;
                        setTitle(value);
                        if (!value) {
                          setError({
                            ...error,
                            title: "Title is required!",
                          });
                        } else {
                          setError({
                            ...error,
                            title: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="mt-4 d-flex justify-content-end gap-1">
                    <Button
                      className="cancelButton text-light"
                      text="Cancel"
                      type="button"
                      onClick={() => dispatch(closeDialog())}
                    />
                    <Button
                      type="submit"
                      className="text-white m10-left submitButton"
                      text="Submit"
                      onClick={handleSubmit}
                      disabled={
                        dialogueData
                          ? title === dialogueData?.title
                          : !title.trim()
                      }
                      style={{
                        opacity:
                          (dialogueData
                            ? title === dialogueData?.title
                            : !title.trim())
                            ? 0.5
                            : 1,
                        cursor: (
                          dialogueData
                            ? title === dialogueData?.title
                            : !title.trim()
                        )
                          ? "not-allowed"
                          : "pointer",
                      }}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportReasonDialog;

