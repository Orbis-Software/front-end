export type AccountingSystem = "xero" | "sage" | "quickbooks"

export type AccountNominalCodes = {
  sales: string | null
  purchase: string | null
  freight: string | null
  fuel: string | null
  credit: string | null
  trackingCategory?: string | null
  sageDepartment?: string | null
  qbClass?: string | null
}

export type AccountTaxMapping = {
  rateType: string | null
  label: string | null
  rate: number
  internalTaxCode: string | null
  salesTaxCode: string | null
  purchaseTaxCode: string | null
  isActive: boolean
}

export type AccountExportSettings = {
  invoicePrefix: string | null
  defaultPaymentTerms: number
  exportCurrency: string
  xeroBrandingTheme?: string | null
  sageReferenceFormat?: string | null
  qbMemoFormat?: string | null
}

export type AccountSetting = {
  id: number
  companyId: number
  accountingSystem: AccountingSystem
  isDefault: boolean
  isActive: boolean
  isConnected: boolean
  nominalCodes: AccountNominalCodes
  taxMappings: AccountTaxMapping[]
  exportSettings: AccountExportSettings
  createdAt?: string | null
  updatedAt?: string | null
}

export type AccountSettingPayload = {
  accountingSystem: AccountingSystem
  isDefault: boolean
  isActive: boolean
  isConnected: boolean
  nominalCodes: AccountNominalCodes
  taxMappings: AccountTaxMapping[]
  exportSettings: AccountExportSettings
}
