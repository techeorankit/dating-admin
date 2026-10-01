"use client";

import { useCallback, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/component/lib/firebaseConfig";
import { apiInstanceFetch } from "@/utils/ApiInstance";

function extractApiErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message: unknown }).message;
    if (typeof m === "string") return m;
    if (Array.isArray(m) && m[0]) return String(m[0]);
  }
  return "Could not verify this email. Please try again.";
}

/** Backend POST api/admin/admin/validateAdminEmail with JSON { email } — reject only on explicit failure flags. */
function validationBodyIndicatesInvalid(res: unknown): boolean {
  if (!res || typeof res !== "object") return false;
  const r = res as Record<string, unknown>;
  if (r.status === false) return true;
  if (r.success === false) return true;
  if (r.valid === false) return true;
  return false;
}

function validationFailureMessage(res: unknown): string {
  if (res && typeof res === "object" && "message" in res) {
    const m = (res as { message: unknown }).message;
    if (typeof m === "string" && m) return m;
    if (Array.isArray(m) && m[0]) return String(m[0]);
  }
  return "This email is not registered for an admin account.";
}

export function isValidEmailFormat(email: string): boolean {
  const t = email.trim();
  if (!t) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

function mapFirebaseResetError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Could not send reset email. Please try again.";
  }
}

export function useFirebasePasswordReset() {
  const [loading, setLoading] = useState(false);

  const sendResetEmail = useCallback(async (email: string) => {
    const trimmed = email.trim();
    if (!isValidEmailFormat(trimmed)) {
      return {
        ok: false as const,
        error: "Please enter a valid email address.",
      };
    }
    setLoading(true);
    try {
      try {
        const validated = await apiInstanceFetch.get(
          `api/admin/admin/validateAdminEmail?email=${trimmed}`,
        );
        if (validationBodyIndicatesInvalid(validated)) {
          return {
            ok: false as const,
            error: validationFailureMessage(validated),
          };
        }
      } catch (e: unknown) {
        return { ok: false as const, error: extractApiErrorMessage(e) };
      }

      await sendPasswordResetEmail(auth, trimmed);
      return { ok: true as const };
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e !== null && "code" in e
          ? String((e as { code: string }).code)
          : "";
      return { ok: false as const, error: mapFirebaseResetError(code) };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, sendResetEmail };
}
