import { basePath } from "@/utils/config";
import CryptoJS from "crypto-js";
import { STORAGE_KEYS } from "@/utils/permissions";
import { setToast } from "@/utils/toastServices";
import { getAuthToken, clearAuthToken } from "@/utils/authToken";

let integrityLogoutInProgress = false;

function readJsonSession(key: string): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hasAdminArtifact(loginType?: string): boolean {
  if (readJsonSession("admin_") !== null || readJsonSession("admin") !== null) return true;
  const lt = String(loginType || sessionStorage.getItem(STORAGE_KEYS.loginType) || "").trim().toUpperCase();
  return lt === "ADMIN" || lt === "SUPER_ADMIN";
}

function hasStaffArtifact(loginType?: string): boolean {
  if (readJsonSession("staff") !== null) return true;
  const lt = String(loginType || sessionStorage.getItem(STORAGE_KEYS.loginType) || "").trim().toUpperCase();
  return lt === "STAFF";
}

/**
 * Admin panel session only (not agency). When false, integrity checks are skipped.
 */
export function shouldRunAdminSessionIntegrityCheck(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem("isAgency") === "true") return false;
  const token = getAuthToken();
  const loginType = sessionStorage.getItem(STORAGE_KEYS.loginType);
  const legacyIsAuth = sessionStorage.getItem("isAuth") === "true";
  return !!(token && (loginType || legacyIsAuth));
}

export type SessionIntegrityResult =
  | { ok: true }
  | { ok: false; code: "MISSING_HASH" | "TAMPER" | "ROLE_MISMATCH" | "LOGIN_TYPE" };

/**
 * Normalize permissions for a stable JSON payload (order-independent).
 */
export function normalizePermissionsForIntegrity(raw: unknown): Array<{
  module: string;
  actions: string[];
}> {
  if (!Array.isArray(raw)) return [];
  const rows = raw
    .map((p: any) => {
      const module = String(p?.module ?? "").trim();
      const actions: string[] = Array.isArray(p?.actions)
        ? (
            [
              ...new Set(
                (p.actions as unknown[])
                  .map((a: unknown) => String(a ?? "").trim())
                  .filter(Boolean)
              ),
            ] as string[]
          ).sort((a: string, b: string) => a.localeCompare(b))
        : [];
      return { module, actions };
    })
    .filter((r) => r.module);
  rows.sort((a, b) => a.module.localeCompare(b.module));
  return rows;
}

export function buildSessionIntegrityPayload(
  loginType: string,
  permissions: unknown[]
): string {
  const lt = String(loginType || "").trim().toUpperCase();
  const permissionsNorm = normalizePermissionsForIntegrity(permissions);
  return JSON.stringify({ loginType: lt, permissions: permissionsNorm });
}

export function computeSessionIntegrityHash(
  loginType: string,
  permissions: unknown[]
): string {
  return CryptoJS.SHA256(
    buildSessionIntegrityPayload(loginType, permissions)
  ).toString();
}

/**
 * Call only after loginType / permissions / admin_ / staff session keys are finalized.
 */
export function persistSessionIntegritySnapshot(): void {
  if (typeof window === "undefined") return;
  const loginType = sessionStorage.getItem(STORAGE_KEYS.loginType) || "";
  let permissions: unknown[] = [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.permissions) || "[]";
    const parsed = JSON.parse(raw);
    permissions = Array.isArray(parsed) ? parsed : [];
  } catch {
    permissions = [];
  }
  const hash = computeSessionIntegrityHash(loginType, permissions);
  sessionStorage.setItem(STORAGE_KEYS.sessionIntegrityHash, hash);
}

function isLoginTypeRoleConsistent(loginTypeRaw: string): boolean {
  const upper = String(loginTypeRaw || "").trim().toUpperCase();
  if (!upper) return false;

  if (upper === "ADMIN" || upper === "SUPER_ADMIN") {
    return hasAdminArtifact(upper) && !readJsonSession("staff");
  }
  if (upper === "STAFF") {
    return hasStaffArtifact(upper) && !readJsonSession("admin_") && !readJsonSession("admin");
  }
  return false;
}

/**
 * Validates sessionStorage loginType + permissions against stored hash and role artifacts.
 * Treat sessionStorage as untrusted; mismatch → caller should logout.
 */
export function validateSessionIntegrity(): SessionIntegrityResult {
  if (typeof window === "undefined") return { ok: true };
  if (!shouldRunAdminSessionIntegrityCheck()) return { ok: true };

  const loginType = sessionStorage.getItem(STORAGE_KEYS.loginType) || "";
  if (!loginType.trim()) {
    return { ok: false, code: "LOGIN_TYPE" };
  }

  if (!isLoginTypeRoleConsistent(loginType)) {
    return { ok: false, code: "ROLE_MISMATCH" };
  }

  const storedHash =
    sessionStorage.getItem(STORAGE_KEYS.sessionIntegrityHash) ||
    sessionStorage.getItem("permissionsIntegrity");
  if (!storedHash) {
    return { ok: false, code: "MISSING_HASH" };
  }

  let permissions: unknown[] = [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.permissions) || "[]";
    const parsed = JSON.parse(raw);
    permissions = Array.isArray(parsed) ? parsed : [];
  } catch {
    return { ok: false, code: "TAMPER" };
  }

  const expected = computeSessionIntegrityHash(loginType, permissions);
  if (expected !== storedHash) {
    return { ok: false, code: "TAMPER" };
  }

  return { ok: true };
}

/** Legacy / alternate integrity key names (must all be cleared on logout / tamper). */
const INTEGRITY_HASH_STORAGE_KEYS = [
  STORAGE_KEYS.sessionIntegrityHash,
  "permissionsIntegrity",
  "sessionIntegrityHash",
];

function removeSessionKeysWithPrefix(prefix: string): void {
  if (typeof window === "undefined") return;
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const k = sessionStorage.key(i);
    if (k && k.startsWith(prefix)) {
      sessionStorage.removeItem(k);
    }
  }
}

/**
 * Clears admin auth session and all app-scoped session keys (e.g. `admin:*` pagination,
 * integrity hash, `isAgency`). Call on logout and on tamper-detected logout.
 */
export function clearAdminPanelSessionStorage(): void {
  if (typeof window === "undefined") return;
  clearAuthToken();
  removeSessionKeysWithPrefix("admin:");
  INTEGRITY_HASH_STORAGE_KEYS.forEach((k) => sessionStorage.removeItem(k));
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("uid");
  sessionStorage.removeItem("admin");
  sessionStorage.removeItem("admin_");
  sessionStorage.removeItem("key");
  sessionStorage.removeItem("staff");
  sessionStorage.removeItem(STORAGE_KEYS.permissions);
  sessionStorage.removeItem(STORAGE_KEYS.loginType);
  sessionStorage.removeItem("isAuth");
  sessionStorage.removeItem("data");
  sessionStorage.removeItem("isAgency");
}

/**
 * Tampered or inconsistent session: clear storage, notify, redirect to login.
 */
export function logoutOnTamperedSession(): void {
  if (integrityLogoutInProgress || typeof window === "undefined") return;
  integrityLogoutInProgress = true;
  clearAdminPanelSessionStorage();
  setToast("error", "Session tampered. Please login again.");
  setTimeout(() => {
    window.location.href = `${basePath}/`;
  }, 400);
}

export function assertSessionIntegrityOrLogout(): boolean {
  const r = validateSessionIntegrity();
  if (r.ok) return true;
  logoutOnTamperedSession();
  return false;
}
