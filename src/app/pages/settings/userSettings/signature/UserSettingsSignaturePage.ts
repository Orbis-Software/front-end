import { computed, onMounted, ref } from "vue"
import { useToast } from "primevue/usetoast"
import { useUserSignatureStore } from "@/app/stores/user-signature"
import type {
  SignatureFieldKey,
  SignatureStyle,
  UserSignature as StoredUserSignature,
  UserSignatureForm,
} from "@/app/types/user-signature"

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
  const signatureStore = useUserSignatureStore()
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
  const selectedImage = ref<File | null>(null)
  const clearImage = ref(false)
  const signature = ref<UserSignatureForm>({
    name: "Operations Team",
    title: "Customer Support",
    phone: "",
    email: "",
    body: "Kind regards,",
    imagePreview: null,
    styles: createDefaultStyles(),
  })

  const hasSignatureImage = computed(() => !!signature.value.imagePreview)
  const loading = computed(() => signatureStore.loading)
  const saving = computed(() => signatureStore.saving)
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

  function applyStoredSignature(saved: StoredUserSignature | null) {
    if (!saved) return

    signature.value = {
      name: saved.name ?? "",
      title: saved.title ?? "",
      phone: saved.phone ?? "",
      email: saved.email ?? "",
      body: saved.body ?? "",
      imagePreview: saved.imageUrl ?? null,
      styles: normalizeStyles(saved.styles),
    }
    selectedImage.value = null
    clearImage.value = false
  }

  async function loadSavedSignature() {
    try {
      await signatureStore.fetch()
      applyStoredSignature(signatureStore.signature)
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Load failed",
        detail:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load your saved signature.",
        life: 5000,
      })
    }
  }

  function onSignatureImageSelect(event: any) {
    const file: File | undefined = event?.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      signature.value.imagePreview = typeof reader.result === "string" ? reader.result : null
      selectedImage.value = file
      clearImage.value = false
    }
    reader.readAsDataURL(file)
  }

  function onClearSignatureImage() {
    signature.value.imagePreview = null
    selectedImage.value = null
    clearImage.value = true
  }

  async function onSaveSignature() {
    const nextSignature: UserSignatureForm = {
      name: signature.value.name.trim(),
      title: signature.value.title.trim(),
      phone: signature.value.phone.trim(),
      email: signature.value.email.trim(),
      body: signature.value.body.trim(),
      imagePreview: signature.value.imagePreview,
      styles: normalizeStyles(signature.value.styles),
    }

    try {
      const saved = await signatureStore.save({
        name: nextSignature.name,
        title: nextSignature.title,
        phone: nextSignature.phone,
        email: nextSignature.email,
        body: nextSignature.body,
        styles: nextSignature.styles,
        image: selectedImage.value,
        clearImage: clearImage.value,
      })

      applyStoredSignature(saved)

      toast.add({
        severity: "success",
        summary: "Saved",
        detail: "Signature saved to your profile settings.",
        life: 2500,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Save failed",
        detail:
          error?.response?.data?.message ||
          error?.message ||
          signatureStore.error ||
          "Unable to save your signature.",
        life: 5000,
      })
    }
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
    loading,
    saving,
    styleDialogVisible,
    getSignatureFieldStyle,
    openStyleDialog,
    onClearSignatureImage,
    onSaveSignature,
    onSignatureImageSelect,
  }
}
