import type {
  ContactChargeBreak,
  ContactChargeRow,
  ContactChargeRowValue,
  ContactChargeTable,
} from "@/app/types/contact"

function asArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? v : []
}

function toNumberOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function toNumber(v: any, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function normalizeBreak(raw: any): ContactChargeBreak {
  return {
    id: Number(raw.id),
    charge_table_id: Number(raw.charge_table_id),
    label: raw.label ?? "",
    min_value: toNumberOrNull(raw.min_value),
    max_value: toNumberOrNull(raw.max_value),
    unit: raw.unit ?? "kg",
    sort_order: toNumber(raw.sort_order, 0),
    created_at: raw.created_at ?? undefined,
    updated_at: raw.updated_at ?? undefined,
  }
}

function normalizeRowValue(raw: any): ContactChargeRowValue {
  return {
    id: Number(raw.id),
    charge_row_id: Number(raw.charge_row_id),
    charge_break_id: Number(raw.charge_break_id),
    amount: toNumber(raw.amount, 0),
    created_at: raw.created_at ?? undefined,
    updated_at: raw.updated_at ?? undefined,
  }
}

function normalizeRow(raw: any): ContactChargeRow {
  const rawValues = raw.values ?? raw.row_values ?? []

  return {
    id: Number(raw.id),
    charge_table_id: Number(raw.charge_table_id),
    description: raw.description ?? "",
    code: raw.code ?? null,
    value_type: raw.value_type ?? "money",
    charge_basis: raw.charge_basis ?? null,
    is_required: Boolean(raw.is_required),
    sort_order: toNumber(raw.sort_order, 0),
    values: asArray(rawValues).map(normalizeRowValue),
    created_at: raw.created_at ?? undefined,
    updated_at: raw.updated_at ?? undefined,
  }
}

const contactChargeTableTransformer = {
  fetch(rawAny: any): ContactChargeTable {
    const raw = rawAny?.data ?? rawAny

    const rawBreaks = raw.breaks ?? []
    const rawRows = raw.rows ?? []

    return {
      id: Number(raw.id),
      company_id: Number(raw.company_id),
      contact_id: Number(raw.contact_id),
      name: raw.name ?? "",
      code: raw.code ?? null,
      charge_type: raw.charge_type ?? "weight_break",
      applies_to: raw.applies_to ?? "collection",
      currency_code: raw.currency_code ?? "GBP",
      valid_from: raw.valid_from ?? null,
      valid_until: raw.valid_until ?? null,
      is_active: Boolean(raw.is_active),
      is_default: Boolean(raw.is_default),
      sort_order: toNumber(raw.sort_order, 0),
      notes: raw.notes ?? null,
      breaks: asArray(rawBreaks).map(normalizeBreak),
      rows: asArray(rawRows).map(normalizeRow),
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  },

  fetchCollection(rawList: any[]): ContactChargeTable[] {
    return (rawList ?? []).map((row: any) => this.fetch(row))
  },
}

export default contactChargeTableTransformer
