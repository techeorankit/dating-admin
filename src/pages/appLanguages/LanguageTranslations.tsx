"use client";

import LanguageTranslationsPanel from "@/component/language/LanguageTranslationsPanel";
import RootLayout from "@/component/layout/Layout";
import { usePermission } from "@/context/PermissionContext";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";

const MODULE_NAME = "Language Management";

const LanguageTranslations = () => {
  const router = useRouter();
  const { canSee } = usePermission();
  const languageCode = String(router.query.languageCode || "");
  const titleQ = String(router.query.title || "");

  const displayTitle = useMemo(() => {
    try {
      return decodeURIComponent(titleQ) || languageCode;
    } catch {
      return titleQ || languageCode;
    }
  }, [titleQ, languageCode]);

  useEffect(() => {
    if (!canSee(MODULE_NAME)) {
      router.push("/not-authorized");
    }
  }, [canSee, router]);

  if (!router.isReady) {
    return null;
  }

  if (!languageCode) {
    return (
      <div className="p-4">
        <p>Missing language code.</p>
        <Link href="/LanguageManagement/AppLanguages">Back to languages</Link>
      </div>
    );
  }

  return (
    <div className="userTable">
      <div className="mb-3">
        <Link
          href="/LanguageManagement/AppLanguages"
          className="text-decoration-none text-muted small d-inline-block mb-2"
        >
          ← App Languages
        </Link>
      </div>
      <LanguageTranslationsPanel
        languageCode={languageCode}
        languageTitle={displayTitle}
        tableMaxHeight="70vh"
      />
    </div>
  );
};

LanguageTranslations.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default LanguageTranslations;
