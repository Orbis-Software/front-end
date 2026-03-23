import { computed } from "vue"

export function useSystemSettingsCompanyPage() {
  const cards = computed(() => [
    {
      title: "Company Profile",
      description: "Manage business name, contact details, and registration information.",
    },
    {
      title: "Addresses",
      description: "Maintain registered office, billing, and operational addresses.",
    },
    {
      title: "Defaults",
      description: "Set company-wide defaults used across the system.",
    },
  ])

  return {
    cards,
  }
}
