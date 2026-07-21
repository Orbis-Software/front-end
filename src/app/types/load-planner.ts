import type { Vector3 } from "three"

export type LoadMode = "road" | "rail" | "sea"

export type LoadUnitType = "pallet" | "carton" | "crate" | "drum" | "bag" | "ibc" | "roll" | "other"

export type SpacePreset = {
  l: number
  w: number
  h: number
  maxWt: number
  mode: LoadMode
  label: string
}

export type LoadSpaceDefinition = {
  l: number
  w: number
  h: number
  maxWt: number
  palH: number
  presetKey?: string
}

export type LoadUnit = {
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

export type LoadPlannerSourcePackage = {
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

export type PlacedUnit = LoadUnit & {
  unitKey: string
  x: number
  y: number
  z: number
  l: number
  w: number
  h: number
  stacked?: boolean
}

export type PlannerLayout = {
  allPlaced: PlacedUnit[]
  unplacedAll: PlacedUnit[]
  tLen: number
  tWid: number
  tHei: number
  palH: number
}

export type Orbit3D = {
  target: Vector3
  dragging: boolean
  rightDrag: boolean
  lastX: number
  lastY: number
  theta: number
  phi: number
  radius: number
}
