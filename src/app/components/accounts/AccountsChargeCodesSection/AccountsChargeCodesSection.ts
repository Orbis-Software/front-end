import { computed, onMounted, reactive, ref } from "vue"
import { downloadCsv } from "@/app/composables/useAccountsDemo"
import { useChargeCodeStore } from "@/app/stores/charge-codes"
import type { ChargeCode, ChargeCodeFilters, ChargeCodePayload } from "@/app/types/charge-code"

export function useAccountsChargeCodesSection() {
  const chargeCodeStore = useChargeCodeStore()
  const editingId = ref<number | null>(null)
  const formVisible = ref(false)

  const filterState = reactive({
    search: "",
    classification: "",
    purchaseNominal: "",
    salesNominal: "",
    isCustoms: "",
    sort: "description",
    direction: "asc" as "asc" | "desc",
    page: 1,
    perPage: 15,
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
    { label: "All classifications", value: "" },
    ...chargeCodeStore.filters.classifications.map(value => ({ label: value, value })),
  ])
  const purchaseOptions = computed(() => [
    { label: "All", value: "" },
    ...chargeCodeStore.filters.purchaseNominals.map(value => ({ label: value, value })),
  ])
  const salesOptions = computed(() => [
    { label: "All", value: "" },
    ...chargeCodeStore.filters.salesNominals.map(value => ({ label: value, value })),
  ])
  const customsOptions = [
    { label: "Any", value: "" },
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ]
  const hasFilters = computed(() =>
    Boolean(
      filterState.search ||
      filterState.classification ||
      filterState.purchaseNominal ||
      filterState.salesNominal ||
      filterState.isCustoms,
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

  const firstRow = computed(() => (filterState.page - 1) * filterState.perPage)
  const formTitle = computed(() => (editingId.value ? "Edit Charge Code" : "Add Charge Code"))

  function requestParams(): ChargeCodeFilters {
    return {
      search: filterState.search,
      classification: filterState.classification,
      purchaseNominal: filterState.purchaseNominal,
      salesNominal: filterState.salesNominal,
      isCustoms: filterState.isCustoms,
      sort: filterState.sort,
      direction: filterState.direction,
      page: filterState.page,
      perPage: filterState.perPage,
    }
  }

  async function fetchChargeCodes() {
    await chargeCodeStore.fetch(requestParams())
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

  async function onPage(event: { first?: number; rows?: number }) {
    const rows = Number(event.rows ?? filterState.perPage)
    filterState.perPage = rows
    filterState.page = Math.floor(Number(event.first ?? 0) / rows) + 1
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

  async function deleteCharge(row: ChargeCode) {
    if (!window.confirm(`Delete "${row.description}"?`)) return
    await chargeCodeStore.remove(row.id)
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
    filterState,
    form,
    classificationOptions,
    purchaseOptions,
    salesOptions,
    customsOptions,
    countsText,
    firstRow,
    formTitle,
    fetchChargeCodes,
    applyFilters,
    openCreateModal,
    closeForm,
    resetForm,
    saveCharge,
    editCharge,
    deleteCharge,
    resetToSeed,
    sortBy,
    onPage,
    sortMarker,
    exportCsv,
    exportExcel,
    printView,
  }
}
