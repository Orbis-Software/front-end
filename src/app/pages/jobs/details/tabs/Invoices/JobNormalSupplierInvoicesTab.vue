<script setup lang="ts">
import "./JobNormalInvoices.css"
import { computed, inject, onMounted, reactive, ref } from "vue"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import { useToast } from "primevue/usetoast"

import contactsService from "@/app/services/contacts"
import { useChargeCodeStore } from "@/app/stores/charge-codes"
import { useTransportJobStore } from "@/app/stores/transport-job"
import type { ChargeCode } from "@/app/types/charge-code"
import type { Contact } from "@/app/types/contact"
import type { JobDetailsContext } from "../../JobDetailsPage.logic"

const context = inject<JobDetailsContext>("jobDetails")

if (!context) {
  throw new Error("JobNormalSupplierInvoicesTab must be used inside JobDetailsPage.")
}

const jobContext = context
const toast = useToast()
const chargeCodeStore = useChargeCodeStore()
const transportJobStore = useTransportJobStore()
const supplierContacts = ref<Contact[]>([])
const suppliersLoading = ref(false)
const uploadDialogVisible = ref(false)
const uploadSaving = ref(false)
const generateDialogVisible = ref(false)
const generateSupplierId = ref<number | null>(null)
const generateLoading = ref(false)

type SupplierInvoiceLineDraft = {
  id: number
  description: string
  quantity: number
  unitCost: number
  currency: string
}

const invoiceDraft = reactive({
  supplierId: null as number | null,
  lines: [] as SupplierInvoiceLineDraft[],
})

function numberValue(value: unknown, fallback = 0): number {
  const numeric = Number(value)

  return Number.isFinite(numeric) ? numeric : fallback
}

function currencyCode(value: unknown): string {
  return String(value || jobContext.form.currency || "GBP").toUpperCase()
}

function money(currency: string, value: number): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currencyCode(currency),
      currencyDisplay: "narrowSymbol",
    }).format(Number.isFinite(value) ? value : 0)
  } catch {
    return `${currencyCode(currency)} ${new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0)}`
  }
}

function displayContactName(contact: Contact): string {
  return (
    contact.company_name ||
    (contact as any)?.name ||
    [(contact as any)?.first_name, (contact as any)?.last_name].filter(Boolean).join(" ") ||
    "Unnamed Contact"
  )
}

function makeLineDraft(): SupplierInvoiceLineDraft {
  return {
    id: Date.now() + Math.floor(Math.random() * 10000),
    description: "",
    quantity: 1,
    unitCost: 0,
    currency: currencyCode(jobContext.form.currency || "GBP"),
  }
}

const rows = computed(() => jobContext.form.buy_costs)
const invoiceCurrency = computed(() =>
  currencyCode(jobContext.form.currency || rows.value[0]?.currency),
)
const supplierOptions = computed(() =>
  supplierContacts.value.map(contact => ({
    label: displayContactName(contact),
    value: Number(contact.id),
  })),
)
const supplierNameById = computed(() => {
  const names = new Map<number, string>()

  supplierContacts.value.forEach(contact => {
    names.set(Number(contact.id), displayContactName(contact))
  })

  return names
})
const supplierInvoiceOptions = computed(() => {
  const ids = new Set<number>()

  rows.value.forEach((row: any) => {
    const supplierId = Number(row.supplier_id ?? row.supplierId)

    if (Number.isFinite(supplierId) && supplierId > 0) {
      ids.add(supplierId)
    }
  })

  return [...ids].map(id => ({
    label: supplierName(id) || `Supplier #${id}`,
    value: id,
  }))
})
const chargeDescriptionOptions = computed(() =>
  chargeCodeStore.chargeCodes.map(charge => ({
    label: charge.description,
    value: charge.description,
  })),
)
const currencyOptions = computed(() => {
  const options = new Set(["GBP", "EUR", "USD", currencyCode(jobContext.form.currency || "GBP")])

  rows.value.forEach((row: any) => {
    if (row.currency) options.add(currencyCode(row.currency))
  })

  return [...options].map(code => ({ label: code, value: code }))
})
const totalCost = computed(() =>
  rows.value.reduce((sum, row: any) => {
    const quantity = numberValue(row.quantity)
    const unitCost = numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount)

    return sum + quantity * unitCost
  }, 0),
)

