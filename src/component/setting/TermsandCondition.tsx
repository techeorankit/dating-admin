import Button from "@/extra/Button";
import { getSetting, updateSetting } from "@/store/settingSlice";
import { RootStore } from "@/store/store";

import { isSkeleton } from "@/utils/allSelector";
import QuillEditor from "@/extra/QuillEditor";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const TermsandCondition = () => {
  const roleSkeleton = useSelector(isSkeleton);
  const [value, setValue] = useState("");

  const { setting }: any = useSelector((state: RootStore) => state?.setting);
  console.log("setting" , setting);
  
  
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleChange = (content: string) => {
    try {
      setValue(content);
      if (error) setError(null); // Clear error if user types again
    } catch (err: any) {
      console.error("Error while changing editor content:", err.message);
      setError("Something went wrong while editing. Please try again.");
    }
  };

  useEffect(() => {
      setValue(setting?.termsOfUsePolicyLink ?? "");
  }, [setting]);

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  const handleSubmit = () => {
    

    try {
      if (!value || value.trim() === "" || value === "<p><br></p>") {
        setError("Content cannot be empty.");
        return;
      }

      // Submit the content
      const settingDataSubmit = {
        termsOfUsePolicyLink: value,
      };
      const payload = {
        settingId: setting?._id,
        settingDataSubmit,
      };
      dispatch(updateSetting(payload));

      // Reset
      setValue("");
      setError(null);
    } catch (err: any) {
      console.error("Error while submitting:", err.message);
      setError("Something went wrong while submitting. Please try again.");
    }
  };

  return (
    <div>
      {roleSkeleton ? (
        <>
          {/* Toolbar Skeleton */}
          <div className="d-flex gap-2 mb-3 flex-wrap mt-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: "30px",
                  width: i === 0 ? "60px" : "30px",
                  borderRadius: "4px",
                }}
              ></div>
            ))}
          </div>

          {/* Editor Content Skeleton */}
          <div
            className="skeleton"
            style={{
              height: "400px",
              width: "100%",
              borderRadius: "8px",
            }}
          ></div>
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center">
            <div
              className="title text-capitalized fw-600"
              style={{
                color: "#404040",
                fontSize: "20px",
                marginBottom: "15px",
                marginTop: "10px",
              }}
            >
              {/* Terms and Condition */}
            </div>

            <Button
              type="submit"
              className="text-light m10-left fw-bold"
              text="Submit"
              style={{ backgroundColor: "#9f5aff" }}
              // style={{ backgroundColor: "#1ebc1e" }}
              onClick={handleSubmit}
            />
          </div>

          <div className="mt-2">
            <QuillEditor value={value} onChange={handleChange} />
          </div>
        </>
      )}

      {/* Show error if any */}
      {error && (
        <div style={{ color: "red", marginTop: "10px", fontWeight: "400" }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default TermsandCondition;
