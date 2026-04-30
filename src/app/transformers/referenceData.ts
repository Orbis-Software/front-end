import type { ReferenceDataCategory, ReferenceDataOption } from "@/app/types/referenceData"

export default {
  option(data: any): ReferenceDataOption {
    return {
      id: data.id,
      reference_data_category_id: data.reference_data_category_id,
      name: data.name,
      is_default: !!data.is_default,
      sort_order: Number(data.sort_order ?? 0),
      is_active: !!data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  category(data: any): ReferenceDataCategory {
    return {
      id: data.id,
      key: data.key,
      group: data.group,
      label: data.label,
      icon: data.icon,
      icon_bg: data.icon_bg,
      icon_color: data.icon_color,
      sort_order: Number(data.sort_order ?? 0),
      is_active: !!data.is_active,
      options: (data.options ?? []).map((option: any) => this.option(option)),
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  collection(data: any[]): ReferenceDataCategory[] {
    return (data ?? []).map((row: any) => this.category(row))
  },
}
