export type XeroConnectionStatus = "disconnected" | "connected" | "needs_reconnect"

export type XeroConnection = {
  provider: "xero"
  status: XeroConnectionStatus
  organisationId: string | null
  organisationName: string | null
  connectedBy: { id: number; name: string; email: string } | null
  connectedAt: string | null
  lastRefreshedAt: string | null
  lastTestedAt: string | null
  lastSuccessfulSyncAt: string | null
  errorCode: string | null
  errorMessage: string | null
}

export type XeroSettings = {
  provider: "xero"
  defaultSalesAccountCode: string | null
  defaultSalesAccountName: string | null
  defaultTaxType: string | null
  defaultTaxName: string | null
  defaultInvoiceStatus: "DRAFT" | "AUTHORISED"
  autoSyncCustomerInvoices: boolean
  syncCustomerContacts: boolean
  useOrbisInvoiceNumber: boolean
  updatedAt: string | null
}

export type XeroStatus = {
  configured: boolean
  status: XeroConnectionStatus
  message: string | null
  settingsComplete: boolean
  connection: XeroConnection | null
  settings: XeroSettings
}

export type XeroAccountOption = {
  code: string
  name: string
  id: string | null
  type: string | null
}
export type XeroTaxRateOption = {
  taxType: string
  name: string
  rate: number
  status: string | null
}
export type XeroOrganisation = { id: string; tenantId: string; name: string }

export type XeroPendingOrganisations = {
  selectionId: string
  organisations: XeroOrganisation[]
  currentOrganisationId: string | null
  expiresAt: string | null
}

export type XeroSettingsPayload = {
  defaultSalesAccountCode: string
  defaultTaxType: string
  defaultInvoiceStatus: "DRAFT" | "AUTHORISED"
  autoSyncCustomerInvoices: boolean
  syncCustomerContacts: boolean
  useOrbisInvoiceNumber: boolean
}

export type XeroSyncResult = {
  provider: "xero"
  entityType: "invoice"
  localEntityId: number
  externalEntityId: string | null
  externalReference: string | null
  syncStatus: string
  lastSyncedAt: string | null
  error: string | null
}
