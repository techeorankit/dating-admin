"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  STORAGE_KEYS,
  buildPermissionMap,
  canDo,
  canSeeModule,
} from "@/utils/permissions";
import {
  shouldRunAdminSessionIntegrityCheck,
  validateSessionIntegrity,
  logoutOnTamperedSession,
} from "@/utils/sessionIntegrity";

const PermissionCtx = createContext({
  loginType: undefined,
  permissionMap: {},
  permissionsReady: false,
  can: () => false,
  canSee: () => false,
  refresh: () => { },
});

function readLoginTypeFromSession() {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem(STORAGE_KEYS.loginType) || undefined;
}

function readPermissionsFromSession() {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.permissions) || "[]";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function PermissionProvider({ children }) {
  const readFromSession = () => {
    try {
      if (
        typeof window !== "undefined" &&
        shouldRunAdminSessionIntegrityCheck()
      ) {
        if (!validateSessionIntegrity().ok) {
          logoutOnTamperedSession();
          return { lt: undefined, pm: buildPermissionMap([]) };
        }
      }

      const lt = readLoginTypeFromSession();
      const raw = readPermissionsFromSession();
      return { lt, pm: buildPermissionMap(raw) };
    } catch {
      return { lt: undefined, pm: buildPermissionMap([]) };
    }
  };

  const emptyState = {
    lt: undefined,
    pm: buildPermissionMap([]),
    ready: false,
  };

  const [{ lt, pm, ready }, setState] = useState(emptyState);

  const hydrateFromSession = () => {
    setState({ ...readFromSession(), ready: true });
  };

  // Load before child useEffects so permission redirects see real loginType.
  useLayoutEffect(() => {
    hydrateFromSession();
  }, []);

  const refresh = () => hydrateFromSession();

  const isElevated =
    String(lt || "").toUpperCase() === "ADMIN" ||
    String(lt || "").toUpperCase() === "SUPER_ADMIN";

  useEffect(() => {
    const onStorage = (e) => {
      if (
        e.storageArea === sessionStorage &&
        [
          STORAGE_KEYS.loginType,
          STORAGE_KEYS.permissions,
          STORAGE_KEYS.sessionIntegrityHash,
        ].includes(e.key || "")
      ) {
        refresh();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      loginType: lt,
      permissionMap: pm,
      permissionsReady: ready,
      can: (moduleName, action) => {
        if (!ready) return true;
        return isElevated ? true : canDo(lt, pm, moduleName, action);
      },
      canSee: (moduleName) => {
        if (!ready) return true;
        return isElevated ? true : canSeeModule(lt, pm, moduleName);
      },
      refresh,
    }),
    [lt, pm, isElevated, ready]
  );

  return (
    <PermissionCtx.Provider value={value}>{children}</PermissionCtx.Provider>
  );
}

export const usePermission = () => useContext(PermissionCtx);
