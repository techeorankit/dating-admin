"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

/** Legacy per-list keys; new data lives in STORAGE_KEY only. */
const LEGACY_PREFIX = "admin:pagination:";
const STORAGE_KEY = "admin:pagination";

/** Separator for route-scoped keys: `${storageKey}::${normalizedPath}` */
const ROUTE_KEY_SEP = "::";

/** Updated by PaginationRouteTracker on each client navigation. */
const LAST_PATH_KEY = "admin:lastPathForPagination";
const CURRENT_PATH_KEY = "admin:currentPathForPagination";
const RESET_BY_SIDEBAR_KEY = "admin:paginationResetBySidebar";

type PaginationEntry = { page: number; rows: number };

/** Stable key from Next.js pathname (no query). */
export function normalizeRoutePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

/** First URL segment for sidebar / section detection (e.g. /User/... and /User/... → same). */
export function sidebarRouteSegment(pathname: string): string {
  const parts = normalizeRoutePath(pathname).split("/").filter(Boolean);
  return parts[0] ?? "";
}

/**
 * Sidebar / section id for reset logic. Must match Navigator “same menu” groupings:
 * Agency list and Agency-wise hosts live under different path prefixes but one sidebar item.
 */
export function paginationNavigationGroup(pathname: string): string {
  const n = normalizeRoutePath(pathname);
  if (n === "/Agency" || n.startsWith("/Agency/")) return "__agency__";
  if (n === "/Host/AgencyWiseHost") return "__agency__";
  return sidebarRouteSegment(pathname);
}

/** Unique persistence id per logical list + full route. */
export function buildPaginationPersistKey(
  storageKey: string,
  pathname: string
): string {
  return `${storageKey}${ROUTE_KEY_SEP}${normalizeRoutePath(pathname)}`;
}

function readStoreRaw(): Record<string, PaginationEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, PaginationEntry>;
  } catch {
    return {};
  }
}

function readStore(): Record<string, PaginationEntry> {
  migrateLegacyKeysIntoStoreOnce();
  return readStoreRaw();
}

function writeStore(store: Record<string, PaginationEntry>): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

let legacyMigrationDone = false;

/** Merge old `admin:pagination:<id>:page|rows` keys into STORAGE_KEY once, then remove them. */
function migrateLegacyKeysIntoStoreOnce(): void {
  if (typeof window === "undefined" || legacyMigrationDone) return;
  legacyMigrationDone = true;
  if (sessionStorage.getItem("admin:pagination:migrated")) return;

  const store = readStoreRaw();
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const k = sessionStorage.key(i);
    if (!k || !k.startsWith(LEGACY_PREFIX)) continue;
    const id =
      k.endsWith(":page") ? k.slice(LEGACY_PREFIX.length, -":page".length)
        : k.endsWith(":rows") ? k.slice(LEGACY_PREFIX.length, -":rows".length)
          : null;
    if (id === null) continue;
    const raw = sessionStorage.getItem(k);
    if (raw === null) continue;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) continue;
    const existing = store[id] ?? { page: 1, rows: 10 };
    if (k.endsWith(":page")) existing.page = n;
    else existing.rows = n;
    store[id] = existing;
  }
  writeStore(store);

  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const k = sessionStorage.key(i);
    if (
      k &&
      k.startsWith(LEGACY_PREFIX) &&
      (k.endsWith(":page") || k.endsWith(":rows"))
    ) {
      sessionStorage.removeItem(k);
    }
  }
  sessionStorage.setItem("admin:pagination:migrated", "1");
}

