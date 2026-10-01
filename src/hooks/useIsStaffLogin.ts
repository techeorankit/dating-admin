import { useEffect, useState } from "react";
import { getAuthUser } from "@/utils/auth";

/**
 * Returns whether the current user is staff. Defaults to false on SSR and the
 * first client paint so server HTML matches hydration, then updates after mount.
 */
export function useIsStaffLogin(): boolean {
  const [isStaffLogin, setIsStaffLogin] = useState(false);

  useEffect(() => {
    const { loginType } = getAuthUser();
    const upper = String(loginType || "").toUpperCase();
    setIsStaffLogin(upper === "STAFF");
  }, []);

  return isStaffLogin;
}
