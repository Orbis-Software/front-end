export type WmsColumn = {
  key: string
  label: string
}

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
