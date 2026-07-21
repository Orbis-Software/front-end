import * as THREE from "three"
import { useReferenceDataStore } from "@/app/stores/reference-data"
import { computed, inject, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { JobDetailsContext } from "@/app/types/job-details"
import type {
  LoadMode,
  LoadSpaceDefinition,
  LoadUnit,
  LoadUnitType,
  Orbit3D,
  PlacedUnit,
  PlannerLayout,
  SpacePreset,
} from "@/app/types/load-planner"

export function useJobLoadPlannerTab() {
  const context = inject<JobDetailsContext>("jobDetails")

  if (!context) {
    throw new Error("JobLoadPlannerTab must be used inside JobDetailsPage.")
  }

  const { form } = context
  const referenceDataStore = useReferenceDataStore()
  const route = useRoute()
  const router = useRouter()
  const vehicleTypeRedirecting = ref(false)

  const COLORS = [
    "#2563eb",
    "#16a34a",
    "#ec691a",
    "#dc2626",
    "#7c3aed",
    "#0891b2",
    "#ca8a04",
    "#0f766e",
    "#be185d",
    "#475569",
    "#65a30d",
    "#9333ea",
  ]
  const DEFAULT_COLOR = "#ec691a"

  const SPACE_PRESETS: Record<string, SpacePreset> = {
    road_small_van: {
      l: 180,
      w: 150,
      h: 120,
      maxWt: 700,
      mode: "road",
      label: "Small Van (Transit Connect)",
    },
    road_swb_van: { l: 240, w: 170, h: 140, maxWt: 900, mode: "road", label: "SWB Van" },
    road_mwb_van: { l: 300, w: 170, h: 180, maxWt: 1000, mode: "road", label: "MWB Van" },
    road_lwb_van: { l: 420, w: 175, h: 190, maxWt: 1200, mode: "road", label: "LWB Van" },
    road_xlwb_van: { l: 470, w: 175, h: 200, maxWt: 1400, mode: "road", label: "Extra LWB Van" },
    road_luton: { l: 400, w: 200, h: 210, maxWt: 900, mode: "road", label: "Luton Van" },
    road_75t: { l: 600, w: 245, h: 240, maxWt: 3500, mode: "road", label: "7.5T Box Truck" },
    road_12t: { l: 720, w: 245, h: 250, maxWt: 8000, mode: "road", label: "12T Box Truck" },
    road_18t: { l: 850, w: 245, h: 260, maxWt: 11000, mode: "road", label: "18T Box Truck" },
    road_curtainsider: {
      l: 1360,
      w: 248,
      h: 270,
      maxWt: 26000,
      mode: "road",
      label: "Curtainsider / Tautliner",
    },
    road_box_trailer: { l: 1360, w: 248, h: 265, maxWt: 26000, mode: "road", label: "Box Trailer" },
    road_mega: { l: 1362, w: 248, h: 294, maxWt: 26000, mode: "road", label: "Mega Trailer" },
    road_doubledeck: {
      l: 1360,
      w: 248,
      h: 270,
      maxWt: 26000,
      mode: "road",
      label: "Double Deck Trailer",
    },
    road_reefer: { l: 1360, w: 248, h: 260, maxWt: 24000, mode: "road", label: "Reefer Trailer" },
    road_joloda: { l: 1360, w: 248, h: 270, maxWt: 26000, mode: "road", label: "Joloda Trailer" },
    road_coil: { l: 1360, w: 248, h: 270, maxWt: 26000, mode: "road", label: "Coil Carrier" },
    road_flatbed: {
      l: 1360,
      w: 248,
      h: 999,
      maxWt: 26000,
      mode: "road",
      label: "Flatbed Trailer (open)",
    },
    road_stepframe: {
      l: 1360,
      w: 248,
      h: 999,
      maxWt: 30000,
      mode: "road",
      label: "Step Frame Trailer (open)",
    },
    road_lowloader: {
      l: 1200,
      w: 300,
      h: 999,
      maxWt: 40000,
      mode: "road",
      label: "Low Loader (open)",
    },
    road_extendable: {
      l: 1360,
      w: 248,
      h: 999,
      maxWt: 26000,
      mode: "road",
      label: "Extendable Trailer (open)",
    },
    sea_10dry: { l: 283, w: 235, h: 239, maxWt: 10000, mode: "sea", label: "10' Dry" },
    sea_20dry: { l: 590, w: 235, h: 239, maxWt: 21700, mode: "sea", label: "20' Dry" },
    sea_20hc: { l: 590, w: 235, h: 269, maxWt: 21700, mode: "sea", label: "20' High Cube" },
    sea_40dry: { l: 1203, w: 235, h: 239, maxWt: 26580, mode: "sea", label: "40' Dry" },
    sea_40hc: { l: 1203, w: 235, h: 269, maxWt: 26330, mode: "sea", label: "40' High Cube" },
    sea_45hc: { l: 1356, w: 235, h: 269, maxWt: 27700, mode: "sea", label: "45' High Cube" },
    sea_20ot: { l: 589, w: 235, h: 235, maxWt: 21500, mode: "sea", label: "20' Open Top" },
    sea_40ot: { l: 1203, w: 235, h: 235, maxWt: 26000, mode: "sea", label: "40' Open Top" },
    sea_20fr: { l: 594, w: 235, h: 999, maxWt: 27000, mode: "sea", label: "20' Flat Rack (open)" },
    sea_40fr: { l: 1213, w: 240, h: 999, maxWt: 39000, mode: "sea", label: "40' Flat Rack (open)" },
    sea_20reefer: { l: 545, w: 229, h: 225, maxWt: 20000, mode: "sea", label: "20' Reefer" },
    sea_40reefer_hc: { l: 1158, w: 229, h: 255, maxWt: 22000, mode: "sea", label: "40' Reefer HC" },
    sea_iso_tank: {
      l: 590,
      w: 235,
      h: 235,
      maxWt: 20000,
      mode: "sea",
      label: "ISO Tank Container",
    },
    rail_box_wagon: { l: 1449, w: 272, h: 210, maxWt: 58000, mode: "rail", label: "Box Wagon" },
    rail_sliding_wall: {
      l: 1500,
      w: 275,
      h: 270,
      maxWt: 58000,
      mode: "rail",
      label: "Sliding Wall Wagon",
    },
    rail_covered: { l: 1400, w: 270, h: 250, maxWt: 58000, mode: "rail", label: "Covered Wagon" },
    rail_open_wagon: {
      l: 1200,
      w: 280,
      h: 999,
      maxWt: 55000,
      mode: "rail",
      label: "Open Wagon (open)",
    },
    rail_highside: {
      l: 1200,
      w: 280,
      h: 200,
      maxWt: 55000,
      mode: "rail",
      label: "High-Side Wagon",
    },
    rail_coil_wagon: { l: 1200, w: 280, h: 200, maxWt: 55000, mode: "rail", label: "Coil Wagon" },
    rail_flat_wagon: {
      l: 1800,
      w: 280,
      h: 999,
      maxWt: 60000,
      mode: "rail",
      label: "Flat Wagon (open)",
    },
    rail_container_60ft: {
      l: 1890,
      w: 240,
      h: 999,
      maxWt: 68500,
      mode: "rail",
      label: "Container Wagon (60ft, open)",
    },
    rail_container_80ft: {
      l: 2400,
      w: 240,
      h: 999,
      maxWt: 70000,
      mode: "rail",
      label: "Container Wagon (80ft, open)",
    },
    rail_pocket: {
      l: 1800,
      w: 240,
      h: 999,
      maxWt: 60000,
      mode: "rail",
      label: "Pocket Wagon (open)",
    },
    rail_car_carrier: {
      l: 2600,
      w: 280,
      h: 300,
      maxWt: 60000,
      mode: "rail",
      label: "Car Carrier Wagon",
    },
  }

  const presetGroups = [
    {
      label: "Road Freight",
      keys: [
        "road_small_van",
        "road_swb_van",
        "road_mwb_van",
        "road_lwb_van",
        "road_xlwb_van",
        "road_luton",
        "road_75t",
        "road_12t",
        "road_18t",
        "road_curtainsider",
        "road_box_trailer",
        "road_mega",
        "road_doubledeck",
        "road_reefer",
        "road_joloda",
        "road_coil",
        "road_flatbed",
        "road_stepframe",
        "road_lowloader",
        "road_extendable",
      ],
    },
    {
      label: "Rail Freight",
      keys: [
        "rail_box_wagon",
        "rail_sliding_wall",
        "rail_covered",
        "rail_open_wagon",
        "rail_highside",
        "rail_coil_wagon",
        "rail_flat_wagon",
        "rail_container_60ft",
        "rail_container_80ft",
        "rail_pocket",
        "rail_car_carrier",
      ],
    },
    {
      label: "Sea Freight",
      keys: [
        "sea_10dry",
        "sea_20dry",
        "sea_20hc",
        "sea_40dry",
        "sea_40hc",
        "sea_45hc",
        "sea_20ot",
        "sea_40ot",
        "sea_20fr",
        "sea_40fr",
        "sea_20reefer",
        "sea_40reefer_hc",
        "sea_iso_tank",
      ],
    },
  ]

  const activeView = ref<"2d" | "3d">("2d")
  const isPreparingPrint = ref(false)
  const spacePresetKey = ref("road_curtainsider")
  const layout = ref<PlannerLayout | null>(null)
  const showPalBases = ref(true)
  const wireframe3d = ref(false)
  const canvasTop = ref<HTMLCanvasElement | null>(null)
  const canvasSide = ref<HTMLCanvasElement | null>(null)
  const canvas3d = ref<HTMLCanvasElement | null>(null)
  let autoCalculateFrame = 0
  let renderer3d: THREE.WebGLRenderer | null = null
  let scene3d: THREE.Scene | null = null
  let camera3d: THREE.PerspectiveCamera | null = null
  let light3d: THREE.DirectionalLight | null = null
  let orbit3d: Orbit3D | null = null
  let sceneObjects3d: THREE.Object3D[] = []

  const space = reactive({
    l: 1360,
    w: 240,
    h: 270,
    maxWt: 26000,
    palH: 15,
  })

  const jobRefLocal = computed({
    get() {
      return form.job_number || ""
    },
    set(value: string) {
      form.job_number = value
    },
  })

  const currentMode = computed<LoadMode>(() => {
    const mode = String(form.mode_of_transport ?? "").toLowerCase()

    if (mode.includes("sea")) return "sea"
    if (mode.includes("rail")) return "rail"

    return "road"
  })

  const transportOrderVehicleType = computed(() => {
    const roadDetail = form.road_detail as any
    return String(roadDetail?.vehicle_type ?? "").trim()
  })

  const customVehicleDimensionsReady = computed(() => {
    if (transportOrderVehicleType.value !== "Custom / Specialised Vehicle") return true

    return Boolean(loadSpaceFromCustomRoadDetail())
  })

  const isActiveLoadPlannerRoute = computed(() => route.name === "tms.jobs.show.load-planner")

  const vehicleTypeRequired = computed(() => {
    return (
      isActiveLoadPlannerRoute.value &&
      currentMode.value === "road" &&
      (!transportOrderVehicleType.value || !customVehicleDimensionsReady.value) &&
      !vehicleTypeRedirecting.value
    )
  })

  const loadSpaceRequiredMessage = computed(() => {
    if (transportOrderVehicleType.value === "Custom / Specialised Vehicle") {
      return "Custom vehicle dimensions are required before planning or printing the load."
    }

    return "Load Space now comes from the Road Transport Order, so a vehicle type is required before planning or printing the load."
  })

  function goToTransportOrder() {
    vehicleTypeRedirecting.value = true
    router.push({
      name: "tms.jobs.show.transport",
      params: route.params,
      query: route.query,
    })
  }

  watch(
    () => route.name,
    name => {
      if (name === "tms.jobs.show.load-planner") {
        vehicleTypeRedirecting.value = false
      }
    },
  )

  const vehicleLabel = computed(() => {
    if (currentMode.value === "road" && transportOrderVehicleType.value) {
      const customLoadSpace = loadSpaceFromCustomRoadDetail()

      if (customLoadSpace) {
        return `${transportOrderVehicleType.value} (${customLoadSpace.l} x ${customLoadSpace.w} x ${customLoadSpace.h} cm)`
      }

      return transportOrderVehicleType.value
    }

    const preset = SPACE_PRESETS[spacePresetKey.value]
    if (preset) return preset.label

    return `${space.l} x ${space.w} x ${space.h} cm`
  })

  const modeLabel = computed(() => {
    if (currentMode.value === "rail") return "Rail"
    if (currentMode.value === "sea") return "Sea"

    return "Road"
  })
  const isConsolidationJob = computed(() => form.job_type === "consolidation")

  function colorAt(index: number) {
    return COLORS[index % COLORS.length] ?? DEFAULT_COLOR
  }

  function spacePresetLabel(key: string) {
    return SPACE_PRESETS[key]?.label ?? key
  }

  function normalizeDimensionCm(value: unknown) {
    const number = Number(value || 0)

    if (!Number.isFinite(number) || number <= 0) return 0

    // Some imported/demo rows arrive in metres (e.g. 1.2) even though package fields are named cm.
    return number > 0 && number <= 20 && !Number.isInteger(number) ? number * 100 : number
  }

  const standardJobPackages = computed<LoadUnit[]>(() => {
    return (Array.isArray(form.packages) ? form.packages : [])
      .map((row: any, index: number) => {
        const type = normalizeUnitType(row.package_type)
        const length = normalizeDimensionCm(row.lengthCm ?? row.length_cm ?? row.length ?? 0)
        const width = normalizeDimensionCm(row.widthCm ?? row.width_cm ?? row.width ?? 0)
        const height = normalizeDimensionCm(row.heightCm ?? row.height_cm ?? row.height ?? 0)
        const qty = Number(row.quantity ?? row.qty ?? 1)
        const weight = Number(row.grossWeightKg ?? row.weight ?? row.grossWeight ?? 0)

        return {
          id: `job-${row.id ?? index}`,
          sourceId: row.id,
          type,
          desc: row.package_type || titleCase(type),
          l: length,
          w: width,
          h: height,
          wt: weight,
          qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
          stackable: Boolean(row.stackable),
          adr: Boolean(row.adr),
          color: colorAt(index),
        }
      })
      .filter(unit => unit.l > 0 && unit.w > 0 && unit.h > 0 && unit.qty > 0)
  })

  const collectionOrderPackages = computed<LoadUnit[]>(() => {
    const orders = Array.isArray(form.consolidation_details?.collectionOrders)
      ? form.consolidation_details.collectionOrders
      : []
    const units: LoadUnit[] = []

    orders.forEach((order: any, orderIndex: number) => {
      const lines = Array.isArray(order?.lines) ? order.lines : []
      const orderRef = String(order?.coRef ?? order?.co_ref ?? order?.reference ?? "").trim()

      lines.forEach((line: any, lineIndex: number) => {
        const type = normalizeUnitType(line.packageType ?? line.package_type)
        const length = normalizeDimensionCm(line.length ?? line.length_cm ?? 0)
        const width = normalizeDimensionCm(line.width ?? line.width_cm ?? 0)
        const height = normalizeDimensionCm(line.height ?? line.height_cm ?? 0)
        const qty = Number(line.qty ?? line.quantity ?? 1)
        const weight = Number(
          line.grossWeight ?? line.gross_weight ?? line.weightKg ?? line.weight ?? 0,
        )
        const packageLabel =
          String(line.packageType ?? line.package_type ?? "").trim() || titleCase(type)

        units.push({
          id: `collection-${order?.id ?? orderIndex}-${line?.id ?? lineIndex}`,
          sourceId: line?.id,
          type,
          desc: orderRef ? `${orderRef} - ${packageLabel}` : packageLabel,
          l: length,
          w: width,
          h: height,
          wt: Number.isFinite(weight) ? weight : 0,
          qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
          stackable: Boolean(line.stackable),
          adr: Boolean(line.adr || order?.hazardous),
          color: colorAt(units.length),
        })
      })
    })

    return units.filter(unit => unit.l > 0 && unit.w > 0 && unit.h > 0 && unit.qty > 0)
  })

  const jobPackages = computed<LoadUnit[]>(() => {
    if (isConsolidationJob.value && collectionOrderPackages.value.length) {
      return collectionOrderPackages.value
    }

    return standardJobPackages.value
  })

  const localPackages = computed(() => jobPackages.value)
  const loadUnitEmptyMessage = computed(() => {
    return isConsolidationJob.value
      ? "Add package lines in Collection Orders to build the load plan."
      : "Add package dimensions in the Packages tab to build the load plan."
  })

  const totalUnits = computed(() => localPackages.value.reduce((sum, unit) => sum + unit.qty, 0))
  const totalWeight = computed(() => {
    return localPackages.value.reduce((sum, unit) => sum + unit.wt * unit.qty, 0)
  })
  const unplacedCounts = computed(() => {
    const counts = new Map<string, number>()

    for (const unit of layout.value?.unplacedAll ?? []) {
      counts.set(unit.id, (counts.get(unit.id) ?? 0) + 1)
    }

    return counts
  })
  const placedCounts = computed(() => {
    const counts = new Map<string, number>()

    for (const unit of layout.value?.allPlaced ?? []) {
      counts.set(unit.id, (counts.get(unit.id) ?? 0) + 1)
    }

    return counts
  })
  const unplacedIds = computed(() => new Set(unplacedCounts.value.keys()))
  const unplacedSummary = computed(() => {
    const names = new Map<string, { desc: string; count: number }>()

    for (const unit of layout.value?.unplacedAll ?? []) {
      const existing = names.get(unit.id)
      names.set(unit.id, {
        desc: unit.desc,
        count: (existing?.count ?? 0) + 1,
      })
    }

    return Array.from(names.values())
      .map(unit => `${unit.desc} x ${unit.count}`)
      .join(", ")
  })

  const stats = computed(() => {
    if (!layout.value) {
      return {
        units: totalUnits.value ? String(totalUnits.value) : "-",
        lenUsed: "-",
        weight: `${totalWeight.value.toFixed(1)} kg`,
        util: "-",
        unplaced: "-",
      }
    }

    const floorItems = layout.value.allPlaced.filter(unit => unit.z === 0)
    const usedLen = floorItems.length ? Math.max(...floorItems.map(unit => unit.x + unit.l)) : 0
    const floorArea = floorItems.reduce((sum, unit) => sum + unit.l * unit.w, 0)
    const util = Math.min(
      100,
      Math.round((floorArea / (layout.value.tLen * layout.value.tWid)) * 100),
    )

    return {
      units: String(totalUnits.value),
      lenUsed: `${usedLen.toFixed(0)} cm`,
      weight: `${totalWeight.value.toFixed(1)} kg`,
      util: `${util}%`,
      unplaced: String(layout.value.unplacedAll.length),
    }
  })

  const overweight = computed(() => totalWeight.value > Number(space.maxWt || 0))
  const printDate = computed(() => new Date().toLocaleDateString("en-GB", { dateStyle: "full" }))

  function normalizeUnitType(value: unknown): LoadUnitType {
    const text = String(value ?? "").toLowerCase()
    if (text.includes("pallet")) return "pallet"
    if (text.includes("carton")) return "carton"
    if (text.includes("crate")) return "crate"
    if (text.includes("drum")) return "drum"
    if (text.includes("bag")) return "bag"
    if (text.includes("ibc") || text.includes("tote")) return "ibc"
    if (text.includes("roll")) return "roll"

    return "other"
  }

  function titleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1).replace("_", " ")
  }

  function scheduleCalculate() {
    if (autoCalculateFrame) {
      window.cancelAnimationFrame(autoCalculateFrame)
    }

    autoCalculateFrame = window.requestAnimationFrame(() => {
      autoCalculateFrame = 0
      calculate()
    })
  }

  function unplacedCount(id: string) {
    return unplacedCounts.value.get(id) ?? 0
  }

  function placedCount(id: string) {
    return placedCounts.value.get(id) ?? 0
  }

  function hasPartialFit(unit: LoadUnit) {
    return placedCount(unit.id) > 0 && unplacedCount(unit.id) > 0
  }

  function fitStatusText(unit: LoadUnit) {
    const placed = placedCount(unit.id)
    const unplaced = unplacedCount(unit.id)

    if (placed && unplaced) return `Partial: ${placed} placed, ${unplaced} no space`
    if (unplaced) return `No space (${unplaced})`
    if (placed) return `Placed (${placed})`

    return "Pending layout"
  }

  function normalizeVehicleName(value: unknown) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[–—]/g, "-")
      .replace(/â€“/g, "-")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
  }

  function loadSpaceFromMetadata(metadata: unknown): LoadSpaceDefinition | null {
    if (!metadata || typeof metadata !== "object") return null

    const source = metadata as Record<string, unknown>
    const l = Number(source.length_cm ?? source.lengthCm ?? source.l ?? 0)
    const w = Number(source.width_cm ?? source.widthCm ?? source.w ?? 0)
    const h = Number(source.height_cm ?? source.heightCm ?? source.h ?? 0)
    const maxWt = Number(source.max_weight_kg ?? source.maxWeightKg ?? source.maxWt ?? 0)
    const palH = Number(source.pallet_base_cm ?? source.palletBaseCm ?? source.palH ?? 15)
    const presetKey = String(source.preset_key ?? source.presetKey ?? "").trim()

    if (![l, w, h, maxWt].every(value => Number.isFinite(value) && value > 0)) return null

    return {
      l,
      w,
      h,
      maxWt,
      palH: Number.isFinite(palH) && palH >= 0 ? palH : 15,
      presetKey: presetKey || undefined,
    }
  }

  function loadSpaceFromReferenceData(vehicleType: string): LoadSpaceDefinition | null {
    const category = referenceDataStore.getByKey("vehicle_types")
    const vehicleKey = normalizeVehicleName(vehicleType)
    const option = category?.options.find(item => normalizeVehicleName(item.name) === vehicleKey)

    return loadSpaceFromMetadata((option as any)?.metadata)
  }

  function loadSpaceFromCustomRoadDetail(): LoadSpaceDefinition | null {
    const roadDetail = form.road_detail as any
    const l = Number(roadDetail.vehicle_length_cm ?? 0)
    const w = Number(roadDetail.vehicle_width_cm ?? 0)
    const h = Number(roadDetail.vehicle_height_cm ?? 0)
    const maxWt = Number(roadDetail.vehicle_max_weight_kg ?? 0)
    const palH = Number(roadDetail.vehicle_pallet_base_cm ?? 15)

    if (![l, w, h, maxWt].every(value => Number.isFinite(value) && value > 0)) return null

    return {
      l,
      w,
      h,
      maxWt,
      palH: Number.isFinite(palH) && palH >= 0 ? palH : 15,
    }
  }

  function loadSpaceFallbackForVehicle(vehicleType: string): LoadSpaceDefinition | null {
    const name = normalizeVehicleName(vehicleType)
    const fromPreset = (presetKey: string, palH = 15): LoadSpaceDefinition => {
      const preset = SPACE_PRESETS[presetKey] ?? SPACE_PRESETS.road_curtainsider!

      return {
        l: preset.l,
        w: preset.w,
        h: preset.h,
        maxWt: preset.maxWt,
        palH,
        presetKey,
      }
    }

    if (name.includes("mega")) return fromPreset("road_mega")
    if (name.includes("flatbed")) return fromPreset("road_flatbed")
    if (name.includes("low loader")) return fromPreset("road_lowloader")
    if (name.includes("rigid 18") || name.includes("18t")) return fromPreset("road_18t")
    if (name.includes("rigid 26") || name === "rigid vehicle") {
      return { l: 920, w: 245, h: 260, maxWt: 15000, palH: 15 }
    }
    if (name.includes("7 5") || name.includes("7 5t")) return fromPreset("road_75t")
    if (name.includes("luton") || name.includes("box van")) return fromPreset("road_luton")
    if (name.includes("extra lwb")) return fromPreset("road_xlwb_van")
    if (name.includes("lwb")) return fromPreset("road_lwb_van")
    if (name.includes("mwb")) return fromPreset("road_mwb_van")
    if (name.includes("swb")) return fromPreset("road_swb_van")
    if (name.includes("small van") || name.includes("transit connect"))
      return fromPreset("road_small_van")
    if (name.includes("sprinter") || name.includes("transit")) return fromPreset("road_lwb_van")
    if (name.includes("car estate")) return { l: 180, w: 100, h: 80, maxWt: 400, palH: 0 }
    if (name.includes("motorbike")) return { l: 60, w: 40, h: 40, maxWt: 20, palH: 0 }
    if (name.includes("40ft hc") || name.includes("40 high cube")) return fromPreset("sea_40hc")
    if (name.includes("40ft") || name.includes("40 dry")) return fromPreset("sea_40dry")
    if (name.includes("20ft") || name.includes("20 dry")) return fromPreset("sea_20dry")
    if (
      name.includes("artic") ||
      name.includes("13 6") ||
      name.includes("curtainsider") ||
      name.includes("refrigerated")
    ) {
      return fromPreset("road_curtainsider")
    }

    return null
  }

  function defaultPresetKeyForMode() {
    if (currentMode.value === "sea") return "sea_40dry"
    if (currentMode.value === "rail") return "rail_box_wagon"

    return "road_curtainsider"
  }

  function applyLoadSpaceDefinition(definition: LoadSpaceDefinition) {
    space.l = definition.l
    space.w = definition.w
    space.h = definition.h
    space.maxWt = definition.maxWt
    space.palH = definition.palH ?? 15
    spacePresetKey.value =
      definition.presetKey && SPACE_PRESETS[definition.presetKey] ? definition.presetKey : ""
    scheduleCalculate()
  }

  function applyLoadSpaceFromTransportOrder() {
    if (currentMode.value === "road" && transportOrderVehicleType.value) {
      const definition =
        loadSpaceFromCustomRoadDetail() ??
        loadSpaceFromReferenceData(transportOrderVehicleType.value) ??
        loadSpaceFallbackForVehicle(transportOrderVehicleType.value)

      if (definition) {
        applyLoadSpaceDefinition(definition)
        return
      }
    }

    spacePresetKey.value = defaultPresetKeyForMode()
    applySpacePreset()
  }

  function applySpacePreset() {
    const preset = SPACE_PRESETS[spacePresetKey.value]
    if (!preset) {
      scheduleCalculate()
      return
    }

    space.l = preset.l
    space.w = preset.w
    space.h = preset.h
    space.maxWt = preset.maxWt
    scheduleCalculate()
  }

  function expandUnits(units: LoadUnit[]): PlacedUnit[] {
    return units.flatMap(unit => {
      return Array.from({ length: unit.qty }, (_, index) => ({
        ...unit,
        unitKey: `${unit.id}-${index}`,
        x: 0,
        y: 0,
        z: 0,
      }))
    })
  }

  function calculate() {
    const tLen = Number(space.l || 0)
    const tWid = Number(space.w || 0)
    const tHei = Number(space.h || 0)
    const palH = Number(space.palH || 0)
    const units = expandUnits(localPackages.value)

    if (!tLen || !tWid || !tHei || !units.length) {
      layout.value = null
      drawAll()
      return
    }

    const floorUnits = units.filter(unit => !unit.stackable).sort(sortByBulk)
    const stackUnits = units.filter(unit => unit.stackable).sort(sortByBulk)
    const { placed: floorPlaced, unplaced: floorUnplaced } = packStrip(floorUnits, tLen, tWid)
    const stackHeights = new Map<string, number>()
    const stackedPlaced: PlacedUnit[] = []
    const stackUnplaced: PlacedUnit[] = []

    floorPlaced.forEach(unit => {
      stackHeights.set(unit.unitKey, 0)
    })

    for (const unit of stackUnits) {
      let placed = false

      for (const base of floorPlaced) {
        const currentStack = stackHeights.get(base.unitKey) ?? 0
        const baseHeight = base.h + palH

        for (const orientation of pickOrientations(unit, base.w)) {
          if (
            orientation.ul <= base.l + 0.01 &&
            orientation.uw <= base.w + 0.01 &&
            baseHeight + currentStack + unit.h <= tHei + 0.01
          ) {
            stackedPlaced.push({
              ...unit,
              x: base.x,
              y: base.y,
              z: baseHeight + currentStack,
              l: orientation.ul,
              w: orientation.uw,
              h: unit.h,
              stacked: true,
            })
            stackHeights.set(base.unitKey, currentStack + unit.h)
            placed = true
            break
          }
        }

        if (placed) break
      }

      if (!placed) {
        const packed = packStripContinue([unit], tLen, tWid, floorPlaced)
        if (packed.placed.length) {
          floorPlaced.push(...packed.placed)
          packed.placed.forEach(item => stackHeights.set(item.unitKey, 0))
        } else {
          stackUnplaced.push(unit)
        }
      }
    }

    layout.value = {
      allPlaced: [...floorPlaced, ...stackedPlaced],
      unplacedAll: [...floorUnplaced, ...stackUnplaced],
      tLen,
      tWid,
      tHei,
      palH,
    }

    drawAll()
  }

  function sortByBulk(a: PlacedUnit, b: PlacedUnit) {
    return b.l * b.w * b.h - a.l * a.w * a.h
  }

  function packStrip(units: PlacedUnit[], tLen: number, tWid: number) {
    return packStripContinue(units, tLen, tWid, [])
  }

  function packStripContinue(
    units: PlacedUnit[],
    tLen: number,
    tWid: number,
    already: PlacedUnit[],
  ) {
    const placed: PlacedUnit[] = []
    const unplaced: PlacedUnit[] = []

    for (const unit of units) {
      const placement = findLeftPriorityPlacement(unit, tLen, tWid, [...already, ...placed])

      if (placement) {
        placed.push({ ...unit, ...placement, z: 0, h: unit.h })
      } else {
        unplaced.push(unit)
      }
    }

    return { placed, unplaced }
  }

  function findLeftPriorityPlacement(
    unit: PlacedUnit,
    tLen: number,
    tWid: number,
    occupied: PlacedUnit[],
  ) {
    const xCandidates = uniqueSorted([0, ...occupied.map(item => item.x + item.l)])
    const yCandidates = uniqueSorted([0, ...occupied.map(item => item.y + item.w)])
    const placements: Array<{ x: number; y: number; l: number; w: number }> = []

    for (const x of xCandidates) {
      for (const y of yCandidates) {
        for (const orientation of pickOrientations(unit, tWid)) {
          if (x + orientation.ul > tLen + 0.01 || y + orientation.uw > tWid + 0.01) continue

          const candidate = { x, y, l: orientation.ul, w: orientation.uw }
          if (occupied.some(item => floorRectsOverlap(candidate, item))) continue

          placements.push(candidate)
        }
      }
    }

    return placements.sort((a, b) => a.x - b.x || a.y - b.y || a.l * a.w - b.l * b.w)[0] ?? null
  }

  function uniqueSorted(values: number[]) {
    return Array.from(new Set(values.map(value => Number(value.toFixed(3)))))
      .filter(value => Number.isFinite(value) && value >= 0)
      .sort((a, b) => a - b)
  }

  function floorRectsOverlap(
    a: { x: number; y: number; l: number; w: number },
    b: { x: number; y: number; l: number; w: number },
  ) {
    return (
      a.x < b.x + b.l - 0.01 &&
      a.x + a.l > b.x + 0.01 &&
      a.y < b.y + b.w - 0.01 &&
      a.y + a.w > b.y + 0.01
    )
  }

  function pickOrientations(unit: PlacedUnit, tWid: number) {
    const options = [
      { ul: unit.l, uw: unit.w },
      { ul: unit.w, uw: unit.l },
    ]
    const valid = options.filter(option => option.uw <= tWid + 0.01)

    return (valid.length ? valid : options).sort((a, b) => a.uw - b.uw)
  }

  function drawAll() {
    nextTick(() => {
      drawTop()
      drawSide()
      draw3D()
    })
  }

  function prepareCanvas(canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const ratio = document.body.classList.contains("job-load-planner-printing")
      ? 3
      : window.devicePixelRatio || 1
    const width = Math.max(1, Math.round(rect.width * ratio))
    const height = Math.max(1, Math.round(rect.height * ratio))

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    return { ctx, width: rect.width, height: rect.height }
  }

  function drawTop() {
    const canvas = canvasTop.value
    const plan = layout.value
    if (!canvas) return

    const prepared = prepareCanvas(canvas)
    if (!prepared) return

    const { ctx, width, height } = prepared
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, width, height)

    if (!plan) {
      drawEmptyCanvas(ctx, width, height, "Calculate a layout to show the top view")
      return
    }

    const pad = 38
    const scale = Math.min((width - pad * 2) / plan.tLen, (height - pad * 2) / plan.tWid)
    const drawW = plan.tLen * scale
    const drawH = plan.tWid * scale

    ctx.save()
    ctx.translate(pad, pad)
    ctx.fillStyle = "#f1f1ee"
    ctx.strokeStyle = "#454545"
    ctx.lineWidth = 2
    ctx.fillRect(0, 0, drawW, drawH)
    ctx.strokeRect(0, 0, drawW, drawH)

    for (const unit of plan.allPlaced.filter(item => item.z === 0)) {
      drawTopUnit(ctx, unit, scale, Boolean(showPalBases.value && plan.palH > 0))
    }

    for (const unit of plan.allPlaced.filter(item => item.z > 0)) {
      drawTopUnit(ctx, unit, scale, false, true)
    }

    ctx.restore()
    drawDimension(ctx, pad, height - 12, pad + drawW, height - 12, `${plan.tLen} cm`)
    drawDimension(ctx, 12, pad, 12, pad + drawH, `${plan.tWid} cm`, true)
  }

  function drawTopUnit(
    ctx: CanvasRenderingContext2D,
    unit: PlacedUnit,
    scale: number,
    showPalletBase: boolean,
    stacked = false,
  ) {
    const x = unit.x * scale
    const y = unit.y * scale
    const w = unit.l * scale
    const h = unit.w * scale
    const inset = stacked ? 7 : showPalletBase ? 4 : 1

    if (showPalletBase) {
      ctx.fillStyle = "#c8a879"
      ctx.fillRect(x + 1, y + 1, Math.max(0, w - 2), Math.max(0, h - 2))
    }

    ctx.fillStyle = stacked ? `${unit.color}66` : `${unit.color}cc`
    ctx.strokeStyle = unit.color
    ctx.lineWidth = stacked ? 1 : 1.4
    if (stacked) ctx.setLineDash([4, 3])
    ctx.fillRect(x + inset, y + inset, Math.max(0, w - inset * 2), Math.max(0, h - inset * 2))
    ctx.strokeRect(x + inset, y + inset, Math.max(0, w - inset * 2), Math.max(0, h - inset * 2))
    ctx.setLineDash([])

    if (w > 28 && h > 18) {
      ctx.fillStyle = "rgba(17, 24, 39, 0.75)"
      ctx.font = "700 10px system-ui"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(trimLabel(unit.desc, Math.max(4, Math.floor(w / 7))), x + w / 2, y + h / 2)
    }
  }

  function drawSide() {
    const canvas = canvasSide.value
    const plan = layout.value
    if (!canvas) return

    const prepared = prepareCanvas(canvas)
    if (!prepared) return

    const { ctx, width, height } = prepared
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, width, height)

    if (!plan) {
      drawEmptyCanvas(ctx, width, height, "Calculate a layout to show the side view")
      return
    }

    const pad = 38
    const scale = Math.min((width - pad * 2) / plan.tLen, (height - pad * 2) / plan.tHei)
    const drawW = plan.tLen * scale
    const drawH = plan.tHei * scale

    ctx.save()
    ctx.translate(pad, pad)
    ctx.fillStyle = "#f1f1ee"
    ctx.strokeStyle = "#454545"
    ctx.lineWidth = 2
    ctx.fillRect(0, 0, drawW, drawH)
    ctx.strokeRect(0, 0, drawW, drawH)

    for (const unit of [...plan.allPlaced].sort((a, b) => a.z - b.z)) {
      const x = unit.x * scale
      const w = unit.l * scale
      const base = unit.z + (unit.z === 0 && showPalBases.value ? plan.palH : 0)
      const y = drawH - (base + unit.h) * scale
      const h = unit.h * scale

      if (showPalBases.value && plan.palH > 0 && unit.z === 0) {
        ctx.fillStyle = "#c8a879"
        ctx.fillRect(x + 1, drawH - plan.palH * scale, Math.max(0, w - 2), plan.palH * scale)
      }

      ctx.fillStyle = `${unit.color}cc`
      ctx.strokeStyle = unit.color
      ctx.lineWidth = 1.4
      ctx.fillRect(x + 1, y, Math.max(0, w - 2), h)
      ctx.strokeRect(x + 1, y, Math.max(0, w - 2), h)
    }

    ctx.restore()
    drawDimension(ctx, pad, height - 12, pad + drawW, height - 12, `${plan.tLen} cm`)
    drawDimension(ctx, 12, pad, 12, pad + drawH, `${plan.tHei} cm`, true)
  }

  function draw3D() {
    const plan = layout.value
    if (!ensure3DRenderer()) return

    clear3DObjects()

    if (!plan || !scene3d || !renderer3d || !camera3d) {
      render3DFrame()
      return
    }

    add3DContainer(plan)
    add3DFloor(plan)

    if (light3d) {
      light3d.position.set(plan.tLen, plan.tHei * 2, plan.tWid)
    }

    for (const unit of plan.allPlaced) {
      const baseZ = unit.z + (unit.z === 0 && showPalBases.value ? plan.palH : 0)

      if (showPalBases.value && plan.palH > 0 && unit.z === 0) {
        add3DBox(
          unit.x + unit.l / 2,
          plan.palH / 2,
          unit.y + unit.w / 2,
          unit.l,
          plan.palH,
          unit.w,
          "#c8a879",
          0.95,
        )
      }

      add3DBox(
        unit.x + unit.l / 2,
        baseZ + unit.h / 2,
        unit.y + unit.w / 2,
        unit.l,
        unit.h,
        unit.w,
        unit.color,
        0.88,
      )
    }

    add3DUnplaced(plan)

    if (!orbit3d) {
      reset3DCamera()
    }

    render3DFrame()
  }

  function ensure3DRenderer() {
    const canvas = canvas3d.value
    if (!canvas || !canvas.clientWidth || !canvas.clientHeight) return false

    if (!renderer3d) {
      renderer3d = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer3d.setPixelRatio(window.devicePixelRatio || 1)
      renderer3d.setClearColor(0x1a1a2e, 1)
      scene3d = new THREE.Scene()
      camera3d = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        1,
        500000,
      )
      scene3d.add(new THREE.AmbientLight(0xffffff, 0.6))
      light3d = new THREE.DirectionalLight(0xffffff, 0.85)
      scene3d.add(light3d)
    }

    renderer3d.setSize(canvas.clientWidth, canvas.clientHeight, false)
    if (camera3d) {
      camera3d.aspect = canvas.clientWidth / canvas.clientHeight
      camera3d.updateProjectionMatrix()
    }

    return true
  }

  function add3DContainer(plan: PlannerLayout) {
    add3DEdge(
      plan.tLen / 2,
      plan.tHei / 2,
      plan.tWid / 2,
      plan.tLen,
      plan.tHei,
      plan.tWid,
      0x94a3b8,
    )
  }

  function add3DFloor(plan: PlannerLayout) {
    if (!scene3d) return

    const geometry = new THREE.PlaneGeometry(plan.tLen, plan.tWid)
    const material = new THREE.MeshLambertMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
    })
    const floor = new THREE.Mesh(geometry, material)
    floor.rotation.x = -Math.PI / 2
    floor.position.set(plan.tLen / 2, 0, plan.tWid / 2)
    scene3d.add(floor)
    sceneObjects3d.push(floor)
  }

  function add3DBox(
    cx: number,
    cy: number,
    cz: number,
    width: number,
    height: number,
    depth: number,
    color: string,
    opacity = 0.88,
  ) {
    if (!scene3d) return

    const geometry = new THREE.BoxGeometry(width, height, depth)
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color(color),
      opacity,
      transparent: opacity < 1,
      wireframe: wireframe3d.value,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(cx, cy, cz)
    scene3d.add(mesh)
    sceneObjects3d.push(mesh)

    if (!wireframe3d.value) {
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({
          color: 0x000000,
          opacity: 0.15,
          transparent: true,
        }),
      )
      edges.position.copy(mesh.position)
      scene3d.add(edges)
      sceneObjects3d.push(edges)
    }
  }

  function add3DEdge(
    cx: number,
    cy: number,
    cz: number,
    width: number,
    height: number,
    depth: number,
    color: number,
  ) {
    if (!scene3d) return

    const geometry = new THREE.BoxGeometry(width, height, depth)
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color }),
    )
    edge.position.set(cx, cy, cz)
    scene3d.add(edge)
    sceneObjects3d.push(edge)
  }

  function add3DUnplaced(plan: PlannerLayout) {
    if (!plan.unplacedAll.length) return

    const groups = new Map<string, { unit: PlacedUnit; count: number }>()

    for (const unit of plan.unplacedAll) {
      const existing = groups.get(unit.id)
      groups.set(unit.id, {
        unit,
        count: (existing?.count ?? 0) + 1,
      })
    }

    const gap = Math.max(35, plan.tWid * 0.2)
    const sideZ = plan.tWid + gap
    let cursorX = 0

    Array.from(groups.values()).forEach(({ unit, count }) => {
      const width = Math.min(unit.l, plan.tLen * 0.28)
      const depth = Math.min(unit.w, plan.tWid * 0.9)
      const height = Math.min(unit.h, plan.tHei * 0.9)
      const x = Math.min(cursorX + width / 2, Math.max(width / 2, plan.tLen - width / 2))

      add3DBox(x, height / 2, sideZ + depth / 2, width, height, depth, "#dc2626", 0.88)
      add3DLabel(
        `No space x${count}`,
        new THREE.Vector3(x, height + Math.max(14, plan.tHei * 0.05), sideZ + depth / 2),
      )

      cursorX += width + gap
    })
  }

  function add3DLabel(text: string, position: THREE.Vector3) {
    if (!scene3d) return

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) return

    canvas.width = 256
    canvas.height = 64
    context.fillStyle = "#dc2626"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "#ffffff"
    context.font = "800 24px system-ui"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
    })
    const sprite = new THREE.Sprite(material)
    sprite.position.copy(position)
    sprite.scale.set(130, 32, 1)
    scene3d.add(sprite)
    sceneObjects3d.push(sprite)
  }

  function render3DFrame() {
    if (!renderer3d || !scene3d || !camera3d) return
    renderer3d.render(scene3d, camera3d)
  }

  function reset3DCamera() {
    const plan = layout.value
    if (!plan || !camera3d) return

    orbit3d = {
      target: new THREE.Vector3(plan.tLen / 2, plan.tHei / 3, plan.tWid / 2),
      dragging: false,
      rightDrag: false,
      lastX: 0,
      lastY: 0,
      theta: 0.7,
      phi: 0.6,
      radius: Math.max(plan.tLen, plan.tWid, plan.tHei) * 2.2,
    }
    update3DCamera()
  }

  function update3DCamera() {
    if (!camera3d || !orbit3d) return

    const { target, theta, phi, radius } = orbit3d
    camera3d.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta),
    )
    camera3d.lookAt(target)
    render3DFrame()
  }

  function clear3DObjects() {
    if (!scene3d) return

    sceneObjects3d.forEach(object => {
      scene3d?.remove(object)
      dispose3DObject(object)
    })
    sceneObjects3d = []
  }

  function dispose3DObject(object: THREE.Object3D) {
    const mesh = object as THREE.Mesh | THREE.LineSegments | THREE.Sprite
    const geometry = (mesh as THREE.Mesh | THREE.LineSegments).geometry as
      | THREE.BufferGeometry
      | undefined
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined

    geometry?.dispose()

    const disposeMaterial = (item: THREE.Material) => {
      const spriteMaterial = item as THREE.SpriteMaterial
      spriteMaterial.map?.dispose()
      item.dispose()
    }

    if (Array.isArray(material)) {
      material.forEach(disposeMaterial)
    } else {
      material && disposeMaterial(material)
    }
  }

  function destroy3DRenderer() {
    clear3DObjects()
    renderer3d?.dispose()
    renderer3d = null
    scene3d = null
    camera3d = null
    light3d = null
    orbit3d = null
  }

  function drawDimension(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    label: string,
    vertical = false,
  ) {
    ctx.save()
    ctx.strokeStyle = "#737373"
    ctx.fillStyle = "#737373"
    ctx.lineWidth = 1
    ctx.font = "10px system-ui"
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    if (vertical) {
      ctx.translate(mx - 4, my)
      ctx.rotate(-Math.PI / 2)
      ctx.textAlign = "center"
      ctx.fillText(label, 0, 0)
    } else {
      ctx.textAlign = "center"
      ctx.fillText(label, mx, my - 5)
    }

    ctx.restore()
  }

  function drawEmptyCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    text: string,
    color = "#737373",
  ) {
    ctx.fillStyle = color
    ctx.font = "700 13px system-ui"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, width / 2, height / 2)
  }

  function trimLabel(value: string, max: number) {
    return value.length > max ? `${value.slice(0, Math.max(1, max - 1))}...` : value
  }

  function handle3DMouseDown(event: MouseEvent) {
    if (!orbit3d) reset3DCamera()
    if (!orbit3d) return

    orbit3d.dragging = true
    orbit3d.rightDrag = event.button === 2
    orbit3d.lastX = event.clientX
    orbit3d.lastY = event.clientY
    event.preventDefault()
  }

  function handle3DMouseMove(event: MouseEvent) {
    if (!orbit3d?.dragging) return

    const dx = event.clientX - orbit3d.lastX
    const dy = event.clientY - orbit3d.lastY
    orbit3d.lastX = event.clientX
    orbit3d.lastY = event.clientY

    if (orbit3d.rightDrag) {
      const scale = orbit3d.radius * 0.001
      orbit3d.target.x -= dx * scale
      orbit3d.target.y += dy * scale
    } else {
      orbit3d.theta -= dx * 0.005
      orbit3d.phi = Math.max(0.05, Math.min(Math.PI - 0.05, orbit3d.phi - dy * 0.005))
    }

    update3DCamera()
  }

  function handle3DMouseUp() {
    if (orbit3d) orbit3d.dragging = false
  }

  function handle3DWheel(event: WheelEvent) {
    event.preventDefault()
    if (!orbit3d) reset3DCamera()
    if (!orbit3d) return

    orbit3d.radius = Math.max(10, orbit3d.radius * (1 + event.deltaY * 0.001))
    update3DCamera()
  }

  function reset3D() {
    reset3DCamera()
    render3DFrame()
  }

  function toggleWireframe3D() {
    wireframe3d.value = !wireframe3d.value
    draw3D()
  }

  function waitForFrame() {
    return new Promise<void>(resolve => {
      window.requestAnimationFrame(() => resolve())
    })
  }

  async function waitForPrintableCanvasLayout() {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await nextTick()
      await waitForFrame()

      const topRect = canvasTop.value?.getBoundingClientRect()
      const sideRect = canvasSide.value?.getBoundingClientRect()
      const topReady = Boolean(topRect && topRect.width > 20 && topRect.height > 20)
      const sideReady = Boolean(sideRect && sideRect.width > 20 && sideRect.height > 20)

      if (topReady && sideReady) return
    }
  }

  async function preparePrintableViews() {
    activeView.value = "2d"
    if (autoCalculateFrame) {
      window.cancelAnimationFrame(autoCalculateFrame)
      autoCalculateFrame = 0
    }

    calculate()
    enablePrintMode()
    await nextTick()
    await waitForFrame()
    await waitForPrintableCanvasLayout()
    drawTop()
    drawSide()
    await waitForFrame()
  }

  async function printPlan() {
    if (isPreparingPrint.value) return

    isPreparingPrint.value = true
    let printOpened = false

    try {
      await preparePrintableViews()
      await nextTick()
      await waitForFrame()
      drawTop()
      drawSide()
      window.print()
      printOpened = true
    } finally {
      isPreparingPrint.value = false
      if (!printOpened) {
        disablePrintMode()
        await nextTick()
        drawAll()
      }
    }
  }

  function enablePrintMode() {
    document.body.classList.add("job-load-planner-printing")
  }

  function disablePrintMode() {
    document.body.classList.remove("job-load-planner-printing")
  }

  function handleBeforePrint() {
    enablePrintMode()
    nextTick(() => {
      window.requestAnimationFrame(() => {
        drawTop()
        drawSide()
      })
    })
  }

  function handleAfterPrint() {
    disablePrintMode()
    nextTick(() => window.requestAnimationFrame(drawAll))
  }

  watch(
    () => [space.l, space.w, space.h, space.maxWt, space.palH, showPalBases.value],
    () => scheduleCalculate(),
  )

  watch(
    () => [
      form.mode_of_transport,
      (form.road_detail as any)?.vehicle_type,
      (form.road_detail as any)?.local_vehicle_required,
      referenceDataStore.getByKey("vehicle_types")?.options.length ?? 0,
    ],
    () => applyLoadSpaceFromTransportOrder(),
    { flush: "post", immediate: true },
  )

  watch(
    localPackages,
    () => {
      scheduleCalculate()
    },
    { deep: true, flush: "post" },
  )

  watch(activeView, () => {
    nextTick(() => window.requestAnimationFrame(drawAll))
  })

  watch(wireframe3d, () => {
    nextTick(() => window.requestAnimationFrame(draw3D))
  })

  onMounted(() => {
    applyLoadSpaceFromTransportOrder()
    calculate()
    window.addEventListener("mouseup", handle3DMouseUp)
    window.addEventListener("resize", drawAll)
    window.addEventListener("beforeprint", handleBeforePrint)
    window.addEventListener("afterprint", handleAfterPrint)
  })

  onUnmounted(() => {
    if (autoCalculateFrame) {
      window.cancelAnimationFrame(autoCalculateFrame)
      autoCalculateFrame = 0
    }

    window.removeEventListener("mouseup", handle3DMouseUp)
    window.removeEventListener("resize", drawAll)
    window.removeEventListener("beforeprint", handleBeforePrint)
    window.removeEventListener("afterprint", handleAfterPrint)
    disablePrintMode()
    destroy3DRenderer()
  })

  return {
    activeView,
    isPreparingPrint,
    spacePresetKey,
    layout,
    showPalBases,
    wireframe3d,
    canvasTop,
    canvasSide,
    canvas3d,
    space,
    jobRefLocal,
    vehicleLabel,
    vehicleTypeRequired,
    loadSpaceRequiredMessage,
    goToTransportOrder,
    modeLabel,
    presetGroups,
    localPackages,
    loadUnitEmptyMessage,
    unplacedIds,
    unplacedSummary,
    stats,
    overweight,
    printDate,
    spacePresetLabel,
    applySpacePreset,
    calculate,
    unplacedCount,
    placedCount,
    hasPartialFit,
    fitStatusText,
    printPlan,
    handle3DMouseDown,
    handle3DMouseMove,
    handle3DWheel,
    reset3D,
    toggleWireframe3D,
  }
}
