import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue"
import { useToast } from "primevue/usetoast"

import contactsService from "@/app/services/contacts"
import { useChargeCodeStore } from "@/app/stores/charge-codes"
import { useExchangeRateStore } from "@/app/stores/exchange-rates"
import { useTaxCodeStore } from "@/app/stores/tax-codes"
import type { ChargeCode } from "@/app/types/charge-code"
import type { Contact } from "@/app/types/contact"
import type {
  BuyCostRow,
  JobChargeBasisTotals as ChargeBasisTotals,
  JobCostRow as CostRow,
  JobCostSelectOption as SelectOption,
  JobDetailsContext,
  SellChargeRow,
} from "@/app/types/job-details"

const HOUSE_ACCOUNT_SUPPLIER_VALUE = "house_account"

const fallbackCurrencyOptions: SelectOption[] = [
  { label: "GBP", value: "GBP" },
  { label: "EUR", value: "EUR" },
  { label: "USD", value: "USD" },
]

const fallbackTaxCodeOptions: SelectOption[] = [
  { label: "UK20", value: "UK20", rate: 20 },
  { label: "UK5", value: "UK5", rate: 5 },
  { label: "GBZR", value: "GBZR", rate: 0 },
]

const fallbackVatRateOptions: SelectOption[] = [
  { label: "20%", value: 20 },
  { label: "5%", value: 5 },
  { label: "0%", value: 0 },
]

let buyId = 1
let sellId = 1

function displayContactName(contact: Contact): string {
  return (
    contact.company_name ||
    (contact as any)?.name ||
    [(contact as any)?.first_name, (contact as any)?.last_name].filter(Boolean).join(" ") ||
    "Unnamed Contact"
  )
}

function numberValue(value: unknown, fallback = 0): number {
  const numeric = Number(value)

  return Number.isFinite(numeric) ? numeric : fallback
}

function currencyCode(value: unknown): string {
  return (
    String(value || "GBP")
      .trim()
      .toUpperCase() || "GBP"
  )
}

function labelValue(value: unknown): string {
  return String(value ?? "")
    .replace(/_/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase())
}

function normalizeDescription(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function createBuyRow(): BuyCostRow {
  return {
    id: `buy-${buyId++}`,
    type: "buy",
    description: "",
    supplier_id: null,
    chargeCodeId: null,
    addToSellCharges: false,
    linkedSellChargeId: null,
    quantity: 1,
    unitCost: 0,
    markupPercentage: 0,
    currency: "GBP",
    exchangeRate: 1,
    amount: 0,
  }
}

function createSellRow(): SellChargeRow {
  return {
    id: `sell-${sellId++}`,
    type: "sell",
    description: "",
    chargeCodeId: null,
    chargeCode: "",
    quantity: 1,
    unitPrice: null,
    currency: "GBP",
    exchangeRate: 1,
    vatRate: 0,
    taxCode: "",
    amount: 0,
    sourceBuyCostId: null,
    linkedWeightCharge: false,
  }
}

function hydrateBuyRow(row: any): BuyCostRow {
  row.type = "buy"
  row.description = row.description ?? ""
  row.supplier_id = row.supplier_id ?? row.supplierId ?? null
  row.chargeCodeId = row.chargeCodeId ?? row.charge_code_id ?? null
  row.addToSellCharges = Boolean(
    row.addToSellCharges ?? row.add_to_sell_charges ?? row.add_to_sell ?? false,
  )
  row.linkedSellChargeId = row.linkedSellChargeId ?? row.linked_sell_charge_id ?? null
  row.quantity = numberValue(row.quantity, 1) || 1
  row.unitCost = numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount, 0)
  row.markupPercentage = numberValue(row.markupPercentage ?? row.markup_percentage, 0)
  row.currency = row.currency || "GBP"
  row.exchangeRate = numberValue(row.exchangeRate ?? row.exchange_rate, 0)

  return row
}

function hydrateSellRow(row: any): SellChargeRow {
  row.type = "sell"
  row.description = row.description ?? ""
  row.chargeCodeId = row.chargeCodeId ?? row.charge_code_id ?? null
  row.chargeCode = row.chargeCode ?? row.charge_code ?? ""
  row.quantity = numberValue(row.quantity, 1) || 1
  const unitPrice = row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount
  row.unitPrice =
    unitPrice === null || unitPrice === undefined || unitPrice === ""
      ? null
      : numberValue(unitPrice, 0)
  row.currency = row.currency || "GBP"
  row.exchangeRate = numberValue(row.exchangeRate ?? row.exchange_rate, 0)
  row.vatRate = numberValue(row.vatRate ?? row.vat_rate, 0)
  row.taxCode = row.taxCode ?? row.tax_code ?? ""
  row.sourceBuyCostId = row.sourceBuyCostId ?? row.source_buy_cost_id ?? null
  row.linkedWeightCharge = Boolean(row.linkedWeightCharge ?? row.linked_weight_charge ?? false)

  return row
}

