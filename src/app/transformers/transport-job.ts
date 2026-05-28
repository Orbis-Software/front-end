import type {
  JobAirDetail,
  JobCharge,
  JobCourierDetail,
  JobPackage,
  JobRailDetail,
  JobRoadDetail,
  JobSeaDetail,
  JobTransportLeg,
  TransportJob,
} from "@/app/types/transport-job"
import jobFileTransformer from "@/app/transformers/job-file"

function nullableNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") return null
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

function nullableString(value: any): string | null {
  if (value === null || value === undefined) return null
  return String(value)
}

function fetchRoadDetail(raw: any): JobRoadDetail | null {
  if (!raw) return null

  return {
    id: nullableNumber(raw.id) ?? undefined,
    job_id: nullableNumber(raw.job_id) ?? undefined,
    service_type: nullableString(raw.service_type),
    vehicle_type: nullableString(raw.vehicle_type),
    origin_city: nullableString(raw.origin_city),
    destination_city: nullableString(raw.destination_city),
    estimated_transit_days: nullableNumber(raw.estimated_transit_days),
    estimated_distance_km: nullableNumber(raw.estimated_distance_km),
    carrier: nullableString(raw.carrier),
    trailer_number: nullableString(raw.trailer_number),
    driver_name: nullableString(raw.driver_name),
    driver_mobile: nullableString(raw.driver_mobile),
    pallet_spaces: nullableNumber(raw.pallet_spaces),
    pallet_type: nullableString(raw.pallet_type),
    cmr_number: nullableString(raw.cmr_number),
    pod_method: nullableString(raw.pod_method),
    notes: nullableString(raw.notes),
  }
}

function fetchSeaDetail(raw: any): JobSeaDetail | null {
  if (!raw) return null

  return {
    id: nullableNumber(raw.id) ?? undefined,
    job_id: nullableNumber(raw.job_id) ?? undefined,
    shipping_line: nullableString(raw.shipping_line),
    vessel_name: nullableString(raw.vessel_name),
    voyage_number: nullableString(raw.voyage_number),
    shipment_type: nullableString(raw.shipment_type),
    container_number: nullableString(raw.container_number),
    container_size: nullableString(raw.container_size),
    seal_number: nullableString(raw.seal_number),
    container_tare_kg: nullableNumber(raw.container_tare_kg),
    master_bl_number: nullableString(raw.master_bl_number),
    house_bl_number: nullableString(raw.house_bl_number),
    bl_type: nullableString(raw.bl_type),
    freight_terms: nullableString(raw.freight_terms),
    port_of_loading: nullableString(raw.port_of_loading),
    port_of_discharge: nullableString(raw.port_of_discharge),
    transhipment_port: nullableString(raw.transhipment_port),
    final_destination: nullableString(raw.final_destination),
    etd: nullableString(raw.etd),
    eta: nullableString(raw.eta),
    cut_off_date: nullableString(raw.cut_off_date),
    cut_off_time: nullableString(raw.cut_off_time),
    free_days_demurrage: nullableNumber(raw.free_days_demurrage),
    free_days_detention: nullableNumber(raw.free_days_detention),
    return_depot: nullableString(raw.return_depot),
    return_date: nullableString(raw.return_date),
    notes: nullableString(raw.notes),
  }
}

function fetchAirDetail(raw: any): JobAirDetail | null {
  if (!raw) return null

  return {
    id: nullableNumber(raw.id) ?? undefined,
    job_id: nullableNumber(raw.job_id) ?? undefined,
    airline: nullableString(raw.airline),
    flight_number: nullableString(raw.flight_number),
    mawb_number: nullableString(raw.mawb_number),
    hawb_number: nullableString(raw.hawb_number),
    airport_of_departure: nullableString(raw.airport_of_departure),
    airport_of_arrival: nullableString(raw.airport_of_arrival),
    via_transhipment: nullableString(raw.via_transhipment),
    shipment_type: nullableString(raw.shipment_type),
    etd: nullableString(raw.etd),
    eta: nullableString(raw.eta),
    cut_off_date: nullableString(raw.cut_off_date),
    cut_off_time: nullableString(raw.cut_off_time),
    uld_type: nullableString(raw.uld_type),
    uld_number: nullableString(raw.uld_number),
    chargeable_weight: nullableNumber(raw.chargeable_weight),
    rate_per_kg: nullableNumber(raw.rate_per_kg),
    notes: nullableString(raw.notes),
  }
}

