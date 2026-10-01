"use client";
import { basePath } from "@/utils/config";

import React, { useState } from "react";
import Button from "../extra/Button";
import { ExInput } from "../extra/Input";
import { Success } from "@/api/toastServices";
import { useFirebasePasswordReset } from "@/hooks/useFirebasePasswordReset";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState({ email: "" });
  const [submittedOk, setSubmittedOk] = useState(false);
  const { loading, sendResetEmail } = useFirebasePasswordReset();

  const handleSubmit = async () => {
    setError({ email: "" });
    setSubmittedOk(false);
    const trimmed = email.trim();
    if (!trimmed) {
      setError({ email: "Email is required!" });
      return;
    }

    const result = await sendResetEmail(trimmed);
    if (result.ok) {
      setSubmittedOk(true);
      Success("Check your email for a link to reset your password.");
      return;
    }
    setError({ email: result.error });
  };

  return (
    <>
      <div className="mainLoginPage">
        <div className="loginDiv" style={{ width: "100%" }}>
          <div className="loginPage m-auto">
            <div className="loginTitle mb-3  d-flex " style={{ width: "60px" }}>
              <img src={`${basePath}/images/logo.png`} width={60} height={60} alt="logo" />
            </div>
            <div className="fw-bold text-theme  me-auto my-auto welComeTitle">
              Welcome Back
            </div>
            <h1>Forgot Password</h1>
            <h6 className="fw-bold text-theme  me-auto my-auto fs-15 py-2 title">
              Please enter your account email
            </h6>
            <div>
              <div className="col-12 ">
                <ExInput
                  type="email"
                  id="email"
                  name="email"
                  label="Email"
                  value={email}
                  placeholder="Email"
                  errorMessage={error.email || undefined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    if (!e.target.value) {
                      setError({ email: "Email is required!" });
                    } else {
                      setError({ email: "" });
                    }
                  }}
                />
              </div>

              <div className="loginButton d-flex gx-2 justify-content-center">
                <Button
                  type="button"
                  className={`bg-theme text-light cursor m10-top col-6 mx-2 ${loading || submittedOk ? "opacity-50" : ""}`}
                  text={
                    loading
                      ? "Sending…"
                      : submittedOk
                        ? "Email sent"
                        : "Send reset link"
                  }
                  onClick={handleSubmit}
                  style={{ borderRadius: "30px" }}
                  disabled={loading || submittedOk}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
