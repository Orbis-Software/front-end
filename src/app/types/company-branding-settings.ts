import type { TextStyle } from "@/app/types/text-style"

export type BrandingDocumentFormat = "PDF" | "Email"
export type BrandingDocumentTone = "Formal" | "Operational" | "Customer Friendly"
export type BrandingPdfLayout = "Standard" | "Compact" | "Detailed"
export type BrandingHeaderFieldKey =
  | "companyName"
  | "tagline"
  | "phone"
  | "email"
  | "website"
  | "address"
  | "message"

export type BrandingHeaderStyle = TextStyle

export type BrandingHeaderSettings = {
  companyName: string
  tagline: string
  phone: string
  email: string
  website: string
  address: string
  message: string
  styles: Record<BrandingHeaderFieldKey, BrandingHeaderStyle>
}

export type BrandingDocumentSection = {
  id: string
  title: string
  description: string
  format: BrandingDocumentFormat
  tone: BrandingDocumentTone
  expanded: boolean
  header: string
  subject: string
  body: string
  footer: string
  layout: BrandingPdfLayout
  includeLogo: boolean
  includeBankDetails: boolean
  includeSignature: boolean
}

export type CompanyBrandingSettings = {
  id: number | null
  documentSections: BrandingDocumentSection[]
  headerSettings: BrandingHeaderSettings | null
  headerImageUrl: string | null
  updatedAt: string | null
}

export type CompanyBrandingSettingsPayload = {
  document_sections?: BrandingDocumentSection[]
  header_settings?: BrandingHeaderSettings
  header_image?: File | null
  clear_header_image?: boolean
}
