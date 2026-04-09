import { computed, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { useSystemSettingsStore } from "@/app/stores/system-settings"

type AwbStatus = "available" | "used" | "reserved" | "voided"
type AwbTab = "single" | "range" | "bulk"

type AwbItem = {
  id: string
  number: string
  status: AwbStatus
  notes: string
  jobNumber: string
  dateUsed: string
  assignNotes: string
}

type AirlineItem = {
  id: string
  name: string
  code: string
  prefix: string
  contract: string
  notes: string
  collapsed: boolean
  awbs: AwbItem[]
}

type ToastItem = {
  id: string
  message: string
  type: "success" | "error" | "info"
}

type AirlineForm = {
  id: string
  name: string
  code: string
  prefix: string
  contract: string
  notes: string
}

type SingleAwbForm = {
  number: string
  status: "available" | "reserved"
  notes: string
}

type RangeAwbForm = {
  from: string
  to: string
}

type BulkAwbForm = {
  text: string
}

type AssignForm = {
  airlineId: string
  awbId: string
  awbDisplay: string
  jobNumber: string
  dateUsed: string
  notes: string
}

const STORAGE_KEY = "awbManager"

function genId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function normalizeStatus(value: string): AwbStatus {
  if (value === "available" || value === "used" || value === "reserved" || value === "voided") {
    return value
  }

  return "available"
}

function safeParseStorage(): AirlineItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.airlines)) return []

    return parsed.airlines.map((airline: any) => ({
      id: String(airline.id ?? genId()),
      name: String(airline.name ?? ""),
      code: String(airline.code ?? ""),
      prefix: String(airline.prefix ?? ""),
      contract: String(airline.contract ?? ""),
      notes: String(airline.notes ?? ""),
      collapsed: Boolean(airline.collapsed),
      awbs: Array.isArray(airline.awbs)
        ? airline.awbs.map((awb: any) => ({
            id: String(awb.id ?? genId()),
            number: String(awb.number ?? ""),
            status: normalizeStatus(String(awb.status ?? "available")),
            notes: String(awb.notes ?? ""),
            jobNumber: String(awb.jobNumber ?? ""),
            dateUsed: String(awb.dateUsed ?? ""),
            assignNotes: String(awb.assignNotes ?? ""),
          }))
        : [],
    }))
  } catch {
    return []
  }
}

