import type { ContactType } from "@/app/types/contact-type"
import type { SelectOption } from "@/app/types/select-option"
import type { UserSummary } from "@/app/types/user"

export type ContactDetailsTab =
  | "overview"
  | "branches"
  | "collections"
  | "weight_break"
  | "customer"

export interface ListContactsParams {
  page?: number
  per_page?: number
  contact_type_id?: number
  status?: string
  include_addresses?: boolean | number
  q?: string
}

export interface ExportContactsParams {
  q?: string
  contact_type_id?: number | null
  status?: string
}

export type ContactEmployeeAssignment = UserSummary

export interface Contact {
  id: number
  company_id: number | null

  // ✅ DB-driven types
  contact_types: ContactType[]

  // Company / identity
  company_name?: string | null
  account_number?: string | null
  account_manager_id?: number | null
  account_support_id?: number | null
  account_manager?: ContactEmployeeAssignment | null
  account_support?: ContactEmployeeAssignment | null

  // Registration
  registration_number?: string | null
  vat_number?: string | null
  eori?: string | null

  // Address
  address_line_1?: string | null
  address_line_2?: string | null
  address_line_3?: string | null
  address_line_4?: string | null
  city?: string | null
  county_state?: string | null
  postal_code?: string | null
  country_id?: number | null

  // Contact methods
  phone?: string | null
  mobile?: string | null
  email?: string | null
  website?: string | null

  // Finance
  credit_limit?: number | null
  currency_preference?: string | null
  credit_used?: number
  available_credit?: number
  total_sales?: number
  hard_stop_limit?: number
  overage_percentage?: number
  at_credit_limit?: boolean
  hard_stopped?: boolean
  days_overdue?: number
  credit_currency?: string
  total_jobs?: number
  total_quotes?: number
  total_invoices?: number

  // Address usage flags (MVP)
  is_delivery?: boolean
  is_collection?: boolean
  is_consignee?: boolean
  is_accounts?: boolean
  is_headoffice?: boolean

  branches?: ContactBranch[]
  collection_addresses?: ContactCollectionAddress[]

  // System
  status: string
  created_at: string
  updated_at: string
}

export interface ContactCreatePayload {
  // ✅ send IDs (pivot)
  contact_type_ids: number[]

  // Relations
  company_id?: number | null

  // Company / identity
  company_name?: string | null
  account_number?: string | null
  account_manager_id?: number | null
  account_support_id?: number | null

  // Registration
  registration_number?: string | null
  vat_number?: string | null
  eori?: string | null

  // Address
  address_line_1?: string | null
  address_line_2?: string | null
  address_line_3?: string | null
  address_line_4?: string | null
  city?: string | null
  county_state?: string | null
  postal_code?: string | null
  country_id?: number | null

  // Contact methods
  phone?: string | null
  mobile?: string | null
  email?: string | null
  website?: string | null

  // Finance
  credit_limit?: number | null
  currency_preference?: string | null

  // Address usage flags
  is_delivery?: boolean
  is_collection?: boolean
  is_consignee?: boolean
  is_accounts?: boolean
  is_headoffice?: boolean

  // System
  status?: string
}

export interface ContactBranch {
  id: number
  contact_id?: number | null
  name: string | null

  contact_person: string | null
  email: string | null
  phone: string | null

  is_collection: boolean
  is_delivery: boolean

  delivery_address_line_1: string | null
  delivery_address_line_2: string | null
  delivery_address_line_3: string | null
  delivery_city: string | null
  delivery_county_state: string | null
  delivery_postal_code: string | null
  delivery_country_id: number | null

  billing_same_as_delivery: boolean

  billing_address_line_1: string | null
  billing_address_line_2: string | null
  billing_address_line_3: string | null
  billing_city: string | null
  billing_county_state: string | null
  billing_postal_code: string | null
  billing_country_id: number | null
}

export interface ContactCollectionAddress {
  id: number
  contact_id?: number | null
  label: string | null

  address_line_1: string | null
  address_line_2: string | null
  address_line_3: string | null
  city: string | null
  county_state: string | null
  postal_code: string | null
  country_id: number | null
  country_name?: string | null

  // ✅ NEW: generated fields
  sequence_no?: number | null
  reference_code?: string | null

  // ✅ NEW: flags (can be both true)
  is_collection?: boolean
  is_delivery?: boolean

  // ✅ persisted UI fields
  hours_of_operation?: string | null
  contact_person?: string | null
  email?: string | null
  phone?: string | null
  special_instructions?: string | null
}

export interface ContactUpdatePayload extends Partial<ContactCreatePayload> {}

