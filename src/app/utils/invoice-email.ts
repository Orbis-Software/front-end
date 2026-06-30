export function isValidInvoiceEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function invoiceEmailSummaryValue(value: string | number | Date): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toLocaleDateString("en-GB")
  }

  return String(value)
}