function fetchRailDetail(raw: any): JobRailDetail | null {
  if (!raw) return null

  return {
    id: nullableNumber(raw.id) ?? undefined,
    job_id: nullableNumber(raw.job_id) ?? undefined,
    rail_operator: nullableString(raw.rail_operator),
    train_number: nullableString(raw.train_number),
    wagon_number: nullableString(raw.wagon_number),
    container_number: nullableString(raw.container_number),
    container_type: nullableString(raw.container_type),
    loading_terminal: nullableString(raw.loading_terminal),
    discharge_terminal: nullableString(raw.discharge_terminal),
    estimated_transit_days: nullableNumber(raw.estimated_transit_days),
    departure_date: nullableString(raw.departure_date),
    departure_time: nullableString(raw.departure_time),
    arrival_date: nullableString(raw.arrival_date),
    arrival_time: nullableString(raw.arrival_time),
    notes: nullableString(raw.notes),
  }
}

function fetchCourierDetail(raw: any): JobCourierDetail | null {
  if (!raw) return null

  return {
    id: nullableNumber(raw.id) ?? undefined,
    job_id: nullableNumber(raw.job_id) ?? undefined,
    courier_service: nullableString(raw.courier_service),
    carrier: nullableString(raw.carrier),
    tracking_number: nullableString(raw.tracking_number),
    vehicle_type: nullableString(raw.vehicle_type),
    driver_name: nullableString(raw.driver_name),
    driver_mobile: nullableString(raw.driver_mobile),
    estimated_distance_miles: nullableNumber(raw.estimated_distance_miles),
    rate_per_mile: nullableNumber(raw.rate_per_mile),
    signature_required: Boolean(raw.signature_required),
    pod_method: nullableString(raw.pod_method),
    exact_delivery_time: nullableString(raw.exact_delivery_time),
    parking_access_code: nullableString(raw.parking_access_code),
    notes: nullableString(raw.notes),
  }
}

function fetchTransportLeg(raw: any): JobTransportLeg {
  return {
    id: nullableNumber(raw.id) ?? undefined,
    job_id: nullableNumber(raw.job_id) ?? undefined,
    sequence: nullableNumber(raw.sequence),
    mode: raw.mode,
    carrier: nullableString(raw.carrier),
    reference: nullableString(raw.reference),
    origin: nullableString(raw.origin),
    destination: nullableString(raw.destination),
    etd: nullableString(raw.etd),
    eta: nullableString(raw.eta),
    notes: nullableString(raw.notes),
    extra_data: raw.extra_data ?? raw.extraData ?? {},
  }
}

function fetchPackage(raw: any): JobPackage {
  return {
    id: nullableNumber(raw.id) ?? undefined,
    job_id: nullableNumber(raw.job_id) ?? undefined,

    package_type: nullableString(raw.package_type),

    stackable:
      raw.stackable === null || raw.stackable === undefined ? null : Boolean(Number(raw.stackable)),
    at_the_top:
      raw.at_the_top === null || raw.at_the_top === undefined
        ? null
        : Boolean(Number(raw.at_the_top)),

    quantity: nullableNumber(raw.quantity),

    length_cm: nullableNumber(raw.length_cm),
    width_cm: nullableNumber(raw.width_cm),
    height_cm: nullableNumber(raw.height_cm),

    weight: nullableNumber(raw.weight),
    volume: nullableNumber(raw.volume),
    volume_weight_kg: nullableNumber(raw.volume_weight_kg),

    description: nullableString(raw.description),
  }
}

