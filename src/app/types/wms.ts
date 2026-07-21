import type { TableColumn } from "@/app/types/table"

export type WmsColumn = TableColumn

export type WmsRow = Record<string, string | number>

export type WmsTableConfig = {
  title: string
  searchPlaceholder: string
  columns: WmsColumn[]
  rows: WmsRow[]
  statusKey?: string
}

export type WmsAdminConfig = {
  title: string
  singular: string
  columns: WmsColumn[]
  rows: WmsRow[]
  primaryKey: string
}

export type WmsDashboardTone = "default" | "warn" | "ok"

export type WmsDashboardStatCard = {
  label: string
  value: string
  subtext: string
  tone?: WmsDashboardTone
}

export type WmsDashboardActivityItem = {
  dot: string
  text: string
  time: string
}

export type WmsDashboardPendingAction = {
  count: number
  label: string
  to: string
  tone?: WmsDashboardTone
}
