export interface PermissionContextValue {
  loginType: string | undefined;
  permissionMap: Record<string, unknown>;
  permissionsReady: boolean;
  can: (moduleName: string, action: string) => boolean;
  canSee: (moduleName: string) => boolean;
  refresh: () => void;
}

export function usePermission(): PermissionContextValue;
