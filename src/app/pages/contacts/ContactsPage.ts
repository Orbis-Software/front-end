import { computed, onMounted, ref } from "vue"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"
import { useRouter } from "vue-router"
import { useContactStore } from "@/app/stores/contact"
import { useCountryStore } from "@/app/stores/country"
import contactsService from "@/app/services/contacts"
import type { Contact, ContactBranch, ContactCollectionAddress } from "@/app/types/contact"

/** tiny debounce (no extra deps) */
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 350) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), wait)
  }
}

function csvEscape(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

function downloadCsv(filename: string, rows: unknown[][]) {
  const blob = new Blob([rows.map(row => row.map(csvEscape).join(",")).join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

type DataTablePageEvent = {
  first: number
  rows: number
  page: number
  pageCount: number
}

export function useContactsPage() {
  const store = useContactStore()
  const confirm = useConfirm()
  const toast = useToast()
  const router = useRouter()
  const countryStore = useCountryStore()

  const search = ref(store.search ?? "")
  const exporting = ref(false)

  const headerTitle = computed(() => {
    if (store.activeTypeId === null) return "Contacts"
    const t = store.types.find(x => x.id === store.activeTypeId)
    return t?.name ?? "Contacts"
  })

  const filterTabs = computed(() => {
    return store.types.map(type => ({
      id: type.id,
      label: type.name,
    }))
  })

  const firstRow = computed(() => (store.page - 1) * store.perPage)

  onMounted(async () => {
    await store.fetchTypes()
    await store.fetch()
  })

  async function setTypeId(id: number | null) {
    await store.setTypeId(id)
  }

  const applySearch = debounce(async (q: string) => {
    await store.setSearch(q)
  }, 350)

  function onSearchInput(v: string) {
    search.value = v ?? ""
    applySearch(search.value)
  }

  function onCreate() {
    router.push("/contacts/new")
  }

  function onEdit(id: number) {
    router.push(`/contacts/${id}/edit`)
  }

  function onImportContacts() {
    router.push("/contacts/import")
  }

  function onOpenCompany(id: number) {
    router.push({
      name: "crm.contacts.show",
      params: { id },
    })
  }

  function clean(value: unknown): string {
    return String(value ?? "").trim()
  }

  function countryLabel(countryId: number | null | undefined): string {
    if (!countryId) return ""

    const country = countryStore.items.find(country => country.id === countryId)
    if (!country) return String(countryId)

    return `${country.name} (${country.alpha_2})`
  }

  function joinAddress(parts: Array<unknown>): string {
    return parts.map(clean).filter(Boolean).join(", ")
  }

  function yesNo(value: boolean): string {
    return value ? "Yes" : "No"
  }

  function contactTypeText(contact: Contact): string {
    return (contact.contact_types ?? [])
      .map(type => `${type.name} ${type.code}`)
      .join(" ")
      .toLowerCase()
  }

  function hasType(contact: Contact, ...terms: string[]): boolean {
    const text = contactTypeText(contact)
    return terms.every(term => text.includes(term.toLowerCase()))
  }

  function formatUsage(contact: Contact): string {
    return [
      contact.is_delivery ? "Delivery" : "",
      contact.is_collection ? "Collection" : "",
      contact.is_consignee ? "Consignee" : "",
      contact.is_accounts ? "Accounts" : "",
      contact.is_headoffice ? "Head Office" : "",
    ]
      .filter(Boolean)
      .join(", ")
  }

  function formatBranch(branch: ContactBranch): string {
    const delivery = joinAddress([
      branch.delivery_address_line_1,
      branch.delivery_address_line_2,
      branch.delivery_address_line_3,
      branch.delivery_city,
      branch.delivery_county_state,
      branch.delivery_postal_code,
      countryLabel(branch.delivery_country_id),
    ])

    const billing = branch.billing_same_as_delivery
      ? "Same as delivery"
      : joinAddress([
          branch.billing_address_line_1,
          branch.billing_address_line_2,
          branch.billing_address_line_3,
          branch.billing_city,
          branch.billing_county_state,
          branch.billing_postal_code,
          countryLabel(branch.billing_country_id),
        ])

    return [
      branch.name ? `Name: ${branch.name}` : "Name: Branch",
      branch.contact_person ? `Contact: ${branch.contact_person}` : "",
      branch.email ? `Email: ${branch.email}` : "",
      branch.phone ? `Phone: ${branch.phone}` : "",
      delivery ? `Delivery: ${delivery}` : "",
      billing ? `Billing: ${billing}` : "",
    ]
      .filter(Boolean)
      .join(" | ")
  }

  function formatCollectionAddress(address: ContactCollectionAddress): string {
    const usage = [address.is_collection ? "Collection" : "", address.is_delivery ? "Delivery" : ""]
      .filter(Boolean)
      .join(", ")

    const location = joinAddress([
      address.address_line_1,
      address.address_line_2,
      address.address_line_3,
      address.city,
      address.county_state,
      address.postal_code,
      address.country_name ?? countryLabel(address.country_id),
    ])

    return [
      address.reference_code ? `Ref: ${address.reference_code}` : "",
      address.label ? `Label: ${address.label}` : "",
      usage ? `Usage: ${usage}` : "",
      location ? `Address: ${location}` : "",
      address.contact_person ? `Contact: ${address.contact_person}` : "",
      address.email ? `Email: ${address.email}` : "",
      address.phone ? `Phone: ${address.phone}` : "",
      address.hours_of_operation ? `Hours: ${address.hours_of_operation}` : "",
      address.special_instructions ? `Instructions: ${address.special_instructions}` : "",
    ]
      .filter(Boolean)
      .join(" | ")
  }

  function contactToExportRow(contact: Contact): unknown[] {
    return [
      contact.id,
      contact.company_id ?? "",
      contact.company_name ?? "",
      contact.account_number ?? "",
      (contact.contact_types ?? []).map(type => type.name).join(", "),
      contact.status ?? "",
      contact.registration_number ?? "",
      contact.vat_number ?? "",
      contact.eori ?? "",
      contact.address_line_1 ?? "",
      contact.address_line_2 ?? "",
      contact.address_line_3 ?? "",
      contact.address_line_4 ?? "",
      contact.city ?? "",
      contact.county_state ?? "",
      contact.postal_code ?? "",
      countryLabel(contact.country_id),
      contact.phone ?? "",
      contact.mobile ?? "",
      contact.email ?? "",
      contact.website ?? "",
      contact.credit_limit ?? "",
      contact.currency_preference ?? "",
      formatUsage(contact),
      yesNo(hasType(contact, "domestic customer")),
      yesNo(hasType(contact, "foreign customer")),
      yesNo(hasType(contact, "shipper")),
      yesNo(hasType(contact, "sales")),
      yesNo(hasType(contact, "domestic haulier")),
      yesNo(hasType(contact, "international haulier")),
      yesNo(clean(contact.status).toLowerCase() === "blacklisted"),
      contact.branches?.length ?? 0,
      (contact.branches ?? []).map(formatBranch).join(" || "),
      contact.collection_addresses?.length ?? 0,
      (contact.collection_addresses ?? []).map(formatCollectionAddress).join(" || "),
      contact.created_at ?? "",
      contact.updated_at ?? "",
    ]
  }

  async function fetchExportContacts(): Promise<Contact[]> {
    const rows: Contact[] = []
    let page = 1
    let lastPage = 1

    do {
      const response = await contactsService.list({
        page,
        per_page: 100,
        q: search.value.trim() || undefined,
        contact_type_id: store.activeTypeId ?? undefined,
      })

      rows.push(...(response.data ?? []))

      const meta: any = (response as any).meta ?? response
      lastPage = Number(meta.last_page ?? page)
      page += 1
    } while (page <= lastPage)

    return rows
  }

  async function onExportContacts() {
    exporting.value = true

    try {
      if (!countryStore.items.length) {
        await countryStore.fetch()
      }

      const contacts = await fetchExportContacts()
      const date = new Date().toISOString().slice(0, 10)

      downloadCsv(`contacts-full-export-${date}.csv`, [
        [
          "Contact ID",
          "Company ID",
          "Company Name",
          "Account Number",
          "Contact Types",
          "Status",
          "Registration Number",
          "VAT Number",
          "EORI Number",
          "Address Line 1",
          "Address Line 2",
          "Address Line 3",
          "Address Line 4",
          "City",
          "County / State",
          "Postal Code",
          "Country",
          "Phone",
          "Mobile",
          "Email",
          "Website",
          "Credit Limit",
          "Currency",
          "Address Usage",
          "Domestic Customer",
          "Foreign Customer",
          "Shipper Address",
          "Sales Address",
          "Domestic Haulier",
          "International Haulier",
          "Blacklisted Account",
          "Branch Count",
          "Branches",
          "Collection / Delivery Address Count",
          "Collection / Delivery Addresses",
          "Created At",
          "Updated At",
        ],
        ...contacts.map(contactToExportRow),
      ])

      toast.add({
        severity: "success",
        summary: "Export ready",
        detail: `${contacts.length} contacts exported.`,
        life: 2500,
      })
    } catch {
      toast.add({
        severity: "error",
        summary: "Export failed",
        detail: "Unable to export contacts. Please try again.",
        life: 4500,
      })
    } finally {
      exporting.value = false
    }
  }

  function onDelete(contactId: number) {
    confirm.require({
      header: "Delete Contact",
      message: "Are you sure you want to delete this contact?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClass: "p-button-danger",
      accept: async () => {
        await store.remove(contactId)
      },
    })
  }

  async function onPage(e: DataTablePageEvent) {
    const nextPerPage = e.rows
    const nextPage = e.page + 1

    if (nextPerPage !== store.perPage) {
      await store.setPerPage(nextPerPage)
      return
    }

    await store.setPage(nextPage)
  }

  return {
    store,
    search,
    exporting,
    headerTitle,
    filterTabs,
    firstRow,
    onPage,
    onSearchInput,
    setTypeId,
    onCreate,
    onEdit,
    onDelete,
    onOpenCompany,
    onImportContacts,
    onExportContacts,
  }
}