function supplierName(supplierId: unknown): string {
  const id = Number(supplierId)

  return Number.isFinite(id) && supplierNameById.value.has(id)
    ? supplierNameById.value.get(id)!
    : ""
}

function findChargeCode(description: string): ChargeCode | null {
  const normalized = description.trim().toLowerCase()

  return (
    chargeCodeStore.chargeCodes.find(charge => {
      return (
        String(charge.description ?? "")
          .trim()
          .toLowerCase() === normalized
      )
    }) ?? null
  )
}

function resetDraft() {
  invoiceDraft.supplierId = null
  invoiceDraft.lines = [makeLineDraft()]
}

function openUploadDialog() {
  resetDraft()
  uploadDialogVisible.value = true
}

function addInvoiceLine() {
  invoiceDraft.lines.push(makeLineDraft())
}

function removeInvoiceLine(id: number) {
  invoiceDraft.lines = invoiceDraft.lines.filter(line => line.id !== id)

  if (!invoiceDraft.lines.length) {
    addInvoiceLine()
  }
}

async function loadSuppliers() {
  suppliersLoading.value = true

  try {
    const firstResponse = await contactsService.list({
      page: 1,
      per_page: 500,
    })
    const contacts = [...(firstResponse.data ?? [])]
    const lastPage = Number(firstResponse.meta?.last_page ?? 1)

    for (let page = 2; page <= lastPage; page += 1) {
      const response = await contactsService.list({
        page,
        per_page: 500,
      })

      contacts.push(...(response.data ?? []))
    }

    supplierContacts.value = contacts
  } finally {
    suppliersLoading.value = false
  }
}

async function saveSupplierInvoice() {
  const supplierId = Number(invoiceDraft.supplierId)
  const validLines = invoiceDraft.lines.filter(line => {
    return line.description.trim() || numberValue(line.unitCost) > 0
  })

  if (!Number.isFinite(supplierId) || supplierId <= 0) {
    toast.add({
      severity: "warn",
      summary: "Supplier required",
      detail: "Select one supplier for this supplier invoice.",
      life: 3000,
    })
    return
  }

  if (!validLines.length) {
    toast.add({
      severity: "warn",
      summary: "Cost rows required",
      detail: "Add at least one cost description row.",
      life: 3000,
    })
    return
  }

  uploadSaving.value = true

  try {
    validLines.forEach(line => {
      const charge = findChargeCode(line.description)

      jobContext.form.buy_costs.push({
        id: `supplier-invoice-${Date.now()}-${line.id}`,
        type: "buy",
        description: line.description.trim(),
        supplier_id: supplierId,
        chargeCodeId: charge?.id ?? null,
        quantity: numberValue(line.quantity, 1) || 1,
        unitCost: numberValue(line.unitCost),
        currency: currencyCode(line.currency),
        exchangeRate: 1,
        amount: numberValue(line.quantity, 1) * numberValue(line.unitCost),
      })
    })

    await jobContext.save({
      successSummary: "Supplier invoice uploaded",
      successDetail: "Supplier invoice cost rows were added to Buy Costs.",
      successLife: 2200,
    })

    uploadDialogVisible.value = false
    resetDraft()
  } catch {
    // save() already displays the exact error toast.
  } finally {
    uploadSaving.value = false
  }
}

function openBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)

  window.open(url, "_blank", "noopener,noreferrer")
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

