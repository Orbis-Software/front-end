import type { AwbSummary } from "@/app/types/awb-manager"

export default {
  fetch(data: any): AwbSummary {
    return {
      airlines: data.airlines ?? 0,
      total: data.total ?? 0,
      available: data.available ?? 0,
      used: data.used ?? 0,
      reserved: data.reserved ?? 0,
      voided: data.voided ?? 0,
    }
  },
}
