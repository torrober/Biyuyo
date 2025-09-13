import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns at most one user-perceived character (grapheme cluster), trimming extra input.
// This helps enforce a single emoji/character in inputs regardless of surrogate pairs or ZWJ sequences.
export function limitToSingleGrapheme(input: string): string {
  if (!input) return "";
  // Use Intl.Segmenter when available for accurate grapheme segmentation
  try {
    // @ts-ignore - not in all TS lib.dom versions
    const seg = new (Intl as any).Segmenter(undefined, { granularity: "grapheme" });
    const it = seg.segment(input)[Symbol.iterator]();
    const first = it.next();
    return first && first.value ? first.value.segment ?? "" : "";
  } catch {
    // Fallback: naive approach using Array.from which splits by code points
    const arr = Array.from(input);
    return arr.length > 0 ? arr[0] : "";
  }
}

// Validates that the whole input is exactly one emoji grapheme
export function isSingleEmoji(input: string): boolean {
  if (!input) return false;
  const single = limitToSingleGrapheme(input);
  if (single !== input) return false;
  // Basic check: grapheme contains at least one Extended_Pictographic code point (covers most emojis)
  try {
    return /\p{Extended_Pictographic}/u.test(single);
  } catch {
    // Fallback for environments without Unicode property escapes support
    const codePoints = Array.from(single);
    return codePoints.some((c) => c.codePointAt(0)! >= 0x1F300); // rough heuristic for emoji range
  }
}

// Format an ISO date string to a value acceptable by <input type="datetime-local">
// using the local timezone: YYYY-MM-DDTHH:mm
export function toLocalDatetimeInputValue(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

// Parse a local datetime-local value (no timezone) into ISO string using local time
export function fromLocalDatetimeInputValue(localValue: string): string {
  // localValue like "YYYY-MM-DDTHH:mm"
  const [date, time] = localValue.split("T");
  const [y, m, d] = date.split("-").map((x) => Number(x));
  const [hh, mi] = time.split(":" ).map((x) => Number(x));
  const dt = new Date(y, m - 1, d, hh, mi, 0, 0);
  return dt.toISOString();
}