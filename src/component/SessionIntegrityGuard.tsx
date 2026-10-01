"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { assertSessionIntegrityOrLogout } from "@/utils/sessionIntegrity";

/**
 * Validates admin session integrity on load, route changes, and window focus
 * (covers sessionStorage edits in DevTools that do not fire the storage event).
 */
export default function SessionIntegrityGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const runCheck = () => {
      assertSessionIntegrityOrLogout();
    };

    runCheck();

    router.events.on("routeChangeComplete", runCheck);
    window.addEventListener("focus", runCheck);

    return () => {
      router.events.off("routeChangeComplete", runCheck);
      window.removeEventListener("focus", runCheck);
    };
  }, [router]);

  return <>{children}</>;
}
