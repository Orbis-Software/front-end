<script setup lang="ts">
import * as THREE from "three"
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue"
import "./LoadPlannerPanel.css"

type LoadMode = "road" | "rail" | "sea"
type LoadUnitType = "pallet" | "carton" | "crate" | "drum" | "bag" | "ibc" | "roll" | "other"

type SpacePreset = {
  l: number
  w: number
  h: number
  maxWt: number
  mode: LoadMode
  label: string
}

type LoadSpaceDefinition = {
  l: number
  w: number
  h: number
  maxWt: number
  palH: number
  presetKey?: string
}

type LoadUnit = {
  id: string
  sourceId?: string | number
  type: LoadUnitType
  desc: string
  l: number
  w: number
  h: number
  wt: number
  qty: number
  stackable: boolean
  adr: boolean
  color: string
}

type LoadPlannerSourcePackage = {
  id?: string | number
  sourceId?: string | number
  type?: string
  packageType?: string
  package_type?: string
  desc?: string
  description?: string
  l?: number | string
  length?: number | string
  lengthCm?: number | string
  length_cm?: number | string
  w?: number | string
  width?: number | string
  widthCm?: number | string
  width_cm?: number | string
  h?: number | string
  height?: number | string
  heightCm?: number | string
  height_cm?: number | string
  wt?: number | string
  weight?: number | string
  weightKg?: number | string
  grossWeight?: number | string
  gross_weight?: number | string
  grossWeightKg?: number | string
  qty?: number | string
  quantity?: number | string
  pieces?: number | string
  stackable?: boolean
  adr?: boolean
  color?: string
}

type PlacedUnit = LoadUnit & {
  unitKey: string
  x: number
  y: number
  z: number
  l: number
  w: number
  h: number
  stacked?: boolean
}

type PlannerLayout = {
  allPlaced: PlacedUnit[]
  unplacedAll: PlacedUnit[]
  tLen: number
  tWid: number
  tHei: number
  palH: number
}

type Orbit3D = {
  target: THREE.Vector3
  dragging: boolean
  rightDrag: boolean
  lastX: number
  lastY: number
  theta: number
  phi: number
  radius: number
}

