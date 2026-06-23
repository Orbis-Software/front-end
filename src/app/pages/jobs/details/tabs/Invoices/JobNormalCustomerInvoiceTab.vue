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

  try {
    await jobContext.save({
      successSummary: "Invoice ready",
      successDetail: "Sell Charges saved before generating the invoice.",
      successLife: 1800,
    })

    const blob = await transportJobStore.jobPdf(id, "invoice")

    if (!(blob instanceof Blob) || blob.type !== "application/pdf") {
      const text = blob instanceof Blob ? await blob.text() : ""
      throw new Error(text || "The server did not return a PDF.")
    }

    openBlob(blob)
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Invoice failed",
      detail: await extractPdfError(error),
      life: 4500,
    })
  } finally {
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
          <table class="job-normal-invoice-tab__table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Currency</th>
                <th>VAT %</th>
                <th>Net</th>
                <th>VAT</th>
                <th>Gross</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td>{{ row.description || "Customer charge" }}</td>
                <td>{{ numberValue(row.quantity) }}</td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount),
                    )
                  }}
                </td>
                <td>{{ currencyCode(row.currency) }}</td>
                <td>{{ numberValue(row.vatRate ?? row.vat_rate).toFixed(2) }}%</td>
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
      </template>
    </div>
  </section>
</template>
