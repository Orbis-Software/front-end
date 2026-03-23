import { computed } from "vue"

export function useSystemSettingsBrandingPage() {
  const sections = computed(() => [
    {
      title: "Logo & Assets",
      description: "Upload company logos and supporting branding assets.",
    },
    {
      title: "Colours",
      description: "Define brand colours used in documents and screens.",
    },
    {
      title: "Documents",
      description: "Apply branded styling to PDFs, emails, and exports.",
    },
  ])

  return {
    sections,
  }
}
