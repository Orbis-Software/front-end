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

function nullableTime(value: any): string | null {
  const text = nullableString(value)

  return text ? text.slice(0, 5) : null
}

function nullableBoolean(value: any): boolean | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase())
}

function fetchRoadDetail(raw: any): JobRoadDetail | null {
  if (!raw) return null

  return {
    id: nullableNumber(raw.id) ?? undefined,
    job_id: nullableNumber(raw.job_id) ?? undefined,
    order_type: nullableString(raw.order_type),
    local_collection_type: nullableString(raw.local_collection_type),
    local_service_level: nullableString(raw.local_service_level),
    local_vehicle_required: nullableString(raw.local_vehicle_required),
    local_zone_area: nullableString(raw.local_zone_area),
    local_estimated_distance_miles: nullableNumber(raw.local_estimated_distance_miles),
    local_estimated_duration_hours: nullableNumber(raw.local_estimated_duration_hours),
    local_rate_per_mile: nullableNumber(raw.local_rate_per_mile),
    local_estimated_mileage_cost: nullableNumber(raw.local_estimated_mileage_cost),
    local_round_trip: nullableBoolean(raw.local_round_trip),
    local_signature_required: nullableBoolean(raw.local_signature_required),
    local_pod_method: nullableString(raw.local_pod_method),
    local_parking_access_code: nullableString(raw.local_parking_access_code),
    local_time_critical: nullableBoolean(raw.local_time_critical),
    local_exact_delivery_time: nullableTime(raw.local_exact_delivery_time),
    local_driver_assigned: nullableString(raw.local_driver_assigned),
    local_driver_mobile: nullableString(raw.local_driver_mobile),
    local_collection_notes: nullableString(raw.local_collection_notes),
    full_load_type: nullableString(raw.full_load_type),
    full_load_plan_ref: nullableString(raw.full_load_plan_ref),
    full_max_stack_height_cm: nullableNumber(raw.full_max_stack_height_cm),
    full_multi_drop: nullableBoolean(raw.full_multi_drop),
    full_multi_drop_stops: Array.isArray(raw.full_multi_drop_stops)
      ? raw.full_multi_drop_stops
      : [],
    full_intermodal_leg: nullableBoolean(raw.full_intermodal_leg),
    full_customs_required: nullableBoolean(raw.full_customs_required),
    full_subcontractor_used: nullableBoolean(raw.full_subcontractor_used),
    customs_direction: nullableString(raw.customs_direction),
    customs_document_type: nullableString(raw.customs_document_type),
    customs_mrn_declaration_ref: nullableString(raw.customs_mrn_declaration_ref),
    customs_export_entry_ref: nullableString(raw.customs_export_entry_ref),
    customs_status: nullableString(raw.customs_status),
    customs_port_border: nullableString(raw.customs_port_border),
    customs_ferry_booking_ref: nullableString(raw.customs_ferry_booking_ref),
    customs_exporter_eori: nullableString(raw.customs_exporter_eori),
    customs_importer_eori: nullableString(raw.customs_importer_eori),
    customs_broker_agent: nullableString(raw.customs_broker_agent),
    customs_broker_reference: nullableString(raw.customs_broker_reference),
    customs_deferment_account: nullableString(raw.customs_deferment_account),
    customs_duty_rate_percent: nullableNumber(raw.customs_duty_rate_percent),
    customs_country_of_origin: nullableString(raw.customs_country_of_origin),
    customs_country_of_destination: nullableString(raw.customs_country_of_destination),
    customs_goods_procedure_code: nullableString(raw.customs_goods_procedure_code),
    customs_export_licence_no: nullableString(raw.customs_export_licence_no),
    customs_notes: nullableString(raw.customs_notes),
    subcontractor_contact_id: nullableNumber(raw.subcontractor_contact_id),
    subcontractor_name: nullableString(raw.subcontractor_name),
    subcontractor_ref: nullableString(raw.subcontractor_ref),
    subcontractor_contact_name: nullableString(raw.subcontractor_contact_name),
    subcontractor_contact_phone: nullableString(raw.subcontractor_contact_phone),
    subcontractor_buy_rate: nullableNumber(raw.subcontractor_buy_rate),
    subcontractor_buy_currency: nullableString(raw.subcontractor_buy_currency),
    subcontractor_charge_description: nullableString(raw.subcontractor_charge_description),
    subcontractor_po_instruction_ref: nullableString(raw.subcontractor_po_instruction_ref),
    subcontractor_status: nullableString(raw.subcontractor_status),
    subcontractor_notes: nullableString(raw.subcontractor_notes),
    full_vehicle_registration: nullableString(raw.full_vehicle_registration),
    full_seal_number: nullableString(raw.full_seal_number),
    full_route_via: nullableString(raw.full_route_via),
    service_type: nullableString(raw.service_type),
    vehicle_type: nullableString(raw.vehicle_type),
    vehicle_length_cm: nullableNumber(raw.vehicle_length_cm),
    vehicle_width_cm: nullableNumber(raw.vehicle_width_cm),
    vehicle_height_cm: nullableNumber(raw.vehicle_height_cm),
    vehicle_max_weight_kg: nullableNumber(raw.vehicle_max_weight_kg),
    vehicle_pallet_base_cm: nullableNumber(raw.vehicle_pallet_base_cm),
    origin_city: nullableString(raw.origin_city),
    destination_city: nullableString(raw.destination_city),
    final_destination: nullableString(raw.final_destination),
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
    final_destination: nullableString(raw.final_destination),
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
    final_destination: nullableString(raw.final_destination),
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
    final_destination: nullableString(raw.final_destination),
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
    adr: raw.adr === null || raw.adr === undefined ? null : Boolean(Number(raw.adr)),

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
    supplier_id: nullableNumber(raw.supplier_id),
    charge_code_id: nullableNumber(raw.charge_code_id),
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

      order_type: raw.order_type ?? null,
      consignment_number: raw.consignment_number ?? null,
      service_type: raw.service_type ?? null,
      incoterms: raw.incoterms ?? null,
      currency: raw.currency ?? null,
      declared_value: nullableNumber(raw.declared_value),
      description_of_goods: raw.description_of_goods ?? null,
      commodity_code: raw.commodity_code ?? null,
      hs_code: raw.hs_code ?? null,
      insurance_level: raw.insurance_level ?? null,
      is_hazardous:
        raw.is_hazardous === null || raw.is_hazardous === undefined
          ? null
          : Boolean(Number(raw.is_hazardous)),
      hazardous_class: raw.hazardous_class ?? null,
      un_number: raw.un_number ?? null,
      temperature_requirement: raw.temperature_requirement ?? null,

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
      destination_address_source_type: raw.destination_address_source_type ?? null,
      destination_address_source_id: nullableNumber(raw.destination_address_source_id),
      origin_address: raw.origin_address ?? raw.originAddress ?? null,
      destination_address: raw.destination_address ?? raw.destinationAddress ?? null,
      collection_date: raw.collection_date ?? null,
      collection_time: raw.collection_time ?? null,
      latest_collection_time: raw.latest_collection_time ?? null,
      delivery_date: raw.delivery_date ?? null,
      delivery_from_time: raw.delivery_from_time ?? null,
      delivery_by_time: raw.delivery_by_time ?? null,
      loading_reference: raw.loading_reference ?? null,
      delivery_booking_ref: raw.delivery_booking_ref ?? null,
      collection_instructions: raw.collection_instructions ?? null,
      delivery_instructions: raw.delivery_instructions ?? null,

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
