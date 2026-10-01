"use client";
import { basePath } from "@/utils/config";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/store";
import { login, setLoading } from "@/store/adminSlice";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../component/lib/firebaseConfig";
import { DangerRight, Success } from "@/api/toastServices";
import { projectName } from "@/utils/config";
import { useFirebasePasswordReset } from "@/hooks/useFirebasePasswordReset";
import { setAuthToken } from "@/utils/authToken";
import { useRouter } from "next/navigation";

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  /** Single shared loading state: which button is currently processing (null = idle). */
  const [submittingAs, setSubmittingAs] = useState<null | "admin">(null);
  const isSubmitting = submittingAs !== null;
  const [error, setError] = useState({
    email: "",
    password: "",
  });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const { loading: resetLoading, sendResetEmail } = useFirebasePasswordReset();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!email || !password) {
      const errorObj: any = {};
      if (!email) errorObj.email = "Email Is Required!";
      if (!password) errorObj.password = "Password Is Required!";
      return setError(errorObj);
    }
    setSubmittingAs("admin");
    dispatch(setLoading(true));
    try {
      const token = await loginUser(email, password);
      if (!token) {
        setSubmittingAs(null);
        dispatch(setLoading(false));
        return;
      }
      const payload = { email, password };
      const result = await dispatch(login(payload)).unwrap();
      if (result?.status === false) {
        setSubmittingAs(null);
        dispatch(setLoading(false));
        router.push("/Login");
        return;
      }
      // Success: redirect handled by slice; keep buttons disabled
    } catch {
      setSubmittingAs(null);
      dispatch(setLoading(false));
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential?.user?.uid;

      if (!userCredential.user) {
        console.error("No user found after login");
        return null;
      }

      // Get Firebase Auth Token — memory only (not sessionStorage)
      const token = await userCredential?.user?.getIdToken(true);
      setAuthToken(token, uid);
      sessionStorage.setItem("uid", uid);

      return token;
    } catch (error: any) {
      DangerRight("Invalid credentials. Please check your email and password.");
      return null;
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleSubmit();
  };

  const openForgotPassword = () => {
    setResetEmail(email.trim());
    setResetError("");
    setResetSuccess(false);
    setForgotOpen(true);
  };

  const backToLogin = useCallback(() => {
    if (resetLoading) return;
    setForgotOpen(false);
    setResetError("");
    setResetSuccess(false);
  }, [resetLoading]);

  useEffect(() => {
    if (!forgotOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !resetLoading) backToLogin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forgotOpen, resetLoading, backToLogin]);

  const handleSendResetEmail = async () => {
    setResetError("");
    setResetSuccess(false);
    const result = await sendResetEmail(resetEmail);
    if (result.ok) {
      setResetSuccess(true);
      Success("Check your email for a link to reset your password.");
      return;
    }
    setResetError(result.error);
  };

  const handleResetKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== "Enter" || resetLoading) return;
    event.preventDefault();
    handleSendResetEmail();
  };

  return (
    <>
      <div className="login-container">
        <div className="image-section">
          <img
            src={`${basePath}/images/login2.png`}
            alt="Login Visual"
            className="login-visual"
          />
        </div>

        <div className="form-section d-flex flex-column align-items-center justify-content-center w-50 login-custom-form">
          <div className="" style={{ width: "100%", maxWidth: 487 }}>
            <div className="logologin">
              <img src={`${basePath}/images/logo.png`} width={80} height={80} />
            </div>

            {!forgotOpen ? (
              <>
                <h2 className="title">Login to your account</h2>
                <p className="subtitle">
                  Let's connect, chat, and spark real connections. Enter your
                  credentials to continue your journey on {projectName}.
                </p>

                <form className="login-form">
                  <div className="form-group">
                    <label>Enter your Email</label>
                    <input
                      type="text"
                      value={email}
                      placeholder="Enter your email"
                      onKeyDown={handleKeyPress}
                      onChange={(e: any) => {
                        setEmail(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            email: `Email Is Required!`,
                          });
                        } else {
                          return setError({
                            ...error,
                            email: "",
                          });
                        }
                      }}
                    />
                    <span className="text-danger" style={{ fontSize: "12px" }}>
                      {error.email}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="mt-2">Enter your Password</label>
                    <div style={{ position: "relative", marginTop: "10px" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder="Enter your password"
                        style={{ paddingRight: "40px", marginTop: 0 }}
                        onChange={(e: any) => {
                          setPassword(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              password: `Password Is Required!`,
                            });
                          } else {
                            return setError({
                              ...error,
                              password: "",
                            });
                          }
                        }}
                        onKeyDown={handleKeyPress}
                      />
                      <span
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="showpassword"
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "10px",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          fontSize: "18px",
                          color: "#aaa",
                          zIndex: 1,
                        }}
                        role="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setShowPassword((prev) => !prev);
                          }
                        }}
                      >
                        {showPassword ? (
                          <i className="fa-solid fa-eye"></i>
                        ) : (
                          <i className="fa-solid fa-eye-slash"></i>
                        )}
                      </span>
                    </div>
                    <span className="text-danger" style={{ fontSize: "12px" }}>
                      {error.password}
                    </span>
                  </div>

                  <div className="forgot-password" style={{ marginTop: 6 }}>
                    <button
                      type="button"
                      className="border-0 bg-transparent p-0"
                      style={{
                        fontSize: 14,
                        color: "#8e8e8e",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                      onClick={openForgotPassword}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      disabled={submittingAs === "admin"}
                      onClick={handleSubmit}
                      className={`login-btn w-100 ${submittingAs === "admin" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {submittingAs === "admin" ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                          />
                          Loading...
                        </>
                      ) : (
                        "Login"
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="border-0 bg-transparent p-0 d-flex align-items-center gap-2 mb-3"
                  style={{
                    color: "#8e8e8e",
                    fontSize: 14,
                    cursor: resetLoading ? "not-allowed" : "pointer",
                  }}
                  disabled={resetLoading}
                  onClick={backToLogin}
                >
                  <i className="fa-solid fa-arrow-left" aria-hidden />
                  <span>Back to login</span>
                </button>

                <h2 className="title">Reset password</h2>
                <p className="subtitle m0">
                  Enter the email for your admin or staff account. We will send a
                  link to reset your password.
                </p>

                {!resetSuccess ? (
                  <form className="login-form">
                    <div className="form-group">
                      <label htmlFor="reset-email">Enter your Email</label>
                      <input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        value={resetEmail}
                        placeholder="Enter your email"
                        disabled={resetLoading}
                        onKeyDown={handleResetKeyDown}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          if (resetError) setResetError("");
                        }}
                      />
                      {resetError ? (
                        <span
                          className="text-danger d-block"
                          style={{ fontSize: "12px" }}
                        >
                          {resetError}
                        </span>
                      ) : null}
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className={`login-btn w-100 ${resetLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={resetLoading}
                        onClick={handleSendResetEmail}
                      >
                        {resetLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              aria-hidden="true"
                            />
                            Sending…
                          </>
                        ) : (
                          "Send reset link"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-3 d-flex flex-column gap-3">
                    <div className="border rounded-3 p-3 d-flex flex-column align-items-center text-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                        style={{
                          width: 48,
                          height: 48,
                          background: "rgba(143, 109, 255, 0.12)",
                          color: "#8f6dff",
                          fontSize: 22,
                        }}
                      >
                        <i className="fa-solid fa-envelope-circle-check" />
                      </div>
                      <div className="fw-semibold small">Check your email</div>
                      <p className="text-muted small m0 mb-1">
                        We sent a password reset link to
                      </p>
                      <div className="fw-medium small text-break">{resetEmail}</div>
                      <button
                        type="button"
                        className="login-btn w-100 mt-3"
                        onClick={backToLogin}
                      >
                        Back to login
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
