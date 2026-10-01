export const STORAGE_KEYS = {
  permissions: 'permissions',
  loginType: 'loginType',
  /** SHA-256 of canonical { loginType, permissions } — set at login; do not trust without re-check. */
  sessionIntegrityHash: 'sessionIntegrityHash',
};

export function buildPermissionMap(rawPermissions = []) {
  const map = {};

  (rawPermissions || []).forEach((permission) => {
    const moduleName = permission.module;
    if (!moduleName) return;

    if (!map[moduleName]) {
      map[moduleName] = {};
    }

    (permission.actions || []).forEach((action) => {
      if (!action) return;

      const key = String(action).trim();
      if (!key) return;

      const lower = key.toLowerCase();

      // Treat "update" and "edit" as the same permission
      if (lower === "update" || lower === "edit") {
        map[moduleName]["Update"] = true;
        map[moduleName]["Edit"] = true;
        return;
      }

      map[moduleName][key] = true;
    });
  });

  return map;
}

export function canDo(loginType, permissionMap, moduleName, action) {
  if (!loginType) return false;

  const upperType = String(loginType).toUpperCase();

  if (upperType === 'ADMIN' || upperType === 'SUPER_ADMIN') {
    return true;
  }

  return !!permissionMap?.[moduleName]?.[action];
}

export function canSeeModule(loginType, permissionMap, moduleName) {
  return canDo(loginType, permissionMap, moduleName, 'List');
}

