import { computed, onMounted, ref } from "vue"
import { useToast } from "primevue/usetoast"

type SignatureFieldKey = "body" | "name" | "title" | "phone" | "email"

type SignatureStyle = {
  fontFamily: string
  fontSize: string
  color: string
}

type UserSignature = {
  name: string
  title: string
  phone: string
  email: string
  body: string
  imagePreview: string | null
  styles: Record<SignatureFieldKey, SignatureStyle>
}

type StoredUserSignature = Partial<UserSignature> & Partial<SignatureStyle>

const signatureStorageKey = "pc-cargo.branding.signature"
const defaultSignatureStyle: SignatureStyle = {
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  color: "#2f2f2f",
}

const signatureFieldLabels: Record<SignatureFieldKey, string> = {
  body: "Signature message",
  name: "Name",
  title: "Title",
  phone: "Phone",
  email: "Email",
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

export function useUserSettingsSignaturePage() {
  const toast = useToast()
  const fontFamilyOptions = [
    "Arial, sans-serif",
    "Georgia, serif",
    "Inter, sans-serif",
    "Times New Roman, serif",
    "Verdana, sans-serif",
  ]
  const fontSizeOptions = ["12px", "13px", "14px", "15px", "16px", "18px", "20px"]
  const styleDialogVisible = ref(false)
  const activeStyleField = ref<SignatureFieldKey>("body")
  const signature = ref<UserSignature>({
    name: "Operations Team",
    title: "Customer Support",
    phone: "",
    email: "",
    body: "Kind regards,",
    imagePreview: null,
    styles: createDefaultStyles(),
  })

  const hasSignatureImage = computed(() => !!signature.value.imagePreview)
  const activeStyleLabel = computed(() => signatureFieldLabels[activeStyleField.value])
  const activeFieldStyle = computed(() => signature.value.styles[activeStyleField.value])
  const activeFieldPreview = computed(() => {
    const value = signature.value[activeStyleField.value]
    return value || activeStyleLabel.value
  })

  function getSignatureFieldStyle(field: SignatureFieldKey) {
    return signature.value.styles[field]
  }

  function openStyleDialog(field: SignatureFieldKey) {
    activeStyleField.value = field
    styleDialogVisible.value = true
  }

  function loadSavedSignature() {
    try {
      const raw = localStorage.getItem(signatureStorageKey)
      if (!raw) return

      const parsed = JSON.parse(raw) as StoredUserSignature
      signature.value = {
        name: parsed.name ?? "",
        title: parsed.title ?? "",
        phone: parsed.phone ?? "",
        email: parsed.email ?? "",
        body: parsed.body ?? "",
        imagePreview: parsed.imagePreview ?? null,
        styles: normalizeStyles(parsed.styles, parsed),
      }
    } catch {
      localStorage.removeItem(signatureStorageKey)
    }
  }

  function onSignatureImageSelect(event: any) {
    const file: File | undefined = event?.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      signature.value.imagePreview = typeof reader.result === "string" ? reader.result : null
    }
    reader.readAsDataURL(file)
  }

  function onClearSignatureImage() {
    signature.value.imagePreview = null
  }

  function onSaveSignature() {
    const nextSignature: UserSignature = {
      name: signature.value.name.trim(),
      title: signature.value.title.trim(),
      phone: signature.value.phone.trim(),
      email: signature.value.email.trim(),
      body: signature.value.body.trim(),
      imagePreview: signature.value.imagePreview,
      styles: normalizeStyles(signature.value.styles),
    }

    signature.value = nextSignature
    localStorage.setItem(signatureStorageKey, JSON.stringify(nextSignature))

    toast.add({
      severity: "success",
      summary: "Saved",
      detail: "Signature saved to your profile settings.",
      life: 2500,
    })
  }

  onMounted(loadSavedSignature)

  return {
    signature,
    activeFieldPreview,
    activeFieldStyle,
    activeStyleLabel,
    activeStyleField,
    fontFamilyOptions,
    fontSizeOptions,
    hasSignatureImage,
    styleDialogVisible,
    getSignatureFieldStyle,
    openStyleDialog,
    onClearSignatureImage,
    onSaveSignature,
    onSignatureImageSelect,
  }
}
