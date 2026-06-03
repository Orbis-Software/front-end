<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue"
import type { JobDetailsContext } from "../../JobDetailsPage.logic"
import "./JobLoadPlannerTab.css"

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

const context = inject<JobDetailsContext>("jobDetails")

if (!context) {
  throw new Error("JobLoadPlannerTab must be used inside JobDetailsPage.")
}

const { form } = context

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
  road_standard: { l: 1360, w: 240, h: 270, maxWt: 26000, mode: "road", label: "Standard Curtainsider / Box (13.6 m)" },
  road_mega: { l: 1360, w: 240, h: 300, maxWt: 26000, mode: "road", label: "Mega Trailer (13.6 m)" },
  road_flatbed: { l: 1360, w: 240, h: 400, maxWt: 26000, mode: "road", label: "Flatbed (13.6 m)" },
  road_lowloader: { l: 1200, w: 300, h: 180, maxWt: 40000, mode: "road", label: "Low Loader" },
  road_rigid18: { l: 900, w: 240, h: 250, maxWt: 11000, mode: "road", label: "Rigid 18t" },
  road_rigid75: { l: 640, w: 230, h: 220, maxWt: 3500, mode: "road", label: "Rigid 7.5t" },
  road_luton: { l: 380, w: 200, h: 185, maxWt: 900, mode: "road", label: "Luton / Box Van" },
  road_sprinter: { l: 290, w: 165, h: 165, maxWt: 900, mode: "road", label: "Sprinter / Transit Van" },
  rail_fea: { l: 1980, w: 246, h: 290, maxWt: 68500, mode: "rail", label: "FEA Spine Wagon (UK)" },
  rail_ika: { l: 2092, w: 278, h: 290, maxWt: 70000, mode: "rail", label: "IKA Bogie Flat (UK)" },
  rail_covered_eu: { l: 2100, w: 278, h: 270, maxWt: 58000, mode: "rail", label: "Covered Wagon Habiss (EU)" },
  rail_open_eu: { l: 1400, w: 280, h: 180, maxWt: 55000, mode: "rail", label: "Open Wagon Eaos (EU)" },
  rail_flat_eu: { l: 1980, w: 280, h: 400, maxWt: 60000, mode: "rail", label: "Flat Wagon (EU)" },
  sea_20std: { l: 589, w: 235, h: 239, maxWt: 21700, mode: "sea", label: "20ft Standard Container" },
  sea_40std: { l: 1203, w: 235, h: 239, maxWt: 26580, mode: "sea", label: "40ft Standard Container" },
  sea_40hc: { l: 1203, w: 235, h: 269, maxWt: 26330, mode: "sea", label: "40ft High Cube Container" },
  sea_45hc: { l: 1352, w: 235, h: 269, maxWt: 27700, mode: "sea", label: "45ft High Cube Container" },
  sea_20reefer: { l: 550, w: 225, h: 220, maxWt: 20000, mode: "sea", label: "20ft Reefer Container" },
  sea_40reefer: { l: 1167, w: 225, h: 220, maxWt: 22000, mode: "sea", label: "40ft Reefer Container" },
  sea_20ot: { l: 589, w: 235, h: 234, maxWt: 21500, mode: "sea", label: "20ft Open Top Container" },
  sea_40ot: { l: 1203, w: 235, h: 233, maxWt: 26000, mode: "sea", label: "40ft Open Top Container" },
  sea_20fr: { l: 562, w: 222, h: 213, maxWt: 27000, mode: "sea", label: "20ft Flat Rack" },
  sea_40fr: { l: 1203, w: 201, h: 213, maxWt: 39000, mode: "sea", label: "40ft Flat Rack" },
}

const UNIT_PRESETS: Partial<Record<LoadUnitType, { l: number; w: number; h: number; stackable: boolean }>> = {
  pallet: { l: 120, w: 100, h: 175, stackable: false },
  carton: { l: 60, w: 40, h: 40, stackable: true },
  crate: { l: 120, w: 80, h: 100, stackable: false },
  drum: { l: 60, w: 60, h: 90, stackable: false },
  bag: { l: 80, w: 50, h: 50, stackable: true },
  ibc: { l: 120, w: 100, h: 120, stackable: false },
  roll: { l: 120, w: 90, h: 90, stackable: false },
}

const presetGroups = [
  { label: "Road Freight", keys: ["road_standard", "road_mega", "road_flatbed", "road_lowloader", "road_rigid18", "road_rigid75", "road_luton", "road_sprinter"] },
  { label: "Rail Freight", keys: ["rail_fea", "rail_ika", "rail_covered_eu", "rail_open_eu", "rail_flat_eu"] },
  { label: "Sea Freight", keys: ["sea_20std", "sea_40std", "sea_40hc", "sea_45hc", "sea_20reefer", "sea_40reefer", "sea_20ot", "sea_40ot", "sea_20fr", "sea_40fr"] },
]

