import type {
  XeroConnection,
  XeroPendingOrganisations,
  XeroSettings,
  XeroStatus,
  XeroSyncResult,
} from "@/app/types/xero"

const nullable = (value: unknown) => {
  const text = String(value ?? "").trim()
  return text || null
}

function settings(raw: any = {}): XeroSettings {
  return {
    provider: "xero",
    defaultSalesAccountCode: nullable(
      raw.defaultSalesAccountCode ?? raw.default_sales_account_code,
    ),
    defaultSalesAccountName: nullable(
      raw.defaultSalesAccountName ?? raw.default_sales_account_name,
    ),
    defaultTaxType: nullable(raw.defaultTaxType ?? raw.default_tax_type),
    defaultTaxName: nullable(raw.defaultTaxName ?? raw.default_tax_name),
    defaultInvoiceStatus:
      String(raw.defaultInvoiceStatus ?? raw.default_invoice_status ?? "DRAFT").toUpperCase() ===
      "AUTHORISED"
        ? "AUTHORISED"
        : "DRAFT",
    autoSyncCustomerInvoices: Boolean(
      raw.autoSyncCustomerInvoices ?? raw.auto_sync_customer_invoices ?? false,
    ),
    syncCustomerContacts: Boolean(raw.syncCustomerContacts ?? raw.sync_customer_contacts ?? true),
    useOrbisInvoiceNumber: Boolean(
      raw.useOrbisInvoiceNumber ?? raw.use_orbis_invoice_number ?? true,
    ),
    updatedAt: nullable(raw.updatedAt ?? raw.updated_at),
  }
}

function connection(raw: any): XeroConnection | null {
  if (!raw) return null
  return {
    provider: "xero",
    status: raw.status ?? "disconnected",
    organisationId: nullable(raw.organisationId ?? raw.organisation_id),
    organisationName: nullable(raw.organisationName ?? raw.organisation_name),
    connectedBy: raw.connectedBy ?? raw.connected_by ?? null,
    connectedAt: nullable(raw.connectedAt ?? raw.connected_at),
    lastRefreshedAt: nullable(raw.lastRefreshedAt ?? raw.last_refreshed_at),
    lastTestedAt: nullable(raw.lastTestedAt ?? raw.last_tested_at),
    lastSuccessfulSyncAt: nullable(raw.lastSuccessfulSyncAt ?? raw.last_successful_sync_at),
    errorCode: nullable(raw.errorCode ?? raw.error_code),
    errorMessage: nullable(raw.errorMessage ?? raw.error_message),
  }
}

function status(raw: any): XeroStatus {
  return {
    configured: Boolean(raw?.configured),
    status: raw?.status ?? "disconnected",
    message: nullable(raw?.message),
    settingsComplete: Boolean(raw?.settingsComplete ?? raw?.settings_complete),
    connection: connection(raw?.connection),
    settings: settings(raw?.settings),
  }
}

function pending(raw: any): XeroPendingOrganisations {
  return {
    selectionId: String(raw?.selection_id ?? raw?.selectionId ?? ""),
    organisations: (raw?.organisations ?? []).map((row: any) => ({
      id: String(row.id ?? ""),
      tenantId: String(row.tenant_id ?? row.tenantId ?? ""),
      name: String(row.name ?? "Xero organisation"),
    })),
    currentOrganisationId: nullable(raw?.current_organisation_id ?? raw?.currentOrganisationId),
    expiresAt: nullable(raw?.expires_at ?? raw?.expiresAt),
  }
}

function options(raw: any) {
  return {
    accounts: (raw?.accounts ?? []).map((row: any) => ({
      code: String(row.code ?? ""),
      name: String(row.name ?? ""),
      id: nullable(row.id),
      type: nullable(row.type),
    })),
    taxRates: (raw?.tax_rates ?? raw?.taxRates ?? []).map((row: any) => ({
      taxType: String(row.tax_type ?? row.taxType ?? ""),
      name: String(row.name ?? ""),
      rate: Number(row.rate ?? 0),
      status: nullable(row.status),
    })),
  }
}

function syncResult(raw: any): XeroSyncResult {
  return {
    provider: "xero",
    entityType: "invoice",
    localEntityId: Number(raw.localEntityId ?? raw.local_entity_id ?? 0),
    externalEntityId: nullable(raw.externalEntityId ?? raw.external_entity_id),
    externalReference: nullable(raw.externalReference ?? raw.external_reference),
    syncStatus: String(raw.syncStatus ?? raw.sync_status ?? "pending"),
    lastSyncedAt: nullable(raw.lastSyncedAt ?? raw.last_synced_at),
    error: nullable(raw.error),
  }
}

export default { settings, connection, status, pending, options, syncResult }