/** Drop legacy :page / :rows keys for this list id (and optionally prune whole legacy namespace). */
function removeLegacyKeysFor(mapKey: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${LEGACY_PREFIX}${mapKey}:page`);
  sessionStorage.removeItem(`${LEGACY_PREFIX}${mapKey}:rows`);
}

function readPage(mapKey: string): number | null {
  if (typeof window === "undefined") return null;
  const store = readStore();
  const fromStore = store[mapKey]?.page;
  if (typeof fromStore === "number" && Number.isFinite(fromStore) && fromStore >= 1) {
    return fromStore;
  }
  const raw = sessionStorage.getItem(`${LEGACY_PREFIX}${mapKey}:page`);
  if (raw === null) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

function readRows(mapKey: string): number | null {
  if (typeof window === "undefined") return null;
  const store = readStore();
  const fromStore = store[mapKey]?.rows;
  if (typeof fromStore === "number" && Number.isFinite(fromStore) && fromStore >= 1) {
    return fromStore;
  }
  const raw = sessionStorage.getItem(`${LEGACY_PREFIX}${mapKey}:rows`);
  if (raw === null) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

/** Prefer route-scoped key; fall back to storage-only key (pre–route-scoped sessions). */
function readPageForList(
  persistKey: string,
  storageKey: string
): number | null {
  return readPage(persistKey) ?? readPage(storageKey);
}

function readRowsForList(
  persistKey: string,
  storageKey: string
): number | null {
  return readRows(persistKey) ?? readRows(storageKey);
}

function upsertPagination(
  mapKey: string,
  page: number,
  rowsPerPage: number
): void {
  if (typeof window === "undefined") return;
  const store = readStore();
  store[mapKey] = { page, rows: rowsPerPage };
  writeStore(store);
  removeLegacyKeysFor(mapKey);
}

function removePaginationEntry(mapKey: string): void {
  if (typeof window === "undefined") return;
  const store = readStore();
  delete store[mapKey];
  writeStore(store);
  removeLegacyKeysFor(mapKey);
}

/**
 * Mount once in _app: records previous pathname on each client navigation so we can
 * detect sidebar / cross-section jumps vs in-section navigation.
 *
 * Important: do NOT clear LAST_PATH when stored CURRENT !== pathname — that can run during
 * SPA transitions (before routeChangeComplete) and wipes lastPath, breaking back navigation.
 */
export function PaginationRouteTracker() {
  const router = useRouter();

  useLayoutEffect(() => {
    if (!router.isReady) return;

    const handleRouteChange = () => {
      const pathname = router.pathname;
      const prev = sessionStorage.getItem(CURRENT_PATH_KEY) || "";
      sessionStorage.setItem(LAST_PATH_KEY, prev);
      sessionStorage.setItem(CURRENT_PATH_KEY, pathname);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    if (!sessionStorage.getItem(CURRENT_PATH_KEY)) {
      sessionStorage.setItem(CURRENT_PATH_KEY, router.pathname);
      sessionStorage.setItem(LAST_PATH_KEY, "");
    }

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.isReady]);

  /** Full reload: URL is source of truth; avoid stale CURRENT breaking pagination logic. */
  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") return;
    const nav = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "reload") {
      sessionStorage.setItem(CURRENT_PATH_KEY, router.pathname);
      sessionStorage.setItem(LAST_PATH_KEY, "");
    }
  }, [router.isReady, router.pathname]);

  return null;
}

export function usePersistedPagination(options: {
  storageKey: string;
  defaultPage?: number;
  defaultRowsPerPage?: number;
  /**
   * Sync pagination state into URL query params so browser back/forward restores it.
   * Defaults to true.
   */
  syncWithUrl?: boolean;
  /**
   * Override URL query param keys used for page/rows.
   * When omitted, we use namespaced keys to avoid collisions between multiple lists on the same route.
   */
  urlPageQueryKey?: string;
  urlRowsQueryKey?: string;
}) {
  const {
    storageKey,
    defaultPage = 1,
    defaultRowsPerPage = 10,
    syncWithUrl = true,
    urlPageQueryKey,
    urlRowsQueryKey,
  } = options;

  const router = useRouter();

  // Capture the route pathname for this hook instance.
  // During a route transition, Next can temporarily change `router.pathname`
  // before the component unmounts, which can cause wrong persistence/URL reads.
  const instancePathnameRef = useRef<string | null>(null);
  if (instancePathnameRef.current === null && typeof router.pathname === "string") {
    instancePathnameRef.current = router.pathname;
  }

  const hashStorageKey = useMemo(() => {
    // Small stable hash so our query param names don't collide.
    let h = 2166136261;
    for (let i = 0; i < storageKey.length; i++) {
      h ^= storageKey.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }, [storageKey]);

  // Query param keys for this pagination instance.
  // - Default: namespaced keys to avoid collisions.
  // - Override: allow specific pages (e.g. Fake Post) to match `?page=&limit=` contract.
  const pageQueryKey = useMemo(
    () => urlPageQueryKey ?? `admin_pg_${hashStorageKey}`,
    [urlPageQueryKey, hashStorageKey]
  );
  const rowsQueryKey = useMemo(
    () => urlRowsQueryKey ?? `admin_rows_${hashStorageKey}`,
    [urlRowsQueryKey, hashStorageKey]
  );

  const readQueryInt = useCallback((value: unknown): number | null => {
    if (typeof value === "string") {
      const n = parseInt(value, 10);
      return Number.isFinite(n) && n >= 1 ? n : null;
    }
    if (Array.isArray(value) && typeof value[0] === "string") {
      const n = parseInt(value[0] as string, 10);
      return Number.isFinite(n) && n >= 1 ? n : null;
    }
    return null;
  }, []);

  // Initialize from URL/session immediately so we don't "flash" defaults (page=1)
  // and accidentally overwrite persisted pagination during the first commit.
  const [page, setPageState] = useState(() => {
    if (typeof window === "undefined") return defaultPage;

    const resetBySidebar = sessionStorage.getItem(RESET_BY_SIDEBAR_KEY) === "1";
    if (resetBySidebar) return defaultPage;

    const persistKey = buildPaginationPersistKey(
      storageKey,
      instancePathnameRef.current ?? router.pathname
    );

    const qPage =
      syncWithUrl && router.query ? readQueryInt(router.query[pageQueryKey]) : null;
    return qPage ?? readPageForList(persistKey, storageKey) ?? defaultPage;
  });

  const [rowsPerPage, setRowsPerPageState] = useState(() => {
    if (typeof window === "undefined") return defaultRowsPerPage;

    const resetBySidebar = sessionStorage.getItem(RESET_BY_SIDEBAR_KEY) === "1";
    if (resetBySidebar) return defaultRowsPerPage;

    const persistKey = buildPaginationPersistKey(
      storageKey,
      instancePathnameRef.current ?? router.pathname
    );

    const qRows =
      syncWithUrl && router.query
        ? readQueryInt(router.query[rowsQueryKey])
        : null;
    return qRows ?? readRowsForList(persistKey, storageKey) ?? defaultRowsPerPage;
  });

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const instancePathname = instancePathnameRef.current ?? router.pathname;

    const persistKey = buildPaginationPersistKey(storageKey, instancePathname);

    const resetBySidebar = sessionStorage.getItem(RESET_BY_SIDEBAR_KEY) === "1";
    if (resetBySidebar) {
      // Consume the flag so browser back restores the previous pagination state.
      sessionStorage.setItem(RESET_BY_SIDEBAR_KEY, "0");

      // Clear persisted entry for this list so defaults are used.
      removePaginationEntry(persistKey);

      // Ignore URL query pagination values when user navigated via sidebar.
      setPageState(defaultPage);
      setRowsPerPageState(defaultRowsPerPage);
      return;
    }

    const qPage =
      syncWithUrl && router.query ? readQueryInt(router.query[pageQueryKey]) : null;
    const qRows =
      syncWithUrl && router.query ? readQueryInt(router.query[rowsQueryKey]) : null;

    const p = qPage ?? readPageForList(persistKey, storageKey);
    const r = qRows ?? readRowsForList(persistKey, storageKey);

    setPageState(p ?? defaultPage);
    setRowsPerPageState(r ?? defaultRowsPerPage);
  }, [
    router.isReady,
    router.pathname,
    storageKey,
    defaultPage,
    defaultRowsPerPage,
    syncWithUrl,
    pageQueryKey,
    rowsQueryKey,
    readQueryInt,
  ]);

  useLayoutEffect(() => {
    if (!router.isReady) return;
    const instancePathname = instancePathnameRef.current ?? router.pathname;

    const persistKey = buildPaginationPersistKey(storageKey, instancePathname);
    upsertPagination(persistKey, page, rowsPerPage);

    if (!syncWithUrl) return;

    // Avoid replacing the URL if it already reflects current pagination.
    const currentPageFromUrl =
      readQueryInt(router.query[pageQueryKey]);
    const currentRowsFromUrl =
      readQueryInt(router.query[rowsQueryKey]);
    if (currentPageFromUrl === page && currentRowsFromUrl === rowsPerPage) return;

    const nextQuery = {
      ...router.query,
      [pageQueryKey]: String(page),
      [rowsQueryKey]: String(rowsPerPage),
    };

    // Shallow replace keeps SPA behavior without polluting the browser history
    // stack during pagination hydration/sync.
    router.replace(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { shallow: true }
    );
  }, [
    router.isReady,
    router.pathname,
    storageKey,
    page,
    rowsPerPage,
    syncWithUrl,
    pageQueryKey,
    rowsQueryKey,
    readQueryInt,
  ]);

  const setPage = useCallback(
    (value: number | ((prev: number) => number)) => {
      setPageState(value);
    },
    []
  );

  const setRowsPerPage = useCallback(
    (value: number | ((prev: number) => number)) => {
      setRowsPerPageState(value);
    },
    []
  );

  /** Clamp page to valid range when totalCount is known; keeps page when still valid. */
  const changeRowsPerPage = useCallback(
    (newRows: number, totalCount: number) => {
      setRowsPerPageState(newRows);
      setPageState((prev) => {
        if (totalCount <= 0) return prev;
        const maxPage = Math.max(1, Math.ceil(totalCount / newRows));
        return Math.min(prev, maxPage);
      });
    },
    []
  );

  return { page, setPage, rowsPerPage, setRowsPerPage, changeRowsPerPage };
}