const activeView = ref<"2d" | "3d">("2d")
const spacePresetKey = ref("road_standard")
const layout = ref<PlannerLayout | null>(null)
const isStale = ref(false)
const showPalBases = ref(true)
const canvasTop = ref<HTMLCanvasElement | null>(null)
const canvasSide = ref<HTMLCanvasElement | null>(null)
const canvas3d = ref<HTMLCanvasElement | null>(null)
const manualUnits = ref<LoadUnit[]>([])
const drag3d = reactive({ active: false, x: 0, y: 0 })
const view3d = reactive({ rotate: -0.7, zoom: 1, panX: 0, panY: 0 })

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
    return form.job_number || ""
  },
  set(value: string) {
    form.job_number = value
  },
})

const vehicleLabel = computed(() => {
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
        desc: row.description || row.package_type || titleCase(type),
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

const localPackages = computed(() => [...jobPackages.value, ...manualUnits.value])

const totalUnits = computed(() => localPackages.value.reduce((sum, unit) => sum + unit.qty, 0))
const totalWeight = computed(() => {
  return localPackages.value.reduce((sum, unit) => sum + unit.wt * unit.qty, 0)
})
const unplacedIds = computed(() => new Set((layout.value?.unplacedAll ?? []).map(unit => unit.id)))

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
  const usedLen = floorItems.length
    ? Math.max(...floorItems.map(unit => unit.x + unit.l))
    : 0
  const floorArea = floorItems.reduce((sum, unit) => sum + unit.l * unit.w, 0)
  const util = Math.min(100, Math.round((floorArea / (layout.value.tLen * layout.value.tWid)) * 100))

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

function markStale() {
  isStale.value = true
}

function applySpacePreset() {
  const preset = SPACE_PRESETS[spacePresetKey.value]
  if (!preset) {
    markStale()
    return
  }

  space.l = preset.l
  space.w = preset.w
  space.h = preset.h
  space.maxWt = preset.maxWt
  markStale()
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
  markStale()
}

function removeUnit(id: string) {
  manualUnits.value = manualUnits.value.filter(unit => unit.id !== id)
  markStale()
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
    isStale.value = false
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

  isStale.value = false
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
  let stripX = 0
  let stripDepth = 0
  let usedY = 0

  if (already.length) {
    stripX = Math.max(...already.map(unit => unit.x))
    const inStrip = already.filter(unit => unit.x === stripX)
    stripDepth = inStrip.length ? Math.max(...inStrip.map(unit => unit.l)) : 0
    usedY = inStrip.reduce((max, unit) => Math.max(max, unit.y + unit.w), 0)

    if (usedY >= tWid - 0.01) {
      stripX += stripDepth
      stripDepth = 0
      usedY = 0
    }
  }

  for (const unit of units) {
    let best = pickOrientations(unit, tWid).find(option => {
      return usedY + option.uw <= tWid + 0.01 && stripX + option.ul <= tLen + 0.01
    })

    if (!best) {
      stripX += stripDepth
      stripDepth = 0
      usedY = 0

      if (stripX >= tLen) {
        unplaced.push(unit)
        continue
      }

      best = pickOrientations(unit, tWid).find(option => {
        return option.uw <= tWid + 0.01 && stripX + option.ul <= tLen + 0.01
      })
    }

    if (best) {
      placed.push({ ...unit, x: stripX, y: usedY, z: 0, l: best.ul, w: best.uw, h: unit.h })
      usedY += best.uw
      stripDepth = Math.max(stripDepth, best.ul)
    } else {
      unplaced.push(unit)
    }
  }

  return { placed, unplaced }
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
  const canvas = canvas3d.value
  const plan = layout.value
  if (!canvas) return

  const prepared = prepareCanvas(canvas)
  if (!prepared) return

  const { ctx, width, height } = prepared
  ctx.clearRect(0, 0, width, height)
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, "#2f3135")
  gradient.addColorStop(1, "#141516")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  if (!plan) {
    drawEmptyCanvas(ctx, width, height, "Calculate a layout to show the 3D view", "#f8fafc")
    return
  }

  const scale = Math.min(width / plan.tLen, height / Math.max(plan.tWid, plan.tHei)) * 0.72 * view3d.zoom
  const project = (x: number, y: number, z: number) => {
    const cx = x - plan.tLen / 2
    const cy = y - plan.tWid / 2
    const cos = Math.cos(view3d.rotate)
    const sin = Math.sin(view3d.rotate)
    const rx = cx * cos - cy * sin
    const ry = cx * sin + cy * cos

    return {
      x: width / 2 + rx * scale + view3d.panX,
      y: height * 0.66 + ry * scale * 0.44 - z * scale * 0.82 + view3d.panY,
    }
  }

  draw3DFloor(ctx, project, plan)

  const placed = [...plan.allPlaced].sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z))
  for (const unit of placed) {
    const baseZ = unit.z + (unit.z === 0 && showPalBases.value ? plan.palH : 0)
    if (showPalBases.value && plan.palH > 0 && unit.z === 0) {
      draw3DBox(ctx, project, unit.x, unit.y, 0, unit.l, unit.w, plan.palH, "#c8a879")
    }
    draw3DBox(ctx, project, unit.x, unit.y, baseZ, unit.l, unit.w, unit.h, unit.color)
  }
}

