import { computed, onMounted, reactive, ref } from "vue"
import { downloadCsv } from "@/app/composables/useAccountsDemo"
import { useChargeCodeStore } from "@/app/stores/charge-codes"
import type { ChargeCode, ChargeCodeFilters, ChargeCodePayload } from "@/app/types/charge-code"

const ALL_FILTER_VALUE = "__all"

export function useAccountsChargeCodesSection() {
  const chargeCodeStore = useChargeCodeStore()
  const editingId = ref<number | null>(null)
  const formVisible = ref(false)
  const deleteDialogVisible = ref(false)
  const pendingDeleteCharge = ref<ChargeCode | null>(null)

  const filterState = reactive({
    search: "",
    classification: ALL_FILTER_VALUE,
    purchaseNominal: ALL_FILTER_VALUE,
    salesNominal: ALL_FILTER_VALUE,
    isCustoms: ALL_FILTER_VALUE,
    sort: "description",
    direction: "asc" as "asc" | "desc",
    page: 1,
    perPage: 1000,
  })

  const form = reactive({
    description: "",
    purchaseNominal: "325",
    salesNominal: "200",
    classification: "",
    defaultTaxCode: "",
    isCustoms: false,
  })

  const classificationOptions = computed(() => [
    { label: "All classifications", value: ALL_FILTER_VALUE },
    ...chargeCodeStore.filters.classifications.map(value => ({ label: value, value })),
  ])
  const purchaseOptions = computed(() => [
    { label: "All purchase nominals", value: ALL_FILTER_VALUE },
    ...chargeCodeStore.filters.purchaseNominals.map(value => ({ label: value, value })),
  ])
  const salesOptions = computed(() => [
    { label: "All sales nominals", value: ALL_FILTER_VALUE },
    ...chargeCodeStore.filters.salesNominals.map(value => ({ label: value, value })),
  ])
  const customsOptions = [
    { label: "All customs", value: ALL_FILTER_VALUE },
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ]

  function isAllFilter(value: string) {
    return value === ALL_FILTER_VALUE
  }

  function filterParam(value: string) {
    return isAllFilter(value) ? "" : value
  }

  const hasFilters = computed(() =>
    Boolean(
      filterState.search ||
      !isAllFilter(filterState.classification) ||
      !isAllFilter(filterState.purchaseNominal) ||
      !isAllFilter(filterState.salesNominal) ||
      !isAllFilter(filterState.isCustoms),
    ),
  )

  const countsText = computed(() => {
    const suffix = hasFilters.value ? " (filtered)" : ""
    const range =
      chargeCodeStore.from && chargeCodeStore.to
        ? `${chargeCodeStore.from}-${chargeCodeStore.to}`
        : "0"

    return `Showing ${range} of ${chargeCodeStore.filtered} charges${suffix}`
  })

  const hasScrollableList = computed(() => chargeCodeStore.filtered > 10)
  const formTitle = computed(() => (editingId.value ? "Edit Charge Code" : "Add Charge Code"))

  function requestParams(): ChargeCodeFilters {
    return {
      search: filterState.search,
      classification: filterParam(filterState.classification),
      purchaseNominal: filterParam(filterState.purchaseNominal),
      salesNominal: filterParam(filterState.salesNominal),
      isCustoms: filterParam(filterState.isCustoms),
      sort: filterState.sort,
      direction: filterState.direction,
      page: filterState.page,
      perPage: filterState.perPage,
    }
  }

  async function fetchChargeCodes() {
    await chargeCodeStore.fetchAll(requestParams())
  }

  async function applyFilters() {
    filterState.page = 1
    await fetchChargeCodes()
  }

  function resetForm() {
    editingId.value = null
    Object.assign(form, {
      description: "",
      purchaseNominal: "325",
      salesNominal: "200",
      classification: "",
      defaultTaxCode: "",
      isCustoms: false,
    })
  }

  function openCreateModal() {
    resetForm()
    formVisible.value = true
  }

  function closeForm() {
    formVisible.value = false
    resetForm()
  }

  function closeDeleteDialog() {
    deleteDialogVisible.value = false
    pendingDeleteCharge.value = null
  }

  function payload(): ChargeCodePayload {
    return {
      description: form.description.trim(),
      purchaseNominal: form.purchaseNominal.trim(),
      salesNominal: form.salesNominal.trim(),
      classification: form.classification.trim(),
      defaultTaxCode: form.defaultTaxCode.trim(),
      isCustoms: form.isCustoms,
    }
  }

  async function saveCharge() {
    if (!form.description.trim()) return

    if (editingId.value) {
      await chargeCodeStore.update(editingId.value, payload())
    } else {
      await chargeCodeStore.create(payload())
    }

    closeForm()
    await fetchChargeCodes()
  }

  function editCharge(row: ChargeCode) {
    editingId.value = row.id
    Object.assign(form, {
      description: row.description,
      purchaseNominal: row.purchaseNominal,
      salesNominal: row.salesNominal,
      classification: row.classification,
      defaultTaxCode: row.defaultTaxCode,
      isCustoms: row.isCustoms,
    })
    formVisible.value = true
  }

  function requestDeleteCharge(row: ChargeCode) {
    pendingDeleteCharge.value = row
    deleteDialogVisible.value = true
  }

  async function confirmDeleteCharge() {
    if (!pendingDeleteCharge.value) return

    await chargeCodeStore.remove(pendingDeleteCharge.value.id)
    closeDeleteDialog()
    await fetchChargeCodes()
  }

  async function resetToSeed() {
    if (!window.confirm("Reset all charges to the imported data? This will discard current edits."))
      return
    await chargeCodeStore.reset()
    await fetchChargeCodes()
    resetForm()
  }

  async function sortBy(key: string) {
    if (filterState.sort === key) {
      filterState.direction = filterState.direction === "asc" ? "desc" : "asc"
    } else {
      filterState.sort = key
      filterState.direction = "asc"
    }
    await fetchChargeCodes()
  }

  function sortMarker(key: string) {
    if (filterState.sort !== key) return ""
    return filterState.direction === "asc" ? "^" : "v"
  }

  function exportCsv() {
    downloadCsv("tms-charge-codes.csv", [
      [
        "Charge Description",
        "Purchase Nominal",
        "Sales Nominal",
        "Classification",
        "Default Tax Code",
        "Customs",
      ],
      ...chargeCodeStore.chargeCodes.map(row => [
        row.description,
        row.purchaseNominal,
        row.salesNominal,
        row.classification,
        row.defaultTaxCode,
        row.isCustoms ? 1 : 0,
      ]),
    ])
  }

  function exportExcel() {
    const xmlEscape = (value: unknown) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
    const cell = (value: unknown, type = "String") =>
      `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`
    const headers = [
      "Charge Description",
      "Purchase Nominal",
      "Sales Nominal",
      "Classification",
      "Default Tax Code",
      "Customs",
    ]
    const rows = chargeCodeStore.chargeCodes
      .map(
        row =>
          `<Row>${cell(row.description)}${cell(row.purchaseNominal)}${cell(row.salesNominal)}${cell(row.classification)}${cell(row.defaultTaxCode)}${cell(row.isCustoms ? 1 : 0, "Number")}</Row>`,
      )
      .join("\n")
    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Charge Codes">
  <Table>
   <Row>${headers.map(header => cell(header)).join("")}</Row>
   ${rows}
  </Table>
 </Worksheet>
</Workbook>`
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "tms-charge-codes.xls"
    link.click()
    URL.revokeObjectURL(url)
  }

  function printView() {
    window.print()
  }

  onMounted(fetchChargeCodes)

  return {
    chargeCodeStore,
    editingId,
    formVisible,
    deleteDialogVisible,
    pendingDeleteCharge,
    filterState,
    form,
    classificationOptions,
    purchaseOptions,
    salesOptions,
    customsOptions,
    countsText,
    hasScrollableList,
    formTitle,
    fetchChargeCodes,
    applyFilters,
    openCreateModal,
    closeForm,
    closeDeleteDialog,
    resetForm,
    saveCharge,
    editCharge,
    requestDeleteCharge,
    confirmDeleteCharge,
    resetToSeed,
    sortBy,
    sortMarker,
    exportCsv,
    exportExcel,
    printView,
  }
}
