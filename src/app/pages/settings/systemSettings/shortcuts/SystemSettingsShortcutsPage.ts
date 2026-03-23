import { computed } from "vue"

export function useSystemSettingsShortcutsPage() {
  const items = computed(() => [
    {
      key: "Quick Create Job",
      value: "Open new job form from dashboard and top nav.",
    },
    {
      key: "Quick Create Contact",
      value: "Open new contact form from searchable shortcut.",
    },
    {
      key: "Recent Views",
      value: "Show commonly accessed records and pages.",
    },
  ])

  return {
    items,
  }
}