function fetchCharge(raw: any): JobCharge {
  return {
    id: nullableNumber(raw.id) ?? undefined,
    job_id: nullableNumber(raw.job_id) ?? undefined,
    type: raw.type,
    description: nullableString(raw.description),
    currency: nullableString(raw.currency),
    amount: nullableNumber(raw.amount),
  }
}

const transportJobTransformer = {
  fetch(raw: any): TransportJob {
    const filesRaw = raw.files ?? raw.job_files ?? []
    const customerRaw = raw.customer_contact ?? raw.customerContact ?? raw.customer ?? null
    const creatorRaw = raw.creator ?? null

    return {
      id: Number(raw.id),
      company_id: Number(raw.company_id),

      created_by:
        raw.created_by === null || raw.created_by === undefined ? null : Number(raw.created_by),

      customer_id:
        raw.customer_id === null || raw.customer_id === undefined ? null : Number(raw.customer_id),

      account_number: raw.account_number ?? null,
      customer_account_number: raw.customer_account_number ?? null,

      quote_ref: raw.quote_ref ?? null,
      job_number: String(raw.job_number ?? ""),
      job_date: raw.job_date ?? null,

      mode_of_transport: raw.mode_of_transport ?? null,
      job_type: raw.job_type,
      status: raw.status ?? null,

      service_type: raw.service_type ?? null,
      incoterms: raw.incoterms ?? null,
      currency: raw.currency ?? null,
      declared_value: nullableNumber(raw.declared_value),
      description_of_goods: raw.description_of_goods ?? null,
      commodity_code: raw.commodity_code ?? null,
      insurance_level: raw.insurance_level ?? null,

      customer_po_number: raw.customer_po_number ?? null,
      customer_booking_ref: raw.customer_booking_ref ?? null,
      our_reference: raw.our_reference ?? null,
      supplier_ref: raw.supplier_ref ?? null,

      consignee_name: raw.consignee_name ?? null,
      consignee_contact: raw.consignee_contact ?? null,
      consignee_phone: raw.consignee_phone ?? null,
      consignee_email: raw.consignee_email ?? null,

      note: raw.note ?? null,

      customer_contact: customerRaw ? (customerRaw as any) : null,
      origin_contact_collection_address_id: nullableNumber(
        raw.origin_contact_collection_address_id,
      ),
      destination_contact_collection_address_id: nullableNumber(
        raw.destination_contact_collection_address_id,
      ),
      origin_address: raw.origin_address ?? raw.originAddress ?? null,
      destination_address: raw.destination_address ?? raw.destinationAddress ?? null,
      collection_date: raw.collection_date ?? null,
      collection_time: raw.collection_time ?? null,

      creator: creatorRaw
        ? {
            id: Number(creatorRaw.id),
            name: creatorRaw.name ?? null,
            email: creatorRaw.email ?? null,
          }
        : null,

      road_detail: fetchRoadDetail(raw.road_detail ?? raw.roadDetail),
      sea_detail: fetchSeaDetail(raw.sea_detail ?? raw.seaDetail),
      air_detail: fetchAirDetail(raw.air_detail ?? raw.airDetail),
      rail_detail: fetchRailDetail(raw.rail_detail ?? raw.railDetail),
      courier_detail: fetchCourierDetail(raw.courier_detail ?? raw.courierDetail),

      transport_legs: Array.isArray(raw.transport_legs ?? raw.transportLegs)
        ? (raw.transport_legs ?? raw.transportLegs).map(fetchTransportLeg)
        : [],

      packages: Array.isArray(raw.packages) ? raw.packages.map(fetchPackage) : [],
      charges: Array.isArray(raw.charges) ? raw.charges.map(fetchCharge) : [],
      consolidation_details: raw.consolidation_details ?? raw.consolidationDetails ?? null,

      files: jobFileTransformer.fetchCollection(filesRaw),

      created_at: raw.created_at ?? undefined,
      updated_at: raw.updated_at ?? undefined,
      deleted_at: raw.deleted_at ?? undefined,
    }
  },

  fetchCollection(raw: any): TransportJob[] {
    if (!Array.isArray(raw)) return []
    return raw.map(x => transportJobTransformer.fetch(x))
  },
}

export default transportJobTransformer
