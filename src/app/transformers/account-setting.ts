import type {
  AccountExportSettings,
  AccountNominalCodes,
  AccountSetting,
  AccountSettingPayload,
  AccountTaxMapping,
  AccountingSystem,
} from "@/app/types/account-setting"

const systems: AccountingSystem[] = ["xero", "sage", "quickbooks"]

function systemValue(value: unknown): AccountingSystem {
  const system = String(value || "xero").toLowerCase()

  return systems.includes(system as AccountingSystem) ? (system as AccountingSystem) : "xero"
}

function nullableString(value: unknown): string | null {
  const text = String(value ?? "").trim()

  return text || null
}

function nominalCodes(raw: any = {}): AccountNominalCodes {
  return {
    sales: nullableString(raw.sales),
    purchase: nullableString(raw.purchase),
    freight: nullableString(raw.freight),
    fuel: nullableString(raw.fuel),
    credit: nullableString(raw.credit),
    trackingCategory: nullableString(raw.trackingCategory ?? raw.tracking_category),
    sageDepartment: nullableString(raw.sageDepartment ?? raw.sage_department),
    qbClass: nullableString(raw.qbClass ?? raw.qb_class),
  }
}

function taxMapping(raw: any = {}): AccountTaxMapping {
  return {
    rateType: nullableString(raw.rateType ?? raw.rate_type),
    label: nullableString(raw.label),
    rate: Number(raw.rate ?? 0),
    internalTaxCode: nullableString(raw.internalTaxCode ?? raw.internal_tax_code),
    salesTaxCode: nullableString(raw.salesTaxCode ?? raw.sales_tax_code),
    purchaseTaxCode: nullableString(raw.purchaseTaxCode ?? raw.purchase_tax_code),
    isActive: raw.isActive ?? raw.is_active ?? true,
  }
}

function exportSettings(raw: any = {}): AccountExportSettings {
  return {
    invoicePrefix: nullableString(raw.invoicePrefix ?? raw.invoice_prefix),
    defaultPaymentTerms: Number(raw.defaultPaymentTerms ?? raw.default_payment_terms ?? 30),
    exportCurrency: String(raw.exportCurrency ?? raw.export_currency ?? "GBP").toUpperCase(),
    xeroBrandingTheme: nullableString(raw.xeroBrandingTheme ?? raw.xero_branding_theme),
    sageReferenceFormat: nullableString(raw.sageReferenceFormat ?? raw.sage_reference_format),
    qbMemoFormat: nullableString(raw.qbMemoFormat ?? raw.qb_memo_format),
  }
}

function fetch(raw: any): AccountSetting {
  return {
    id: Number(raw?.id ?? 0),
    companyId: Number(raw?.companyId ?? raw?.company_id ?? 0),
    accountingSystem: systemValue(raw?.accountingSystem ?? raw?.accounting_system),
    isDefault: raw?.isDefault ?? raw?.is_default ?? false,
    isActive: raw?.isActive ?? raw?.is_active ?? true,
    isConnected: raw?.isConnected ?? raw?.is_connected ?? false,
    nominalCodes: nominalCodes(raw?.nominalCodes ?? raw?.nominal_codes),
    taxMappings: Array.isArray(raw?.taxMappings ?? raw?.tax_mappings)
      ? (raw.taxMappings ?? raw.tax_mappings).map(taxMapping)
      : [],
    exportSettings: exportSettings(raw?.exportSettings ?? raw?.export_settings),
    createdAt: raw?.createdAt ?? raw?.created_at ?? null,
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? null,
  }
}

function fetchCollection(rows: any[] = []): AccountSetting[] {
  return rows.map(fetch)
}

function payload(setting: AccountSettingPayload) {
  return {
    accountingSystem: setting.accountingSystem,
    isDefault: setting.isDefault,
    isActive: setting.isActive,
    isConnected: setting.isConnected,
    nominalCodes: nominalCodes(setting.nominalCodes),
    taxMappings: setting.taxMappings.map(taxMapping),
    exportSettings: exportSettings(setting.exportSettings),
  }
}

export default {
  fetch,
  fetchCollection,
  payload,
}
