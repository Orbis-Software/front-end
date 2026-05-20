export type GlobalReferenceDataTabValue = "terminals" | "airlines" | "cities"

export type GlobalReferenceDataRow = Record<string, string>

export type GlobalReferenceDataSet = Record<GlobalReferenceDataTabValue, GlobalReferenceDataRow[]>
