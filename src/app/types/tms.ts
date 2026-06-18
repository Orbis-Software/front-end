export type TmsColumn = {
  key: string
  label: string
}

export type TmsRow = Record<string, string | number>

export type TmsTableConfig = {
  title: string
  searchPlaceholder: string
  actionLabel: string
  tabs: Array<{ label: string; value: string }>
  columns: TmsColumn[]
  rows: TmsRow[]
  statusKey?: string
}
