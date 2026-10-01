

import { DangerRight, Success } from "../api/toastServices";

export const routerChange = (path: string, type: string, router: any) => {
    const handleRouteChange = (url: string) => {
        if (!url.includes(path)) {
            localStorage.removeItem(type);
        }
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
        router.events.off("routeChangeStart", handleRouteChange);
    };
}

export const copyId = (id: string) => {
  const text = typeof id === "string" ? id.trim() : "";
  if (!text || text === "-") return;

  const fallbackCopy = () => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  };

  // Try modern Clipboard API first (requires secure context + permissions).
  if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => Success("Unique ID copied"))
      .catch(() => {
        const ok = fallbackCopy();
        if (ok) Success("Unique ID copied");
        else DangerRight("Copy failed. Please copy manually.");
      });
    return;
  }

  const ok = fallbackCopy();
  if (ok) Success("Unique ID copied");
  else DangerRight("Copy failed. Please copy manually.");
};

export function getCountryCodeFromEmoji(emoji: any) {
  if (!emoji || emoji.length < 2) return null;
  const codePoints = [...emoji].map(char => char.codePointAt(0) - 127397);
  return String.fromCharCode(...codePoints).toLowerCase(); // e.g. "in"
}