function draw3DFloor(
  ctx: CanvasRenderingContext2D,
  project: (x: number, y: number, z: number) => { x: number; y: number },
  plan: PlannerLayout,
) {
  const corners = [
    project(0, 0, 0),
    project(plan.tLen, 0, 0),
    project(plan.tLen, plan.tWid, 0),
    project(0, plan.tWid, 0),
  ]

  ctx.fillStyle = "rgba(255,255,255,0.08)"
  ctx.strokeStyle = "rgba(255,255,255,0.34)"
  ctx.lineWidth = 1.5
  drawPolygon(ctx, corners)
  ctx.stroke()
}

function draw3DBox(
  ctx: CanvasRenderingContext2D,
  project: (x: number, y: number, z: number) => { x: number; y: number },
  x: number,
  y: number,
  z: number,
  l: number,
  w: number,
  h: number,
  color: string,
) {
  const p = {
    a: project(x, y, z),
    b: project(x + l, y, z),
    c: project(x + l, y + w, z),
    d: project(x, y + w, z),
    e: project(x, y, z + h),
    f: project(x + l, y, z + h),
    g: project(x + l, y + w, z + h),
    i: project(x, y + w, z + h),
  }

  ctx.fillStyle = shadeColor(color, -18)
  drawPolygon(ctx, [p.b, p.c, p.g, p.f])
  ctx.fill()
  ctx.fillStyle = shadeColor(color, -28)
  drawPolygon(ctx, [p.c, p.d, p.i, p.g])
  ctx.fill()
  ctx.fillStyle = shadeColor(color, 8)
  drawPolygon(ctx, [p.e, p.f, p.g, p.i])
  ctx.fill()

  ctx.strokeStyle = "rgba(0,0,0,0.28)"
  ctx.lineWidth = 1
  ;[
    [p.a, p.b, p.c, p.d],
    [p.e, p.f, p.g, p.i],
    [p.a, p.e],
    [p.b, p.f],
    [p.c, p.g],
    [p.d, p.i],
  ].forEach(points => {
    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })
    if (points.length > 2) ctx.closePath()
    ctx.stroke()
  })
}

function drawPolygon(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) {
  ctx.beginPath()
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y)
    else ctx.lineTo(point.x, point.y)
  })
  ctx.closePath()
}

function shadeColor(color: string, percent: number) {
  const amount = Math.round((percent / 100) * 255)
  const value = color.replace("#", "")
  const num = parseInt(value, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount))

  return `rgb(${r}, ${g}, ${b})`
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
  drag3d.active = true
  drag3d.x = event.clientX
  drag3d.y = event.clientY
}

function handle3DMouseMove(event: MouseEvent) {
  if (!drag3d.active) return

  const dx = event.clientX - drag3d.x
  const dy = event.clientY - drag3d.y
  drag3d.x = event.clientX
  drag3d.y = event.clientY
  view3d.rotate += dx * 0.008
  view3d.panY += dy * 0.3
  draw3D()
}

function handle3DMouseUp() {
  drag3d.active = false
}

function handle3DWheel(event: WheelEvent) {
  event.preventDefault()
  view3d.zoom = Math.max(0.35, Math.min(2.4, view3d.zoom * (1 - event.deltaY * 0.001)))
  draw3D()
}

function reset3D() {
  view3d.rotate = -0.7
  view3d.zoom = 1
  view3d.panX = 0
  view3d.panY = 0
  draw3D()
}

function printPlan() {
  activeView.value = "2d"
  nextTick(() => window.print())
}

function selectDefaultPresetForMode() {
  const mode = String(form.mode_of_transport ?? "")
  if (mode === "sea") spacePresetKey.value = "sea_40std"
  else if (mode === "rail") spacePresetKey.value = "rail_fea"
  else spacePresetKey.value = "road_standard"
  applySpacePreset()
}

