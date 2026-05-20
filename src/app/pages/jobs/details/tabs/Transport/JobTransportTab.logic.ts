import { computed, inject, onMounted } from "vue"
import { storeToRefs } from "pinia"
import { useGlobalReferenceDataStore } from "@/app/stores/global-reference-data"
import type { GlobalReferenceDataRow } from "@/app/types/globalReferenceData"
import type { useJobDetailsPage } from "../../JobDetailsPage.logic"

export type TransportMode = "" | "road" | "rail" | "sea" | "air" | "courier" | "multi_modal"

export type MultiModalLegMode = "road" | "rail" | "sea" | "air" | "courier"

export type MultiModalLeg = {
  id: number
  mode: MultiModalLegMode

  carrier: string
  reference: string
  origin: string
  destination: string
  etd: string
  eta: string
  notes: string

  // Road
  vehicle_type: string
  driver_name: string
  driver_mobile: string

  // Sea
  vessel: string
  voyage: string
  container: string

  // Air
  airline: string
  flight: string
  awb: string

  // Rail
  train: string
  wagon: string

  // Courier
  tracking: string
  service: string
  extra_data: Record<string, any>
}

let legId = 1

type ReferenceOption = {
  label: string
  value: string
  subLabel?: string
}

function createLeg(): MultiModalLeg {
  return {
    id: -legId++,
    mode: "road",

    carrier: "",
    reference: "",
    origin: "",
    destination: "",
    etd: "",
    eta: "",
    notes: "",

    vehicle_type: "",
    driver_name: "",
    driver_mobile: "",

    vessel: "",
    voyage: "",
    container: "",

    airline: "",
    flight: "",
    awb: "",

    train: "",
    wagon: "",

    tracking: "",
    service: "",
    extra_data: {},
  }
}

export function useJobTransportTab() {
  const jobDetails = inject<ReturnType<typeof useJobDetailsPage>>("jobDetails")
  const globalReferenceDataStore = useGlobalReferenceDataStore()
  const { data: globalReferenceData } = storeToRefs(globalReferenceDataStore)

  if (!jobDetails) {
    throw new Error("Job details context is missing")
  }

  const { form } = jobDetails

  const airportOptions = computed(() => {
    return terminalOptions(row => row.type === "Airport")
  })

  const seaportOptions = computed(() => {
    return terminalOptions(row => row.type === "Seaport")
  })

  const railTerminalOptions = computed(() => {
    return terminalOptions(row => row.type === "Rail Freight")
  })

  const roadTerminalOptions = computed(() => {
    return terminalOptions(row => row.type === "Road Freight")
  })

  const cityOptions = computed(() => {
    return globalReferenceData.value.cities
      .map(row => {
        const value = row.fullName || row.city || row.location || row.code || ""
        const subLabel = [row.country, row.code].filter(Boolean).join(" | ")

        return {
          label: value,
          value,
          subLabel,
        }
      })
      .filter(option => option.value)
  })

  function terminalOptions(filter: (row: GlobalReferenceDataRow) => boolean): ReferenceOption[] {
    return globalReferenceData.value.terminals
      .filter(filter)
      .map(row => {
        const value = row.terminalName || row.name || row.location || row.code || ""
        const subLabel = [row.location, row.country, row.code].filter(Boolean).join(" | ")

        return {
          label: value,
          value,
          subLabel,
        }
      })
      .filter(option => option.value)
  }

  function getLocationOptions(locationMode: MultiModalLegMode): ReferenceOption[] {
    if (locationMode === "air") return airportOptions.value
    if (locationMode === "sea") return seaportOptions.value
    if (locationMode === "rail") return railTerminalOptions.value

    return roadTerminalOptions.value
  }

  function getOriginLabel(locationMode: MultiModalLegMode): string {
    if (locationMode === "air") return "Airport of Departure"
    if (locationMode === "sea") return "Port of Loading"
    if (locationMode === "rail") return "Loading Terminal"

    return "Origin Road Terminal"
  }

  function getDestinationLabel(locationMode: MultiModalLegMode): string {
    if (locationMode === "air") return "Airport of Arrival"
    if (locationMode === "sea") return "Port of Discharge"
    if (locationMode === "rail") return "Discharge Terminal"

    return "Destination Road Terminal"
  }

  const mode = computed<TransportMode>(() => {
    const value = form.mode_of_transport

    if (
      value === "road" ||
      value === "rail" ||
      value === "sea" ||
      value === "air" ||
      value === "courier" ||
      value === "multi_modal"
    ) {
      return value
    }

    return ""
  })

  const modeLabel = computed(() => {
    switch (mode.value) {
      case "road":
        return "Road Freight"
      case "rail":
        return "Rail Freight"
      case "sea":
        return "Sea Freight"
      case "air":
        return "Air Freight"
      case "courier":
        return "Courier"
      case "multi_modal":
        return "Multi Modal"
      default:
        return "No mode selected"
    }
  })

  const multiModalLegs = computed<MultiModalLeg[]>({
    get() {
      const extra = form as any

      if (!Array.isArray(extra.multi_modal_legs)) {
        extra.multi_modal_legs = []
      }

      extra.multi_modal_legs.forEach((leg: Partial<MultiModalLeg>) => {
        if (!leg.extra_data || typeof leg.extra_data !== "object") {
          leg.extra_data = {}
        }
      })

      return extra.multi_modal_legs
    },
    set(value) {
      ;(form as any).multi_modal_legs = value
    },
  })

  function addLeg() {
    multiModalLegs.value = [...multiModalLegs.value, createLeg()]
  }

  function removeLeg(id: number) {
    multiModalLegs.value = multiModalLegs.value.filter(leg => leg.id !== id)
  }

  onMounted(async () => {
    const hasReferenceData =
      globalReferenceData.value.terminals.length ||
      globalReferenceData.value.airlines.length ||
      globalReferenceData.value.cities.length

    if (!hasReferenceData) {
      await globalReferenceDataStore.fetchAll()
    }
  })

  return {
    form,
    mode,
    modeLabel,
    multiModalLegs,
    airportOptions,
    seaportOptions,
    railTerminalOptions,
    roadTerminalOptions,
    cityOptions,
    getLocationOptions,
    getOriginLabel,
    getDestinationLabel,
    addLeg,
    removeLeg,
  }
}