export function useSystemSettingsAwbManagerPage() {
  const router = useRouter()
  const systemSettingsStore = useSystemSettingsStore()

  const airlines = ref<AirlineItem[]>(safeParseStorage())
  const toasts = ref<ToastItem[]>([])

  const showAirlineModal = ref(false)
  const showAwbModal = ref(false)
  const showAssignModal = ref(false)

  const currentAwbTab = ref<AwbTab>("single")
  const awbTargetAirlineId = ref("")

  const airlineSearch = reactive<Record<string, string>>({})
  const airlineFilter = reactive<Record<string, "all" | AwbStatus>>({})

  const airlineForm = reactive<AirlineForm>({
    id: "",
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
    airlineId: "",
    awbId: "",
    awbDisplay: "",
    jobNumber: "",
    dateUsed: "",
    notes: "",
  })

  const eoriNumber = computed(() => systemSettingsStore.eoriNumber)
  const hasEoriNumber = computed(() => systemSettingsStore.hasEoriNumber)

  function persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        airlines: airlines.value,
      }),
    )
  }

  function pushToast(message: string, type: "success" | "error" | "info" = "info") {
    const id = genId()
    toasts.value.push({ id, message, type })

    window.setTimeout(() => {
      toasts.value = toasts.value.filter(item => item.id !== id)
    }, 3500)
  }

  function ensureAccess() {
    if (!hasEoriNumber.value) {
      router.replace({ name: "settings.system.master" })
    }
  }

  function seedDemoIfEmpty() {
    if (airlines.value.length > 0) return

    airlines.value = [
      {
        id: genId(),
        name: "Lufthansa Cargo",
        code: "LH",
        prefix: "020",
        contract: "LH-2024-001",
        notes: "Annual stock agreement",
        collapsed: false,
        awbs: [
          {
            id: genId(),
            number: "020-12345678",
            status: "available",
            notes: "",
            jobNumber: "",
            dateUsed: "",
            assignNotes: "",
          },
          {
            id: genId(),
            number: "020-12345679",
            status: "used",
            notes: "",
            jobNumber: "JOB-2024-0041",
            dateUsed: "2024-11-15",
            assignNotes: "Frankfurt shipment",
          },
          {
            id: genId(),
            number: "020-12345680",
            status: "used",
            notes: "",
            jobNumber: "JOB-2024-0048",
            dateUsed: "2024-12-01",
            assignNotes: "",
          },
          {
            id: genId(),
            number: "020-12345681",
            status: "available",
            notes: "",
            jobNumber: "",
            dateUsed: "",
            assignNotes: "",
          },
          {
            id: genId(),
            number: "020-12345682",
            status: "reserved",
            notes: "Hold for January shipment",
            jobNumber: "",
            dateUsed: "",
            assignNotes: "",
          },
        ],
      },
      {
        id: genId(),
        name: "Emirates SkyCargo",
        code: "EK",
        prefix: "176",
        contract: "EK-2024-SC-009",
        notes: "",
        collapsed: false,
        awbs: [
          {
            id: genId(),
            number: "176-87654321",
            status: "available",
            notes: "",
            jobNumber: "",
            dateUsed: "",
            assignNotes: "",
          },
          {
            id: genId(),
            number: "176-87654322",
            status: "available",
            notes: "",
            jobNumber: "",
            dateUsed: "",
            assignNotes: "",
          },
          {
            id: genId(),
            number: "176-87654323",
            status: "used",
            notes: "",
            jobNumber: "JOB-2024-0055",
            dateUsed: "2024-12-10",
            assignNotes: "Dubai to Sydney perishables",
          },
        ],
      },
    ]

    persist()
  }

  const summary = computed(() => {
    let total = 0
    let available = 0
    let used = 0
    let reserved = 0

    for (const airline of airlines.value) {
      for (const awb of airline.awbs) {
        total += 1
        if (awb.status === "available") available += 1
        if (awb.status === "used") used += 1
        if (awb.status === "reserved") reserved += 1
      }
    }

    return {
      airlines: airlines.value.length,
      total,
      available,
      used,
      reserved,
    }
  })

  function getFilteredAwbs(airline: AirlineItem) {
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
          item.jobNumber.toLowerCase().includes(search) ||
          item.notes.toLowerCase().includes(search) ||
          item.assignNotes.toLowerCase().includes(search)
        )
      })
    }

    return items
  }

  function getAirlineCounts(airline: AirlineItem) {
    return {
      total: airline.awbs.length,
      available: airline.awbs.filter(item => item.status === "available").length,
      used: airline.awbs.filter(item => item.status === "used").length,
      reserved: airline.awbs.filter(item => item.status === "reserved").length,
    }
  }

  function statusLabel(status: AwbStatus) {
    if (status === "available") return "Available"
    if (status === "used") return "Used"
    if (status === "reserved") return "Reserved"
    return "Voided"
  }

  function formatDate(date: string) {
    if (!date) return ""
    const parts = date.split("-")
    if (parts.length !== 3) return date
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  function openAddAirlineModal(id?: string) {
    if (id) {
      const airline = airlines.value.find(item => item.id === id)
      if (!airline) return

      airlineForm.id = airline.id
      airlineForm.name = airline.name
      airlineForm.code = airline.code
      airlineForm.prefix = airline.prefix
      airlineForm.contract = airline.contract
      airlineForm.notes = airline.notes
    } else {
      airlineForm.id = ""
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

  function saveAirline() {
    const name = airlineForm.name.trim()
    const prefix = airlineForm.prefix.trim()
    const code = airlineForm.code.trim().toUpperCase()

    if (!name) {
      pushToast("Airline name is required.", "error")
      return
    }

    if (!prefix) {
      pushToast("AWB prefix is required.", "error")
      return
    }

    if (airlineForm.id) {
      const airline = airlines.value.find(item => item.id === airlineForm.id)
      if (!airline) return

      airline.name = name
      airline.code = code
      airline.prefix = prefix
      airline.contract = airlineForm.contract.trim()
      airline.notes = airlineForm.notes.trim()

      pushToast("Airline updated.", "success")
    } else {
      airlines.value.push({
        id: genId(),
        name,
        code,
        prefix,
        contract: airlineForm.contract.trim(),
        notes: airlineForm.notes.trim(),
        collapsed: false,
        awbs: [],
      })

      pushToast("Airline added.", "success")
    }

    persist()
    closeAirlineModal()
  }

  function deleteAirline(id: string) {
    const airline = airlines.value.find(item => item.id === id)
    if (!airline) return

    const confirmed = window.confirm(
      `Delete "${airline.name}" and all ${airline.awbs.length} AWB(s)? This cannot be undone.`,
    )
    if (!confirmed) return

    airlines.value = airlines.value.filter(item => item.id !== id)
    persist()
    pushToast("Airline removed.", "info")
  }

  function toggleCollapse(id: string) {
    const airline = airlines.value.find(item => item.id === id)
    if (!airline) return

    airline.collapsed = !airline.collapsed
    persist()
  }

  function openAddAwbModal(airlineId: string) {
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

  function saveAwbs() {
    const airline = airlines.value.find(item => item.id === awbTargetAirlineId.value)
    if (!airline) return

    let toAdd: AwbItem[] = []

    if (currentAwbTab.value === "single") {
      const number = singleAwbForm.number.trim()
      if (!number) {
        pushToast("AWB number is required.", "error")
        return
      }

      toAdd.push({
        id: genId(),
        number,
        status: singleAwbForm.status,
        notes: singleAwbForm.notes.trim(),
        jobNumber: "",
        dateUsed: "",
        assignNotes: "",
      })
    }

    if (currentAwbTab.value === "range") {
      const from = Number(rangeAwbForm.from.trim())
      const to = Number(rangeAwbForm.to.trim())

      if (Number.isNaN(from) || Number.isNaN(to)) {
        pushToast("Enter valid serial numbers.", "error")
        return
      }

      if (to < from) {
        pushToast('"To" must be greater than or equal to "From".', "error")
        return
      }

      if (to - from > 199) {
        pushToast("Maximum 200 AWBs per batch.", "error")
        return
      }

      for (let i = from; i <= to; i += 1) {
        toAdd.push({
          id: genId(),
          number: `${airline.prefix}-${String(i).padStart(8, "0")}`,
          status: "available",
          notes: "",
          jobNumber: "",
          dateUsed: "",
          assignNotes: "",
        })
      }
    }

    if (currentAwbTab.value === "bulk") {
      const lines = bulkAwbForm.text
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)

      if (!lines.length) {
        pushToast("Paste at least one AWB number.", "error")
        return
      }

      if (lines.length > 500) {
        pushToast("Maximum 500 AWBs per paste.", "error")
        return
      }

      toAdd = lines.map(number => ({
        id: genId(),
        number,
        status: "available",
        notes: "",
        jobNumber: "",
        dateUsed: "",
        assignNotes: "",
      }))
    }

    const existing = new Set(airline.awbs.map(item => item.number))
    const duplicates = toAdd.filter(item => existing.has(item.number))
    const unique = toAdd.filter(item => !existing.has(item.number))

    airline.awbs.push(...unique)
    persist()
    closeAwbModal()

    let message = `${unique.length} AWB(s) added.`
    if (duplicates.length) {
      message += ` ${duplicates.length} duplicate(s) skipped.`
    }

    pushToast(message, "success")
  }

  function openAssignModal(airlineId: string, awbId: string) {
    const airline = airlines.value.find(item => item.id === airlineId)
    const awb = airline?.awbs.find(item => item.id === awbId)
    if (!airline || !awb) return

    assignForm.airlineId = airlineId
    assignForm.awbId = awbId
    assignForm.awbDisplay = awb.number
    assignForm.jobNumber = awb.jobNumber
    assignForm.dateUsed = awb.dateUsed || new Date().toISOString().slice(0, 10)
    assignForm.notes = awb.assignNotes

    showAssignModal.value = true
  }

  function closeAssignModal() {
    showAssignModal.value = false
  }

  function confirmAssign() {
    const airline = airlines.value.find(item => item.id === assignForm.airlineId)
    const awb = airline?.awbs.find(item => item.id === assignForm.awbId)
    if (!airline || !awb) return

    if (!assignForm.jobNumber.trim()) {
      pushToast("Job number is required.", "error")
      return
    }

    if (!assignForm.dateUsed.trim()) {
      pushToast("Date is required.", "error")
      return
    }

    awb.jobNumber = assignForm.jobNumber.trim()
    awb.dateUsed = assignForm.dateUsed.trim()
    awb.assignNotes = assignForm.notes.trim()
    awb.status = "used"

    persist()
    closeAssignModal()
    pushToast(`AWB assigned to ${awb.jobNumber}`, "success")
  }

  function unassignAwb(airlineId: string, awbId: string) {
    const confirmed = window.confirm("Remove job assignment from this AWB and mark it available?")
    if (!confirmed) return

    const airline = airlines.value.find(item => item.id === airlineId)
    const awb = airline?.awbs.find(item => item.id === awbId)
    if (!airline || !awb) return

    awb.jobNumber = ""
    awb.dateUsed = ""
    awb.assignNotes = ""
    awb.status = "available"

    persist()
    pushToast("AWB unassigned.", "info")
  }

  function setAwbStatus(airlineId: string, awbId: string, status: AwbStatus) {
    const airline = airlines.value.find(item => item.id === airlineId)
    const awb = airline?.awbs.find(item => item.id === awbId)
    if (!airline || !awb) return

    if (status === "voided") {
      const confirmed = window.confirm("Mark this AWB as voided? It will no longer be available.")
      if (!confirmed) return
    }

    awb.status = status

    if (status !== "used") {
      awb.jobNumber = ""
      awb.dateUsed = ""
    }

    persist()
  }

  function deleteAwb(airlineId: string, awbId: string) {
    const confirmed = window.confirm("Delete this AWB? This cannot be undone.")
    if (!confirmed) return

    const airline = airlines.value.find(item => item.id === airlineId)
    if (!airline) return

    airline.awbs = airline.awbs.filter(item => item.id !== awbId)
    persist()
    pushToast("AWB deleted.", "info")
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

  function exportAirlineCsv(airlineId: string) {
    const airline = airlines.value.find(item => item.id === airlineId)
    if (!airline) return

    const rows: string[][] = [["AWB Number", "Status", "Job Number", "Date Used", "Notes"]]

    for (const awb of airline.awbs) {
      rows.push([awb.number, awb.status, awb.jobNumber, awb.dateUsed, awb.notes || awb.assignNotes])
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
          awb.jobNumber,
          awb.dateUsed,
          awb.notes || awb.assignNotes,
        ])
      }
    }

    downloadCsv(rows, "AWB_Stock_Export.csv")
  }

  seedDemoIfEmpty()

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
