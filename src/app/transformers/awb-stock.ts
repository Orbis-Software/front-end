import type { AwbStock } from "@/app/types/awb-manager"

export default {
  fetch(data: any): AwbStock {
    return {
      id: data.id,
      awb_airline_id: data.awbAirlineId ?? data.awb_airline_id,
      transport_job_id: data.transportJobId ?? data.transport_job_id ?? null,

      number: data.number ?? data.awbNumber ?? data.awb_number ?? "",
      awb_number: data.awbNumber ?? data.awb_number ?? data.number ?? "",
      serial_number: data.serialNumber ?? data.serial_number ?? null,

      status: data.status,

      jobNumber:
        data.jobNumber ?? data.transportJob?.jobNumber ?? data.transport_job?.job_number ?? null,
      dateUsed: data.dateUsed ?? data.date_used ?? null,

      notes: data.notes ?? null,
      assignNotes: data.assignNotes ?? data.assignmentNotes ?? data.assignment_notes ?? null,

      reserved_at: data.reservedAt ?? data.reserved_at ?? null,
      used_at: data.usedAt ?? data.used_at ?? null,
      voided_at: data.voidedAt ?? data.voided_at ?? null,
      date_used: data.dateUsed ?? data.date_used ?? null,
      assignment_notes: data.assignmentNotes ?? data.assignment_notes ?? null,

      created_at: data.createdAt ?? data.created_at,
      updated_at: data.updatedAt ?? data.updated_at,
    }
  },

  fetchCollection(data: any[]): AwbStock[] {
    return (data ?? []).map((row: any) => this.fetch(row))
  },
}