watch(
  () => [space.l, space.w, space.h, space.maxWt, space.palH, showPalBases.value],
  () => markStale(),
)

watch(
  localPackages,
  () => {
    markStale()
  },
  { deep: true },
)

watch(activeView, () => {
  nextTick(() => window.requestAnimationFrame(drawAll))
})

onMounted(() => {
  selectDefaultPresetForMode()
  calculate()
  window.addEventListener("mouseup", handle3DMouseUp)
  window.addEventListener("resize", drawAll)
})

onUnmounted(() => {
  window.removeEventListener("mouseup", handle3DMouseUp)
  window.removeEventListener("resize", drawAll)
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
        <span>Job Ref</span>
        <input v-model="jobRefLocal" type="text" />
      </label>

      <div class="job-load-planner-tab__toolbar-actions">
        <button type="button" class="job-load-planner-tab__button" @click="printPlan">
          Print
        </button>
        <button type="button" class="job-load-planner-tab__button job-load-planner-tab__button--primary" @click="calculate">
          Calculate Layout
        </button>
      </div>
    </header>

    <div class="job-load-planner-tab__body">
      <aside class="job-load-planner-tab__sidebar">
        <section class="job-load-planner-tab__card">
          <h3>
            Load Space
            <span class="job-load-planner-tab__mode">{{ modeLabel }}</span>
          </h3>

          <label class="job-load-planner-tab__field job-load-planner-tab__field--full">
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
              <input v-model.number="space.l" type="number" min="1" />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Width cm</span>
              <input v-model.number="space.w" type="number" min="1" />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Height cm</span>
              <input v-model.number="space.h" type="number" min="1" />
            </label>
          </div>

          <div class="job-load-planner-tab__grid">
            <label class="job-load-planner-tab__field">
              <span>Max kg</span>
              <input v-model.number="space.maxWt" type="number" min="0" />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Pallet Base cm</span>
              <input v-model.number="space.palH" type="number" min="0" />
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

          <button type="button" class="job-load-planner-tab__button job-load-planner-tab__button--full" @click="addUnit">
            Add Load Unit
          </button>
        </section>

        <section class="job-load-planner-tab__card">
          <h3>Load Units</h3>

          <div class="job-load-planner-tab__unit-list">
            <div v-if="!localPackages.length" class="job-load-planner-tab__empty">
              Add package dimensions in the Packages tab or add a manual unit here.
            </div>

            <article
              v-for="unit in localPackages"
              :key="unit.id"
              class="job-load-planner-tab__unit"
              :class="{ 'job-load-planner-tab__unit--warn': unplacedIds.has(unit.id) }"
            >
              <span class="job-load-planner-tab__dot" :style="{ background: unit.color }"></span>
              <div>
                <strong>
                  {{ unit.desc }} x {{ unit.qty }}
                  <em v-if="unit.adr">ADR</em>
                </strong>
                <small>{{ unit.l }} x {{ unit.w }} x {{ unit.h }} cm / {{ unit.wt }} kg</small>
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
        <div v-if="isStale" class="job-load-planner-tab__banner">
          Items or settings changed.
          <button type="button" @click="calculate">Recalculate</button>
        </div>

        <div v-if="layout?.unplacedAll.length" class="job-load-planner-tab__banner job-load-planner-tab__banner--danger">
          {{ layout.unplacedAll.length }} unit(s) could not be placed:
          {{ [...new Set(layout.unplacedAll.map(unit => unit.desc))].join(", ") }}
        </div>

        <div v-if="overweight" class="job-load-planner-tab__banner job-load-planner-tab__banner--danger">
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
          ></canvas>
          <div class="job-load-planner-tab__three-hint">Drag to rotate / scroll to zoom</div>
          <button type="button" class="job-load-planner-tab__three-reset" @click="reset3D">
            Reset
          </button>
        </section>

        <section class="job-load-planner-tab__card job-load-planner-tab__legend">
          <h3>Legend</h3>
          <span v-for="unit in localPackages" :key="unit.id">
            <i :style="{ background: unit.color }"></i>{{ unit.desc }} x {{ unit.qty }}
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
                <th>Description</th>
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
              <tr v-for="unit in localPackages" :key="unit.id">
                <td>{{ unit.desc }}</td>
                <td>{{ unit.l }}</td>
                <td>{{ unit.w }}</td>
                <td>{{ unit.h }}</td>
                <td>{{ unit.wt }}</td>
                <td>{{ unit.qty }}</td>
                <td>{{ unit.adr ? "Yes" : "No" }}</td>
                <td>{{ unplacedIds.has(unit.id) ? "Cannot fit" : "Placed" }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  </section>
</template>
