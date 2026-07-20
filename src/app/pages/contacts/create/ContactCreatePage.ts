import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"
import { useContactStore } from "@/app/stores/contact"
import { useCountryStore } from "@/app/stores/country"
import { useEmployeeStore } from "@/app/stores/employee"
import { useAuthStore } from "@/app/stores/auth"
import { buildInitialBranchPayload } from "@/app/utils/contactBranch"
import type { Country } from "@/app/types/country"
import type { ContactCreatePayload } from "@/app/types/contact"

type UsageKey = "delivery" | "collection" | "consignee" | "accounts" | "headoffice"

export function useContactCreatePage() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const store = useContactStore()
  const countryStore = useCountryStore()
  const employeeStore = useEmployeeStore()
  const auth = useAuthStore()

  const saving = ref(false)
  const loadingContact = ref(false)
  const leaveDialogVisible = ref(false)

  const cleanFormSnapshot = ref("")
  const formReady = ref(false)
  let allowNavigation = false
  let leaveDecisionPromise: Promise<boolean> | null = null
  let resolveLeaveDecision: ((allow: boolean) => void) | null = null

  const contactId = computed<number | null>(() => {
    const raw = route.params.id
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  })

  const isEdit = computed(() => contactId.value !== null)

  const form = reactive<any>({
    contact_type_ids: [] as number[],

    company_name: "",
    account_number: null as string | null,
    account_manager_id: null as number | null,
    account_support_id: null as number | null,

    credit_limit: null as number | null,
    currency_preference: "",

    registration_number: "",
    vat_number: "",
    eori: "",

    address_line_1: "",
    address_line_2: "",
    address_line_3: "",
    city: "",
    county_state: "",
    postal_code: "",

    country_id: null as number | null,

    phone_country_code: "",
    phone: "",
    email: "",
    website: "",

    address_usage: {
      delivery: false,
      collection: false,
      consignee: false,
      accounts: false,
      headoffice: false,
    },
  })

  const selectedCountry = ref<Country | null>(null)
  const countrySuggestions = ref<Country[]>([])
  const countrySearching = ref(false)

  function currentFormSnapshot() {
    const selectedCountryValue = selectedCountry.value as Country | string | null

    return JSON.stringify({
      contact_type_ids: [...form.contact_type_ids].sort((a, b) => a - b),
      company_name: form.company_name,
      account_number: form.account_number,
      account_manager_id: form.account_manager_id,
      account_support_id: form.account_support_id,
      credit_limit: form.credit_limit,
      currency_preference: form.currency_preference,
      registration_number: form.registration_number,
      vat_number: form.vat_number,
      eori: form.eori,
      address_line_1: form.address_line_1,
      address_line_2: form.address_line_2,
      address_line_3: form.address_line_3,
      city: form.city,
      county_state: form.county_state,
      postal_code: form.postal_code,
      country_id: form.country_id,
      selected_country:
        typeof selectedCountryValue === "string"
          ? selectedCountryValue
          : (selectedCountryValue?.id ?? null),
      phone_country_code: form.phone_country_code,
      phone: form.phone,
      email: form.email,
      website: form.website,
      address_usage: { ...form.address_usage },
    })
  }

  function markFormClean() {
    cleanFormSnapshot.value = currentFormSnapshot()
    formReady.value = true
  }

  const hasUnsavedChanges = computed(
    () => formReady.value && currentFormSnapshot() !== cleanFormSnapshot.value,
  )

  function resetForm() {
    form.contact_type_ids = []

    form.company_name = ""
    form.account_number = null
    form.account_manager_id = null
    form.account_support_id = null

    form.credit_limit = null
    form.currency_preference = ""

    form.registration_number = ""
    form.vat_number = ""
    form.eori = ""

    form.address_line_1 = ""
    form.address_line_2 = ""
    form.address_line_3 = ""
    form.city = ""
    form.county_state = ""
    form.postal_code = ""

    form.country_id = null
    selectedCountry.value = null

    form.phone_country_code = ""
    form.phone = ""
    form.email = ""
    form.website = ""

    form.address_usage.delivery = false
    form.address_usage.collection = false
    form.address_usage.consignee = false
    form.address_usage.accounts = false
    form.address_usage.headoffice = false
  }

  function hydrateFromContact(c: any) {
    form.contact_type_ids = (c.contact_types ?? []).map((t: any) => t.id)

    form.company_name = c.company_name ?? ""
    form.account_number = c.account_number ?? null
    form.account_manager_id = c.account_manager_id ?? null
    form.account_support_id = c.account_support_id ?? null

    form.credit_limit = c.credit_limit ?? null
    form.currency_preference = c.currency_preference ?? ""

    form.registration_number = c.registration_number ?? ""
    form.vat_number = c.vat_number ?? ""
    form.eori = c.eori ?? ""

    form.address_line_1 = c.address_line_1 ?? ""
    form.address_line_2 = c.address_line_2 ?? ""
    form.address_line_3 = c.address_line_3 ?? ""
    form.city = c.city ?? ""
    form.county_state = c.county_state ?? ""
    form.postal_code = c.postal_code ?? ""

    form.country_id = c.country_id ?? null
    selectedCountry.value = countryStore.items.find(x => x.id === form.country_id) ?? null

    // If API stores phone as a single string, keep it in form.phone
    // (so user can edit it)
    form.phone = c.phone ?? ""
    form.phone_country_code = ""

    form.email = c.email ?? ""
    form.website = c.website ?? ""

    form.address_usage.delivery = !!c.is_delivery
    form.address_usage.collection = !!c.is_collection
    form.address_usage.consignee = !!c.is_consignee
    form.address_usage.accounts = !!c.is_accounts
    form.address_usage.headoffice = !!c.is_headoffice
  }

  onMounted(async () => {
    window.addEventListener("beforeunload", handleBeforeUnload)

    if (!isEdit.value) markFormClean()

    if (!store.types.length) await store.fetchTypes()
    if (!countryStore.items.length) await countryStore.fetch()
    if (!employeeStore.items.length) {
      try {
        await employeeStore.fetch({ per_page: 200 })
      } catch {
        toast.add({
          severity: "warn",
          summary: "Employees unavailable",
          detail: "The contact can still be edited, but account assignments could not be loaded.",
          life: 4500,
        })
      }
    }

    // ✅ load existing contact for edit
    if (isEdit.value && contactId.value) {
      loadingContact.value = true
      try {
        const res = await store.find(contactId.value)
        const c = (res as any)?.data ?? res
        hydrateFromContact(c)
      } catch (err) {
        toast.add({
          severity: "error",
          summary: "Load failed",
          detail: "Unable to load this contact for editing.",
          life: 4500,
        })
        allowNavigation = true
        router.push("/contacts")
        return
      } finally {
        loadingContact.value = false
      }

      markFormClean()
    }
  })

  function requestLeaveDecision(): Promise<boolean> {
    if (leaveDecisionPromise) return leaveDecisionPromise

    leaveDialogVisible.value = true
    leaveDecisionPromise = new Promise<boolean>(resolve => {
      resolveLeaveDecision = resolve
    })

    return leaveDecisionPromise
  }

  function completeLeaveDecision(allow: boolean) {
    const resolve = resolveLeaveDecision
    resolveLeaveDecision = null
    leaveDecisionPromise = null
    leaveDialogVisible.value = false

    if (allow) allowNavigation = true
    resolve?.(allow)
  }

  function stayOnContact() {
    completeLeaveDecision(false)
  }

  function leaveWithoutSaving() {
    completeLeaveDecision(true)
  }

  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (allowNavigation || !hasUnsavedChanges.value) return

    event.preventDefault()
    event.returnValue = ""
  }

  onBeforeRouteLeave(() => {
    if (allowNavigation || !hasUnsavedChanges.value) return true
    return requestLeaveDecision()
  })

  onBeforeUnmount(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload)
  })

  function toggleType(id: number) {
    const idx = form.contact_type_ids.indexOf(id)
    if (idx >= 0) form.contact_type_ids.splice(idx, 1)
    else form.contact_type_ids.push(id)
  }

  function toggleUsage(key: UsageKey) {
    form.address_usage[key] = !form.address_usage[key]
  }

  const accountNumberPreview = computed(() => form.account_number ?? "")

  const canManageCredit = computed(() => {
    return (
      auth.isAdmin ||
      auth.isDev ||
      auth.hasRole("company-manager") ||
      auth.hasPermission("mgmt.accounts.invoices.manage")
    )
  })

  const creditLimitText = computed({
    get() {
      return form.credit_limit === null || form.credit_limit === undefined
        ? ""
        : String(form.credit_limit)
    },
    set(v: string) {
      const raw = v.replace(/[^\d.]/g, "")
      if (!raw) form.credit_limit = null
      else form.credit_limit = Number(raw)
    },
  })

  function onCurrencyBlur() {
    form.currency_preference = (form.currency_preference ?? "").trim().toUpperCase()
  }

  async function searchCountries(q: string) {
    const query = (q ?? "").trim()
    if (!query) {
      countrySuggestions.value = countryStore.items.slice(0, 20)
      return
    }

    countrySearching.value = true
    try {
      countryStore.setSearch?.(query)
      await countryStore.fetch()
      countrySuggestions.value = countryStore.items.slice(0, 30)
    } finally {
      countrySearching.value = false
    }
  }

  function onCountrySelect(country: Country | null) {
    selectedCountry.value = country
    form.country_id = country?.id ?? null
    form.phone_country_code = country?.dial_code ?? ""
  }

  const phoneCountryCodeText = computed({
    get() {
      return (form.phone_country_code ?? "").toString()
    },
    set(v: string) {
      form.phone_country_code = v
    },
  })

  function hasAnyUsage(): boolean {
    const u = form.address_usage
    return !!(u.delivery || u.collection || u.consignee || u.accounts || u.headoffice)
  }

  function validate(): string[] {
    const errors: string[] = []

    if (!form.contact_type_ids.length) errors.push("Please select at least one contact type.")
    if (!form.company_name?.trim()) errors.push("Company Name is required.")
    if (!form.address_line_1?.trim()) errors.push("Address Line 1 is required.")
    if (!form.city?.trim()) errors.push("City is required.")
    if (!form.postal_code?.trim()) errors.push("Postcode/ZIP is required.")
    if (!form.country_id) errors.push("Country is required.")
    if (!form.phone?.trim()) errors.push("Phone Number is required.")
    if (!form.email?.trim()) errors.push("Email Address is required.")

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form.email?.trim() && !emailPattern.test(form.email.trim())) {
      errors.push("Please enter a valid email address.")
    }

    // if (!hasAnyUsage()) errors.push('Please select at least one address usage type.')

    return errors
  }

  function onClear() {
    if (confirm("Are you sure you want to clear all form fields?")) {
      resetForm()
      toast.add({
        severity: "info",
        summary: "Cleared",
        detail: "All form fields have been cleared.",
        life: 2000,
      })
    }
  }

  function onCancel() {
    router.push("/contacts")
  }

  function extractLaravelErrors(err: any): string {
    const data = err?.response?.data

    if (data?.errors && typeof data.errors === "object") {
      const msgs = Object.values(data.errors).flat().filter(Boolean).map(String)

      if (msgs.length) return msgs.join(" ")
    }

    if (data?.message) return String(data.message)

    return "Unable to save contact. Please try again."
  }

  async function onSave() {
    const errors = validate()
    if (errors.length) {
      toast.add({
        severity: "warn",
        summary: "Missing fields",
        detail: errors.join(" "),
        life: 4500,
      })
      return
    }

    const payload: ContactCreatePayload & any = {
      contact_type_ids: form.contact_type_ids,

      company_name: form.company_name?.trim() ?? null,
      account_number: form.account_number,
      account_manager_id: form.account_manager_id,
      account_support_id: form.account_support_id,

      credit_limit: form.credit_limit,
      currency_preference: form.currency_preference?.trim() || null,

      registration_number: form.registration_number?.trim() || null,
      vat_number: form.vat_number?.trim() || null,
      eori: form.eori?.trim() || null,

      address_line_1: form.address_line_1?.trim() || null,
      address_line_2: form.address_line_2?.trim() || null,
      address_line_3: form.address_line_3?.trim() || null,
      city: form.city?.trim() || null,
      county_state: form.county_state?.trim() || null,
      postal_code: form.postal_code?.trim() || null,

      country_id: form.country_id,

      // If you prefer storing separately, change backend. For now keep your existing format:
      phone: `${form.phone_country_code} ${form.phone}`.trim(),
      email: form.email?.trim() || null,
      website: form.website?.trim() || null,

      is_delivery: !!form.address_usage.delivery,
      is_collection: !!form.address_usage.collection,
      is_consignee: !!form.address_usage.consignee,
      is_accounts: !!form.address_usage.accounts,
      is_headoffice: !!form.address_usage.headoffice,
    }

    saving.value = true
    try {
      if (isEdit.value && contactId.value) {
        await store.update(contactId.value, payload)
        toast.add({
          severity: "success",
          summary: "Updated",
          detail: "Contact updated successfully.",
          life: 2200,
        })
      } else {
        const created = await store.create(payload)
        await store.createBranch(created.id, buildInitialBranchPayload(payload))

        toast.add({
          severity: "success",
          summary: "Saved",
          detail: "Contact saved successfully with its first branch.",
          life: 2200,
        })
      }

      markFormClean()
      allowNavigation = true
      router.push("/contacts")
    } catch (err: any) {
      toast.add({
        severity: "error",
        summary: isEdit.value ? "Update failed" : "Save failed",
        detail: extractLaravelErrors(err),
        life: 5500,
      })
    } finally {
      saving.value = false
    }
  }

  return {
    store,
    employeeStore,
    form,
    saving,
    loadingContact,
    leaveDialogVisible,
    hasUnsavedChanges,

    contactId,
    isEdit,

    accountNumberPreview,
    creditLimitText,
    canManageCredit,

    selectedCountry,
    countrySuggestions,
    countrySearching,
    searchCountries,
    onCountrySelect,

    phoneCountryCodeText,

    toggleType,
    toggleUsage,
    onClear,
    onCancel,
    onSave,
    onCurrencyBlur,
    stayOnContact,
    leaveWithoutSaving,
  }
}
