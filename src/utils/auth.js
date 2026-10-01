import { STORAGE_KEYS, buildPermissionMap, canDo } from "./permissions";
import { getAuthToken } from "./authToken";
import {
  shouldRunAdminSessionIntegrityCheck,
  validateSessionIntegrity,
  logoutOnTamperedSession,
} from "./sessionIntegrity";

/**
 * Safely parse JSON from sessionStorage.
 */
function readJson(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Get raw auth-related values from sessionStorage.
 * This is the single source of truth for auth state.
 */
export function getAuthUser() {
  if (typeof window === "undefined") {
    return {
      loginType: undefined,
      token: undefined,
      isAuth: false,
      admin: null,
      staff: null,
    };
  }

  const loginType = sessionStorage.getItem(STORAGE_KEYS.loginType) || undefined;
  const token = getAuthToken() || undefined;

  const isAuthRaw = sessionStorage.getItem("isAuth");
  const isAuth =
    !!(token && loginType) ||
    isAuthRaw === "true" ||
    isAuthRaw === true ||
    isAuthRaw === "1" ||
    isAuthRaw === 1;

  // Derive minimal user representation from session token and role when not found in legacy storage
  let admin =
    readJson("admin_") ??
    readJson("admin") ??
    null;
  if (!admin && isAuth && (loginType === "ADMIN" || loginType === "SUPER_ADMIN" || !loginType)) {
    admin = { role: loginType || "ADMIN", authenticated: true };
  }

  let staff = readJson("staff") ?? null;
  if (!staff && isAuth && loginType === "STAFF") {
    staff = { role: "STAFF", authenticated: true };
  }

  return {
    loginType,
    token,
    isAuth,
    admin,
    staff,
  };
}

/**
 * Returns true when the current session should be considered authenticated.
 * - Requires isAuth === true
 * - Requires token to exist
 * - Requires a matching user object according to loginType
 */
export function isAuthenticated() {
  const { loginType, token, isAuth, admin, staff } = getAuthUser();

  if (!isAuth) return false;
  if (!token) return false;

  if (shouldRunAdminSessionIntegrityCheck()) {
    const integrity = validateSessionIntegrity();
    if (!integrity.ok) {
      logoutOnTamperedSession();
      return false;
    }
  }

  const upperType = String(loginType || "").toUpperCase();

  if (upperType === "ADMIN" || upperType === "SUPER_ADMIN") {
    return !!admin;
  }

  if (upperType === "STAFF") {
    return !!staff;
  }

  return false;
}

/**
 * Read raw permissions array from sessionStorage.
 */
export function getPermissions() {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      sessionStorage.getItem(STORAGE_KEYS.permissions) ||
      "[]";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Check whether current user can perform a given action
 * on a given module, based on their permissions and loginType.
 */
export function canAccess(moduleName, actionName) {
  if (!moduleName || !actionName) return false;

  if (shouldRunAdminSessionIntegrityCheck()) {
    const integrity = validateSessionIntegrity();
    if (!integrity.ok) {
      logoutOnTamperedSession();
      return false;
    }
  }

  const { loginType } = getAuthUser();
  const rawPermissions = getPermissions();
  const permissionMap = buildPermissionMap(rawPermissions);

  return canDo(loginType, permissionMap, moduleName, actionName);
}

