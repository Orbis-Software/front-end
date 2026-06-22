import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue"
import { useToast } from "primevue/usetoast"

import contactsService from "@/app/services/contacts"
import { useChargeCodeStore } from "@/app/stores/charge-codes"
import { useExchangeRateStore } from "@/app/stores/exchange-rates"
import { useTaxCodeStore } from "@/app/stores/tax-codes"
import type { ChargeCode } from "@/app/types/charge-code"
import type { Contact } from "@/app/types/contact"
import type { JobDetailsContext } from "../../JobDetailsPage.logic"
import type { BuyCostRow, SellChargeRow } from "@/app/types/job-details"

type SelectOption = {
  label: string
  value: string | number | null
  rate?: number
  calculationType?: "percentage" | "withholding_tax"
  backCalculatedRate?: number | null
}

type CostRow = BuyCostRow | SellChargeRow

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

function createBuyRow(): BuyCostRow {
  return {
    id: `buy-${buyId++}`,
    type: "buy",
    description: "",
    supplier_id: null,
    chargeCodeId: null,
    quantity: 1,
    unitCost: 0,
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
    unitPrice: 0,
    currency: "GBP",
    exchangeRate: 1,
    vatRate: 0,
    taxCode: "",
    amount: 0,
  }
}

function hydrateBuyRow(row: any): BuyCostRow {
  row.type = "buy"
  row.description = row.description ?? ""
  row.supplier_id = row.supplier_id ?? row.supplierId ?? null
  row.chargeCodeId = row.chargeCodeId ?? row.charge_code_id ?? null
  row.quantity = numberValue(row.quantity, 1) || 1
  row.unitCost = numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount, 0)
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
  row.unitPrice = numberValue(row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount, 0)
  row.currency = row.currency || "GBP"
  row.exchangeRate = numberValue(row.exchangeRate ?? row.exchange_rate, 0)
  row.vatRate = numberValue(row.vatRate ?? row.vat_rate, 0)
  row.taxCode = row.taxCode ?? row.tax_code ?? ""

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
  const pendingDeleteRow = ref<CostRow | null>(null)
  const openChargeDescriptionDropdowns = ref(0)
  let missingChargeCodeTimer: ReturnType<typeof setTimeout> | null = null

  const buyRows = computed<BuyCostRow[]>(() => context.form.buy_costs.map(hydrateBuyRow))
  const sellRows = computed<SellChargeRow[]>(() => context.form.sell_costs.map(hydrateSellRow))
  const jobCurrency = computed(() => currencyCode(context.form.currency || "GBP"))
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

  const supplierOptions = computed<SelectOption[]>(() =>
    supplierContacts.value.map(contact => ({
      label: displayContactName(contact),
      value: Number(contact.id),
    })),
  )

  function addBuyRow() {
    context.form.buy_costs.push(createBuyRow())
  }

  function addSellRow() {
    context.form.sell_costs.push(createSellRow())
  }

  function removeBuyRow(id: number | string) {
    context.form.buy_costs = context.form.buy_costs.filter(row => row.id !== id)
  }

  function removeSellRow(id: number | string) {
    context.form.sell_costs = context.form.sell_costs.filter(row => row.id !== id)
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

  function lineNetGbp(row: CostRow): number {
    return lineNet(row) * effectiveExchangeRate(row)
  }

  function sellVat(row: SellChargeRow): number {
    const vatRate = numberValue(row.vatRate)

    return vatRate > 0 ? lineNet(row) * (vatRate / 100) : 0
  }

  function sellVatGbp(row: SellChargeRow): number {
    const vatRate = numberValue(row.vatRate)

    return vatRate > 0 ? lineNetGbp(row) * (vatRate / 100) : 0
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
    pendingDeleteRow.value = null
  }

  function confirmRemoveRow() {
    const row = pendingDeleteRow.value

    if (row?.type === "buy") {
      removeBuyRow(row.id)
    }

    if (row?.type === "sell") {
      removeSellRow(row.id)
    }

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

  const totals = computed(() => {
    const totalBuy = buyRows.value.reduce((sum, row) => sum + lineNetGbp(row), 0)
    const totalSell = sellRows.value.reduce((sum, row) => sum + lineNetGbp(row), 0)
    const totalVat = sellRows.value.reduce((sum, row) => sum + sellVatGbp(row), 0)
    const margin = totalSell - totalBuy
    const missingExchangeRates = [...buyRows.value, ...sellRows.value].filter(missingExchangeRate)

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
    },
    { deep: true },
  )

  watch(jobCurrency, () => {
    ;[...buyRows.value, ...sellRows.value].forEach(row => syncLineExchangeRate(row, false))
  })

  watch(jobRateDate, () => {
    ;[...buyRows.value, ...sellRows.value].forEach(row => syncLineExchangeRate(row, false))
    ensureEffectiveExchangeRates()
  })

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
    ])
    await ensureEffectiveExchangeRates()
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
    pendingDeleteRow,
    addBuyRow,
    addSellRow,
    removeBuyRow,
    removeSellRow,
    selectChargeDescription,
    syncChargeDescriptionFilter,
    scheduleMissingChargeDescriptionCheck,
    chargeDescriptionDropdownShown,
    chargeDescriptionDropdownHidden,
    confirmAddChargeCode,
    cancelAddChargeCode,
    requestRemoveRow,
    cancelRemoveRow,
    confirmRemoveRow,
    lineNet,
    lineNetGbp,
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