export type ContactBranchPayload = Partial<Omit<ContactBranch, "id">>
export type ContactCollectionAddressPayload = Partial<Omit<ContactCollectionAddress, "id">>

export interface ContactChargeBreak {
  id: number
  charge_table_id: number
  label: string
  min_value: number | null
  max_value: number | null
  unit: string
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface ContactChargeRowValue {
  id: number
  charge_row_id: number
  charge_break_id: number | null
  amount: number
  created_at?: string
  updated_at?: string
}

export interface ContactChargeRow {
  id: number
  charge_table_id: number
  description: string
  code: string | null
  value_type: string
  charge_basis: string | null
  transport_mode?: string | null
  is_required: boolean
  sort_order: number
  values?: ContactChargeRowValue[]
  created_at?: string
  updated_at?: string
}

export interface ContactChargeTable {
  id: number
  company_id: number
  contact_id: number
  name: string
  code: string | null
  charge_type: string
  applies_to: string
  currency_code: string
  measurement_type: string | null
  weight_unit: string | null
  volume_unit: string | null
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  is_default: boolean
  sort_order: number
  notes: string | null
  breaks?: ContactChargeBreak[]
  rows?: ContactChargeRow[]
  created_at: string
  updated_at: string
}

export interface ContactChargeRowValuePayload {
  charge_break_id?: number | null
  break_sort_order?: number | null
  amount?: number | null
}

export interface ContactChargeRowPayload {
  description: string
  code?: string | null
  value_type?: string | null
  charge_basis?: string | null
  transport_mode?: string | null
  is_required?: boolean
  sort_order?: number
  values?: ContactChargeRowValuePayload[]
}

export interface ContactChargeBreakPayload {
  label: string
  min_value?: number | null
  max_value?: number | null
  unit?: string | null
  sort_order?: number
}

export interface ContactChargeTablePayload {
  name: string
  code?: string | null
  charge_type: string
  applies_to: string
  currency_code: string
  measurement_type?: string | null
  weight_unit?: string | null
  volume_unit?: string | null
  valid_from?: string | null
  valid_until?: string | null
  is_active?: boolean
  is_default?: boolean
  sort_order?: number
  notes?: string | null
  breaks?: ContactChargeBreakPayload[]
  rows?: ContactChargeRowPayload[]
}

export interface ContactChargeTableListParams {
  page?: number
  per_page?: number
  charge_type?: string
  applies_to?: string
  is_active?: boolean | string
  q?: string
}

export type ContactChargeSelectOption = SelectOption

export type ContactChargeMeasurementType = "weight" | "volume"

export type ContactWeightBreak = {
  id: number
  label: string
  min: number | string
  max: number | string
  unit?: string
}

export type ContactWeightChargeRow = {
  id: number
  description: string
  values: Array<number | string>
}

export type ContactChargeRowMigrationResult = {
  rows: ContactWeightChargeRow[]
  changed: boolean
  messages: string[]
}

export type ContactChargeTableListItem = {
  id: number
  name: string
}

export type ContactChargeAutosaveSnapshot = {
  activeTableId: number | null
  tableTitle: string
  currency: string
  valid_until: string | null
  measurementType: ContactChargeMeasurementType
  weightUnit: string
  volumeUnit: string
  weightBreaks: ContactWeightBreak[]
  charges: ContactWeightChargeRow[]
}

export type ContactChargeAutosaveChange = {
  key: string
  message: string
}

export type ContactCustomerChargeCurrency = "GBP" | "USD" | "EUR"
export type ContactCustomerChargeTransportMode = "Road" | "Air" | "Sea"
export type ContactCustomerChargeUnit = "Per Shipment" | "Per KG" | "Each"

export type ContactCustomerChargeLine = {
  id: number
  description: string
  uom: ContactCustomerChargeUnit
  rate: number | null
  transport_mode: ContactCustomerChargeTransportMode
}

export type ContactCustomerChargeSheet = {
  id: number
  name: string
  currency: ContactCustomerChargeCurrency
  valid_until: string | null
  lines: ContactCustomerChargeLine[]
}

export type ContactCalculationCurrency = "GBP" | "USD" | "EUR" | "PHP" | string

export type ContactNormalizedChargeBreak = {
  id: number
  label: string
  min: number
  max: number | null
  unit: string
  sortOrder: number
}

export type ContactNormalizedChargeRowValue = {
  id: number
  chargeBreakId: number
  amount: number
}

export type ContactNormalizedChargeRow = {
  id: number
  description: string
  chargeBasis: string
  sortOrder: number
  values: ContactNormalizedChargeRowValue[]
}

export type ContactChargeCalculationRow = {
  description: string
  weightBreak: string
  rate: number
  rateText: string
  weightUnit: string
  charge: number
  basisText: string
}
