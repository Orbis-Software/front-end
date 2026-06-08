import http from "@/api/http"
import transportJobTransformer from "@/app/transformers/transport-job"
import type { TransportJob, TransportJobUpdatePayload } from "@/app/types/transport-job"

type FormValue = string | number | boolean | null | undefined

function appendValue(fd: FormData, key: string, value: FormValue | Record<string, any>): void {
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
      appendValue(fd, `${key}[${childKey}]`, childValue)
    })
    return
  }

  fd.append(key, String(value))
}

function appendObject(fd: FormData, prefix: string, value?: Record<string, any> | null): void {
  if (value === undefined) return

  if (value === null) {
    return
  }

  Object.entries(value).forEach(([key, item]) => {
    appendValue(fd, `${prefix}[${key}]`, item)
  })
}

function appendArrayOfObjects(
  fd: FormData,
  prefix: string,
  value?: Record<string, any>[] | null,
): void {
  if (value === undefined) return

  if (value === null) {
    return
  }

  if (value.length === 0) {
    fd.append(`${prefix}__empty`, "1")
    return
  }

  value.forEach((row, index) => {
    Object.entries(row).forEach(([key, item]) => {
      appendValue(fd, `${prefix}[${index}][${key}]`, item)
    })
  })
}

function toFormData(payload: TransportJobUpdatePayload): FormData {
  const fd = new FormData()

  appendValue(fd, "customer_id", payload.customer_id)
  appendValue(fd, "account_number", payload.account_number)
  appendValue(fd, "quote_ref", payload.quote_ref)
  appendValue(fd, "job_number", payload.job_number)
  appendValue(fd, "job_date", payload.job_date)
  appendValue(fd, "mode_of_transport", payload.mode_of_transport)
  appendValue(fd, "job_type", payload.job_type)
  appendValue(fd, "status", payload.status)

  appendValue(fd, "order_type", payload.order_type)
  appendValue(fd, "consignment_number", payload.consignment_number)
  appendValue(fd, "service_type", payload.service_type)
  appendValue(fd, "incoterms", payload.incoterms)
  appendValue(fd, "currency", payload.currency)
  appendValue(fd, "declared_value", payload.declared_value)
  appendValue(fd, "description_of_goods", payload.description_of_goods)
  appendValue(fd, "commodity_code", payload.commodity_code)
  appendValue(fd, "hs_code", payload.hs_code)
  appendValue(fd, "insurance_level", payload.insurance_level)
  appendValue(fd, "is_hazardous", payload.is_hazardous)
  appendValue(fd, "hazardous_class", payload.hazardous_class)
  appendValue(fd, "un_number", payload.un_number)
  appendValue(fd, "temperature_requirement", payload.temperature_requirement)

  appendValue(fd, "customer_po_number", payload.customer_po_number)
  appendValue(fd, "customer_booking_ref", payload.customer_booking_ref)
  appendValue(fd, "our_reference", payload.our_reference)
  appendValue(fd, "supplier_ref", payload.supplier_ref)

  appendValue(fd, "consignee_name", payload.consignee_name)
  appendValue(fd, "consignee_contact", payload.consignee_contact)
  appendValue(fd, "consignee_phone", payload.consignee_phone)
  appendValue(fd, "consignee_email", payload.consignee_email)
  appendValue(
    fd,
    "origin_contact_collection_address_id",
    payload.origin_contact_collection_address_id,
  )
  appendValue(
    fd,
    "destination_contact_collection_address_id",
    payload.destination_contact_collection_address_id,
  )
  appendValue(fd, "collection_date", payload.collection_date)
  appendValue(fd, "collection_time", payload.collection_time)
  appendValue(fd, "latest_collection_time", payload.latest_collection_time)
  appendValue(fd, "delivery_date", payload.delivery_date)
  appendValue(fd, "delivery_from_time", payload.delivery_from_time)
  appendValue(fd, "delivery_by_time", payload.delivery_by_time)
  appendValue(fd, "loading_reference", payload.loading_reference)
  appendValue(fd, "delivery_booking_ref", payload.delivery_booking_ref)
  appendValue(fd, "collection_instructions", payload.collection_instructions)
  appendValue(fd, "delivery_instructions", payload.delivery_instructions)

  appendValue(fd, "note", payload.note)

  appendObject(fd, "road_detail", payload.road_detail as Record<string, any> | null | undefined)
  appendObject(fd, "sea_detail", payload.sea_detail as Record<string, any> | null | undefined)
  appendObject(fd, "air_detail", payload.air_detail as Record<string, any> | null | undefined)
  appendObject(fd, "rail_detail", payload.rail_detail as Record<string, any> | null | undefined)
  appendObject(
    fd,
    "courier_detail",
    payload.courier_detail as Record<string, any> | null | undefined,
  )

  appendArrayOfObjects(
    fd,
    "transport_legs",
    payload.transport_legs as Record<string, any>[] | null | undefined,
  )
  appendArrayOfObjects(fd, "packages", payload.packages as Record<string, any>[] | null | undefined)
  appendArrayOfObjects(fd, "charges", payload.charges as Record<string, any>[] | null | undefined)
  appendValue(
    fd,
    "consolidation_details",
    payload.consolidation_details as Record<string, any> | null | undefined,
  )

  const files = payload.files ?? []
  const fileTypes = payload.file_types ?? []

  files.forEach((file, idx) => {
    fd.append(`files[${idx}]`, file)

    const type = fileTypes[idx]
    if (type !== undefined) {
      fd.append(`file_types[${idx}]`, type ?? "")
    }
  })

  return fd
}

export default async function updateTransportJob(
  id: number,
  payload: TransportJobUpdatePayload,
): Promise<TransportJob> {
  const fd = toFormData(payload)
  fd.append("_method", "PATCH")

  const response = await http.post(`/transport-jobs/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  })

  return transportJobTransformer.fetch(response.data.data)
}
