type DateInput = string | number | Date | null | undefined;

function toValidDate(value: DateInput): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return null;

    // Normalize some common backend formats:
    // - "2026-03-18 10:30:12" -> "2026-03-18T10:30:12"
    // - "2026-03-18T10:30:12.000Z" stays as-is
    const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function formatDateTime(
  value: DateInput,
  options?: Intl.DateTimeFormatOptions,
  locale: string = "en-US"
): string {
  const d = toValidDate(value);
  if (!d) return "-";

  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...options,
  });
}