async function extractPdfError(error: any) {
  const data = error?.response?.data

  if (data instanceof Blob) {
    const text = await data.text()

    try {
      const parsed = JSON.parse(text)
      return parsed?.message ?? text
    } catch {
      return text || "Unable to generate the supplier invoice."
    }
  }

  return (
    error?.response?.data?.message ?? error?.message ?? "Unable to generate the supplier invoice."
  )
}

function openGenerateDialog() {
  generateSupplierId.value = supplierInvoiceOptions.value[0]?.value ?? null
  generateDialogVisible.value = true
}

async function generateSupplierInvoice() {
  const id = Number(jobContext.job.value?.id)
  const supplierId = Number(generateSupplierId.value)

  if (!Number.isFinite(id) || id <= 0) {
    toast.add({
      severity: "warn",
      summary: "Save job first",
      detail: "The job must be saved before a supplier invoice can be generated.",
      life: 3500,
    })
    return
  }

  if (!Number.isFinite(supplierId) || supplierId <= 0) {
    toast.add({
      severity: "warn",
      summary: "Supplier required",
      detail: "Select the supplier for this supplier invoice.",
      life: 3000,
    })
    return
  }

  generateLoading.value = true

  try {
    await jobContext.save({
      successSummary: "Supplier invoice ready",
      successDetail: "Buy Costs saved before generating the supplier invoice.",
      successLife: 1800,
    })

    const blob = await transportJobStore.jobPdf(id, "supplier_invoice", { supplierId })

    if (!(blob instanceof Blob) || blob.type !== "application/pdf") {
      const text = blob instanceof Blob ? await blob.text() : ""
      throw new Error(text || "The server did not return a PDF.")
    }

    openBlob(blob)
    generateDialogVisible.value = false
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Supplier invoice failed",
      detail: await extractPdfError(error),
      life: 4500,
    })
  } finally {
    generateLoading.value = false
  }
}

onMounted(async () => {
  resetDraft()
  await Promise.all([
    loadSuppliers(),
    chargeCodeStore.fetchAll({ sort: "description", direction: "asc", perPage: 1000 }),
  ])
})
</script>

