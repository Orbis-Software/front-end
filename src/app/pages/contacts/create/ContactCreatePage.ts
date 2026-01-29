import { computed, reactive, ref, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import contacts from "@/app/services/contacts"
import { useConfirm } from "primevue/useconfirm"
import contactPeople from "@/app/services/contact-people"
import type { Contact, ContactCreatePayload, ContactType } from "@/app/types/contact"
import type { ContactPersonCreatePayload } from "@/app/types/contact-person"

type PersonDraft = {
  _key: string
  id?: number
  name: string
  email: string | null
  phone: string | null
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

const LIST_ROUTES: Record<ContactType, string> = {
  customer: "/contacts/customers",
  supplier: "/contacts/suppliers",
  road_haulier: "/contacts/road-hauliers",
  airline: "/contacts/airlines",
  rail_operator: "/contacts/rail-operators",
  shipping_line: "/contacts/shipping-lines",
}

export function useContactCreatePage() {
  const router = useRouter()
  const route = useRoute()
  const confirm = useConfirm()

  const saving = ref(false)
  const loading = ref(false)

  const contactId = computed(() => {
    const v = route.params.id
    if (!v) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  })

  const isEdit = computed(() => !!contactId.value)

  const routeContactType = computed(() => route.meta.contactType as ContactType | undefined)

  const form = reactive<ContactCreatePayload>({
    contact_types: [], // ✅ NEW
    address: null,
    country: null,
    eori: null,
    credit_limit: null,
    currency_preference: null,
    status: "active",
  })

  const people = ref<PersonDraft[]>([
    { _key: uid(), name: "", email: null, phone: null },
  ])

  const errors = reactive<Record<string, string>>({})
  const personErrors = ref<Array<Record<string, string>>>(people.value.map(() => ({})))

  const contactTypeOptions: Array<{ label: string; value: ContactType }> = [
    { label: "Customer", value: "customer" },
    { label: "Supplier", value: "supplier" },
    { label: "Road Haulier", value: "road_haulier" },
    { label: "Airline", value: "airline" },
    { label: "Rail Operator", value: "rail_operator" },
    { label: "Shipping Line", value: "shipping_line" },
  ]

  const statusOptions = ["active", "inactive"]

const initializedTypes = ref(false)

watchEffect(() => {
  if (initializedTypes.value) return

  const t = routeContactType.value
  if (!t) return

  if (!form.contact_types.includes(t)) {
    form.contact_types.push(t)
  }

  initializedTypes.value = true
})

  async function loadForEdit() {
    if (!contactId.value) return
    loading.value = true
    try {
      const c: Contact = await contacts.show(contactId.value)

      form.contact_types = (c.contact_types ?? []).slice()

      // ensure route type is included if present
      if (routeContactType.value && !form.contact_types.includes(routeContactType.value)) {
        form.contact_types.push(routeContactType.value)
      }

      form.address = c.address
      form.country = c.country
      form.eori = c.eori
      form.credit_limit = c.credit_limit
      form.currency_preference = c.currency_preference
      form.status = c.status

      const existingPeople = (c.people ?? []).map((p) => ({
        _key: uid(),
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
      }))

      people.value = existingPeople.length
        ? existingPeople
        : [{ _key: uid(), name: "", email: null, phone: null }]

      personErrors.value = people.value.map(() => ({}))
    } finally {
      loading.value = false
    }
  }

  watchEffect(() => {
    if (isEdit.value) loadForEdit()
  })

  function addPerson() {
    people.value.push({ _key: uid(), name: "", email: null, phone: null })
    personErrors.value.push({})
  }

  async function removePerson(index: number) {
    if (people.value.length <= 1) return

    const person = people.value[index]
    if (!person) return

    if (!person.id) {
      people.value.splice(index, 1)
      personErrors.value.splice(index, 1)
      return
    }

    confirm.require({
      header: "Remove Contact Person",
      message: `Remove "${person.name}" from this contact?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Remove",
      rejectLabel: "Cancel",
      acceptClass: "p-button-danger",
      accept: async () => {
        await contactPeople.remove(person.id!)

        people.value.splice(index, 1)
        personErrors.value.splice(index, 1)

        if (people.value.length === 0) {
          people.value.push({ _key: uid(), name: "", email: null, phone: null })
          personErrors.value.push({})
        }
      },
    })
  }

  function clearErrors() {
    Object.keys(errors).forEach((k) => delete errors[k])
    personErrors.value = people.value.map(() => ({}))
  }

  function validate(): boolean {
    clearErrors()

    if (!form.contact_types || form.contact_types.length < 1) {
      errors.contact_types = "Select at least 1 contact type."
    }

    if (people.value.length < 1) errors.people = "At least 1 contact person is required."

    people.value.forEach((p, idx) => {
      const pe: Record<string, string> = {}
      if (!p.name || p.name.trim().length < 2) pe.name = "Name is required."
      if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) pe.email = "Email format is invalid."
      personErrors.value[idx] = pe
    })

    const hasContactErrors = Object.keys(errors).length > 0
    const hasPersonErrors = personErrors.value.some((e) => Object.keys(e).length > 0)
    return !hasContactErrors && !hasPersonErrors
  }

  const canSubmit = computed(() => {
    if (saving.value || loading.value) return false
    if (!form.contact_types?.length) return false
    if (people.value.length < 1) return false
    return people.value.every((p) => (p.name ?? "").trim().length >= 2)
  })

  async function submit() {
    if (!validate()) return
    saving.value = true

    try {
      let contact: Contact

      if (isEdit.value && contactId.value) {
        contact = (await contacts.update(contactId.value, form)) as unknown as Contact
      } else {
        contact = (await contacts.create(form)) as unknown as Contact
      }

      const toCreate: ContactPersonCreatePayload[] = people.value
        .filter((p) => !p.id)
        .map((p) => ({
          contact_id: contact.id,
          name: p.name.trim(),
          email: p.email?.trim() || null,
          phone: p.phone?.trim() || null,
        }))

      for (const payload of toCreate) {
        await contactPeople.create(payload)
      }

      // ✅ Go back to the list page of the route you came from
      const backType = routeContactType.value ?? contact.contact_types?.[0] ?? "customer"
      await router.push(LIST_ROUTES[backType])
    } catch (e: any) {
      errors.submit = e?.response?.data?.message ?? "Failed to save contact."
    } finally {
      saving.value = false
    }
  }

  function goBack() {
    router.back()
  }

  return {
    form,
    people,
    errors,
    personErrors,
    saving,
    loading,
    canSubmit,
    contactTypeOptions,
    statusOptions,
    isEdit,
    addPerson,
    removePerson,
    submit,
    goBack,
  }
}
