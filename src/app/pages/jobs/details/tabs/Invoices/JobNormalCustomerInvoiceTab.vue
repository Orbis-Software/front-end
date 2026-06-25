<script setup lang="ts">
import "./JobNormalInvoices.css"
import { computed, inject, ref } from "vue"
import Button from "primevue/button"
import { useToast } from "primevue/usetoast"

import type { JobDetailsContext } from "../../JobDetailsPage.logic"
import { useTransportJobStore } from "@/app/stores/transport-job"

const context = inject<JobDetailsContext>("jobDetails")

if (!context) {
  throw new Error("JobNormalCustomerInvoiceTab must be used inside JobDetailsPage.")
}

const jobContext = context
const toast = useToast()
const transportJobStore = useTransportJobStore()
const generating = ref(false)

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

const rows = computed(() => jobContext.form.sell_costs)
const invoices = computed(() =>
  ((jobContext.form as any).invoices ?? []).filter((invoice: any) => {
    return (invoice.invoiceType ?? invoice.invoice_type ?? "customer") === "customer"
  }),
)
const invoiceCurrency = computed(() =>
  currencyCode(jobContext.form.currency || rows.value[0]?.currency),
)
const subtotal = computed(() =>
  rows.value.reduce((sum, row: any) => {
    const quantity = numberValue(row.quantity)
    const unitPrice = numberValue(row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount)

    return sum + quantity * unitPrice
  }, 0),
)
const vatTotal = computed(() =>
  rows.value.reduce((sum, row: any) => {
    const quantity = numberValue(row.quantity)
    const unitPrice = numberValue(row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount)
    const vatRate = numberValue(row.vatRate ?? row.vat_rate)

    return sum + quantity * unitPrice * (vatRate / 100)
  }, 0),
)
const grandTotal = computed(() => subtotal.value + vatTotal.value)

function invoiceNumber(row: any): string {
  return row?.invoice?.invoiceNumber ?? row?.invoice?.invoice_number ?? row?.invoiceNumber ?? ""
}

function invoiceStatus(row: any): string {
  const status = row?.invoice_status ?? row?.invoiceStatus ?? "not_invoiced"
  return status === "printed" && invoiceNumber(row)
    ? `Printed on ${invoiceNumber(row)}`
    : "Not invoiced"
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
      return text || "Unable to generate the invoice."
    }
  }

  return error?.response?.data?.message ?? error?.message ?? "Unable to generate the invoice."
}

function showInvoiceProgressToast(detail: string) {
  ;(toast as any).removeGroup?.("invoice-progress")
  toast.add({
    group: "invoice-progress",
    severity: "info",
    summary: "Generating invoice",
    detail,
    life: 60000,
    closable: false,
  } as any)
}

function clearInvoiceProgressToast() {
  ;(toast as any).removeGroup?.("invoice-progress")
}

async function generateInvoice() {
  const id = Number(jobContext.job.value?.id)

  if (!Number.isFinite(id) || id <= 0) {
    toast.add({
      severity: "warn",
      summary: "Save job first",
      detail: "The job must be saved before an invoice can be generated.",
      life: 3500,
    })
    return
  }

  if (!rows.value.length) {
    toast.add({
      severity: "warn",
      summary: "No sell charges",
      detail: "Add at least one sell charge before generating the invoice.",
      life: 3500,
    })
    return
  }

  generating.value = true
  showInvoiceProgressToast("Saving sell charges, then building the customer invoice PDF...")

  try {
    await jobContext.save({
      successSummary: "Invoice ready",
      successDetail: "Sell Charges saved before generating the invoice.",
      successLife: 1800,
    })

    showInvoiceProgressToast(
      "Customer invoice PDF is still processing. It will open as soon as it is ready...",
    )
    const blob = await transportJobStore.jobPdf(id, "invoice")

    if (!(blob instanceof Blob) || blob.type !== "application/pdf") {
      const text = blob instanceof Blob ? await blob.text() : ""
      throw new Error(text || "The server did not return a PDF.")
    }

    openBlob(blob)
    await jobContext.load()
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Invoice failed",
      detail: await extractPdfError(error),
      life: 4500,
    })
  } finally {
    clearInvoiceProgressToast()
    generating.value = false
  }
}
</script>

