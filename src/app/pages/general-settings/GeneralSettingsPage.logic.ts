import { computed, ref } from "vue"

export type GeneralSettingsTabKey = "all" | "company" | "branding" | "shortcuts" | "master-settings"

type TabItem = {
  key: GeneralSettingsTabKey
  label: string
}

type SettingsItem = {
  id: number
  label: string
  isDefault: boolean
}

type SettingsSection = {
  id: string
  tab: Exclude<GeneralSettingsTabKey, "all">
  label: string
  description: string
  icon: string
  iconBg: string
  iconColor: string
  open: boolean
  items: SettingsItem[]
}

const initialSections: SettingsSection[] = [
  {
    id: "company-information",
    tab: "company",
    label: "Company information",
    description: "Basic business identity and profile details.",
    icon: "🏢",
    iconBg: "#E6F1FB",
    iconColor: "#0C447C",
    open: true,
    items: [
      { id: 1, label: "Company name", isDefault: true },
      { id: 2, label: "Trading name", isDefault: false },
      { id: 3, label: "Email address", isDefault: false },
      { id: 4, label: "Phone number", isDefault: false },
      { id: 5, label: "VAT number", isDefault: false },
    ],
  },
  {
    id: "company-addresses",
    tab: "company",
    label: "Company addresses",
    description: "Manage registered, billing, and operational addresses.",
    icon: "📍",
    iconBg: "#EAF3DE",
    iconColor: "#27500A",
    open: false,
    items: [
      { id: 1, label: "Registered office", isDefault: true },
      { id: 2, label: "Billing address", isDefault: false },
      { id: 3, label: "Warehouse address", isDefault: false },
      { id: 4, label: "Returns address", isDefault: false },
    ],
  },
  {
    id: "branding-identity",
    tab: "branding",
    label: "Brand identity",
    description: "Set logo, company name display, and color values.",
    icon: "🎨",
    iconBg: "#FAECE7",
    iconColor: "#712B13",
    open: false,
    items: [
      { id: 1, label: "Primary color", isDefault: true },
      { id: 2, label: "Primary hover", isDefault: false },
      { id: 3, label: "Accent color", isDefault: false },
      { id: 4, label: "Logo URL", isDefault: false },
      { id: 5, label: "Favicon URL", isDefault: false },
    ],
  },
  {
    id: "branding-layout",
    tab: "branding",
    label: "Header & navigation branding",
    description: "Control logo visibility and compact navigation defaults.",
    icon: "🧭",
    iconBg: "#EEEDFE",
    iconColor: "#3C3489",
    open: false,
    items: [
      { id: 1, label: "Show logo in header", isDefault: true },
      { id: 2, label: "Show company name", isDefault: false },
      { id: 3, label: "Compact navigation", isDefault: false },
    ],
  },
  {
    id: "shortcuts-dashboard",
    tab: "shortcuts",
    label: "Dashboard shortcuts",
    description: "Manage shortcut actions shown on dashboards.",
    icon: "⚡",
    iconBg: "#FAEEDA",
    iconColor: "#633806",
    open: false,
    items: [
      { id: 1, label: "New Job", isDefault: true },
      { id: 2, label: "New Contact", isDefault: false },
      { id: 3, label: "Quotes", isDefault: false },
      { id: 4, label: "Reports", isDefault: false },
    ],
  },
  {
    id: "shortcuts-user-tools",
    tab: "shortcuts",
    label: "User quick tools",
    description: "Common utility shortcuts for daily operations.",
    icon: "🛠",
    iconBg: "#E1F5EE",
    iconColor: "#085041",
    open: false,
    items: [
      { id: 1, label: "Open jobs list", isDefault: true },
      { id: 2, label: "Open contacts", isDefault: false },
      { id: 3, label: "Open tasks", isDefault: false },
    ],
  },
  {
    id: "master-finance",
    tab: "master-settings",
    label: "Finance defaults",
    description: "Global defaults for currency, tax, and document settings.",
    icon: "£",
    iconBg: "#EAF3DE",
    iconColor: "#27500A",
    open: false,
    items: [
      { id: 1, label: "GBP", isDefault: true },
      { id: 2, label: "USD", isDefault: false },
      { id: 3, label: "EUR", isDefault: false },
      { id: 4, label: "30 Days Payment Term", isDefault: false },
    ],
  },
  {
    id: "master-job-defaults",
    tab: "master-settings",
    label: "Job defaults",
    description: "Set default prefixes, status, and job behavior.",
    icon: "📦",
    iconBg: "#FAECE7",
    iconColor: "#712B13",
    open: false,
    items: [
      { id: 1, label: "JOB Prefix", isDefault: true },
      { id: 2, label: "Draft Status", isDefault: false },
      { id: 3, label: "Auto numbering", isDefault: false },
      { id: 4, label: "Require customer reference", isDefault: false },
    ],
  },
]

