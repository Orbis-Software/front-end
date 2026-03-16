import { computed, ref, watch, onMounted } from "vue"
import { useContactStore } from "@/app/stores/contact"
import { useCompanyStore } from "@/app/stores/company"

export type Option = { label: string; value: string | null }

export type DimensionRow = {
  packaging: string | null
  qty: number
  length_cm: number
  width_cm: number
  height_cm: number
  gross_kg: number
  ldm: number
}

export type ExistingOrder = {
  id: string
  carrier: string
  pickup: string
  ref: string
  type: string
  customer?: string
  status: "Confirmed" | "Draft" | "Sent"
}

export type OrderFormState = {
  type: string
  collection_address: string | null
  delivery_address: string | null
  order_reference: string
  customer_ref: string
  collection_ref: string
  carrier: string
  pickup_date: Date | null
  pickup_time: string
  delivery_date: Date | null
  delivery_time: string
  hazardous: boolean
  hazardous_class: string | null
  goods_description: string
  dimensions: DimensionRow[]
}

export type Totals = {
  qty: number
  gross: number
  cube: number
  vol: number
  ldm: number
}

export type ChargeDisplayRow = {
  id: string
  source: "weight_break" | "customer_flat"
  table_name: string
  description: string
  basis: string
  amount: number
}

export type ChargeDisplaySummary = {
  weight_table_name: string | null
  customer_table_name: string | null
  rows: ChargeDisplayRow[]
  total: number
}

const CARRIER_TYPE_IDS = [3, 4, 5, 6]

export const orderTypeOptions: Option[] = [
  { label: "Domestic", value: "DOMESTIC" },
  { label: "Export", value: "EXPORT" },
  { label: "Import", value: "IMPORT" },
]

export const packagingOptions: Option[] = [
  { label: "Pallet", value: "PALLET" },
  { label: "Carton", value: "CARTON" },
  { label: "Crate", value: "CRATE" },
  { label: "Bag", value: "BAG" },
]

export const hazardClassOptions: Option[] = [
  { label: "Class 1: Explosives", value: "CLASS_1_EXPLOSIVES" },
  { label: "Class 2: Gases", value: "CLASS_2_GASES" },
  { label: "Class 3: Flammable Liquids", value: "CLASS_3_FLAMMABLE_LIQUIDS" },
  { label: "Class 4: Flammable Solids", value: "CLASS_4_FLAMMABLE_SOLIDS" },
  { label: "Class 5: Oxidizing Substances", value: "CLASS_5_OXIDIZING_SUBSTANCES" },
  { label: "Class 6: Toxic Substances", value: "CLASS_6_TOXIC_SUBSTANCES" },
  { label: "Class 7: Radioactive Material", value: "CLASS_7_RADIOACTIVE_MATERIAL" },
  { label: "Class 8: Corrosive Substances", value: "CLASS_8_CORROSIVE_SUBSTANCES" },
  { label: "Class 9: Miscellaneous", value: "CLASS_9_MISCELLANEOUS" },
]

export function createDimensionRow(): DimensionRow {
  return {
    packaging: null,
    qty: 1,
    length_cm: 0,
    width_cm: 0,
    height_cm: 0,
    gross_kg: 0,
    ldm: 0,
  }
}

export function createOrderForm(reference: string): OrderFormState {
  return {
    type: "DOMESTIC",
    collection_address: null,
    delivery_address: null,
    order_reference: reference,
    customer_ref: "",
    collection_ref: "",
    carrier: "",
    pickup_date: null,
    pickup_time: "",
    delivery_date: null,
    delivery_time: "",
    hazardous: false,
    hazardous_class: null,
    goods_description: "",
    dimensions: [createDimensionRow()],
  }
}

function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function cubeM3(row: DimensionRow): number {
  const m3 = (row.length_cm / 100) * (row.width_cm / 100) * (row.height_cm / 100)
  return Number.isFinite(m3) ? m3 : 0
}

export function volumeM3(row: DimensionRow): number {
  return cubeM3(row) * (row.qty || 0)
}

export function calculateTotals(rows: DimensionRow[]): Totals {
  const qty = rows.reduce((a, r) => a + (r.qty || 0), 0)
  const gross = rows.reduce((a, r) => a + (r.gross_kg || 0), 0)
  const cube = rows.reduce((a, r) => a + cubeM3(r), 0)
  const vol = rows.reduce((a, r) => a + volumeM3(r), 0)
  const ldm = rows.reduce((a, r) => a + (r.ldm || 0), 0)

  return { qty, gross, cube, vol, ldm }
}

