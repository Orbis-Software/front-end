<script setup lang="ts">
import "./CustomerQuoteDetailsPage.css"

import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import Button from "primevue/button"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import Toast from "primevue/toast"
import { useToast } from "primevue/usetoast"
import LoadPlannerPanel from "@/app/components/load-planner/LoadPlannerPanel.vue"
import { useTransportQuoteStore } from "@/app/stores/transportQuote"
import type { TransportQuote } from "@/app/types/transportQuote"

const route = useRoute()
const router = useRouter()
const toast = useToast()
const quoteStore = useTransportQuoteStore()

const actionProcessing = ref(false)
const pdfLoading = ref(false)
const showCustomerReferenceModal = ref(false)
const customerReferenceInput = ref("")

const quoteId = computed(() => Number(route.params.id))
const quote = computed<TransportQuote | null>(() => quoteStore.selectedQuote)
const loading = computed(() => quoteStore.loading)

const chargeLines = computed(() => {
  return (quote.value?.charges ?? []).map((charge, index) => ({
    id: Number(charge.id ?? index + 1),
    description: charge.description ?? "-",
    quantity: Number(charge.qty ?? charge.quantity ?? 0),
    uom: charge.uom ?? "-",
    total_sell: Number(charge.sell_total ?? charge.total_sell ?? 0),
  }))
})

const totalWeight = computed(() => {
  return (quote.value?.dimensions ?? []).reduce((sum, item) => {
    return sum + Number(item.weight || 0) * Number(item.pieces || 1)
  }, 0)
})

const totalCbm = computed(() => {
  return (quote.value?.dimensions ?? []).reduce((sum, item) => sum + Number(item.cbm || 0), 0)
})

const loadPlannerPackages = computed(() =>
  (quote.value?.dimensions ?? []).map((row, index) => ({
    id: row.id ?? index,
    type: quote.value?.mode_of_transport === "road" ? "Pallet" : row.container_type || "Package",
    desc:
      quote.value?.mode_of_transport === "road" ? `Pallet ${index + 1}` : `Package ${index + 1}`,
    length: row.length ?? 0,
    width: row.width ?? 0,
    height: row.height ?? 0,
    qty: row.pieces ?? 1,
    weight: row.weight ?? 0,
    stackable: row.stackable ?? true,
    adr: Boolean(quote.value?.is_hazardous),
  })),
)

const loadPlannerReference = computed(() => quote.value?.quote_ref || "Quote Load Plan")

function onBack() {
  router.push({ name: "customer.quotes" })
}

function requestAcceptQuote() {
  if (!quote.value || actionProcessing.value) return

  const customerReference = String(quote.value.customer_ref ?? "").trim()

  if (customerReference) {
    respond("accepted", customerReference)
    return
  }

  customerReferenceInput.value = ""
  showCustomerReferenceModal.value = true
}

async function acceptQuote(customerReference: string | null = null) {
  showCustomerReferenceModal.value = false
  await respond("accepted", customerReference)
}

async function respond(status: "accepted" | "rejected", customerReference?: string | null) {
  if (!quote.value || actionProcessing.value) return

  actionProcessing.value = true

  try {
    const payload =
      status === "accepted"
        ? { status, customer_ref: customerReference?.trim() || null }
        : { status }

    await quoteStore.updateQuote(quote.value.id, payload)
    await quoteStore.fetchQuote(quote.value.id)

    toast.add({
      severity: status === "accepted" ? "success" : "warn",
      summary: status === "accepted" ? "Quote Accepted" : "Quote Declined",
      detail: `${quote.value.quote_ref ?? "Quote"} has been ${status}.`,
      life: 3000,
    })
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Action Failed",
      detail: error?.response?.data?.message ?? "Unable to update this quote.",
      life: 4000,
    })
  } finally {
    actionProcessing.value = false
  }
}