<template>
  <section class="job-normal-invoice-tab">
    <div class="job-normal-invoice-tab__section">
      <header class="job-normal-invoice-tab__header">
        <div>
          <h2>Customer Invoice</h2>
          <p>Customer invoice lines are based on the job Sell Charges.</p>
        </div>

        <div class="job-normal-invoice-tab__actions">
          <Button
            :label="generating ? 'Opening...' : 'Generate Customer Invoice'"
            icon="pi pi-file-pdf"
            :loading="generating"
            :disabled="!rows.length || jobContext.saving.value"
            @click="generateInvoice"
          />
        </div>
      </header>

      <div v-if="!rows.length" class="job-normal-invoice-tab__placeholder">
        <strong>No sell charges yet</strong>
        <p class="job-normal-invoice-tab__empty">
          Add Sell Charges in Costs & Charges to build the customer invoice.
        </p>
      </div>

      <template v-else>
        <div class="job-normal-invoice-tab__table-wrap">
          <table class="job-normal-invoice-tab__table job-normal-invoice-tab__table--customer">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>Description</th>
                <th class="job-normal-invoice-tab__quantity">Qty</th>
                <th class="job-normal-invoice-tab__money">Unit Price</th>
                <th class="job-normal-invoice-tab__currency">Currency</th>
                <th class="job-normal-invoice-tab__quantity">VAT %</th>
                <th class="job-normal-invoice-tab__money">Net</th>
                <th class="job-normal-invoice-tab__money">VAT</th>
                <th class="job-normal-invoice-tab__money">Gross</th>
                <th>Invoice Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td>{{ row.description || "Customer charge" }}</td>
                <td class="job-normal-invoice-tab__quantity">{{ numberValue(row.quantity) }}</td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount),
                    )
                  }}
                </td>
                <td class="job-normal-invoice-tab__currency">{{ currencyCode(row.currency) }}</td>
                <td class="job-normal-invoice-tab__quantity">
                  {{ numberValue(row.vatRate ?? row.vat_rate).toFixed(2) }}%
                </td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.quantity) *
                        numberValue(
                          row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount,
                        ),
                    )
                  }}
                </td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.quantity) *
                        numberValue(
                          row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount,
                        ) *
                        (numberValue(row.vatRate ?? row.vat_rate) / 100),
                    )
                  }}
                </td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.quantity) *
                        numberValue(
                          row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount,
                        ) *
                        (1 + numberValue(row.vatRate ?? row.vat_rate) / 100),
                    )
                  }}
                </td>
                <td>
                  <span
                    class="job-normal-invoice-tab__status"
                    :class="{ 'job-normal-invoice-tab__status--printed': row.invoice_id }"
                  >
                    {{ invoiceStatus(row) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="job-normal-invoice-tab__summary">
          <div class="job-normal-invoice-tab__metric">
            <span>Lines</span>
            <strong>{{ rows.length }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>Net</span>
            <strong>{{ money(invoiceCurrency, subtotal) }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>VAT</span>
            <strong>{{ money(invoiceCurrency, vatTotal) }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>Gross</span>
            <strong>{{ money(invoiceCurrency, grandTotal) }}</strong>
          </div>
        </div>

        <div class="job-normal-invoice-tab__section job-normal-invoice-tab__section--nested">
          <header class="job-normal-invoice-tab__subheader">
            <div>
              <h3>Invoice List</h3>
              <p>Customer invoices generated from this job's Sell Charges.</p>
            </div>
          </header>

          <div v-if="!invoices.length" class="job-normal-invoice-tab__placeholder">
            <strong>No invoices printed yet</strong>
            <p class="job-normal-invoice-tab__empty">Generated invoices will appear here.</p>
          </div>

          <div v-else class="job-normal-invoice-tab__table-wrap">
            <table
              class="job-normal-invoice-tab__table job-normal-invoice-tab__table--invoice-list"
            >
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th class="job-normal-invoice-tab__money">Total</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in invoices" :key="invoice.id">
                  <td>{{ invoice.invoiceNumber }}</td>
                  <td>{{ invoice.invoiceDate || "-" }}</td>
                  <td>{{ invoice.status || "printed" }}</td>
                  <td class="job-normal-invoice-tab__money">
                    {{ money(invoice.currency, numberValue(invoice.total)) }}
                  </td>
                  <td>
                    <a
                      v-if="invoice.pdfUrl"
                      class="job-normal-invoice-tab__link"
                      :href="invoice.pdfUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open
                    </a>
                    <span v-else class="job-normal-invoice-tab__muted">Cached after open</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
