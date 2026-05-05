import { computed, inject } from "vue"
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
}

let legId = 1

function createLeg(): MultiModalLeg {
  return {
    id: legId++,
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
  }
}

export function useJobTransportTab() {
  const jobDetails = inject<ReturnType<typeof useJobDetailsPage>>("jobDetails")

  if (!jobDetails) {
    throw new Error("Job details context is missing")
  }

  const { form } = jobDetails

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

  return {
    form,
    mode,
    modeLabel,
    multiModalLegs,
    addLeg,
    removeLeg,
  }
}