export function useJobCostsTab() {
  const injectedContext = inject<JobDetailsContext>("jobDetails")

  if (!injectedContext) {
    throw new Error("JobCostsTab must be used inside JobDetailsPage.")
  }

  const context = injectedContext
  const toast = useToast()
  const chargeCodeStore = useChargeCodeStore()
  const exchangeRateStore = useExchangeRateStore()
  const taxCodeStore = useTaxCodeStore()
  const supplierContacts = ref<Contact[]>([])
  const suppliersLoading = ref(false)
  const addChargeCodeDialogVisible = ref(false)
  const addChargeCodeSaving = ref(false)
  const pendingChargeCodeDescription = ref("")
  const pendingChargeCodeRow = ref<CostRow | null>(null)
  const deleteDialogVisible = ref(false)
  const printedDeleteDialogVisible = ref(false)
  const pendingDeleteRow = ref<CostRow | null>(null)
  const openChargeDescriptionDropdowns = ref(0)
  const customerChargeTables = ref<any[]>([])
  const customerChargeTablesLoading = ref(false)
  let missingChargeCodeTimer: ReturnType<typeof setTimeout> | null = null

  const buyRows = computed<BuyCostRow[]>(() => context.form.buy_costs.map(hydrateBuyRow))
  const sellRows = computed<SellChargeRow[]>(() => context.form.sell_costs.map(hydrateSellRow))
  const jobCurrency = computed(() => currencyCode(context.form.currency || "GBP"))
  const sellCurrency = ref(
    currencyCode(context.form.sell_costs[0]?.currency || context.form.currency || "GBP"),
  )
  const jobRateDate = computed(() => {
    const value = context.form.job_date

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10)
    }

    const raw = String(value ?? "").slice(0, 10)

    return raw || new Date().toISOString().slice(0, 10)
  })

  const currencyOptions = computed<SelectOption[]>(() => {
    const options = [
      ...(context.referenceOptions.currencyOptions?.value ?? []),
      ...fallbackCurrencyOptions,
    ]

    exchangeRateStore.exchangeRates
      .filter(rate => rate.isActive !== false)
      .forEach(rate => {
        options.push({ label: rate.base, value: rate.base })
        options.push({ label: rate.quote, value: rate.quote })
      })
    ;[...buyRows.value, ...sellRows.value].forEach(row => {
      if (row.currency) options.push({ label: row.currency, value: row.currency })
    })

    const unique = new Map<string, SelectOption>()

    options.forEach(option => {
      const value = String(option.value ?? "").toUpperCase()

      if (value && !unique.has(value)) {
        unique.set(value, { label: value, value })
      }
    })

    return [...unique.values()].sort((left, right) => left.label.localeCompare(right.label))
  })

  const taxCodeOptions = computed<SelectOption[]>(() => {
    const options = taxCodeStore.taxCodes
      .filter(code => code.isActive !== false)
      .map(code => ({
        label: code.taxCode || code.code,
        value: code.taxCode || code.code,
        rate: numberValue(code.rate),
        calculationType: code.calculationType,
        backCalculatedRate: code.backCalculatedRate,
      }))

    return options.length ? options : fallbackTaxCodeOptions
  })

  const vatRateOptions = computed<SelectOption[]>(() => {
    const unique = new Map<number, SelectOption>()

    fallbackVatRateOptions.forEach(option => unique.set(numberValue(option.value), option))
    taxCodeOptions.value.forEach(option => {
      const rate = numberValue(option.rate)

      if (!unique.has(rate)) {
        unique.set(rate, {
          label:
            option.calculationType === "withholding_tax" ? `${rate}% WHT gross-up` : `${rate}%`,
          value: rate,
          rate,
          calculationType: option.calculationType,
          backCalculatedRate: option.backCalculatedRate,
        })
      }
    })

    return [...unique.values()].sort(
      (left, right) => numberValue(right.value) - numberValue(left.value),
    )
  })

  const primaryJobChargeClassification = computed(() => {
    const mode = labelValue(context.form.mode_of_transport)
    const type = labelValue(context.form.job_type)

    if (mode && type && mode !== type) return `${mode} ${type}`

    return mode || type || ""
  })

  const eligibleChargeCodes = computed<ChargeCode[]>(() => chargeCodeStore.chargeCodes)

  const chargeDescriptionOptions = computed<SelectOption[]>(() =>
    eligibleChargeCodes.value.map(charge => ({
      label: charge.description,
      value: charge.description,
    })),
  )

  const supplierOptions = computed<SelectOption[]>(() => [
    { label: "House Account", value: HOUSE_ACCOUNT_SUPPLIER_VALUE },
    ...supplierContacts.value.map(contact => ({
      label: displayContactName(contact),
      value: Number(contact.id),
    })),
  ])

  const activeWeightChargeTables = computed(() => {
    const now = new Date()

    return customerChargeTables.value.filter(table => {
      if (String(table?.charge_type ?? "").toLowerCase() !== "weight_break") return false
      if (table?.is_active === false) return false

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
    })
  })

  const chargeBasisTotals = computed<ChargeBasisTotals>(() => {
    return (context.form.packages ?? []).reduce(
      (totals: ChargeBasisTotals, row: any) => {
        const quantity = numberValue(row.quantity, 1) || 1
        totals.qty += quantity
        totals.gross += quantity * numberValue(row.grossWeightKg ?? row.weight, 0)
        totals.volume += quantity * numberValue(row.cbm ?? row.volume, 0)
        totals.volumeWeight += quantity * numberValue(row.volumeWeightKg ?? row.volume_weight_kg, 0)

        return totals
      },
      { qty: 0, gross: 0, volume: 0, volumeWeight: 0 },
    )
  })

  function sortedBySortOrder<T extends Record<string, any>>(items: T[]): T[] {
    return [...items].sort(
      (left, right) => numberValue(left.sort_order) - numberValue(right.sort_order),
    )
  }

  function metricForUnit(unit: string): number {
    const normalized = String(unit ?? "").toLowerCase()

    if (normalized.includes("m3") || normalized.includes("cube") || normalized.includes("volume")) {
      return chargeBasisTotals.value.volume
    }

    if (normalized.includes("qty") || normalized.includes("each")) {
      return chargeBasisTotals.value.qty
    }

    return chargeBasisTotals.value.gross || chargeBasisTotals.value.volumeWeight
  }

  function multiplierForBasis(chargeBasis: string): number {
    const normalized = String(chargeBasis ?? "")
      .toLowerCase()
      .trim()

    if (normalized === "per_kg") return chargeBasisTotals.value.gross
    if (normalized === "per_qty") return chargeBasisTotals.value.qty
    if (normalized === "per_m3") return chargeBasisTotals.value.volume
    if (normalized === "per_shipment") return 1

    return 1
  }

  function matchingWeightBreak(table: any): any | null {
    const breaks = sortedBySortOrder(Array.isArray(table?.breaks) ? table.breaks : [])

    if (!breaks.length) return null

    const input = metricForUnit(String(breaks[0]?.unit ?? "kg"))

    return (
      breaks.find(chargeBreak => {
        const min = numberValue(chargeBreak?.min_value, 0)
        const maxRaw = chargeBreak?.max_value
        const max =
          maxRaw === null || maxRaw === undefined || maxRaw === ""
            ? Infinity
            : numberValue(maxRaw, Infinity)

        return input >= min && input <= max
      }) ??
      breaks[breaks.length - 1] ??
      null
    )
  }

  function valueForBreak(row: any, breakId: number | null): any | null {
    const values = Array.isArray(row?.values) ? row.values : []

    if (!values.length) return null

    if (breakId !== null) {
      const exact = values.find((value: any) => numberValue(value?.charge_break_id, 0) === breakId)
      if (exact) return exact
    }

    return values.find((value: any) => value?.charge_break_id === null) ?? values[0] ?? null
  }

  function linkedWeightChargeForDescription(
    description: string,
  ): { amount: number; currency: string } | null {
    const normalizedDescription = normalizeDescription(description)

    if (!normalizedDescription) return null

    for (const table of activeWeightChargeTables.value) {
      const matchedBreak = matchingWeightBreak(table)
      const breakId = matchedBreak ? numberValue(matchedBreak.id, 0) : null
      const matchedRow = sortedBySortOrder(Array.isArray(table?.rows) ? table.rows : []).find(
        row => {
          return normalizeDescription(row?.description ?? row?.code) === normalizedDescription
        },
      )

      if (!matchedRow) continue

      const value = valueForBreak(matchedRow, breakId)
      const amountPerUnit = numberValue(value?.amount, 0)
      const multiplier = multiplierForBasis(String(matchedRow?.charge_basis ?? "per_shipment"))

      return {
        amount: roundMoney(amountPerUnit * multiplier),
        currency: String(table?.currency_code || jobCurrency.value || "GBP"),
      }
    }

    return null
  }

  function addBuyRow() {
    context.form.buy_costs.push(createBuyRow())
  }

  function addSellRow() {
    const row = createSellRow()
    row.currency = sellCurrency.value
    syncLineExchangeRate(row, false)
    context.form.sell_costs.push(row)
  }

  function sellChargeForBuyRow(row: BuyCostRow): SellChargeRow | null {
    const linkedId = row.linkedSellChargeId

    if (linkedId !== null && linkedId !== undefined) {
      const linked = sellRows.value.find(sellRow => String(sellRow.id) === String(linkedId))
      if (linked) return linked
    }

    const sourceLinked = sellRows.value.find(sellRow => {
      return (
        sellRow.sourceBuyCostId !== null &&
        sellRow.sourceBuyCostId !== undefined &&
        String(sellRow.sourceBuyCostId) === String(row.id)
      )
    })

    if (sourceLinked) return sourceLinked

    const description = normalizeDescription(row.description)

    if (!description) return null

    return (
      sellRows.value.find(sellRow => {
        return !sellRow.sourceBuyCostId && normalizeDescription(sellRow.description) === description
      }) ?? null
    )
  }

  function buyCostForSellCharge(row: SellChargeRow): BuyCostRow | null {
    if (row.sourceBuyCostId !== null && row.sourceBuyCostId !== undefined) {
      const source = buyRows.value.find(buyRow => String(buyRow.id) === String(row.sourceBuyCostId))
      if (source) return source
    }

    const linked = buyRows.value.find(
      buyRow =>
        buyRow.linkedSellChargeId !== null &&
        buyRow.linkedSellChargeId !== undefined &&
        String(buyRow.linkedSellChargeId) === String(row.id),
    )

    if (linked) return linked

    const description = normalizeDescription(row.description)
    if (!description) return null

    const matching = buyRows.value.find(
      buyRow =>
        (buyRow.addToSellCharges || numberValue(buyRow.markupPercentage) > 0) &&
        normalizeDescription(buyRow.description) === description,
    )

    if (matching) {
      matching.addToSellCharges = true
      matching.linkedSellChargeId = row.id
      row.sourceBuyCostId = matching.id
    }

    return matching ?? null
  }

  function convertCurrencyAmount(
    amount: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): number | null {
    const source = currencyCode(sourceCurrency)
    const target = currencyCode(targetCurrency)

    if (source === target) return roundMoney(amount)
    if (amount === 0) return 0

    const sourceToJobRate = exchangeRateForCurrency(source)
    const targetToJobRate = exchangeRateForCurrency(target)

    if (
      sourceToJobRate === null ||
      sourceToJobRate <= 0 ||
      targetToJobRate === null ||
      targetToJobRate <= 0
    ) {
      return null
    }

    return roundMoney((amount * sourceToJobRate) / targetToJobRate)
  }

  function markedUpUnitPrice(row: BuyCostRow, targetCurrency: string): number | null {
    const markup = Math.max(0, numberValue(row.markupPercentage))
    const markedUpSourceAmount = numberValue(row.unitCost) * (1 + markup / 100)

    return convertCurrencyAmount(markedUpSourceAmount, row.currency, targetCurrency)
  }

  function updateLinkedMarkupPrice(buyRow: BuyCostRow, sellRow: SellChargeRow, notify = false) {
    if (numberValue(buyRow.markupPercentage) <= 0) return

    const convertedPrice = markedUpUnitPrice(buyRow, sellRow.currency)
    sellRow.unitPrice = convertedPrice

    if (convertedPrice === null && notify) {
      toast.add({
        severity: "warn",
        summary: "Missing exchange rate",
        detail: `Add the rates needed to convert ${currencyCode(buyRow.currency)} to ${currencyCode(sellRow.currency)} in Accounts > Exchange Rates.`,
        life: 4500,
      })
    }
  }

  function updateBuyMarkupFromSellPrice(sellRow: SellChargeRow, notify = true) {
    const buyRow = buyCostForSellCharge(sellRow)

    if (!buyRow) return

    const sellUnitPrice = sellRow.unitPrice

    if (sellUnitPrice === null || sellUnitPrice === undefined) {
      buyRow.markupPercentage = 0
      return
    }

    const buyUnitCost = numberValue(buyRow.unitCost)

    if (buyUnitCost <= 0) {
      buyRow.markupPercentage = 0
      return
    }

    const sellPriceInBuyCurrency = convertCurrencyAmount(
      numberValue(sellUnitPrice),
      sellRow.currency,
      buyRow.currency,
    )

    if (sellPriceInBuyCurrency === null) {
      if (notify) {
        toast.add({
          severity: "warn",
          summary: "Markup not calculated",
          detail: `Add the rates needed to convert ${currencyCode(sellRow.currency)} to ${currencyCode(buyRow.currency)} in Accounts > Exchange Rates.`,
          life: 4500,
        })
      }

      return
    }

    const markup = ((sellPriceInBuyCurrency - buyUnitCost) / buyUnitCost) * 100

    buyRow.markupPercentage = roundMoney(Math.max(0, markup))
    buyRow.addToSellCharges = true
    buyRow.linkedSellChargeId = sellRow.id
    sellRow.sourceBuyCostId = buyRow.id
  }

  function refreshLinkedMarkupPrices() {
    sellRows.value.forEach(sellRow => {
      const buyRow = buyCostForSellCharge(sellRow)

      if (buyRow) updateLinkedMarkupPrice(buyRow, sellRow)
    })
  }

  function setSellCurrency(value: unknown, notify = true): boolean {
    const targetCurrency = currencyCode(value)
    const updates: Array<{ row: SellChargeRow; unitPrice: number | null }> = []
    const missingConversions = new Set<string>()

    sellRows.value.forEach(row => {
      const sourceCurrency = currencyCode(row.currency)
      const buyRow = buyCostForSellCharge(row)
      const unitPrice =
        buyRow && numberValue(buyRow.markupPercentage) > 0
          ? markedUpUnitPrice(buyRow, targetCurrency)
          : row.unitPrice === null || row.unitPrice === undefined
            ? null
            : convertCurrencyAmount(numberValue(row.unitPrice), sourceCurrency, targetCurrency)

      const linkedMarkup = Boolean(buyRow && numberValue(buyRow.markupPercentage) > 0)
      const requiresConversion =
        linkedMarkup || (row.unitPrice !== null && row.unitPrice !== undefined)

      if (unitPrice === null && requiresConversion) {
        const conversionSource = linkedMarkup ? currencyCode(buyRow?.currency) : sourceCurrency
        missingConversions.add(`${conversionSource} to ${targetCurrency}`)
      }

      updates.push({ row, unitPrice })
    })

    if (missingConversions.size > 0) {
      if (notify) {
        toast.add({
          severity: "warn",
          summary: "Sell currency not changed",
          detail: `Add ${[...missingConversions].join(", ")} exchange rates in Accounts > Exchange Rates first.`,
          life: 5000,
        })
      }

      return false
    }

    sellCurrency.value = targetCurrency
    updates.forEach(({ row, unitPrice }) => {
      row.currency = targetCurrency
      row.unitPrice = unitPrice
      syncLineExchangeRate(row, false)
    })

    return true
  }

  function syncLinkedSellCharge(row: BuyCostRow) {
    const linkedWeightCharge = linkedWeightChargeForDescription(row.description)
    const charge = findChargeCodeByDescription(row.description)
    let sellRow = sellChargeForBuyRow(row)

    if (!sellRow) {
      sellRow = {
        ...createSellRow(),
        id: `sell-from-${row.id}`,
        sourceBuyCostId: row.id,
      }
      context.form.sell_costs.push(sellRow)
    }

    sellRow.description = row.description
    sellRow.chargeCodeId = charge?.id ?? row.chargeCodeId ?? sellRow.chargeCodeId ?? null
    sellRow.chargeCode = charge?.salesNominal || sellRow.chargeCode || ""
    sellRow.sourceBuyCostId = row.id
    const markup = Math.max(0, numberValue(row.markupPercentage))
    const useMarkupPrice = markup > 0
    const targetSellCurrency = sellCurrency.value

    sellRow.linkedWeightCharge = Boolean(linkedWeightCharge && !useMarkupPrice)
    sellRow.quantity = linkedWeightCharge && !useMarkupPrice ? 1 : numberValue(row.quantity, 1) || 1
    sellRow.unitPrice = useMarkupPrice
      ? markedUpUnitPrice(row, targetSellCurrency)
      : linkedWeightCharge
        ? convertCurrencyAmount(
            linkedWeightCharge.amount,
            linkedWeightCharge.currency,
            targetSellCurrency,
          )
        : null
    sellRow.currency = targetSellCurrency
    syncLineExchangeRate(sellRow, false)

    if (charge?.defaultTaxCode) {
      sellRow.taxCode = charge.defaultTaxCode
      applyTaxCode(sellRow, charge.defaultTaxCode)
    }

    row.addToSellCharges = true
    row.linkedSellChargeId = sellRow.id
  }

  function updateBuyPricing(row: BuyCostRow) {
    if (buyRowSellChargeChecked(row)) syncLinkedSellCharge(row)
  }

  function updateBuyCurrency(row: BuyCostRow) {
    syncLineExchangeRate(row)
    updateBuyPricing(row)
  }

  function removeLinkedSellCharge(row: BuyCostRow) {
    const sellRow = sellChargeForBuyRow(row)

    if (sellRow) {
      removeSellRow(sellRow.id)
    }

    row.addToSellCharges = false
    row.linkedSellChargeId = null
  }

  function toggleBuyRowSellCharge(row: BuyCostRow, checked: boolean) {
    if (checked) {
      syncLinkedSellCharge(row)
      return
    }

    removeLinkedSellCharge(row)
  }

  function buyRowSellChargeChecked(row: BuyCostRow): boolean {
    return Boolean(row.addToSellCharges || sellChargeForBuyRow(row))
  }

  function buyRowSellChargeTooltip(row: BuyCostRow): string {
    const linkedWeightCharge = linkedWeightChargeForDescription(row.description)

    if (linkedWeightCharge) {
      return `Add to Sell Charges using linked customer weight charge ${formatMoney(linkedWeightCharge.amount, linkedWeightCharge.currency)}.`
    }

    const markup = Math.max(0, numberValue(row.markupPercentage))
    if (markup > 0) {
      const linkedSellRow = sellChargeForBuyRow(row)
      const targetCurrency = linkedSellRow?.currency || sellCurrency.value
      const convertedPrice = markedUpUnitPrice(row, targetCurrency)

      return convertedPrice === null
        ? `Add to Sell Charges with ${markup}% markup. An exchange rate is required from ${currencyCode(row.currency)} to ${currencyCode(targetCurrency)}.`
        : `Add to Sell Charges at ${formatMoney(convertedPrice, targetCurrency)} (${markup}% markup).`
    }

    return "Add this charge description to Sell Charges with a blank unit price. Enter markup to calculate it automatically."
  }

  function removeBuyRow(id: number | string) {
    context.form.buy_costs = context.form.buy_costs.filter(row => row.id !== id)
  }

  function removeSellRow(id: number | string) {
    context.form.sell_costs = context.form.sell_costs.filter(row => row.id !== id)
  }

  function printedInvoiceNumber(row: CostRow | null): string {
    return String(
      (row as any)?.invoice?.invoiceNumber ??
        (row as any)?.invoice?.invoice_number ??
        (row as any)?.invoiceNumber ??
        "",
    )
  }

  function isPrintedInvoiceRow(row: CostRow | null): boolean {
    const status = String((row as any)?.invoice_status ?? (row as any)?.invoiceStatus ?? "")

    return status === "printed" && printedInvoiceNumber(row) !== ""
  }

  function clearPendingChargeCode() {
    addChargeCodeDialogVisible.value = false
    pendingChargeCodeDescription.value = ""
    pendingChargeCodeRow.value = null
  }

  function applyChargeCode(row: CostRow, charge: ChargeCode | null, description: string) {
    row.description = description
    row.chargeCodeId = charge?.id ?? null

    if (row.type === "sell" && charge) {
      row.chargeCode = charge?.salesNominal || row.chargeCode || ""
      if (charge.defaultTaxCode) {
        row.taxCode = charge.defaultTaxCode
        applyTaxCode(row, charge.defaultTaxCode)
      }
    }
  }

  function selectChargeDescription(row: CostRow, value: unknown) {
    const description = String(value ?? "").trim()
    const charge = eligibleChargeCodes.value.find(item => {
      return normalizeDescription(item.description) === normalizeDescription(description)
    })

    applyChargeCode(row, charge ?? null, description)

    if (row.type === "buy" && buyRowSellChargeChecked(row)) {
      syncLinkedSellCharge(row)
    }
  }

  function syncChargeDescriptionFilter(row: CostRow, event: { value?: unknown } | unknown) {
    const value =
      event && typeof event === "object" && "value" in event ? (event as any).value : event

    selectChargeDescription(row, value)
  }

  function findChargeCodeByDescription(description: string): ChargeCode | null {
    return (
      eligibleChargeCodes.value.find(item => {
        return normalizeDescription(item.description) === normalizeDescription(description)
      }) ?? null
    )
  }

  function hasActiveChargeDescriptionInput(): boolean {
    if (openChargeDescriptionDropdowns.value > 0) return true

    const activeElement = document.activeElement as HTMLElement | null

    if (!activeElement) return false
    if (activeElement.closest(".job-costs-tab__charge-description")) return true
    if (activeElement.closest(".p-select-overlay, .p-dropdown-panel, .p-select-panel")) return true

    return false
  }

  function checkMissingChargeDescriptions() {
    missingChargeCodeTimer = null

    if (addChargeCodeDialogVisible.value) return

    if (hasActiveChargeDescriptionInput()) {
      scheduleMissingChargeDescriptionCheck(500)
      return
    }

    const row = [...buyRows.value, ...sellRows.value].find(item => {
      const description = String(item.description ?? "").trim()

      if (!description || item.chargeCodeId) return false

      return !findChargeCodeByDescription(description)
    })

    if (!row) return

    const description = String(row.description ?? "").trim()
    const charge = findChargeCodeByDescription(description)

    if (charge) {
      applyChargeCode(row, charge, charge.description)
      return
    }

    pendingChargeCodeDescription.value = description
    pendingChargeCodeRow.value = row
    addChargeCodeDialogVisible.value = true
  }

  function scheduleMissingChargeDescriptionCheck(delay = 350) {
    if (missingChargeCodeTimer) clearTimeout(missingChargeCodeTimer)

    missingChargeCodeTimer = setTimeout(checkMissingChargeDescriptions, delay)
  }

  function chargeDescriptionDropdownShown() {
    openChargeDescriptionDropdowns.value += 1
  }

  function chargeDescriptionDropdownHidden() {
    openChargeDescriptionDropdowns.value = Math.max(0, openChargeDescriptionDropdowns.value - 1)
    scheduleMissingChargeDescriptionCheck()
  }

  async function confirmAddChargeCode() {
    const description = pendingChargeCodeDescription.value.trim()
    const row = pendingChargeCodeRow.value

    if (!description || !row) {
      clearPendingChargeCode()
      return
    }

    addChargeCodeSaving.value = true

    try {
      const charge = await chargeCodeStore.create({
        description,
        classification: primaryJobChargeClassification.value,
        isActive: true,
      })

      applyChargeCode(row, charge, charge.description)
      clearPendingChargeCode()
      scheduleMissingChargeDescriptionCheck()
      toast.add({
        severity: "success",
        summary: "Charge Code Added",
        detail: `${charge.description} has been added and selected.`,
        life: 2500,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Charge Code Failed",
        detail: error?.response?.data?.message || error?.message || "Unable to add charge code.",
        life: 4500,
      })
    } finally {
      addChargeCodeSaving.value = false
    }
  }

  function cancelAddChargeCode() {
    const row = pendingChargeCodeRow.value

    if (
      row &&
      normalizeDescription(row.description) ===
        normalizeDescription(pendingChargeCodeDescription.value)
    ) {
      row.description = ""
      row.chargeCodeId = null

      if (row.type === "sell") {
        row.chargeCode = ""
      }
    }

    clearPendingChargeCode()
    scheduleMissingChargeDescriptionCheck()
  }

  function exchangeRateTooltip(row: CostRow): string {
    const from = currencyCode(row.currency)
    const to = jobCurrency.value

    if (from === to) return `No exchange rate is needed because this line is already in ${to}.`

    if (missingExchangeRate(row)) {
      return `Missing ${from} to ${to} exchange rate. Add or update this in Accounts > Exchange Rates.`
    }

    const cached = exchangeRateStore.effectiveRates[exchangeRateCacheKey(from, to)]

    if (cached?.effectiveDate) {
      return `Using ${from} to ${to} rate ${numberValue(cached.rate).toFixed(4)} effective ${cached.effectiveDate} for job date ${jobRateDate.value}.`
    }

    return `Exchange rate is managed in Accounts > Exchange Rates. Change it there to update Costs & Charges.`
  }

  function exchangeRateForCurrency(currency: string | null | undefined): number | null {
    const code = currencyCode(currency)
    const target = jobCurrency.value

    if (!code || code === target) return 1

    const cached = exchangeRateStore.effectiveRates[exchangeRateCacheKey(code, target)]

    if (cached !== undefined) {
      const cachedRate = numberValue(cached?.rate, 0)

      return cachedRate > 0 ? cachedRate : null
    }

    const jobDateMs = new Date(`${jobRateDate.value}T23:59:59`).getTime()
    const rates = exchangeRateStore.exchangeRates
      .filter(rate => rate.isActive !== false)
      .slice()
      .sort((left, right) => {
        const rightDate = new Date(right.effectiveDate ?? "").getTime() || 0
        const leftDate = new Date(left.effectiveDate ?? "").getTime() || 0

        return rightDate - leftDate || Number(right.id ?? 0) - Number(left.id ?? 0)
      })
    const effectiveRates = rates.filter(rate => {
      const rateDateMs = new Date(`${rate.effectiveDate ?? ""}T00:00:00`).getTime()

      return Number.isFinite(rateDateMs) && rateDateMs <= jobDateMs
    })
    const ratesForDate = effectiveRates.length ? effectiveRates : rates
    const direct = ratesForDate.find(rate => {
      return rate.base?.toUpperCase() === code && rate.quote?.toUpperCase() === target
    })

    if (direct) {
      const directRate = numberValue(direct.rate, 0)

      return directRate > 0 ? directRate : null
    }

    const inverse = ratesForDate.find(rate => {
      return rate.base?.toUpperCase() === target && rate.quote?.toUpperCase() === code
    })
    const inverseRate = numberValue(inverse?.rate, 0)

    return inverseRate > 0 ? 1 / inverseRate : null
  }

  function exchangeRateCacheKey(base: string, quote: string) {
    return exchangeRateStore.effectiveKey({
      base: currencyCode(base),
      quote: currencyCode(quote),
      date: jobRateDate.value,
    })
  }

  async function ensureEffectiveExchangeRates() {
    const target = jobCurrency.value
    const currencies = new Set(
      [...buyRows.value, ...sellRows.value]
        .map(row => currencyCode(row.currency))
        .filter(code => code && code !== target),
    )

    await Promise.all(
      [...currencies].map(code =>
        exchangeRateStore
          .fetchEffective({
            base: code,
            quote: target,
            date: jobRateDate.value,
          })
          .catch(() => null),
      ),
    )
    ;[...buyRows.value, ...sellRows.value].forEach(row => syncLineExchangeRate(row, false))
    refreshLinkedMarkupPrices()
  }

  function effectiveExchangeRate(row: CostRow): number {
    const stored = numberValue((row as any).exchangeRate ?? (row as any).exchange_rate, 0)

    return stored > 0 ? stored : (exchangeRateForCurrency(row.currency) ?? 0)
  }

  function missingExchangeRate(row: CostRow): boolean {
    return exchangeRateForCurrency(row.currency) === null
  }

  function formatExchangeRate(row: CostRow): string {
    if (missingExchangeRate(row)) return "Missing"

    return effectiveExchangeRate(row).toFixed(4)
  }

  function lineNet(row: CostRow): number {
    const unit = row.type === "buy" ? numberValue(row.unitCost) : numberValue(row.unitPrice)

    return numberValue(row.quantity) * unit
  }

  function lineNetInSellCurrency(row: CostRow): number {
    return convertCurrencyAmount(lineNet(row), row.currency, sellCurrency.value) ?? 0
  }

  function sellVat(row: SellChargeRow): number {
    const vatRate = numberValue(row.vatRate)

    return vatRate > 0 ? lineNet(row) * (vatRate / 100) : 0
  }

  function sellVatInSellCurrency(row: SellChargeRow): number {
    const vatRate = numberValue(row.vatRate)

    return vatRate > 0 ? lineNetInSellCurrency(row) * (vatRate / 100) : 0
  }

  function missingSellCurrencyExchangeRate(row: CostRow): boolean {
    const source = currencyCode(row.currency)
    const target = sellCurrency.value

    if (source === target) return false

    return exchangeRateForCurrency(source) === null || exchangeRateForCurrency(target) === null
  }

  function formatMoney(value: number, currency = "GBP"): string {
    const safeValue = Number.isFinite(value) ? value : 0
    const code = currencyCode(currency)

    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: code,
        currencyDisplay: "narrowSymbol",
      }).format(safeValue)
    } catch {
      return `${code} ${new Intl.NumberFormat("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(safeValue)}`
    }
  }

  function formatRowMoney(row: CostRow, value: number): string {
    return formatMoney(value, row.currency)
  }

  function applyTaxCode(row: SellChargeRow, taxCode: string | number | null) {
    const selected = taxCodeOptions.value.find(option => option.value === taxCode)

    row.taxCode = String(taxCode ?? "")

    if (selected) {
      row.vatRate = numberValue(selected.rate)
    }
  }

  function applyVatRate(row: SellChargeRow, vatRate: string | number | null) {
    row.vatRate = numberValue(vatRate)

    const selected = taxCodeOptions.value.find(option => numberValue(option.rate) === row.vatRate)
    row.taxCode = selected ? String(selected.value ?? "") : ""
  }

  function syncLineExchangeRate(row: CostRow, notify = true) {
    const rate = exchangeRateForCurrency(row.currency)

    row.exchangeRate = rate ?? 0

    if (rate === null && notify) {
      toast.add({
        severity: "warn",
        summary: "Missing exchange rate",
        detail: `Add ${currencyCode(row.currency)} to ${jobCurrency.value} in Accounts > Exchange Rates before using this line in totals.`,
        life: 4500,
      })
    }
  }

  function requestRemoveRow(row: CostRow) {
    pendingDeleteRow.value = row
    deleteDialogVisible.value = true
  }

  function cancelRemoveRow() {
    deleteDialogVisible.value = false
    printedDeleteDialogVisible.value = false
    pendingDeleteRow.value = null
  }

  function removePendingRow() {
    const row = pendingDeleteRow.value

    if (row?.type === "buy") {
      removeBuyRow(row.id)
    }

    if (row?.type === "sell") {
      removeSellRow(row.id)
    }
  }

  function confirmRemoveRow() {
    if (isPrintedInvoiceRow(pendingDeleteRow.value)) {
      deleteDialogVisible.value = false
      printedDeleteDialogVisible.value = true
      return
    }

    removePendingRow()

    cancelRemoveRow()
  }

  function confirmPrintedRemoveRow() {
    removePendingRow()
    cancelRemoveRow()
  }

  async function loadSuppliers() {
    suppliersLoading.value = true

    try {
      const firstResponse = await contactsService.list({
        page: 1,
        per_page: 500,
      })
      const contacts = [...(firstResponse.data ?? [])]
      const lastPage = Number(firstResponse.meta?.last_page ?? 1)

      for (let page = 2; page <= lastPage; page += 1) {
        const response = await contactsService.list({
          page,
          per_page: 500,
        })

        contacts.push(...(response.data ?? []))
      }

      supplierContacts.value = contacts
    } finally {
      suppliersLoading.value = false
    }
  }

  async function loadCustomerChargeTables() {
    const customerId = Number(context.form.customer_id ?? 0)

    customerChargeTables.value = []

    if (!Number.isFinite(customerId) || customerId <= 0) return

    customerChargeTablesLoading.value = true

    try {
      const response = await contactsService.listChargeTables(customerId, {
        per_page: 500,
        charge_type: "weight_break",
        is_active: true,
      })

      customerChargeTables.value = response.data ?? []
    } finally {
      customerChargeTablesLoading.value = false
    }
  }

  const totals = computed(() => {
    const totalBuy = buyRows.value.reduce((sum, row) => sum + lineNetInSellCurrency(row), 0)
    const totalSell = sellRows.value.reduce((sum, row) => sum + lineNetInSellCurrency(row), 0)
    const totalVat = sellRows.value.reduce((sum, row) => sum + sellVatInSellCurrency(row), 0)
    const margin = totalSell - totalBuy
    const missingExchangeRates = [...buyRows.value, ...sellRows.value].filter(
      missingSellCurrencyExchangeRate,
    )

    return {
      totalBuy,
      totalSell,
      margin,
      marginPercent: totalSell > 0 ? (margin / totalSell) * 100 : 0,
      totalVat,
      grandTotal: totalSell + totalVat,
      hasVat: totalVat > 0 || sellRows.value.some(row => numberValue(row.vatRate) > 0),
      missingExchangeRates: missingExchangeRates.length,
    }
  })

  watch(buyRows, rows => rows.forEach(hydrateBuyRow), { immediate: true })
  watch(sellRows, rows => rows.forEach(hydrateSellRow), { immediate: true })

  watch(
    () => exchangeRateStore.exchangeRates,
    () => {
      ;[...buyRows.value, ...sellRows.value].forEach(row => syncLineExchangeRate(row, false))
      refreshLinkedMarkupPrices()
    },
    { deep: true },
  )

  watch(
    () => exchangeRateStore.effectiveRates,
    () => refreshLinkedMarkupPrices(),
    { deep: true },
  )

  watch(jobCurrency, () => {
    ;[...buyRows.value, ...sellRows.value].forEach(row => syncLineExchangeRate(row, false))
    refreshLinkedMarkupPrices()
  })

  watch(jobRateDate, () => {
    ;[...buyRows.value, ...sellRows.value].forEach(row => syncLineExchangeRate(row, false))
    ensureEffectiveExchangeRates()
  })

  watch(
    () => context.form.customer_id,
    () => {
      loadCustomerChargeTables()
    },
  )

  watch(
    () =>
      [
        jobCurrency.value,
        jobRateDate.value,
        ...[...buyRows.value, ...sellRows.value].map(row => currencyCode(row.currency)).sort(),
      ].join("|"),
    () => {
      ensureEffectiveExchangeRates()
    },
  )

  onMounted(async () => {
    await Promise.all([
      chargeCodeStore.fetchAll({ sort: "description", direction: "asc", perPage: 1000 }),
      exchangeRateStore.fetch({ perPage: 1000 }),
      taxCodeStore.fetch({ perPage: 1000 }),
      loadSuppliers(),
      loadCustomerChargeTables(),
    ])
    await ensureEffectiveExchangeRates()
    setSellCurrency(sellCurrency.value, false)
  })

  onUnmounted(() => {
    if (missingChargeCodeTimer) clearTimeout(missingChargeCodeTimer)
    missingChargeCodeTimer = null
  })

  return {
    buyRows,
    sellRows,
    totals,
    jobCurrency,
    sellCurrency,
    currencyOptions,
    taxCodeOptions,
    vatRateOptions,
    chargeDescriptionOptions,
    supplierOptions,
    chargeCodesLoading: computed(() => chargeCodeStore.loading),
    suppliersLoading,
    addChargeCodeDialogVisible,
    addChargeCodeSaving,
    pendingChargeCodeDescription,
    primaryJobChargeClassification,
    deleteDialogVisible,
    printedDeleteDialogVisible,
    pendingDeleteRow,
    addBuyRow,
    addSellRow,
    selectChargeDescription,
    syncChargeDescriptionFilter,
    updateBuyPricing,
    updateBuyCurrency,
    updateBuyMarkupFromSellPrice,
    setSellCurrency,
    scheduleMissingChargeDescriptionCheck,
    chargeDescriptionDropdownShown,
    chargeDescriptionDropdownHidden,
    confirmAddChargeCode,
    cancelAddChargeCode,
    requestRemoveRow,
    cancelRemoveRow,
    confirmRemoveRow,
    confirmPrintedRemoveRow,
    toggleBuyRowSellCharge,
    buyRowSellChargeChecked,
    buyRowSellChargeTooltip,
    printedInvoiceNumber,
    lineNet,
    lineNetInSellCurrency,
    sellVat,
    formatMoney,
    formatRowMoney,
    formatExchangeRate,
    exchangeRateTooltip,
    missingExchangeRate,
    applyTaxCode,
    applyVatRate,
    syncLineExchangeRate,
  }
}