const props = withDefaults(
  defineProps<{
    packages?: LoadPlannerSourcePackage[]
    planRef?: string
    referenceLabel?: string
    transportMode?: string
    emptyMessage?: string
    vehicleType?: string
    vehicleLoadSpace?: Record<string, unknown> | null
    lockVehicleType?: boolean
  }>(),
  {
    packages: () => [],
    planRef: "",
    referenceLabel: "Reference",
    transportMode: "road",
    emptyMessage: "Add package dimensions or add a manual unit here.",
    vehicleType: "",
    vehicleLoadSpace: null,
    lockVehicleType: false,
  },
)

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
  road_standard: {
    l: 1360,
    w: 240,
    h: 270,
    maxWt: 26000,
    mode: "road",
    label: "Standard Curtainsider / Box (13.6 m)",
  },
  road_mega: {
    l: 1360,
    w: 240,
    h: 300,
    maxWt: 26000,
    mode: "road",
    label: "Mega Trailer (13.6 m)",
  },
  road_flatbed: { l: 1360, w: 240, h: 400, maxWt: 26000, mode: "road", label: "Flatbed (13.6 m)" },
  road_lowloader: { l: 1200, w: 300, h: 180, maxWt: 40000, mode: "road", label: "Low Loader" },
  road_rigid18: { l: 900, w: 240, h: 250, maxWt: 11000, mode: "road", label: "Rigid 18t" },
  road_rigid75: { l: 640, w: 230, h: 220, maxWt: 3500, mode: "road", label: "Rigid 7.5t" },
  road_luton: { l: 380, w: 200, h: 185, maxWt: 900, mode: "road", label: "Luton / Box Van" },
  road_sprinter: {
    l: 290,
    w: 165,
    h: 165,
    maxWt: 900,
    mode: "road",
    label: "Sprinter / Transit Van",
  },
  rail_fea: { l: 1980, w: 246, h: 290, maxWt: 68500, mode: "rail", label: "FEA Spine Wagon (UK)" },
  rail_ika: { l: 2092, w: 278, h: 290, maxWt: 70000, mode: "rail", label: "IKA Bogie Flat (UK)" },
  rail_covered_eu: {
    l: 2100,
    w: 278,
    h: 270,
    maxWt: 58000,
    mode: "rail",
    label: "Covered Wagon Habiss (EU)",
  },
  rail_open_eu: {
    l: 1400,
    w: 280,
    h: 180,
    maxWt: 55000,
    mode: "rail",
    label: "Open Wagon Eaos (EU)",
  },
  rail_flat_eu: { l: 1980, w: 280, h: 400, maxWt: 60000, mode: "rail", label: "Flat Wagon (EU)" },
  sea_20std: {
    l: 589,
    w: 235,
    h: 239,
    maxWt: 21700,
    mode: "sea",
    label: "20ft Standard Container",
  },
  sea_40std: {
    l: 1203,
    w: 235,
    h: 239,
    maxWt: 26580,
    mode: "sea",
    label: "40ft Standard Container",
  },
  sea_40hc: {
    l: 1203,
    w: 235,
    h: 269,
    maxWt: 26330,
    mode: "sea",
    label: "40ft High Cube Container",
  },
  sea_45hc: {
    l: 1352,
    w: 235,
    h: 269,
    maxWt: 27700,
    mode: "sea",
    label: "45ft High Cube Container",
  },
  sea_20reefer: {
    l: 550,
    w: 225,
    h: 220,
    maxWt: 20000,
    mode: "sea",
    label: "20ft Reefer Container",
  },
  sea_40reefer: {
    l: 1167,
    w: 225,
    h: 220,
    maxWt: 22000,
    mode: "sea",
    label: "40ft Reefer Container",
  },
  sea_20ot: { l: 589, w: 235, h: 234, maxWt: 21500, mode: "sea", label: "20ft Open Top Container" },
  sea_40ot: {
    l: 1203,
    w: 235,
    h: 233,
    maxWt: 26000,
    mode: "sea",
    label: "40ft Open Top Container",
  },
  sea_20fr: { l: 562, w: 222, h: 213, maxWt: 27000, mode: "sea", label: "20ft Flat Rack" },
  sea_40fr: { l: 1203, w: 201, h: 213, maxWt: 39000, mode: "sea", label: "40ft Flat Rack" },
}

const UNIT_PRESETS: Partial<
  Record<LoadUnitType, { l: number; w: number; h: number; stackable: boolean }>
> = {
  pallet: { l: 120, w: 100, h: 175, stackable: false },
  carton: { l: 60, w: 40, h: 40, stackable: true },
  crate: { l: 120, w: 80, h: 100, stackable: false },
  drum: { l: 60, w: 60, h: 90, stackable: false },
  bag: { l: 80, w: 50, h: 50, stackable: true },
  ibc: { l: 120, w: 100, h: 120, stackable: false },
  roll: { l: 120, w: 90, h: 90, stackable: false },
}

const presetGroups = [
  {
    label: "Road Freight",
    keys: [
      "road_standard",
      "road_mega",
      "road_flatbed",
      "road_lowloader",
      "road_rigid18",
      "road_rigid75",
      "road_luton",
      "road_sprinter",
    ],
  },
  {
    label: "Rail Freight",
    keys: ["rail_fea", "rail_ika", "rail_covered_eu", "rail_open_eu", "rail_flat_eu"],
  },
  {
    label: "Sea Freight",
    keys: [
      "sea_20std",
      "sea_40std",
      "sea_40hc",
      "sea_45hc",
      "sea_20reefer",
      "sea_40reefer",
      "sea_20ot",
      "sea_40ot",
      "sea_20fr",
      "sea_40fr",
    ],
  },
]

const activeView = ref<"2d" | "3d">("2d")
const isPreparingPrint = ref(false)
const spacePresetKey = ref("road_standard")
const layout = ref<PlannerLayout | null>(null)
const showPalBases = ref(true)
const wireframe3d = ref(false)
const canvasTop = ref<HTMLCanvasElement | null>(null)
const canvasSide = ref<HTMLCanvasElement | null>(null)
const canvas3d = ref<HTMLCanvasElement | null>(null)
const manualUnits = ref<LoadUnit[]>([])
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

