import type { Country } from '@/app/types/country'

function fetchOne(raw: any): Country {
  return {
    id: Number(raw.id),
    alpha_2: String(raw.alpha_2 ?? ''),
    alpha_3: String(raw.alpha_3 ?? ''),
    name: String(raw.name ?? ''),
    dial_code: String(raw.dial_code ?? ''),
    min: Number(raw.min ?? 0),
    max: Number(raw.max ?? 0),
    created_at: raw.created_at ?? undefined,
    updated_at: raw.updated_at ?? undefined,
  }
}

function fetchCollection(rows: any[] = []): Country[] {
  return rows.map(fetchOne)
}

export default {
  fetchOne,
  fetchCollection,
}
