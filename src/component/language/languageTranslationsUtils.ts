export function normalizeTranslations(payload: any): Record<string, string> {
  // API shape: { status, message, doc: { languageCode, module, translations: { key: value } } }
  let raw =
    payload?.doc?.translations ??
    payload?.data?.translations ??
    payload?.data ??
    payload?.translations;

  if (raw == null && payload && typeof payload === "object" && !Array.isArray(payload)) {
    const looksLikeApiWrapper =
      "status" in payload || "message" in payload || "doc" in payload;
    if (!looksLikeApiWrapper) {
      raw = payload;
    }
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const out: Record<string, string> = {};
    Object.keys(raw).forEach((k) => {
      const v = raw[k];
      out[k] = v == null ? "" : String(v);
    });
    return out;
  }
  return {};
}
