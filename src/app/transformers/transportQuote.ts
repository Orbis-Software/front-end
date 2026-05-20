import type { TransportQuote } from "@/app/types/transportQuote"

const emptyTotals = {
  subtotal_sell: null,
  subtotal_cost: null,
  total_excl_tax: null,
  tax_amount: null,
  total_incl_tax: null,
  profit_total: null,
  profit_percent: null,
}

export function transformTransportQuote(payload: any): TransportQuote {
  return {
    id: payload.id,
    company_id: payload.company_id,
    created_by: payload.created_by ?? null,
    customer_id: payload.customer_id ?? null,
    transport_job_id: payload.transport_job_id ?? null,

    quote_ref: payload.quote_ref ?? null,
    quote_type: payload.quote_type ?? null,
    mode_of_transport: payload.mode_of_transport ?? null,
    status: payload.status ?? "draft",

    account_number: payload.account_number ?? null,
    customer_ref: payload.customer_ref ?? null,
    contact_name: payload.contact_name ?? null,
    contact_email: payload.contact_email ?? null,
    contact_phone: payload.contact_phone ?? null,

    quote_date: payload.quote_date ?? null,
    follow_up_date: payload.follow_up_date ?? null,
    valid_until: payload.valid_until ?? null,
    currency: payload.currency ?? null,
    incoterm: payload.incoterm ?? null,

    origin: payload.origin ?? null,
    destination: payload.destination ?? null,
    etd: payload.etd ?? null,
    eta: payload.eta ?? null,

    commodity: payload.commodity ?? null,
    vehicle_type: payload.vehicle_type ?? null,
    cargo_class: payload.cargo_class ?? null,
    container_type: payload.container_type ?? null,
    load_type: payload.load_type ?? null,
    goods_description: payload.goods_description ?? null,

    is_hazardous: Boolean(payload.is_hazardous),
    hazardous_class: payload.hazardous_class ?? null,
    un_number: payload.un_number ?? null,
    packing_group: payload.packing_group ?? null,

    conditions_preset: payload.conditions_preset ?? null,
    terms_conditions: payload.terms_conditions ?? null,
    validity_period: payload.validity_period ?? null,
    note: payload.note ?? null,

    discount: payload.discount ?? null,
    tax_rate: payload.tax_rate ?? null,
    totals: payload.totals ?? emptyTotals,

    customer_contact: payload.customer_contact,
    creator: payload.creator,
    transport_job: payload.transport_job,

    dimensions: Array.isArray(payload.dimensions) ? payload.dimensions : [],
    charges: Array.isArray(payload.charges) ? payload.charges : [],

    converted_at: payload.converted_at ?? null,
    created_at: payload.created_at ?? null,
    updated_at: payload.updated_at ?? null,
  }
}

export function transformTransportQuoteCollection(response: any): TransportQuote[] {
  const rows = response?.data?.data ?? response?.data ?? []

  return Array.isArray(rows) ? rows.map(transformTransportQuote) : []
}