export const tabs: TabItem[] = [
  { key: "all", label: "All" },
  { key: "company", label: "Company" },
  { key: "branding", label: "Branding" },
  { key: "shortcuts", label: "Shortcuts" },
  { key: "master-settings", label: "Master Settings" },
]

export const activeTab = ref<GeneralSettingsTabKey>("all")
export const allExpanded = ref(false)
export const lastSavedLabel = ref("All changes saved locally")
export const toastMessage = ref("")

export const sections = ref<SettingsSection[]>(
  initialSections.map(section => ({
    ...section,
    items: section.items.map(item => ({ ...item })),
  })),
)

export const newItemValues = ref<Record<string, string>>({})

let nextItemId = 1000
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string) {
  toastMessage.value = message

  if (toastTimer) {
    clearTimeout(toastTimer)
  }

  toastTimer = setTimeout(() => {
    toastMessage.value = ""
  }, 2200)
}

export function setActiveTab(tab: GeneralSettingsTabKey) {
  activeTab.value = tab
}

export const activeTabLabel = computed(() => {
  const match = tabs.find(tab => tab.key === activeTab.value)
  return match?.label ?? "General Settings"
})

export const filteredSections = computed(() => {
  if (activeTab.value === "all") {
    return sections.value
  }

  return sections.value.filter(section => section.tab === activeTab.value)
})

export const totalOptions = computed(() => {
  return filteredSections.value.reduce((sum, section) => sum + section.items.length, 0)
})

export function getTabCount(tabKey: GeneralSettingsTabKey) {
  if (tabKey === "all") {
    return sections.value.length
  }

  return sections.value.filter(section => section.tab === tabKey).length
}

export function toggleSection(sectionId: string) {
  const section = sections.value.find(item => item.id === sectionId)
  if (!section) return

  section.open = !section.open
}

export function toggleAll() {
  allExpanded.value = !allExpanded.value

  sections.value.forEach(section => {
    if (activeTab.value === "all" || section.tab === activeTab.value) {
      section.open = allExpanded.value
    }
  })
}

export function visibleItems(section: SettingsSection) {
  return section.items
}

export function addItem(sectionId: string) {
  const value = (newItemValues.value[sectionId] ?? "").trim()
  if (!value) return

  const section = sections.value.find(item => item.id === sectionId)
  if (!section) return

  const exists = section.items.some(item => item.label.toLowerCase() === value.toLowerCase())

  if (exists) {
    showToast("That item already exists.")
    return
  }

  section.items.push({
    id: nextItemId++,
    label: value,
    isDefault: false,
  })

  newItemValues.value[sectionId] = ""
  saveLocally(`"${value}" added to ${section.label}`)
}

export function removeItem(sectionId: string, itemId: number) {
  const section = sections.value.find(item => item.id === sectionId)
  if (!section) return

  const target = section.items.find(item => item.id === itemId)
  if (!target) return

  section.items = section.items.filter(item => item.id !== itemId)
  saveLocally(`"${target.label}" removed.`)
}

export function setDefault(sectionId: string, itemId: number) {
  const section = sections.value.find(item => item.id === sectionId)
  if (!section) return

  let selectedLabel = ""

  section.items.forEach(item => {
    item.isDefault = item.id === itemId
    if (item.id === itemId) {
      selectedLabel = item.label
    }
  })

  saveLocally(`"${selectedLabel}" set as default.`)
}

export function moveItem(sectionId: string, itemId: number, direction: -1 | 1) {
  const section = sections.value.find(item => item.id === sectionId)
  if (!section) return

  const index = section.items.findIndex(item => item.id === itemId)
  if (index === -1) return

  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= section.items.length) return

  const current = section.items[index]
  const target = section.items[nextIndex]

  if (!current || !target) return

  section.items[index] = target
  section.items[nextIndex] = current

  saveLocally("Order updated.")
}

export function resetDefaults() {
  sections.value = initialSections.map(section => ({
    ...section,
    items: section.items.map(item => ({ ...item })),
  }))

  newItemValues.value = {}
  allExpanded.value = false
  saveLocally("Reset to defaults.")
}

export function exportSettings() {
  const output = sections.value.map(section => ({
    id: section.id,
    tab: section.tab,
    label: section.label,
    description: section.description,
    items: section.items.map(item => ({
      label: item.label,
      isDefault: item.isDefault,
    })),
  }))

  const blob = new Blob([JSON.stringify(output, null, 2)], {
    type: "application/json",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "general_settings.json"
  link.click()
  URL.revokeObjectURL(url)

  showToast("JSON exported.")
}

function saveLocally(toast: string) {
  lastSavedLabel.value = `Saved ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`

  showToast(toast)
}

export function saveChanges() {
  saveLocally("Changes saved.")
}
