import { computed, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useSystemSettingsStore } from "@/app/stores/system-settings"
import { useAwbManagerStore } from "@/app/stores/awb-manager"
import type {
  AssignAwbForm as AssignForm,
  AwbAirline,
  AwbAirlineForm as AirlineForm,
  AwbStatus,
  BulkAwbForm,
  RangeAwbForm,
  SingleAwbForm,
} from "@/app/types/awb-manager"

type ToastType = "success" | "error" | "info"
type AwbTab = "single" | "range" | "bulk"

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

function genId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export function useSystemSettingsAwbManagerPage() {
  const router = useRouter()
  const systemSettingsStore = useSystemSettingsStore()
  const awbManagerStore = useAwbManagerStore()

  const { airlines, summary } = storeToRefs(awbManagerStore)

  const toasts = ref<ToastItem[]>([])

  const showAirlineModal = ref(false)
  const showAwbModal = ref(false)
  const showAssignModal = ref(false)

  const currentAwbTab = ref<AwbTab>("single")
  const awbTargetAirlineId = ref<number | null>(null)

  const airlineSearch = reactive<Record<number, string>>({})
  const airlineFilter = reactive<Record<number, "all" | AwbStatus>>({})

  const airlineForm = reactive<AirlineForm>({
    id: null,
    name: "",
    code: "",
    prefix: "",
    contract: "",
    notes: "",
  })

  const singleAwbForm = reactive<SingleAwbForm>({
    number: "",
    status: "available",
    notes: "",
  })

  const rangeAwbForm = reactive<RangeAwbForm>({
    from: "",
    to: "",
  })

  const bulkAwbForm = reactive<BulkAwbForm>({
    text: "",
  })

  const assignForm = reactive<AssignForm>({
    airlineId: null,
    awbId: null,
    awbDisplay: "",
    jobNumber: "",
    dateUsed: todayDate(),
    notes: "",
  })

  const eoriNumber = computed(() => systemSettingsStore.eoriNumber)
  const hasEoriNumber = computed(() => systemSettingsStore.hasEoriNumber)

  function pushToast(message: string, type: ToastType = "info") {
    const id = genId()

    toasts.value.push({
      id,
      type,
      message,
    })

    window.setTimeout(() => {
      toasts.value = toasts.value.filter(item => item.id !== id)
    }, 3000)
  }

  async function ensureAccess() {
    if (!hasEoriNumber.value) {
      router.push({ name: "system-settings.company" })
      return
    }

    try {
      await awbManagerStore.fetch()
    } catch {
      pushToast("Unable to load AWB Manager data.", "error")
    }
  }

  function statusLabel(status: AwbStatus) {
    if (status === "available") return "Available"
    if (status === "used") return "Used"
    if (status === "reserved") return "Reserved"

    return "Voided"
  }

  function formatDate(date: string | null) {
    if (!date) return ""

    const cleanDate = date.slice(0, 10)
    const parts = cleanDate.split("-")

    if (parts.length !== 3) return date

    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  function getFilteredAwbs(airline: AwbAirline) {
    const search = (airlineSearch[airline.id] ?? "").trim().toLowerCase()
    const filter = airlineFilter[airline.id] ?? "all"

    let items = [...airline.awbs]

    if (filter !== "all") {
      items = items.filter(item => item.status === filter)
    }

    if (search) {
      items = items.filter(item => {
        return (
          item.number.toLowerCase().includes(search) ||
          (item.jobNumber ?? "").toLowerCase().includes(search) ||
          (item.notes ?? "").toLowerCase().includes(search) ||
          (item.assignNotes ?? "").toLowerCase().includes(search)
        )
      })
    }

    return items
  }

  function getAirlineCounts(airline: AwbAirline) {
    return {
      total: airline.awbs.length,
      available: airline.awbs.filter(item => item.status === "available").length,
      used: airline.awbs.filter(item => item.status === "used").length,
      reserved: airline.awbs.filter(item => item.status === "reserved").length,
      voided: airline.awbs.filter(item => item.status === "voided").length,
    }
  }

  function openAddAirlineModal(id?: number) {
    if (id) {
      const airline = airlines.value.find(item => item.id === id)
      if (!airline) return

      airlineForm.id = airline.id
      airlineForm.name = airline.name
      airlineForm.code = airline.code ?? ""
      airlineForm.prefix = airline.prefix
      airlineForm.contract = airline.contract ?? ""
      airlineForm.notes = airline.notes ?? ""
    } else {
      airlineForm.id = null
      airlineForm.name = ""
      airlineForm.code = ""
      airlineForm.prefix = ""
      airlineForm.contract = ""
      airlineForm.notes = ""
    }

    showAirlineModal.value = true
  }

  function closeAirlineModal() {
    showAirlineModal.value = false
  }

  async function saveAirline() {
    const name = airlineForm.name.trim()
    const prefix = airlineForm.prefix.trim()
    const code = airlineForm.code.trim().toUpperCase()
    const contract = airlineForm.contract.trim()
    const notes = airlineForm.notes.trim()

    if (!name) {
      pushToast("Airline name is required.", "error")
      return
    }

    if (!prefix) {
      pushToast("AWB prefix is required.", "error")
      return
    }

    if (prefix.length !== 3) {
      pushToast("AWB prefix must be exactly 3 digits.", "error")
      return
    }

    try {
      const payload = {
        name,
        code: code || null,
        prefix,
        contract_ref: contract || null,
        contractRef: contract || null,
        notes: notes || null,
        is_active: true,
      }

      if (airlineForm.id) {
        await awbManagerStore.updateAirline(airlineForm.id, payload)
        pushToast("Airline updated.", "success")
      } else {
        await awbManagerStore.createAirline(payload)
        pushToast("Airline added.", "success")
      }

      closeAirlineModal()
    } catch {
      pushToast("Unable to save airline.", "error")
    }
  }

  async function deleteAirline(id: number) {
    const airline = airlines.value.find(item => item.id === id)
    if (!airline) return

    const confirmed = window.confirm(
      `Delete "${airline.name}" and all ${airline.awbs.length} AWB(s)? This cannot be undone.`,
    )

    if (!confirmed) return

    try {
      await awbManagerStore.deleteAirline(id)
      pushToast("Airline removed.", "info")
    } catch {
      pushToast("Unable to delete airline.", "error")
    }
  }

  function toggleCollapse(id: number) {
    const airline = airlines.value.find(item => item.id === id)
    if (!airline) return

    airline.collapsed = !airline.collapsed
  }

  function openAddAwbModal(airlineId: number) {
    awbTargetAirlineId.value = airlineId
    currentAwbTab.value = "single"

    singleAwbForm.number = ""
    singleAwbForm.status = "available"
    singleAwbForm.notes = ""

    rangeAwbForm.from = ""
    rangeAwbForm.to = ""

    bulkAwbForm.text = ""

    showAwbModal.value = true
  }

  function closeAwbModal() {
    showAwbModal.value = false
  }

  function switchAwbTab(tab: AwbTab) {
    currentAwbTab.value = tab
  }

  async function saveAwbs() {
    if (!awbTargetAirlineId.value) return

    try {
      if (currentAwbTab.value === "single") {
        const awbNumber = singleAwbForm.number.trim()

        if (!awbNumber) {
          pushToast("AWB number is required.", "error")
          return
        }

        await awbManagerStore.createSingleAwb(awbTargetAirlineId.value, {
          number: awbNumber,
          status: singleAwbForm.status,
          notes: singleAwbForm.notes.trim() || null,
        })

        pushToast("AWB added.", "success")
      }

      if (currentAwbTab.value === "range") {
        const from = Number(rangeAwbForm.from)
        const to = Number(rangeAwbForm.to)

        if (!from || !to) {
          pushToast("Serial from and serial to are required.", "error")
          return
        }

        if (to < from) {
          pushToast("Serial to must be greater than or equal to serial from.", "error")
          return
        }

        if (to - from > 199) {
          pushToast("Maximum 200 AWBs per batch.", "error")
          return
        }

        await awbManagerStore.createRangeAwbs(awbTargetAirlineId.value, {
          from,
          to,
        })

        pushToast("AWB range added.", "success")
      }

      if (currentAwbTab.value === "bulk") {
        const numbers = bulkAwbForm.text
          .split(/\r?\n/)
          .map(item => item.trim())
          .filter(Boolean)

        if (!numbers.length) {
          pushToast("Paste at least one AWB number.", "error")
          return
        }

        if (numbers.length > 500) {
          pushToast("Maximum 500 AWBs per bulk upload.", "error")
          return
        }

        await awbManagerStore.createBulkAwbs(awbTargetAirlineId.value, {
          numbers,
        })

        pushToast("Bulk AWBs added.", "success")
      }

      closeAwbModal()
    } catch {
      pushToast("Unable to save AWB numbers.", "error")
    }
  }

  function openAssignModal(airlineId: number, awbId: number) {
    const airline = airlines.value.find(item => item.id === airlineId)
    if (!airline) return

    const awb = airline.awbs.find(item => item.id === awbId)
    if (!awb) return

    assignForm.airlineId = airlineId
    assignForm.awbId = awbId
    assignForm.awbDisplay = awb.number
    assignForm.jobNumber = awb.transport_job_id ? String(awb.transport_job_id) : ""
    assignForm.dateUsed = awb.dateUsed ?? todayDate()
    assignForm.notes = awb.assignNotes ?? awb.notes ?? ""

    showAssignModal.value = true
  }

  function closeAssignModal() {
    showAssignModal.value = false
  }

  async function confirmAssign() {
    if (!assignForm.awbId) return

    const transportJobId = Number(assignForm.jobNumber)
    const dateUsed = assignForm.dateUsed.trim()

    if (!transportJobId) {
      pushToast("Transport job ID is required.", "error")
      return
    }

    if (!dateUsed) {
      pushToast("Date used is required.", "error")
      return
    }

    try {
      await awbManagerStore.assignAwb(assignForm.awbId, {
        transport_job_id: transportJobId,
        date_used: dateUsed,
        notes: assignForm.notes.trim() || null,
      })

      closeAssignModal()
      pushToast("AWB assigned.", "success")
    } catch {
      pushToast("Unable to assign AWB.", "error")
    }
  }

  async function unassignAwb(_airlineId: number, awbId: number) {
    const confirmed = window.confirm("Unassign this AWB from the job?")
    if (!confirmed) return

    try {
      await awbManagerStore.unassignAwb(awbId)
      pushToast("AWB unassigned.", "info")
    } catch {
      pushToast("Unable to unassign AWB.", "error")
    }
  }

  async function setAwbStatus(_airlineId: number, awbId: number, status: AwbStatus) {
    if (status === "voided") {
      const confirmed = window.confirm(
        "Void this AWB? This action should only be used when needed.",
      )
      if (!confirmed) return
    }

    try {
      await awbManagerStore.setAwbStatus(awbId, status)

      if (status === "reserved") {
        pushToast("AWB reserved.", "success")
      } else if (status === "available") {
        pushToast("AWB unreserved.", "info")
      } else if (status === "voided") {
        pushToast("AWB voided.", "info")
      }
    } catch {
      pushToast("Unable to update AWB status.", "error")
    }
  }

  async function deleteAwb(_airlineId: number, awbId: number) {
    const confirmed = window.confirm("Delete this AWB? This cannot be undone.")
    if (!confirmed) return

    try {
      await awbManagerStore.deleteAwb(awbId)
      pushToast("AWB deleted.", "info")
    } catch {
      pushToast("Unable to delete AWB.", "error")
    }
  }

  function downloadCsv(rows: string[][], filename: string) {
    const csv = rows
      .map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const link = document.createElement("a")

    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()

    URL.revokeObjectURL(link.href)

    pushToast("CSV downloaded.", "success")
  }

  function exportAirlineCsv(airlineId: number) {
    const airline = airlines.value.find(item => item.id === airlineId)
    if (!airline) return

    const rows: string[][] = [["AWB Number", "Status", "Job Number", "Date Used", "Notes"]]

    for (const awb of airline.awbs) {
      rows.push([
        awb.number,
        awb.status,
        awb.jobNumber ?? "",
        awb.dateUsed ?? "",
        awb.notes || awb.assignNotes || "",
      ])
    }

    downloadCsv(rows, `${airline.name.replace(/\s+/g, "_")}_AWBs.csv`)
  }

  function exportAllCsv() {
    const rows: string[][] = [
      ["Airline", "AWB Prefix", "AWB Number", "Status", "Job Number", "Date Used", "Notes"],
    ]

    for (const airline of airlines.value) {
      for (const awb of airline.awbs) {
        rows.push([
          airline.name,
          airline.prefix,
          awb.number,
          awb.status,
          awb.jobNumber ?? "",
          awb.dateUsed ?? "",
          awb.notes || awb.assignNotes || "",
        ])
      }
    }

    downloadCsv(rows, "AWB_Stock_Export.csv")
  }

  return {
    eoriNumber,
    hasEoriNumber,

    airlines,
    toasts,
    summary,

    currentAwbTab,
    airlineSearch,
    airlineFilter,

    showAirlineModal,
    showAwbModal,
    showAssignModal,

    airlineForm,
    singleAwbForm,
    rangeAwbForm,
    bulkAwbForm,
    assignForm,

    ensureAccess,
    statusLabel,
    formatDate,
    getFilteredAwbs,
    getAirlineCounts,

    openAddAirlineModal,
    closeAirlineModal,
    saveAirline,
    deleteAirline,
    toggleCollapse,

    openAddAwbModal,
    closeAwbModal,
    switchAwbTab,
    saveAwbs,

    openAssignModal,
    closeAssignModal,
    confirmAssign,
    unassignAwb,

    setAwbStatus,
    deleteAwb,

    exportAirlineCsv,
    exportAllCsv,
  }
}
