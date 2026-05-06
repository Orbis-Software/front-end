import type { AwbAirline } from "@/app/types/awb-manager"
import awbStockTransformer from "@/app/transformers/awb-stock"

export default {
  fetch(data: any): AwbAirline {
    const stocks = data.awbs ?? data.awbStocks ?? data.awb_stocks ?? []

    return {
      id: data.id,
      company_id: data.companyId ?? data.company_id,

      name: data.name,
      code: data.code ?? null,
      prefix: data.prefix,

      contract: data.contract ?? data.contractRef ?? data.contract_ref ?? null,
      contract_ref: data.contractRef ?? data.contract_ref ?? null,

      notes: data.notes ?? null,
      is_active: data.isActive ?? data.is_active ?? false,

      awbs: awbStockTransformer.fetchCollection(stocks),
      collapsed: data.collapsed ?? false,

      created_at: data.createdAt ?? data.created_at,
      updated_at: data.updatedAt ?? data.updated_at,
    }
  },

  fetchCollection(data: any[]): AwbAirline[] {
    return (data ?? []).map((row: any) => this.fetch(row))
  },
}
