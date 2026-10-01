"use client";

import SimpleDialog from "@/component/common/SimpleDialog";
import Button from "@/extra/Button";
import { fetchLanguageTotal } from "@/utils/languageSetup";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

export default function LanguageSetupPrompt() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pathnameRef = useRef(router.pathname);

  const runLanguageCheck = useCallback(async () => {
    const pathname = pathnameRef.current;
    if (pathname.startsWith("/appLanguages")) {
      setOpen(false);
      return;
    }

    const total = await fetchLanguageTotal();
    if (total === null) return;

    setOpen(total === 0);
  }, []);

  useEffect(() => {
    pathnameRef.current = router.pathname;
  }, [router.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const check = async () => {
      if (cancelled) return;
      await runLanguageCheck();
    };

    void check();

    const onRouteChange = (url: string) => {
      pathnameRef.current = url.split("?")[0] || router.pathname;
      void check();
    };

    router.events.on("routeChangeComplete", onRouteChange);
    return () => {
      cancelled = true;
      router.events.off("routeChangeComplete", onRouteChange);
    };
  }, [router.events, runLanguageCheck]);

  const dismiss = useCallback(() => {
    setOpen(false);
  }, []);

  const handleManage = useCallback(() => {
    setOpen(false);
    router.push("/appLanguages/AppLanguages");
  }, [router]);

  return (
    <SimpleDialog
      open={open}
      title="App Language Required"
      onClose={dismiss}
      closeOnBackdrop={false}
    >
      <p className="text-muted mb-2" style={{ fontSize: "14px", lineHeight: 1.6 }}>
        No app languages are configured yet. Add at least one language so your
        app can display localized content for users.
      </p>
      <ul className="mb-3 ps-3" style={{ fontSize: "14px", lineHeight: 1.6 }}>
        <li>Set a language title and code (for example, English / en)</li>
        <li>Upload or manage translations for the app module</li>
        <li>Mark one language as default when you are ready</li>
      </ul>
      <div className="d-flex flex-wrap gap-2 justify-content-end">
        <button type="button" className="cancel-button" onClick={dismiss}>
          Later
        </button>
        <Button text="Manage App Languages" onClick={handleManage} />
      </div>
    </SimpleDialog>
  );
}