const formUnit = reactive({
  type: "pallet" as LoadUnitType,
  l: 120,
  w: 100,
  h: 175,
  wt: 0,
  qty: 1,
  stackable: false,
  adr: false,
})

const jobRefLocal = computed({
  get() {
    return props.planRef || ""
  },
  set() {},
})

function loadSpaceFromMetadata(
  metadata: Record<string, unknown> | null,
): LoadSpaceDefinition | null {
  if (!metadata) return null

  const l = Number(metadata.length_cm ?? metadata.lengthCm ?? metadata.l ?? 0)
  const w = Number(metadata.width_cm ?? metadata.widthCm ?? metadata.w ?? 0)
  const h = Number(metadata.height_cm ?? metadata.heightCm ?? metadata.h ?? 0)
  const maxWt = Number(metadata.max_weight_kg ?? metadata.maxWeightKg ?? metadata.maxWt ?? 0)
  const palH = Number(metadata.pallet_base_cm ?? metadata.palletBaseCm ?? metadata.palH ?? 15)
  const presetKey = String(metadata.preset_key ?? metadata.presetKey ?? "").trim()

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

const usesExternalVehicle = computed(
  () => props.lockVehicleType && String(props.transportMode).toLowerCase() === "road",
)
const externalLoadSpace = computed(() => loadSpaceFromMetadata(props.vehicleLoadSpace))
const hasUsableSpaceDimensions = computed(() =>
  [space.l, space.w, space.h, space.maxWt].every(value => Number.isFinite(value) && value > 0),
)
const loadSpaceBlocked = computed(
  () =>
    usesExternalVehicle.value &&
    (!props.vehicleType.trim() || (!externalLoadSpace.value && !hasUsableSpaceDimensions.value)),
)
const loadSpaceRequiredMessage = computed(() => {
  if (!props.vehicleType.trim()) return "Select the Vehicle Type in Shipment Summary first."

  return "This vehicle has no Reference Data dimensions. Enter its load-space dimensions below."
})

const vehicleLabel = computed(() => {
  if (usesExternalVehicle.value) return props.vehicleType.trim() || "Vehicle type not selected"

  const preset = SPACE_PRESETS[spacePresetKey.value]
  if (preset) return preset.label

  return `${space.l} x ${space.w} x ${space.h} cm`
})

const modeLabel = computed(() => {
  const preset = SPACE_PRESETS[spacePresetKey.value]
  if (preset?.mode === "rail") return "Rail"
  if (preset?.mode === "sea") return "Sea"

  return "Road"
})

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

const jobPackages = computed<LoadUnit[]>(() => {
  return (Array.isArray(props.packages) ? props.packages : [])
    .map((row, index) => {
      const packageLabel = String(
        row.desc ?? row.description ?? row.packageType ?? row.package_type ?? row.type ?? "",
      ).trim()
      const type = normalizeUnitType(
        row.type ?? row.packageType ?? row.package_type ?? packageLabel,
      )
      const length = normalizeDimensionCm(row.l ?? row.lengthCm ?? row.length_cm ?? row.length ?? 0)
      const width = normalizeDimensionCm(row.w ?? row.widthCm ?? row.width_cm ?? row.width ?? 0)
      const height = normalizeDimensionCm(row.h ?? row.heightCm ?? row.height_cm ?? row.height ?? 0)
      const qty = Number(row.qty ?? row.quantity ?? row.pieces ?? 1)
      const weight = Number(
        row.wt ??
          row.grossWeightKg ??
          row.grossWeight ??
          row.gross_weight ??
          row.weightKg ??
          row.weight ??
          0,
      )

      return {
        id: `source-${row.id ?? row.sourceId ?? index}`,
        sourceId: row.sourceId ?? row.id,
        type,
        desc: packageLabel || titleCase(type),
        l: length,
        w: width,
        h: height,
        wt: weight,
        qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
        stackable: Boolean(row.stackable),
        adr: Boolean(row.adr),
        color: row.color || colorAt(index),
      }
    })
    .filter(unit => unit.l > 0 && unit.w > 0 && unit.h > 0 && unit.qty > 0)
})

const localPackages = computed(() => [...jobPackages.value, ...manualUnits.value])
const loadUnitEmptyMessage = computed(() => props.emptyMessage)

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

function applyExternalVehicleLoadSpace() {
  const definition = externalLoadSpace.value

  if (!definition) {
    spacePresetKey.value = ""
    space.l = 0
    space.w = 0
    space.h = 0
    space.maxWt = 0
    space.palH = 15
    layout.value = null
    nextTick(drawAll)
    return
  }

  space.l = definition.l
  space.w = definition.w
  space.h = definition.h
  space.maxWt = definition.maxWt
  space.palH = definition.palH
  spacePresetKey.value =
    definition.presetKey && SPACE_PRESETS[definition.presetKey] ? definition.presetKey : ""
  scheduleCalculate()
}

function applyUnitType() {
  const preset = UNIT_PRESETS[formUnit.type]
  if (!preset) return

  formUnit.l = preset.l
  formUnit.w = preset.w
  formUnit.h = preset.h
  formUnit.stackable = preset.stackable
}

function addUnit() {
  if (!formUnit.l || !formUnit.w || !formUnit.h || !formUnit.qty) return

  manualUnits.value = [
    ...manualUnits.value,
    {
      id: `manual-${Date.now()}-${Math.random()}`,
      type: formUnit.type,
      desc: titleCase(formUnit.type),
      l: Number(formUnit.l),
      w: Number(formUnit.w),
      h: Number(formUnit.h),
      wt: Number(formUnit.wt || 0),
      qty: Number(formUnit.qty || 1),
      stackable: Boolean(formUnit.stackable),
      adr: Boolean(formUnit.adr),
      color: colorAt(jobPackages.value.length + manualUnits.value.length),
    },
  ]

  formUnit.qty = 1
  scheduleCalculate()
}

function removeUnit(id: string) {
  manualUnits.value = manualUnits.value.filter(unit => unit.id !== id)
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
  if (loadSpaceBlocked.value) {
    layout.value = null
    drawAll()
    return
  }

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

function packStripContinue(units: PlacedUnit[], tLen: number, tWid: number, already: PlacedUnit[]) {
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
  const ratio = window.devicePixelRatio || 1
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
    camera3d = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 1, 500000)
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
  add3DEdge(plan.tLen / 2, plan.tHei / 2, plan.tWid / 2, plan.tLen, plan.tHei, plan.tWid, 0x94a3b8)
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
  await waitForPrintableCanvasLayout()
  drawTop()
  drawSide()
  await waitForFrame()
}

async function printPlan() {
  if (isPreparingPrint.value) return

  isPreparingPrint.value = true

  try {
    await preparePrintableViews()
    enablePrintMode()
    await nextTick()
    await waitForFrame()
    window.print()
  } finally {
    isPreparingPrint.value = false
  }
}

function enablePrintMode() {
  document.body.classList.add("job-load-planner-printing")
}

function disablePrintMode() {
  document.body.classList.remove("job-load-planner-printing")
}

function selectDefaultPresetForMode() {
  if (usesExternalVehicle.value) {
    applyExternalVehicleLoadSpace()
    return
  }

  const mode = String(props.transportMode ?? "").toLowerCase()
  if (mode === "sea") spacePresetKey.value = "sea_40std"
  else if (mode === "rail") spacePresetKey.value = "rail_fea"
  else spacePresetKey.value = "road_standard"
  applySpacePreset()
}

watch(
  () => [space.l, space.w, space.h, space.maxWt, space.palH, showPalBases.value],
  () => scheduleCalculate(),
)

watch(
  localPackages,
  () => {
    scheduleCalculate()
  },
  { deep: true, flush: "post" },
)

watch(
  () => [props.transportMode, props.vehicleType, props.vehicleLoadSpace, props.lockVehicleType],
  () => selectDefaultPresetForMode(),
  { deep: true },
)

watch(activeView, () => {
  nextTick(() => window.requestAnimationFrame(drawAll))
})

watch(wireframe3d, () => {
  nextTick(() => window.requestAnimationFrame(draw3D))
})

onMounted(() => {
  selectDefaultPresetForMode()
  calculate()
  window.addEventListener("mouseup", handle3DMouseUp)
  window.addEventListener("resize", drawAll)
  window.addEventListener("beforeprint", enablePrintMode)
  window.addEventListener("afterprint", disablePrintMode)
})

onUnmounted(() => {
  if (autoCalculateFrame) {
    window.cancelAnimationFrame(autoCalculateFrame)
    autoCalculateFrame = 0
  }

  window.removeEventListener("mouseup", handle3DMouseUp)
  window.removeEventListener("resize", drawAll)
  window.removeEventListener("beforeprint", enablePrintMode)
  window.removeEventListener("afterprint", disablePrintMode)
  disablePrintMode()
  destroy3DRenderer()
})
</script>

<template>
  <section class="job-load-planner-tab">
    <header class="job-load-planner-tab__toolbar">
      <div>
        <h2>Load Planner</h2>
        <p>{{ vehicleLabel }}</p>
      </div>

      <label class="job-load-planner-tab__job-ref">
        <span>{{ referenceLabel }}</span>
        <input v-model="jobRefLocal" type="text" />
      </label>

      <div class="job-load-planner-tab__toolbar-actions">
        <button
          type="button"
          class="job-load-planner-tab__button"
          :disabled="isPreparingPrint || loadSpaceBlocked"
          @click="printPlan"
        >
          {{ isPreparingPrint ? "Preparing..." : "Print" }}
        </button>
        <button
          type="button"
          class="job-load-planner-tab__button job-load-planner-tab__button--primary"
          :disabled="loadSpaceBlocked"
          @click="calculate"
        >
          Calculate Layout
        </button>
      </div>
    </header>

    <header class="job-load-planner-tab__print-header">
      <div>
        <h1>Load Planner</h1>
        <p>{{ vehicleLabel }}</p>
      </div>
      <div>
        <span>{{ referenceLabel }}</span>
        <strong>{{ jobRefLocal || "Load Plan" }}</strong>
      </div>
    </header>

    <div class="job-load-planner-tab__body">
      <aside class="job-load-planner-tab__sidebar">
        <section class="job-load-planner-tab__card">
          <h3>
            Load Space
            <span class="job-load-planner-tab__mode">{{ modeLabel }}</span>
          </h3>

          <div
            v-if="usesExternalVehicle"
            class="job-load-planner-tab__vehicle-source"
            :class="{ 'job-load-planner-tab__vehicle-source--invalid': loadSpaceBlocked }"
          >
            <span>Quote Vehicle Type</span>
            <strong>{{ vehicleLabel }}</strong>
            <small v-if="loadSpaceBlocked">{{ loadSpaceRequiredMessage }}</small>
          </div>

          <label v-else class="job-load-planner-tab__field job-load-planner-tab__field--full">
            <span>Vehicle / Container Preset</span>
            <select v-model="spacePresetKey" @change="applySpacePreset">
              <option value="">Manual dimensions</option>
              <optgroup v-for="group in presetGroups" :key="group.label" :label="group.label">
                <option v-for="key in group.keys" :key="key" :value="key">
                  {{ spacePresetLabel(key) }}
                </option>
              </optgroup>
            </select>
          </label>

          <div class="job-load-planner-tab__grid job-load-planner-tab__grid--three">
            <label class="job-load-planner-tab__field">
              <span>Length cm</span>
              <input
                v-model.number="space.l"
                type="number"
                min="1"
                :readonly="usesExternalVehicle && externalLoadSpace !== null"
              />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Width cm</span>
              <input
                v-model.number="space.w"
                type="number"
                min="1"
                :readonly="usesExternalVehicle && externalLoadSpace !== null"
              />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Height cm</span>
              <input
                v-model.number="space.h"
                type="number"
                min="1"
                :readonly="usesExternalVehicle && externalLoadSpace !== null"
              />
            </label>
          </div>

          <div class="job-load-planner-tab__grid">
            <label class="job-load-planner-tab__field">
              <span>Max kg</span>
              <input
                v-model.number="space.maxWt"
                type="number"
                min="0"
                :readonly="usesExternalVehicle && externalLoadSpace !== null"
              />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Pallet Base cm</span>
              <input
                v-model.number="space.palH"
                type="number"
                min="0"
                :readonly="usesExternalVehicle && externalLoadSpace !== null"
              />
            </label>
          </div>

          <label class="job-load-planner-tab__check-row">
            <input v-model="showPalBases" type="checkbox" />
            <span>Show pallet bases in views</span>
          </label>
        </section>

        <section class="job-load-planner-tab__card">
          <h3>Add Load Unit</h3>

          <div class="job-load-planner-tab__grid">
            <label class="job-load-planner-tab__field job-load-planner-tab__field--full">
              <span>Type</span>
              <select v-model="formUnit.type" @change="applyUnitType">
                <option value="pallet">Pallet</option>
                <option value="carton">Carton</option>
                <option value="crate">Crate</option>
                <option value="drum">Drum</option>
                <option value="bag">Bag / Sack</option>
                <option value="ibc">IBC / Tote</option>
                <option value="roll">Roll</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label class="job-load-planner-tab__field">
              <span>Length</span>
              <input v-model.number="formUnit.l" type="number" min="1" />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Width</span>
              <input v-model.number="formUnit.w" type="number" min="1" />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Height</span>
              <input v-model.number="formUnit.h" type="number" min="1" />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Weight</span>
              <input v-model.number="formUnit.wt" type="number" min="0" step="0.1" />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Qty</span>
              <input v-model.number="formUnit.qty" type="number" min="1" />
            </label>
          </div>

          <div class="job-load-planner-tab__switches">
            <label class="job-load-planner-tab__check-row">
              <input v-model="formUnit.stackable" type="checkbox" />
              <span>Stackable</span>
            </label>
            <label class="job-load-planner-tab__check-row">
              <input v-model="formUnit.adr" type="checkbox" />
              <span>ADR</span>
            </label>
          </div>

          <button
            type="button"
            class="job-load-planner-tab__button job-load-planner-tab__button--full"
            @click="addUnit"
          >
            Add Load Unit
          </button>
        </section>

        <section class="job-load-planner-tab__card">
          <h3>Load Units</h3>

          <div class="job-load-planner-tab__unit-list">
            <div v-if="!localPackages.length" class="job-load-planner-tab__empty">
              {{ loadUnitEmptyMessage }}
            </div>

            <article
              v-for="unit in localPackages"
              :key="unit.id"
              class="job-load-planner-tab__unit"
              :class="{
                'job-load-planner-tab__unit--warn': unplacedIds.has(unit.id),
                'job-load-planner-tab__unit--partial': hasPartialFit(unit),
              }"
            >
              <span class="job-load-planner-tab__dot" :style="{ background: unit.color }"></span>
              <div>
                <strong>
                  {{ unit.desc }} x {{ unit.qty }}
                  <em v-if="unit.adr">ADR</em>
                  <em v-if="hasPartialFit(unit)" class="job-load-planner-tab__placed-badge">
                    Placed x{{ placedCount(unit.id) }}
                  </em>
                  <em v-if="unplacedCount(unit.id)" class="job-load-planner-tab__unfit-badge">
                    No space<span v-if="unplacedCount(unit.id) > 1">
                      x{{ unplacedCount(unit.id) }}</span
                    >
                  </em>
                </strong>
                <small
                  >{{ unit.l }} x {{ unit.w }} x {{ unit.h }} cm / {{ unit.wt }} kg /
                  {{ fitStatusText(unit) }}</small
                >
              </div>
              <button
                v-if="unit.id.startsWith('manual-')"
                type="button"
                aria-label="Remove load unit"
                @click="removeUnit(unit.id)"
              >
                x
              </button>
            </article>
          </div>
        </section>
      </aside>

      <main class="job-load-planner-tab__viewer">
        <div
          v-if="layout?.unplacedAll.length"
          class="job-load-planner-tab__banner job-load-planner-tab__banner--danger"
        >
          No more space: {{ layout.unplacedAll.length }} unit(s) cannot fit in the selected
          vehicle/container:
          {{ unplacedSummary }}
        </div>

        <div
          v-if="overweight"
          class="job-load-planner-tab__banner job-load-planner-tab__banner--danger"
        >
          Total weight exceeds the selected load-space maximum.
        </div>

        <section class="job-load-planner-tab__stats">
          <article>
            <strong>{{ stats.units }}</strong>
            <span>Load units</span>
          </article>
          <article>
            <strong>{{ stats.lenUsed }}</strong>
            <span>Length used</span>
          </article>
          <article>
            <strong>{{ stats.weight }}</strong>
            <span>Total weight</span>
          </article>
          <article>
            <strong>{{ stats.util }}</strong>
            <span>Floor util.</span>
          </article>
          <article :class="{ 'job-load-planner-tab__stat--warn': Number(stats.unplaced) > 0 }">
            <strong>{{ stats.unplaced }}</strong>
            <span>Unplaced</span>
          </article>
        </section>

        <div class="job-load-planner-tab__view-tabs">
          <button type="button" :class="{ active: activeView === '2d' }" @click="activeView = '2d'">
            2D Views
          </button>
          <button type="button" :class="{ active: activeView === '3d' }" @click="activeView = '3d'">
            3D View
          </button>
        </div>

        <section v-show="activeView === '2d'" class="job-load-planner-tab__views">
          <div class="job-load-planner-tab__canvas-card">
            <div>Top view <span>Looking down</span></div>
            <canvas ref="canvasTop"></canvas>
          </div>
          <div class="job-load-planner-tab__canvas-card">
            <div>Side view <span>From the side</span></div>
            <canvas ref="canvasSide"></canvas>
          </div>
        </section>

        <section v-show="activeView === '3d'" class="job-load-planner-tab__three">
          <canvas
            ref="canvas3d"
            @mousedown="handle3DMouseDown"
            @mousemove="handle3DMouseMove"
            @wheel="handle3DWheel"
            @contextmenu.prevent
          ></canvas>
          <div class="job-load-planner-tab__three-hint">
            Drag to rotate / scroll to zoom / right-drag to pan
          </div>
          <div class="job-load-planner-tab__three-actions">
            <button type="button" @click="reset3D">Reset</button>
            <button
              type="button"
              :class="{ active: wireframe3d }"
              :aria-pressed="wireframe3d"
              @click="toggleWireframe3D"
            >
              Wireframe
            </button>
          </div>
        </section>

        <section class="job-load-planner-tab__card job-load-planner-tab__legend">
          <h3>Legend</h3>
          <span v-for="unit in localPackages" :key="unit.id">
            <i :style="{ background: unit.color }"></i>{{ unit.desc }} x {{ unit.qty }}
            <em v-if="hasPartialFit(unit)" class="job-load-planner-tab__placed-badge">
              Placed x{{ placedCount(unit.id) }}
            </em>
            <em v-if="unplacedCount(unit.id)" class="job-load-planner-tab__unfit-badge">
              No space<span v-if="unplacedCount(unit.id) > 1"> x{{ unplacedCount(unit.id) }}</span>
            </em>
          </span>
          <span v-if="showPalBases && space.palH > 0">
            <i style="background: #c8a879"></i>Pallet base
          </span>
        </section>

        <section class="job-load-planner-tab__manifest">
          <h3>Load Manifest - {{ vehicleLabel }}</h3>
          <p>{{ jobRefLocal || "Load Plan" }} / {{ printDate }}</p>
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>L</th>
                <th>W</th>
                <th>H</th>
                <th>Kg</th>
                <th>Qty</th>
                <th>ADR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="unit in localPackages"
                :key="unit.id"
                :class="{ 'job-load-planner-tab__manifest-row--warn': unplacedCount(unit.id) }"
              >
                <td>{{ unit.desc }}</td>
                <td>{{ unit.l }}</td>
                <td>{{ unit.w }}</td>
                <td>{{ unit.h }}</td>
                <td>{{ unit.wt }}</td>
                <td>{{ unit.qty }}</td>
                <td>{{ unit.adr ? "Yes" : "No" }}</td>
                <td>{{ fitStatusText(unit) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  </section>
</template>
