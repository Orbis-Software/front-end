// src/app/utils/reference-sequence.ts
import type { CompanyReferenceSequence } from "@/app/types/company"

/**
 * Build preview reference number like: JB26-00000001
 * Uses:
 * - prefix: "JB"
 * - year: from date (2026 -> "26")
 * - next_number_formatted if provided, else pad next_number with min_width
 *
 * NOTE: Preview only. Backend must still increment atomically on create.
 */
export function buildReferenceNumber(
  seq: CompanyReferenceSequence,
  date: Date,
  opts?: { separator?: string; offset?: number },
): string {
  if (!seq?.use_system) return ""

  const separator = opts?.separator ?? "-"
  const offset = Math.max(0, Number(opts?.offset ?? 0))
  const year = String(date.getFullYear()).slice(-2)

  const formatted =
    offset === 0 && seq.next_number_formatted
      ? String(seq.next_number_formatted)
      : String(Number(seq.next_number ?? 0) + offset).padStart(Number(seq.min_width ?? 1), "0")

  return `${seq.prefix}${year}${separator}${formatted}`
}
