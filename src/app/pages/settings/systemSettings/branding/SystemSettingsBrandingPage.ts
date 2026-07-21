import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useCompanyBrandingSettingsStore } from "@/app/stores/company-branding-settings"
import { useCompanyStore } from "@/app/stores/company"
import { useUserSignatureStore } from "@/app/stores/user-signature"
import type { Company } from "@/app/types/company"
import type {
  BrandingDocumentFormat as DocumentFormat,
  BrandingDocumentSection,
  BrandingDocumentTone as DocumentTone,
  BrandingHeaderFieldKey,
  BrandingHeaderSettings,
  BrandingHeaderStyle,
  BrandingPdfLayout as PdfLayout,
} from "@/app/types/company-branding-settings"
import type {
  SignatureFieldKey,
  SignatureStyle,
  UserSignatureForm as BrandingSignature,
} from "@/app/types/user-signature"
import { useToast } from "primevue/usetoast"

type BrandingTab = "logo-assets" | "header" | "colours" | "documents"

const fallbackLogo = "/orbis-logo.png"
const defaultSignatureStyle: SignatureStyle = {
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  color: "#2f2f2f",
}
const defaultHeaderStyle: BrandingHeaderStyle = {
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  color: "#2f2f2f",
}
const headerFieldLabels: Record<BrandingHeaderFieldKey, string> = {
  companyName: "Company name",
  tagline: "Tagline",
  phone: "Phone",
  email: "Email",
  website: "Website",
  address: "Address",
  message: "Header message",
}

function createDefaultStyles(): Record<SignatureFieldKey, SignatureStyle> {
  return {
    body: { ...defaultSignatureStyle },
    name: { ...defaultSignatureStyle, fontSize: "15px" },
    title: { ...defaultSignatureStyle, color: "#5f5f5f" },
    phone: { ...defaultSignatureStyle, fontSize: "12px", color: "#5f5f5f" },
    email: { ...defaultSignatureStyle, fontSize: "12px", color: "#5f5f5f" },
  }
}

function createDefaultHeaderStyles(): Record<BrandingHeaderFieldKey, BrandingHeaderStyle> {
  return {
    companyName: { ...defaultHeaderStyle, fontSize: "20px", color: "#171717" },
    tagline: { ...defaultHeaderStyle, fontSize: "13px", color: "#6b7280" },
    phone: { ...defaultHeaderStyle, fontSize: "12px", color: "#4b5563" },
    email: { ...defaultHeaderStyle, fontSize: "12px", color: "#4b5563" },
    website: { ...defaultHeaderStyle, fontSize: "12px", color: "#4b5563" },
    address: { ...defaultHeaderStyle, fontSize: "12px", color: "#4b5563" },
    message: { ...defaultHeaderStyle, fontSize: "13px", color: "#2f2f2f" },
  }
}

function normalizeStyles(
  saved?: Partial<Record<SignatureFieldKey, Partial<SignatureStyle>>>,
  legacy?: Partial<SignatureStyle>,
) {
  const defaults = createDefaultStyles()
  const legacyStyle = {
    ...defaultSignatureStyle,
    ...(legacy?.fontFamily || legacy?.fontSize || legacy?.color ? legacy : {}),
  }

  return (Object.keys(defaults) as SignatureFieldKey[]).reduce(
    (styles, key) => {
      styles[key] = {
        ...defaults[key],
        ...(saved?.[key] ?? legacyStyle),
      }
      return styles
    },
    {} as Record<SignatureFieldKey, SignatureStyle>,
  )
}

function normalizeHeaderStyles(
  saved?: Partial<Record<BrandingHeaderFieldKey, Partial<BrandingHeaderStyle>>>,
) {
  const defaults = createDefaultHeaderStyles()

  return (Object.keys(defaults) as BrandingHeaderFieldKey[]).reduce(
    (styles, key) => {
      styles[key] = {
        ...defaults[key],
        ...(saved?.[key] ?? {}),
      }
      return styles
    },
    {} as Record<BrandingHeaderFieldKey, BrandingHeaderStyle>,
  )
}