export function badgeClass(status: ExistingOrder["status"]): string {
  if (status === "Confirmed") return "badge badge--confirmed"
  if (status === "Sent") return "badge badge--sent"
  return "badge badge--draft"
}

function formatAddressLine(item: any): string {
  const countryName = typeof item?.country === "object" ? item.country?.name : item?.country

  const parts = [
    item?.label,
    item?.name,
    item?.address_line_1,
    item?.address_line_2,
    item?.address_line_3,
    item?.address_line_4,
    item?.city,
    item?.county_state,
    item?.postal_code,
    countryName,
  ].filter(Boolean)

  return parts.join(", ")
}

function resolveContactId(form: any): number | null {
  const id = Number(
    form?.contact_id ?? form?.customer_id ?? form?.contact?.id ?? form?.customer?.id ?? 0,
  )

  return id > 0 ? id : null
}

function getChargeTableRows(table: any): any[] {
  return Array.isArray(table?.rows) ? table.rows : []
}

function sortBySortOrder<T extends Record<string, any>>(items: T[]): T[] {
  return [...items].sort((a, b) => toNumber(a?.sort_order, 0) - toNumber(b?.sort_order, 0))
}

function isWeightTable(table: any): boolean {
  return String(table?.charge_type ?? "").toLowerCase() === "weight_break"
}

function isCustomerTable(table: any): boolean {
  return String(table?.charge_type ?? "").toLowerCase() === "customer_flat"
}

function tableAppliesToTarget(table: any, target: "collection" | "transport"): boolean {
  const applies = String(table?.applies_to ?? "")
    .toLowerCase()
    .trim()

  if (!applies || applies === "all" || applies === "both") return true

  if (target === "collection") {
    return ["collection", "pickup"].includes(applies)
  }

  return ["transport", "delivery", "haulage"].includes(applies)
}

function isTableActive(table: any): boolean {
  if (table?.is_active === false) return false

  const now = new Date()

  if (table?.valid_from) {
    const from = new Date(table.valid_from)
    if (!Number.isNaN(from.getTime()) && now < from) return false
  }

  if (table?.valid_until) {
    const until = new Date(table.valid_until)
    until.setHours(23, 59, 59, 999)
    if (!Number.isNaN(until.getTime()) && now > until) return false
  }

  return true
}

function getMetricValueByUnit(unit: string, totals: Totals): number {
  const normalized = String(unit ?? "")
    .toLowerCase()
    .trim()

  if (normalized.includes("kg")) return totals.gross
  if (normalized.includes("ldm")) return totals.ldm
  if (normalized.includes("m3") || normalized.includes("cube") || normalized.includes("volume"))
    return totals.vol
  if (normalized.includes("qty") || normalized.includes("each")) return totals.qty

  return totals.gross
}

function findMatchingBreak(table: any, totals: Totals): any | null {
  const breaks = sortBySortOrder(Array.isArray(table?.breaks) ? table.breaks : [])
  if (!breaks.length) return null

  const unit = String(breaks[0]?.unit ?? "kg")
  const inputValue = getMetricValueByUnit(unit, totals)

  for (const chargeBreak of breaks) {
    const min = toNumber(chargeBreak?.min_value, 0)
    const maxRaw = chargeBreak?.max_value
    const max =
      maxRaw === null || maxRaw === undefined || maxRaw === ""
        ? Infinity
        : toNumber(maxRaw, Infinity)

    if (inputValue >= min && inputValue <= max) {
      return chargeBreak
    }
  }

  return breaks[breaks.length - 1] ?? null
}

function getRowValueForBreak(row: any, breakId: number | null): any | null {
  const values = Array.isArray(row?.values) ? row.values : []
  if (!values.length) return null

  if (breakId !== null) {
    const exact = values.find((value: any) => toNumber(value?.charge_break_id, 0) === breakId)
    if (exact) return exact
  }

  return values.find((value: any) => value?.charge_break_id === null) ?? values[0] ?? null
}

function getChargeBasisLabel(chargeBasis: string): string {
  const basis = String(chargeBasis ?? "")
    .toLowerCase()
    .trim()

  if (basis === "per_kg") return "Per KG"
  if (basis === "per_shipment") return "Per Shipment"
  if (basis === "per_qty") return "Per Qty"
  if (basis === "per_ldm") return "Per LDM"
  if (basis === "per_m3") return "Per M³"

  return chargeBasis || "Charge"
}