<template>
  <section class="job-normal-invoice-tab">
    <div class="job-normal-invoice-tab__section">
      <header class="job-normal-invoice-tab__header">
        <div>
          <h2>Supplier Invoices</h2>
          <p>Supplier invoice framework is based on the job Buy Costs.</p>
        </div>

        <div class="job-normal-invoice-tab__actions">
          <Button
            :label="generateLoading ? 'Opening...' : 'Generate Supplier Invoice'"
            icon="pi pi-file-pdf"
            :loading="generateLoading"
            :disabled="!supplierInvoiceOptions.length || jobContext.saving.value || generateLoading"
            @click="openGenerateDialog"
          />
          <Button
            label="Upload Supplier Invoice"
            icon="pi pi-upload"
            :disabled="jobContext.saving.value || generateLoading"
            @click="openUploadDialog"
          />
        </div>
      </header>

      <div v-if="!rows.length" class="job-normal-invoice-tab__placeholder">
        <strong>No buy costs yet</strong>
        <p class="job-normal-invoice-tab__empty">
          Add Buy Costs in Costs & Charges to prepare supplier invoice matching.
        </p>
      </div>

      <template v-else>
        <div class="job-normal-invoice-tab__table-wrap">
          <table class="job-normal-invoice-tab__table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Cost Description</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Currency</th>
                <th>Net Cost</th>
                <th>Invoice Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td>
                  <span v-if="supplierName(row.supplier_id)">
                    {{ supplierName(row.supplier_id) }}
                  </span>
                  <span v-else-if="row.supplier_id">Supplier #{{ row.supplier_id }}</span>
                  <span v-else class="job-normal-invoice-tab__muted">Not selected</span>
                </td>
                <td>{{ row.description || "Supplier cost" }}</td>
                <td>{{ numberValue(row.quantity) }}</td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount),
                    )
                  }}
                </td>
                <td>{{ currencyCode(row.currency) }}</td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.quantity) *
                        numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount),
                    )
                  }}
                </td>
                <td class="job-normal-invoice-tab__muted">Awaiting upload</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="job-normal-invoice-tab__summary">
          <div class="job-normal-invoice-tab__metric">
            <span>Cost Lines</span>
            <strong>{{ rows.length }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>Matched Invoices</span>
            <strong>0</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>Pending Upload</span>
            <strong>{{ rows.length }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>Total Cost</span>
            <strong>{{ money(invoiceCurrency, totalCost) }}</strong>
          </div>
        </div>
      </template>
    </div>

    <Dialog
      v-model:visible="uploadDialogVisible"
      modal
      header="Upload Supplier Invoice"
      class="job-normal-invoice-tab__dialog"
      :style="{ width: 'min(980px, 96vw)' }"
    >
      <div class="job-normal-invoice-tab__dialog-body">
        <label class="job-normal-invoice-tab__field">
          <span>Supplier</span>
          <Dropdown
            v-model="invoiceDraft.supplierId"
            :options="supplierOptions"
            option-label="label"
            option-value="value"
            placeholder="Select supplier"
            filter
            auto-filter-focus
            :loading="suppliersLoading"
          />
        </label>

        <div class="job-normal-invoice-tab__dialog-head">
          <div>
            <strong>Cost Description Rows</strong>
            <p class="job-normal-invoice-tab__note">
              These rows will be added to Buy Costs using the selected supplier.
            </p>
          </div>
          <Button label="Add Row" icon="pi pi-plus" text @click="addInvoiceLine" />
        </div>

        <div class="job-normal-invoice-tab__table-wrap">
          <table class="job-normal-invoice-tab__table job-normal-invoice-tab__table--dialog">
            <thead>
              <tr>
                <th>Cost Description</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Currency</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in invoiceDraft.lines" :key="line.id">
                <td>
                  <Dropdown
                    v-model="line.description"
                    :options="chargeDescriptionOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="Select cost description"
                    filter
                    editable
                    show-clear
                  />
                </td>
                <td><InputNumber v-model="line.quantity" :min="0" /></td>
                <td>
                  <InputNumber
                    v-model="line.unitCost"
                    :min="0"
                    :min-fraction-digits="2"
                    :max-fraction-digits="2"
                  />
                </td>
                <td>
                  <Dropdown
                    v-model="line.currency"
                    :options="currencyOptions"
                    option-label="label"
                    option-value="value"
                  />
                </td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(line.currency, numberValue(line.quantity) * numberValue(line.unitCost))
                  }}
                </td>
                <td>
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    aria-label="Remove invoice row"
                    @click="removeInvoiceLine(line.id)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text :disabled="uploadSaving" @click="uploadDialogVisible = false" />
        <Button
          :label="uploadSaving ? 'Saving...' : 'Save Supplier Invoice'"
          icon="pi pi-check"
          :loading="uploadSaving"
          @click="saveSupplierInvoice"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="generateDialogVisible"
      modal
      header="Generate Supplier Invoice"
      class="job-normal-invoice-tab__dialog"
      :style="{ width: 'min(520px, 94vw)' }"
    >
      <div class="job-normal-invoice-tab__dialog-body">
        <label class="job-normal-invoice-tab__field">
          <span>Supplier</span>
          <Dropdown
            v-model="generateSupplierId"
            :options="supplierInvoiceOptions"
            option-label="label"
            option-value="value"
            placeholder="Select supplier"
            filter
            auto-filter-focus
          />
        </label>
        <p class="job-normal-invoice-tab__note">
          The generated supplier invoice will include only Buy Cost rows for the selected supplier.
        </p>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          text
          :disabled="generateLoading"
          @click="generateDialogVisible = false"
        />
        <Button
          :label="generateLoading ? 'Opening...' : 'Generate Supplier Invoice'"
          icon="pi pi-file-pdf"
          :loading="generateLoading"
          @click="generateSupplierInvoice"
        />
      </template>
    </Dialog>
  </section>
</template>
