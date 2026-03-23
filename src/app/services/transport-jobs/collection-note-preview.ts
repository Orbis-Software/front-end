import http from "@/api/http"

export interface CollectionNotePreviewPayload {
  order_reference?: string
  collection_ref?: string
  delivery_ref?: string
  pickup_date?: string | Date | null
  pickup_time?: string | null
  goods_description?: string | null
  billing_account?: string | null
  special_instructions?: string | null
  agreed_rate?: string | number | null
  fsc_percent?: string | number | null
  additional_costs?: string | number | null
  total?: string | number | null
  carrier_name?: string | null
  booking_ref?: string | null

  collection_address?: Record<string, any> | null
  delivery_address?: Record<string, any> | null

  items?: Array<{
    description?: string | null
    length_cm?: number | null
    width_cm?: number | null
    height_cm?: number | null
    qty?: number | null
    gross_kg?: number | null
  }>
}

export default async function collectionNotePreview(
  payload: CollectionNotePreviewPayload,
): Promise<Blob> {
  const response = await http.post("/transport-jobs/collection-note-pdf-preview", payload, {
    responseType: "blob",
  })

  return response.data
}
