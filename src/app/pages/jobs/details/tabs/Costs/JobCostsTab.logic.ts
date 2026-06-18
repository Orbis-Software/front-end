import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue"
import { useToast } from "primevue/usetoast"

import contactsService from "@/app/services/contacts"
import { useChargeCodeStore } from "@/app/stores/charge-codes"
import { useContactTypeStore } from "@/app/stores/contact-type"
import type { ChargeCode } from "@/app/types/charge-code"
import type { Contact } from "@/app/types/contact"
import type { JobDetailsContext } from "../../JobDetailsPage.logic"
import type { BuyCostRow, SellChargeRow } from "@/app/types/job-details"

type SelectOption = {
  label: string
  value: string | number | null
}

type CostRow = BuyCostRow | SellChargeRow

const fallbackCurrencyOptions: SelectOption[] = [
  { label: "GBP", value: "GBP" },
  { label: "EUR", value: "EUR" },
  { label: "USD", value: "USD" },
]

let buyId = 1
let sellId = 1

function displayContactName(contact: Contact): string {
  return (
    contact.company_name ||
    (contact as any)?.name ||
    [(contact as any)?.first_name, (contact as any)?.last_name].filter(Boolean).join(" ") ||
    "Unnamed Supplier"
  )
}

function numberValue(value: unknown, fallback = 0): number {
  const numeric = Number(value)

  return Number.isFinite(numeric) ? numeric : fallback
}

function labelValue(value: unknown): string {
  return String(value ?? "")
    .replace(/_/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase())
}

function normalizeClassification(value: unknown): string {
  return String(value ?? "")
    .replace(/[_/-]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

function normalizeDescription(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

function isChargeCodeForJob(charge: ChargeCode, validClassifications: Set<string>): boolean {
  const classification = normalizeClassification(charge.classification)

  if (!classification) return true
  if (!validClassifications.size) return true

  return validClassifications.has(classification)
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
    vatRate: 20,
    amount: 0,
  }
}

function hydrateBuyRow(row: any): BuyCostRow {
  row.type = "buy"
  row.description = row.description ?? ""
  row.supplier_id = row.supplier_id ?? row.supplierId ?? null
  row.chargeCodeId = row.chargeCodeId ?? row.charge_code_id ?? null
  row.quantity = numberValue(row.quantity, 1) || 1
  row.unitCost = numberValue(row.unitCost ?? row.unit_cost ?? row.amount, 0)
  row.currency = row.currency || "GBP"

  return row
}

function hydrateSellRow(row: any): SellChargeRow {
  row.type = "sell"
  row.description = row.description ?? ""
  row.chargeCodeId = row.chargeCodeId ?? row.charge_code_id ?? null
  row.chargeCode = row.chargeCode ?? row.charge_code ?? ""
  row.quantity = numberValue(row.quantity, 1) || 1
  row.unitPrice = numberValue(row.unitPrice ?? row.unit_price ?? row.amount, 0)
  row.currency = row.currency || "GBP"
  row.vatRate = numberValue(row.vatRate ?? row.vat_rate, 20)

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
  const contactTypeStore = useContactTypeStore()
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

  const currencyOptions = computed<SelectOption[]>(() => {
    const options = context.referenceOptions.currencyOptions?.value ?? []

    return options.length ? options : fallbackCurrencyOptions
  })

  const jobChargeClassifications = computed<Set<string>>(() => {
    const mode = labelValue(context.form.mode_of_transport)
    const type = labelValue(context.form.job_type)
    const classifications = [mode, type]

    if (mode && type && mode !== type) {
      classifications.push(`${mode} ${type}`, `${type} ${mode}`)
    }

    return new Set(classifications.map(normalizeClassification).filter(Boolean))
  })

  const primaryJobChargeClassification = computed(() => {
    const mode = labelValue(context.form.mode_of_transport)
    const type = labelValue(context.form.job_type)

    if (mode && type && mode !== type) return `${mode} ${type}`

    return mode || type || ""
  })

  const eligibleChargeCodes = computed<ChargeCode[]>(() =>
    chargeCodeStore.chargeCodes.filter(charge => {
      return isChargeCodeForJob(charge, jobChargeClassifications.value)
    }),
  )

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

  function rowChargeCode(row: SellChargeRow): string {
    const charge = eligibleChargeCodes.value.find(item => {
      return item.id === row.chargeCodeId || item.description === row.description
    })

    return charge?.salesNominal || row.chargeCode || ""
  }

  function buyTotal(row: BuyCostRow): number {
    return numberValue(row.quantity) * numberValue(row.unitCost)
  }

  function sellTotal(row: SellChargeRow): number {
    return numberValue(row.quantity) * numberValue(row.unitPrice)
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
      if (!contactTypeStore.items.length) {
        await contactTypeStore.fetch()
      }

      const supplierType = contactTypeStore.findByCode("supplier")
      const response = await contactsService.list({
        page: 1,
        per_page: 500,
        contact_type_id: supplierType?.id,
      })
      let contacts = response.data ?? []
      let usedUnfilteredFallback = false

      if (!contacts.length && supplierType?.id) {
        const fallbackResponse = await contactsService.list({
          page: 1,
          per_page: 500,
        })

        contacts = fallbackResponse.data ?? []
        usedUnfilteredFallback = true
      }

      supplierContacts.value = contacts.filter(contact => {
        if (!contact.contact_types?.length) {
          return Boolean(supplierType?.id) && !usedUnfilteredFallback
        }

        return contact.contact_types.some(type => {
          const code = String(type.code ?? "").toLowerCase()
          const name = String(type.name ?? "").toLowerCase()

          return code === "supplier" || name === "supplier" || type.id === supplierType?.id
        })
      })
    } finally {
      suppliersLoading.value = false
    }
  }

  const totals = computed(() => {
    const totalBuy = buyRows.value.reduce((sum, row) => sum + buyTotal(row), 0)
    const totalSell = sellRows.value.reduce((sum, row) => sum + sellTotal(row), 0)

    return {
      totalBuy,
      totalSell,
      margin: totalSell - totalBuy,
    }
  })

  watch(buyRows, rows => rows.forEach(hydrateBuyRow), { immediate: true })
  watch(sellRows, rows => rows.forEach(hydrateSellRow), { immediate: true })

  onMounted(async () => {
    await Promise.all([
      chargeCodeStore.fetch({ sort: "description", direction: "asc", perPage: 1000 }),
      loadSuppliers(),
    ])
  })

  onUnmounted(() => {
    if (missingChargeCodeTimer) clearTimeout(missingChargeCodeTimer)
    missingChargeCodeTimer = null
  })

  return {
    buyRows,
    sellRows,
    totals,
    currencyOptions,
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
    rowChargeCode,
    buyTotal,
    sellTotal,
  }
}
