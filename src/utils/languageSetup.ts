import { apiInstance } from "@/utils/ApiInstance";
import { ensureAuthToken, getAuthUid } from "@/utils/authToken";

export function resolveLanguageTotal(payload: unknown): number {
  if (payload == null || typeof payload !== "object") return 0;
  const data = payload as Record<string, unknown>;
  if (typeof data.total === "number") return data.total;
  if (typeof data.count === "number") return data.count;
  const raw = data.data ?? data.languages;
  return Array.isArray(raw) ? raw.length : 0;
}

export async function fetchLanguageTotal(): Promise<number | null> {
  if (typeof window === "undefined") return null;

  try {
    const token = await ensureAuthToken();
    if (!token) return null;

    const uid = getAuthUid() || sessionStorage.getItem("uid") || "";

    const data = await apiInstance.get(
      "api/admin/language/getLanguages?start=1&limit=1&search=",
      {
        headers: {
          "x-admin-uid": uid,
        },
      }
    );
    return resolveLanguageTotal(data);
  } catch {
    return null;
  }
}