function getMultiplierFromChargeBasis(chargeBasis: string, totals: Totals): number {
  const basis = String(chargeBasis ?? "")
    .toLowerCase()
    .trim()

  if (basis === "per_kg") return totals.gross
  if (basis === "per_qty") return totals.qty
  if (basis === "per_ldm") return totals.ldm
  if (basis === "per_m3") return totals.vol
  if (basis === "per_shipment") return 1

  return 1
}

function buildWeightRows(table: any | null, totals: Totals): ChargeDisplayRow[] {
  if (!table) return []

  const matchedBreak = findMatchingBreak(table, totals)
  const rows = sortBySortOrder(getChargeTableRows(table))

  return rows
    .map((row: any) => {
      const value = getRowValueForBreak(row, matchedBreak ? toNumber(matchedBreak.id, 0) : null)
      const amountPerUnit = toNumber(value?.amount, 0)
      const chargeBasis = String(row?.charge_basis ?? "per_shipment")
        .toLowerCase()
        .trim()
      const multiplier = getMultiplierFromChargeBasis(chargeBasis, totals)
      const amount = round2(amountPerUnit * multiplier)

      return {
        id: `weight-${table.id}-${row.id}`,
        source: "weight_break" as const,
        table_name: String(table?.name ?? "Weight Table"),
        description: String(row?.description ?? row?.code ?? "Weight Charge"),
        basis: matchedBreak?.label
          ? `${matchedBreak.label} · ${getChargeBasisLabel(chargeBasis)}`
          : getChargeBasisLabel(chargeBasis),
        amount,
      }
    })
    .filter(row => row.amount > 0 || rows.length > 0)
}

function buildCustomerRows(table: any | null, totals: Totals): ChargeDisplayRow[] {
  if (!table) return []

  const rows = sortBySortOrder(getChargeTableRows(table))

  return rows
    .map((row: any) => {
      const value = getRowValueForBreak(row, null)
      const amountPerUnit = toNumber(value?.amount, 0)
      const chargeBasis = String(row?.charge_basis ?? "per_shipment")
        .toLowerCase()
        .trim()
      const multiplier = getMultiplierFromChargeBasis(chargeBasis, totals)
      const amount = round2(amountPerUnit * multiplier)

      return {
        id: `customer-${table.id}-${row.id}`,
        source: "customer_flat" as const,
        table_name: String(table?.name ?? "Customer Table"),
        description: String(row?.description ?? row?.code ?? "Customer Charge"),
        basis: getChargeBasisLabel(chargeBasis),
        amount,
      }
    })
    .filter(row => row.amount > 0 || rows.length > 0)
}

function buildChargeSummary(
  weightTable: any | null,
  customerTable: any | null,
  totals: Totals,
): ChargeDisplaySummary {
  const weightRows = buildWeightRows(weightTable, totals)
  const customerRows = buildCustomerRows(customerTable, totals)
  const rows = [...weightRows, ...customerRows]
  const total = round2(rows.reduce((sum, row) => sum + row.amount, 0))

  return {
    weight_table_name: weightTable?.name ?? null,
    customer_table_name: customerTable?.name ?? null,
    rows,
    total,
  }
}

