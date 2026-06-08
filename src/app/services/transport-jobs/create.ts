import http from "@/api/http"
import transportJobTransformer from "@/app/transformers/transport-job"
import type { TransportJob, TransportJobCreatePayload } from "@/app/types/transport-job"

function toFormData(payload: TransportJobCreatePayload): FormData {
  const fd = new FormData()

  if (payload.customer_id !== undefined) {
    fd.append("customer_id", payload.customer_id === null ? "" : String(payload.customer_id))
  }

  if (payload.quote_ref !== undefined) fd.append("quote_ref", payload.quote_ref ?? "")
  if (payload.job_number) fd.append("job_number", payload.job_number)

  if (payload.job_date !== undefined) fd.append("job_date", payload.job_date ?? "")

  if (payload.mode_of_transport) {
    fd.append("mode_of_transport", payload.mode_of_transport)
  }
  fd.append("job_type", payload.job_type)
  if (payload.status !== undefined) fd.append("status", payload.status ?? "")

  appendFlatValue(fd, "account_number", payload.account_number)
  appendFlatValue(fd, "order_type", payload.order_type)
  appendFlatValue(fd, "consignment_number", payload.consignment_number)
  appendFlatValue(fd, "service_type", payload.service_type)
  appendFlatValue(fd, "incoterms", payload.incoterms)
  appendFlatValue(fd, "currency", payload.currency)
  appendFlatValue(fd, "declared_value", payload.declared_value)
  appendFlatValue(fd, "description_of_goods", payload.description_of_goods)
  appendFlatValue(fd, "commodity_code", payload.commodity_code)
  appendFlatValue(fd, "hs_code", payload.hs_code)
  appendFlatValue(fd, "insurance_level", payload.insurance_level)
  appendFlatValue(fd, "is_hazardous", payload.is_hazardous)
  appendFlatValue(fd, "hazardous_class", payload.hazardous_class)
  appendFlatValue(fd, "un_number", payload.un_number)
  appendFlatValue(fd, "temperature_requirement", payload.temperature_requirement)
  appendFlatValue(fd, "customer_po_number", payload.customer_po_number)
  appendFlatValue(fd, "customer_booking_ref", payload.customer_booking_ref)
  appendFlatValue(fd, "our_reference", payload.our_reference)
  appendFlatValue(fd, "supplier_ref", payload.supplier_ref)
  appendFlatValue(fd, "consignee_name", payload.consignee_name)
  appendFlatValue(fd, "consignee_contact", payload.consignee_contact)
  appendFlatValue(fd, "consignee_phone", payload.consignee_phone)
  appendFlatValue(fd, "consignee_email", payload.consignee_email)
  appendFlatValue(
    fd,
    "origin_contact_collection_address_id",
    payload.origin_contact_collection_address_id,
  )
  appendFlatValue(
    fd,
    "destination_contact_collection_address_id",
    payload.destination_contact_collection_address_id,
  )
  appendFlatValue(fd, "collection_date", payload.collection_date)
  appendFlatValue(fd, "collection_time", payload.collection_time)
  appendFlatValue(fd, "latest_collection_time", payload.latest_collection_time)
  appendFlatValue(fd, "delivery_date", payload.delivery_date)
  appendFlatValue(fd, "delivery_from_time", payload.delivery_from_time)
  appendFlatValue(fd, "delivery_by_time", payload.delivery_by_time)
  appendFlatValue(fd, "loading_reference", payload.loading_reference)
  appendFlatValue(fd, "delivery_booking_ref", payload.delivery_booking_ref)
  appendFlatValue(fd, "collection_instructions", payload.collection_instructions)
  appendFlatValue(fd, "delivery_instructions", payload.delivery_instructions)

  if (payload.note !== undefined) fd.append("note", payload.note ?? "")

  appendNestedValue(fd, "road_detail", payload.road_detail)
  appendNestedValue(fd, "sea_detail", payload.sea_detail)
  appendNestedValue(fd, "air_detail", payload.air_detail)
  appendNestedValue(fd, "rail_detail", payload.rail_detail)
  appendNestedValue(fd, "courier_detail", payload.courier_detail)
  appendNestedValue(fd, "transport_legs", payload.transport_legs)
  appendNestedValue(fd, "packages", payload.packages)
  appendNestedValue(fd, "charges", payload.charges)

  const consolidationDetails = (payload as any).consolidation_details
  if (consolidationDetails && typeof consolidationDetails === "object") {
    Object.entries(consolidationDetails).forEach(([key, value]) => {
      appendNestedValue(fd, `consolidation_details[${key}]`, value)
    })
  }

  const files = payload.files ?? []
  const fileTypes = payload.file_types ?? []

  files.forEach((file, idx) => {
    fd.append(`files[${idx}]`, file)
    const type = fileTypes[idx]
    if (type !== undefined) fd.append(`file_types[${idx}]`, type ?? "")
  })

  return fd
}

function appendFlatValue(fd: FormData, key: string, value: any): void {
  if (value === undefined) return
  if (typeof value === "boolean") {
    fd.append(key, value ? "1" : "0")
    return
  }
  fd.append(key, value === null ? "" : String(value))
}

function appendNestedValue(fd: FormData, key: string, value: any): void {
  if (value === undefined) return

  if (value === null) {
    fd.append(key, "")
    return
  }

  if (typeof value === "boolean") {
    fd.append(key, value ? "1" : "0")
    return
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendNestedValue(fd, `${key}[${childKey}]`, childValue)
    })
    return
  }

  fd.append(key, String(value))
}

export default async function createTransportJob(
  payload: TransportJobCreatePayload,
): Promise<TransportJob> {
  const response = await http.post("/transport-jobs", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  })

  return transportJobTransformer.fetch(response.data.data)
}