export function useSystemSettingsBrandingPage() {
  const store = useCompanyStore()
  const brandingSettingsStore = useCompanyBrandingSettingsStore()
  const signatureStore = useUserSignatureStore()
  const toast = useToast()
  const activeTab = ref<BrandingTab>("logo-assets")
  const logoFile = ref<File | null>(null)
  const logoPreview = ref<string | null>(null)
  const localLogoUrl = ref<string | null>(null)
  const headerImageFile = ref<File | null>(null)
  const headerImagePreview = ref<string | null>(null)
  const clearHeaderImage = ref(false)
  const headerStyleDialogVisible = ref(false)
  const activeHeaderStyleField = ref<BrandingHeaderFieldKey>("companyName")
  const errorMessage = ref("")
  const savedSignature = ref<BrandingSignature | null>(null)
  const fontFamilyOptions = [
    "Arial, sans-serif",
    "Georgia, serif",
    "Inter, sans-serif",
    "Times New Roman, serif",
    "Verdana, sans-serif",
  ]
  const fontSizeOptions = ["12px", "13px", "14px", "15px", "16px", "18px", "20px", "24px"]
  const documentFormatOptions: DocumentFormat[] = ["PDF", "Email"]
  const documentToneOptions: DocumentTone[] = ["Formal", "Operational", "Customer Friendly"]
  const pdfLayoutOptions: PdfLayout[] = ["Standard", "Compact", "Detailed"]
  const headerSettings = ref<BrandingHeaderSettings>({
    companyName: "",
    tagline: "Freight, customs, and logistics services",
    phone: "",
    email: "",
    website: "",
    address: "",
    message: "Thank you for choosing our team.",
    styles: createDefaultHeaderStyles(),
  })

  const documentSections = ref<BrandingDocumentSection[]>([
    {
      id: "invoice-pdf",
      title: "Invoice PDF",
      description: "Layout and wording for generated customer invoice PDFs.",
      format: "PDF",
      tone: "Formal",
      expanded: true,
      header: "Tax Invoice",
      subject: "",
      body: "Line items, totals, tax summary, and payment information will be shown here.",
      footer: "Thank you for your business.",
      layout: "Standard",
      includeLogo: true,
      includeBankDetails: true,
      includeSignature: false,
    },
    {
      id: "quote-pdf",
      title: "Quote PDF",
      description: "Branding for customer quotation and estimate PDF exports.",
      format: "PDF",
      tone: "Customer Friendly",
      expanded: false,
      header: "Quotation",
      subject: "",
      body: "Service details, quoted charges, validity, and acceptance information will be shown here.",
      footer: "Rates are valid subject to availability and final shipment details.",
      layout: "Detailed",
      includeLogo: true,
      includeBankDetails: false,
      includeSignature: false,
    },
    {
      id: "job-pdf",
      title: "Job Document PDF",
      description: "Default styling for job sheets, delivery notes, and operational PDFs.",
      format: "PDF",
      tone: "Operational",
      expanded: false,
      header: "Job Document",
      subject: "",
      body: "Job references, routing details, cargo information, and operational notes will be shown here.",
      footer: "Generated by operations.",
      layout: "Compact",
      includeLogo: true,
      includeBankDetails: false,
      includeSignature: false,
    },
    {
      id: "invoice-email",
      title: "Invoice Email",
      description: "Subject line and body footer for sending customer invoices.",
      format: "Email",
      tone: "Formal",
      expanded: false,
      header: "Please find your invoice attached.",
      subject: "Invoice {{ invoice_number }} from {{ company_name }}",
      body: "<p>Hello {{ customer_name }},</p><p>Please find attached invoice <strong>{{ invoice_number }}</strong> for your records.</p><p>Payment details are included below.</p>",
      footer: "If you have any questions, please reply to this email.",
      layout: "Standard",
      includeLogo: true,
      includeBankDetails: true,
      includeSignature: true,
    },
    {
      id: "shipment-email",
      title: "Shipment Update Email",
      description: "Default format for milestone and tracking update emails.",
      format: "Email",
      tone: "Customer Friendly",
      expanded: false,
      header: "Your shipment has been updated.",
      subject: "Shipment update for {{ job_number }}",
      body: "<p>Hello {{ customer_name }},</p><p>Your shipment <strong>{{ job_number }}</strong> has a new status update.</p><p>Latest status: {{ shipment_status }}.</p>",
      footer: "You can contact our team for any further assistance.",
      layout: "Standard",
      includeLogo: true,
      includeBankDetails: false,
      includeSignature: true,
    },
    {
      id: "notification-email",
      title: "System Notification Email",
      description: "Short transactional email format for alerts and account notices.",
      format: "Email",
      tone: "Operational",
      expanded: false,
      header: "Notification",
      subject: "{{ notification_title }}",
      body: "<p>{{ notification_message }}</p>",
      footer: "This is an automated message.",
      layout: "Compact",
      includeLogo: true,
      includeBankDetails: false,
      includeSignature: false,
    },
  ])

  const company = computed(() => store.item as Company | null)
  const loading = computed(
    () => store.loading || brandingSettingsStore.loading || signatureStore.loading,
  )
  const saving = computed(() => store.saving || brandingSettingsStore.saving)

  const tabs: Array<{ label: string; value: BrandingTab }> = [
    { label: "Logo & Assets", value: "logo-assets" },
    { label: "Header", value: "header" },
    { label: "Colours", value: "colours" },
    { label: "Documents", value: "documents" },
  ]

  const companyName = computed(() => {
    return company.value?.trading_name || company.value?.legal_name || "Company"
  })

  const currentLogoSrc = computed(() => {
    return logoPreview.value ?? localLogoUrl.value ?? fallbackLogo
  })

  const hasLogoChange = computed(() => !!logoFile.value)
  const currentHeaderImageSrc = computed(() => {
    return (
      headerImagePreview.value ??
      brandingSettingsStore.settings?.headerImageUrl ??
      currentLogoSrc.value
    )
  })
  const hasHeaderImage = computed(() => {
    return Boolean(headerImagePreview.value || brandingSettingsStore.settings?.headerImageUrl)
  })
  const activeHeaderStyleLabel = computed(() => headerFieldLabels[activeHeaderStyleField.value])
  const activeHeaderFieldStyle = computed(
    () => headerSettings.value.styles[activeHeaderStyleField.value],
  )
  const activeHeaderFieldPreview = computed(() => {
    return headerSettings.value[activeHeaderStyleField.value] || activeHeaderStyleLabel.value
  })
  const activeSignature = computed<BrandingSignature>(() => {
    return (
      savedSignature.value ?? {
        name: "Operations Team",
        title: "Customer Support",
        phone: "",
        email: "",
        body: "Kind regards,",
        imagePreview: null,
        styles: createDefaultStyles(),
      }
    )
  })
  const hasSavedSignature = computed(() => !!savedSignature.value)

  function getActiveSignatureFieldStyle(field: SignatureFieldKey) {
    return activeSignature.value.styles[field]
  }

  function getHeaderFieldStyle(field: BrandingHeaderFieldKey) {
    return headerSettings.value.styles[field]
  }

  function openHeaderStyleDialog(field: BrandingHeaderFieldKey) {
    activeHeaderStyleField.value = field
    headerStyleDialogVisible.value = true
  }

  function setActiveTab(tab: BrandingTab) {
    activeTab.value = tab
  }

  function toggleDocumentSection(sectionId: string) {
    const section = documentSections.value.find(item => item.id === sectionId)
    if (section) section.expanded = !section.expanded
  }

  function updateDocumentBody(sectionId: string, event: Event) {
    const section = documentSections.value.find(item => item.id === sectionId)
    const element = event.target as HTMLElement | null
    if (section && element) section.body = element.innerHTML
  }

  function applyEditorCommand(command: "bold" | "italic" | "insertUnorderedList") {
    document.execCommand(command)
  }

  function revokePreview() {
    if (logoPreview.value?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview.value)
    }
  }

  function revokeHeaderPreview() {
    if (headerImagePreview.value?.startsWith("blob:")) {
      URL.revokeObjectURL(headerImagePreview.value)
    }
  }

  function hydrateFromCompany() {
    localLogoUrl.value = company.value?.logo_url ?? null
    headerSettings.value.companyName =
      headerSettings.value.companyName ||
      company.value?.trading_name ||
      company.value?.legal_name ||
      ""

    if (!logoFile.value) {
      revokePreview()
      logoPreview.value = null
    }
  }

  async function onRefresh() {
    errorMessage.value = ""
    await Promise.all([store.fetch(), brandingSettingsStore.fetch(), signatureStore.fetch()])
    logoFile.value = null
    hydrateFromCompany()
    hydrateFromBrandingSettings()
    hydrateFromSignature()
  }

  function onLogoSelect(event: any) {
    const file: File | undefined = event?.files?.[0]
    if (!file) return

    errorMessage.value = ""
    logoFile.value = file
    revokePreview()
    logoPreview.value = URL.createObjectURL(file)
  }

  function onClearLogoSelection() {
    logoFile.value = null
    revokePreview()
    logoPreview.value = null
    errorMessage.value = ""
  }

  function hydrateFromSignature() {
    const parsed = signatureStore.signature

    if (!parsed) {
      savedSignature.value = null
      return
    }

    savedSignature.value = {
      name: parsed.name ?? "",
      title: parsed.title ?? "",
      phone: parsed.phone ?? "",
      email: parsed.email ?? "",
      body: parsed.body ?? "",
      imagePreview: parsed.imageUrl ?? null,
      styles: normalizeStyles(parsed.styles),
    }
  }

  function hydrateFromBrandingSettings() {
    const savedSections = brandingSettingsStore.settings?.documentSections
    const savedHeader = brandingSettingsStore.settings?.headerSettings

    if (savedHeader) {
      headerSettings.value = {
        companyName:
          savedHeader.companyName || company.value?.trading_name || company.value?.legal_name || "",
        tagline: savedHeader.tagline ?? "",
        phone: savedHeader.phone ?? "",
        email: savedHeader.email ?? "",
        website: savedHeader.website ?? "",
        address: savedHeader.address ?? "",
        message: savedHeader.message ?? "",
        styles: normalizeHeaderStyles(savedHeader.styles),
      }
      headerImageFile.value = null
      clearHeaderImage.value = false
      revokeHeaderPreview()
      headerImagePreview.value = null
    }

    if (!savedSections?.length) return

    documentSections.value = savedSections.map(section => ({
      ...section,
      expanded: Boolean(section.expanded),
    }))
  }

  function onHeaderImageSelect(event: any) {
    const file: File | undefined = event?.files?.[0]
    if (!file) return

    headerImageFile.value = file
    clearHeaderImage.value = false
    revokeHeaderPreview()
    headerImagePreview.value = URL.createObjectURL(file)
  }

  function onClearHeaderImage() {
    headerImageFile.value = null
    clearHeaderImage.value = true
    revokeHeaderPreview()
    headerImagePreview.value = null
  }

  async function onSaveLogo() {
    if (!company.value || !logoFile.value) return

    errorMessage.value = ""

    try {
      const payload = new FormData()
      payload.append("logo", logoFile.value)

      await store.update(payload as any)
      logoFile.value = null
      hydrateFromCompany()

      toast.add({
        severity: "success",
        summary: "Saved",
        detail: "Company logo updated.",
        life: 2500,
      })
    } catch (error: any) {
      const detail =
        error?.response?.data?.message ??
        (error instanceof Error ? error.message : "Unable to save the logo. Please try again.")

      errorMessage.value = detail

      toast.add({
        severity: "error",
        summary: "Logo not saved",
        detail,
        life: 5000,
      })
    }
  }

  async function onSaveDocumentBranding() {
    try {
      await brandingSettingsStore.saveDocuments(documentSections.value)

      toast.add({
        severity: "success",
        summary: "Saved",
        detail: "Document branding settings updated.",
        life: 2500,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Branding not saved",
        detail:
          error?.response?.data?.message ||
          error?.message ||
          brandingSettingsStore.error ||
          "Unable to save document branding settings.",
        life: 5000,
      })
    }
  }

  async function onSaveHeaderBranding() {
    try {
      const saved = await brandingSettingsStore.saveHeader(
        {
          ...headerSettings.value,
          companyName: headerSettings.value.companyName.trim(),
          tagline: headerSettings.value.tagline.trim(),
          phone: headerSettings.value.phone.trim(),
          email: headerSettings.value.email.trim(),
          website: headerSettings.value.website.trim(),
          address: headerSettings.value.address.trim(),
          message: headerSettings.value.message.trim(),
          styles: normalizeHeaderStyles(headerSettings.value.styles),
        },
        headerImageFile.value,
        clearHeaderImage.value,
      )

      headerImageFile.value = null
      clearHeaderImage.value = false
      revokeHeaderPreview()
      headerImagePreview.value = null
      hydrateFromBrandingSettings()

      toast.add({
        severity: "success",
        summary: "Saved",
        detail: saved?.headerImageUrl
          ? "Company header settings and image updated."
          : "Company header settings updated.",
        life: 2500,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Header not saved",
        detail:
          error?.response?.data?.message ||
          error?.message ||
          brandingSettingsStore.error ||
          "Unable to save company header settings.",
        life: 5000,
      })
    }
  }

  watch(company, hydrateFromCompany)
  watch(() => brandingSettingsStore.settings, hydrateFromBrandingSettings)
  watch(() => signatureStore.signature, hydrateFromSignature)

  onMounted(async () => {
    store.hydrateFromAuth()
    hydrateFromCompany()

    await onRefresh()
  })

  onBeforeUnmount(() => {
    revokePreview()
    revokeHeaderPreview()
  })

  return {
    activeTab,
    tabs,
    company,
    companyName,
    currentLogoSrc,
    currentHeaderImageSrc,
    errorMessage,
    hasLogoChange,
    hasHeaderImage,
    headerSettings,
    headerStyleDialogVisible,
    activeHeaderFieldPreview,
    activeHeaderFieldStyle,
    activeHeaderStyleLabel,
    activeSignature,
    hasSavedSignature,
    loading,
    saving,
    fontFamilyOptions,
    fontSizeOptions,
    documentFormatOptions,
    documentSections,
    documentToneOptions,
    pdfLayoutOptions,
    setActiveTab,
    getActiveSignatureFieldStyle,
    getHeaderFieldStyle,
    openHeaderStyleDialog,
    toggleDocumentSection,
    updateDocumentBody,
    applyEditorCommand,
    onSaveDocumentBranding,
    onSaveHeaderBranding,
    onHeaderImageSelect,
    onClearHeaderImage,
    onClearLogoSelection,
    onLogoSelect,
    onRefresh,
    onSaveLogo,
  }
}