export function useJobTransportTab(form: any) {
  const contactStore = useContactStore()
  const companyStore = useCompanyStore()

  const open = ref<{ collection: boolean; transport: boolean }>({
    collection: true,
    transport: true,
  })

  const collection = ref<OrderFormState>(createOrderForm("CO-2026-000003"))
  const transport = ref<OrderFormState>(createOrderForm("TO-2026-000003"))

  const existingCollectionOrders = ref<ExistingOrder[]>([])
  const existingTransportOrders = ref<ExistingOrder[]>([])

  const selectedContact = computed(() => contactStore.current)

  const collectionTotals = computed(() => calculateTotals(collection.value.dimensions))
  const transportTotals = computed(() => calculateTotals(transport.value.dimensions))

  const carrierOptions = computed<Option[]>(() => {
    return (contactStore.items ?? [])
      .filter((contact: any) =>
        contact.types?.some((t: any) => CARRIER_TYPE_IDS.includes(Number(t.id))),
      )
      .map((contact: any) => ({
        label: `${contact.company_name ?? contact.name ?? "Carrier"} (${contact.account_number ?? `#${contact.id}`})`,
        value: String(contact.id),
      }))
  })

  const collectionAddressOptions = computed<Option[]>(() => {
    const addresses = (selectedContact.value?.collection_addresses ?? []).filter((address: any) =>
      Boolean(address?.is_collection),
    )

    return addresses.map((address: any) => ({
      label: formatAddressLine(address),
      value: `collection-${address.id}`,
    }))
  })

  const deliveryAddressOptions = computed<Option[]>(() => {
    const addresses = (selectedContact.value?.collection_addresses ?? []).filter((address: any) =>
      Boolean(address?.is_delivery),
    )

    return addresses.map((address: any) => ({
      label: formatAddressLine(address),
      value: `collection-${address.id}`,
    }))
  })

  const allChargeTables = computed(() => {
    return (contactStore.chargeTables ?? []).filter((table: any) => isTableActive(table))
  })

  const firstCollectionWeightTable = computed(() => {
    return (
      allChargeTables.value.find(
        (table: any) => isWeightTable(table) && tableAppliesToTarget(table, "collection"),
      ) ?? null
    )
  })

  const firstCollectionCustomerTable = computed(() => {
    return (
      allChargeTables.value.find(
        (table: any) => isCustomerTable(table) && tableAppliesToTarget(table, "collection"),
      ) ?? null
    )
  })

  const firstTransportWeightTable = computed(() => {
    return (
      allChargeTables.value.find(
        (table: any) => isWeightTable(table) && tableAppliesToTarget(table, "transport"),
      ) ?? null
    )
  })

  const firstTransportCustomerTable = computed(() => {
    return (
      allChargeTables.value.find(
        (table: any) => isCustomerTable(table) && tableAppliesToTarget(table, "transport"),
      ) ?? null
    )
  })

  const collectionAppliedCharges = computed<ChargeDisplaySummary>(() => {
    return buildChargeSummary(
      firstCollectionWeightTable.value,
      firstCollectionCustomerTable.value,
      collectionTotals.value,
    )
  })

  const transportAppliedCharges = computed<ChargeDisplaySummary>(() => {
    return buildChargeSummary(
      firstTransportWeightTable.value,
      firstTransportCustomerTable.value,
      transportTotals.value,
    )
  })

  const collectionCostTotal = computed(() => collectionAppliedCharges.value.total)
  const transportCostTotal = computed(() => transportAppliedCharges.value.total)

  async function loadSelectedContact() {
    const contactId = resolveContactId(form)
    if (!contactId) return

    if (contactStore.current?.id !== contactId) {
      await contactStore.load(contactId)
    }

    await contactStore.fetchChargeTables(contactId)
  }

  async function loadCarrierContacts() {
    await contactStore.fetchTypes()
    await contactStore.fetch()
  }

  async function createAddressForSelectedContact(payload: any) {
    if (!selectedContact.value?.id) return null
    const created = await contactStore.createCollectionAddress(selectedContact.value.id, payload)
    await contactStore.load(selectedContact.value.id)
    return created
  }

  onMounted(async () => {
    await loadCarrierContacts()
    await loadSelectedContact()
  })

  watch(
    () => resolveContactId(form),
    async newId => {
      if (!newId) return

      if (contactStore.current?.id !== newId) {
        await contactStore.load(newId)
      }

      await contactStore.fetchChargeTables(newId)

      collection.value.collection_address = null
      collection.value.delivery_address = null
      transport.value.collection_address = null
      transport.value.delivery_address = null
    },
  )

  function addDimRow(target: "collection" | "transport") {
    const targetForm = target === "collection" ? collection.value : transport.value
    targetForm.dimensions.push(createDimensionRow())
  }

  function togglePanel(key: "collection" | "transport") {
    open.value[key] = !open.value[key]
  }

  function handleHazardousChange(target: "collection" | "transport", value: boolean) {
    const targetForm = target === "collection" ? collection.value : transport.value
    targetForm.hazardous = value

    if (!value) {
      targetForm.hazardous_class = null
    }
  }

  return {
    contactStore,
    open,
    collection,
    transport,
    selectedContact,
    carrierOptions,
    collectionAddressOptions,
    deliveryAddressOptions,
    collectionTotals,
    transportTotals,
    collectionAppliedCharges,
    transportAppliedCharges,
    collectionCostTotal,
    transportCostTotal,
    existingCollectionOrders,
    existingTransportOrders,
    addDimRow,
    togglePanel,
    handleHazardousChange,
    loadSelectedContact,
    createAddressForSelectedContact,
  }
}
