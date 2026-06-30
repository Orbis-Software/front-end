export type InvoiceEmailRecipientOption = {
  label: string
  value: string
  group: string
}

export type InvoiceEmailJobSummary = Record<string, string | number | Date | null | undefined>

export type InvoiceEmailDialogProps = {
  visible: boolean
  title: string
  jobId?: number | null
  invoiceId?: number | null
  invoiceNumber: string
  invoiceLabel: string
  pdfUrl?: string | null
  recipientOptions: InvoiceEmailRecipientOption[]
  jobSummary?: InvoiceEmailJobSummary
}