async function openQuotePdf() {
  if (!quote.value || pdfLoading.value) return

  pdfLoading.value = true

  try {
    const blob = await quoteStore.quotePdf(quote.value.id)

    if (!(blob instanceof Blob) || blob.type !== "application/pdf") {
      const text = blob instanceof Blob ? await blob.text() : ""
      throw new Error(text || "The server did not return a PDF.")
    }

    const url = URL.createObjectURL(blob)

    window.open(url, "_blank", "noopener,noreferrer")
    window.setTimeout(() => URL.revokeObjectURL(url), 60000)
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "PDF failed",
      detail: await extractPdfError(error),
      life: 4500,
    })
  } finally {
    pdfLoading.value = false
  }
}

async function extractPdfError(error: any) {
  const data = error?.response?.data

  if (data instanceof Blob) {
    const text = await data.text()

    try {
      const parsed = JSON.parse(text)
      return parsed?.message ?? text
    } catch {
      return text || "Unable to generate the quote PDF."
    }
  }

  return error?.response?.data?.message ?? error?.message ?? "Unable to generate the quote PDF."
}

function canRespond(status: string | undefined) {
  return status === "sent"
}

function prettify(value: unknown): string {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase())
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function money(value: unknown) {
  const amount = Number(value || 0)
  const currency = quote.value?.currency || "GBP"

  return `${currency} ${new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
}

function statusClass(status: string | undefined) {
  return {
    "customer-quote-details__status--pending": status === "sent",
    "customer-quote-details__status--accepted": status === "accepted",
    "customer-quote-details__status--declined": status === "rejected",
    "customer-quote-details__status--converted": status === "converted",
  }
}

async function loadQuote() {
  if (!Number.isFinite(quoteId.value)) {
    router.push({ name: "customer.quotes" })
    return
  }

  try {
    await quoteStore.fetchQuote(quoteId.value)
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Quote Not Available",
      detail: error?.response?.data?.message ?? "Unable to load this quote.",
      life: 4000,
    })
  }
}

onMounted(() => {
  loadQuote()
})
</script>

<template>
  <section class="customer-quote-details">
    <Toast />

    <section v-if="loading" class="customer-quote-details__card">Loading quote...</section>

    <section v-else-if="!quote" class="customer-quote-details__card">Quote not found.</section>

    <template v-else>
      <header class="customer-quote-details__header">
        <div>
          <Button
            label="Back to Quotes"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            @click="onBack"
          />

          <h1>
            {{ quote.quote_ref || `QUOTE-${quote.id}` }}
            <small>{{ prettify(quote.mode_of_transport) }} Freight</small>
          </h1>
        </div>

        <div class="customer-quote-details__actions">
          <span class="customer-quote-details__status" :class="statusClass(quote.status)">
            {{ quote.status === "sent" ? "Pending" : prettify(quote.status) }}
          </span>

          <Button
            label="View PDF"
            icon="pi pi-file-pdf"
            class="btn btn--ghost"
            :loading="pdfLoading"
            :disabled="pdfLoading || actionProcessing"
            @click="openQuotePdf"
          />

          <Button
            v-if="canRespond(quote.status)"
            label="Accept"
            icon="pi pi-check"
            class="btn btn--primary"
            :loading="actionProcessing"
            :disabled="actionProcessing"
            @click="requestAcceptQuote"
          />

          <Button
            v-if="canRespond(quote.status)"
            label="Decline"
            icon="pi pi-times"
            class="btn btn--ghost"
            :disabled="actionProcessing"
            @click="respond('rejected')"
          />
        </div>
      </header>

      <section class="customer-quote-details__hero">
        <div>
          <span>Total Incl. Tax</span>
          <strong>{{ money(quote.totals?.total_incl_tax) }}</strong>
        </div>

        <div>
          <span>Valid Until</span>
          <strong>{{ formatDate(quote.valid_until) }}</strong>
        </div>

        <div>
          <span>Customer Reference</span>
          <strong>{{ quote.customer_ref || "-" }}</strong>
        </div>
      </section>

      <div class="customer-quote-details__grid">
        <section class="customer-quote-details__card">
          <h2>Shipment</h2>

          <dl class="customer-quote-details__info">
            <div>
              <dt>Origin</dt>
              <dd>{{ quote.origin || "-" }}</dd>
            </div>

            <div>
              <dt>Destination</dt>
              <dd>{{ quote.destination || "-" }}</dd>
            </div>

            <div>
              <dt>Estimated Departure</dt>
              <dd>{{ formatDate(quote.etd) }}</dd>
            </div>

            <div>
              <dt>Estimated Arrival</dt>
              <dd>{{ formatDate(quote.eta) }}</dd>
            </div>

            <div>
              <dt>Mode</dt>
              <dd>{{ prettify(quote.mode_of_transport) }}</dd>
            </div>

            <div>
              <dt>Quote Type</dt>
              <dd>{{ prettify(quote.quote_type) }}</dd>
            </div>

            <div>
              <dt>Total Weight</dt>
              <dd>{{ totalWeight ? `${totalWeight.toLocaleString("en-GB")} kg` : "-" }}</dd>
            </div>

            <div>
              <dt>Total CBM</dt>
              <dd>{{ totalCbm ? totalCbm.toFixed(2) : "-" }}</dd>
            </div>
          </dl>
        </section>

        <section class="customer-quote-details__card">
          <h2>Contact</h2>

          <dl class="customer-quote-details__info">
            <div>
              <dt>Name</dt>
              <dd>{{ quote.contact_name || "-" }}</dd>
            </div>

            <div>
              <dt>Email</dt>
              <dd>{{ quote.contact_email || "-" }}</dd>
            </div>

            <div>
              <dt>Phone</dt>
              <dd>{{ quote.contact_phone || "-" }}</dd>
            </div>

            <div>
              <dt>Incoterms</dt>
              <dd>{{ quote.incoterm || "-" }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section class="customer-quote-details__card">
        <h2>Goods</h2>
        <p>{{ quote.goods_description || quote.commodity || "-" }}</p>

        <p v-if="quote.is_hazardous" class="customer-quote-details__hazard">
          Hazardous: {{ quote.hazardous_class || "-" }} / {{ quote.un_number || "-" }} /
          {{ quote.packing_group || "-" }}
        </p>
      </section>

      <section class="customer-quote-details__card">
        <LoadPlannerPanel
          :packages="loadPlannerPackages"
          :plan-ref="loadPlannerReference"
          :adr-default="quote.is_hazardous"
        />
      </section>

      <section class="customer-quote-details__card">
        <h2>Charges</h2>

        <DataTable :value="chargeLines" responsiveLayout="scroll">
          <Column field="description" header="Description" />
          <Column field="quantity" header="Qty" />
          <Column field="uom" header="UOM" />
          <Column header="Sell Total">
            <template #body="{ data }">
              <strong>{{ money(data.total_sell) }}</strong>
            </template>
          </Column>
        </DataTable>
      </section>

      <section class="customer-quote-details__card">
        <h2>Terms & Conditions</h2>
        <pre>{{ quote.terms_conditions || "-" }}</pre>
      </section>
    </template>

    <Dialog
      v-model:visible="showCustomerReferenceModal"
      header="Customer Reference"
      modal
      :style="{ width: '420px' }"
    >
      <div class="customer-quote-details__reference-modal">
        <p>
          This quote does not have a customer reference yet. Add one now or continue without it.
        </p>

        <label for="customer-reference">Customer Reference</label>
        <InputText
          id="customer-reference"
          v-model="customerReferenceInput"
          class="customer-quote-details__reference-input"
          placeholder="Enter customer reference"
          autofocus
        />
      </div>

      <template #footer>
        <Button
          label="Proceed Without Reference"
          class="btn btn--ghost"
          :disabled="actionProcessing"
          @click="acceptQuote(null)"
        />
        <Button
          label="Accept Quote"
          icon="pi pi-check"
          class="btn btn--primary"
          :loading="actionProcessing"
          @click="acceptQuote(customerReferenceInput)"
        />
      </template>
    </Dialog>
  </section>
</template>
