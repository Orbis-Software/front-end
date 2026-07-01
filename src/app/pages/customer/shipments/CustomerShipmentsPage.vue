<script setup lang="ts">
import "../CustomerPortalListPage.css"
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import { useAuthStore } from "@/app/stores/auth"
import type { JobInvoiceSummary, TransportJob, TransportMode } from "@/app/types/transport-job"

const tabs = [
  { label: "All Shipments", value: "all" },
  { label: "In Transit", value: "transit" },
  { label: "Customs", value: "customs" },
  { label: "Arrived", value: "arrived" },
]

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const activeTab = ref("all")
const search = ref("")
const selectedMode = ref("all")
const selectedJobId = ref<number | null>(null)
const detailVisible = ref(false)

const jobs = computed(() => auth.customer?.transport_jobs ?? [])

const filteredShipments = computed(() => {
  const query = search.value.trim().toLowerCase()

  return jobs.value.filter(job => {
    const statusMatch =
      activeTab.value === "all" ||
      (activeTab.value === "transit" && isTransit(job.status)) ||
      (activeTab.value === "customs" && isCustoms(job.status)) ||
      (activeTab.value === "arrived" && isArrived(job.status))

    const modeMatch = selectedMode.value === "all" || job.mode_of_transport === selectedMode.value

    const searchMatch =
      !query ||
      [
        job.job_number,
        job.quote_ref,
        job.customer_po_number,
        job.customer_booking_ref,
        job.consignment_number,
        job.consignee_name,
        shipmentRoute(job),
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query))

    return statusMatch && modeMatch && searchMatch
  })
})

function tabCount(value: string) {
  if (value === "all") return jobs.value.length
  if (value === "transit") return jobs.value.filter(item => isTransit(item.status)).length
  if (value === "customs") return jobs.value.filter(item => isCustoms(item.status)).length
  if (value === "arrived") return jobs.value.filter(item => isArrived(item.status)).length
  return 0
}

const modeOptions = computed(() => {
  const modes = new Set(jobs.value.map(job => job.mode_of_transport).filter(Boolean))

  return [
    { label: "All Modes", value: "all" },
    ...Array.from(modes).map(mode => ({
      label: modeLabel(mode as TransportMode),
      value: mode as string,
    })),
  ]
})

const selectedJob = computed(() => {
  if (!selectedJobId.value) return null

  return jobs.value.find(job => job.id === selectedJobId.value) ?? null
})

const customerInvoices = computed(() => {
  return (selectedJob.value?.invoices ?? []).filter(
    invoice => String(invoice.invoiceType ?? "customer").toLowerCase() === "customer",
  )
})

watch(
  () => [route.query.job, jobs.value.length],
  ([value]) => {
    const id = Number(value)

    if (Number.isFinite(id) && jobs.value.some(job => job.id === id)) {
      openShipment(id, false)
    }
  },
  { immediate: true },
)

function normalizedStatus(status: string | null | undefined): string {
  return String(status ?? "")
    .trim()
    .toLowerCase()
}

function isTransit(status: string | null | undefined): boolean {
  return ["in transit", "transit", "collected", "departed", "en route"].includes(
    normalizedStatus(status),
  )
}

function isCustoms(status: string | null | undefined): boolean {
  return normalizedStatus(status).includes("customs")
}

function isArrived(status: string | null | undefined): boolean {
  return ["arrived", "delivered", "completed", "closed", "pod / closed"].includes(
    normalizedStatus(status),
  )
}

function statusColor(status: string | null | undefined): string {
  if (isArrived(status)) return "green"
  if (isCustoms(status)) return "orange"
  if (isTransit(status)) return "amber"
  return "blue"
}

function modeColor(mode: TransportMode | null): string {
  if (mode === "air") return "purple"
  if (mode === "sea") return "blue"
  if (mode === "road") return "green"
  if (mode === "rail") return "orange"
  return "blue"
}

function statusLabel(status: string | null | undefined): string {
  return status || "Draft"
}

function modeLabel(mode: TransportMode | null): string {
  if (!mode) return "Not set"
  return mode.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase())
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "Not set"

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

function formatMoney(invoice: JobInvoiceSummary): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: invoice.currency || "GBP",
  }).format(Number(invoice.total ?? 0))
}

function shipmentReference(job: TransportJob): string {
  return job.job_number || job.consignment_number || `Job #${job.id}`
}

function shipmentRoute(job: TransportJob): string {
  const origin =
    job.origin_address?.city ||
    job.road_detail?.origin_city ||
    job.sea_detail?.port_of_loading ||
    job.air_detail?.airport_of_departure ||
    job.rail_detail?.loading_terminal

  const destination =
    job.destination_address?.city ||
    job.road_detail?.destination_city ||
    job.sea_detail?.port_of_discharge ||
    job.air_detail?.airport_of_arrival ||
    job.rail_detail?.discharge_terminal ||
    job.consignee_name

  return [origin, destination].filter(Boolean).join(" to ") || job.consignee_name || "Not set"
}

function carrier(job: TransportJob): string {
  return (
    job.road_detail?.carrier ||
    job.sea_detail?.shipping_line ||
    job.air_detail?.airline ||
    job.rail_detail?.rail_operator ||
    job.courier_detail?.carrier ||
    "Not set"
  )
}

function vesselOrFlight(job: TransportJob): string {
  return (
    job.sea_detail?.vessel_name ||
    job.air_detail?.flight_number ||
    job.rail_detail?.train_number ||
    job.road_detail?.vehicle_type ||
    job.courier_detail?.tracking_number ||
    "Not set"
  )
}

function eta(job: TransportJob): string {
  return formatDate(
    job.delivery_date ||
      job.sea_detail?.eta ||
      job.air_detail?.eta ||
      job.rail_detail?.arrival_date ||
      null,
  )
}

function openShipment(id: number, syncRoute = true) {
  selectedJobId.value = id
  detailVisible.value = true

  if (syncRoute && String(route.query.job ?? "") !== String(id)) {
    router.replace({ name: "customer.shipments", query: { ...route.query, job: id } })
  }
}

function closeShipment() {
  detailVisible.value = false
  selectedJobId.value = null

  const nextQuery = { ...route.query }
  delete nextQuery.job
  router.replace({ name: "customer.shipments", query: nextQuery })
}

function openInvoice(invoice: JobInvoiceSummary) {
  if (!invoice.pdfUrl) return

  window.open(invoice.pdfUrl, "_blank", "noopener,noreferrer")
}
</script>

<template>
  <section class="customer-list-page">
    <header class="customer-list-page__header">
      <div class="customer-list-page__title-wrap">
        <h1 class="customer-list-page__title">Shipments</h1>
      </div>

      <Button
        class="btn btn--primary customer-list-page__action-btn"
        icon="pi pi-plus"
        label="Request Shipment"
      />
    </header>

    <div class="customer-list-page__card">
      <div class="customer-list-page__tabs-bar">
        <nav class="customer-list-page__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="customer-list-page__tab"
            :class="{ 'customer-list-page__tab--active': activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span class="customer-list-page__tab-count">{{ tabCount(tab.value) }}</span>
          </button>
        </nav>

        <div class="customer-list-page__tabs-tools">
          <input
            v-model="search"
            class="customer-list-page__search-input"
            placeholder="Search by reference, route..."
          />

          <select v-model="selectedMode" class="customer-list-page__filter-select">
            <option v-for="mode in modeOptions" :key="mode.value" :value="mode.value">
              {{ mode.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="customer-list-page__content">
        <div class="customer-list-page__table-card">
          <div class="customer-list-page__table-scroll">
            <table class="customer-list-page__table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Mode</th>
                  <th>Carrier</th>
                  <th>Vessel / Flight</th>
                  <th>ETA</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                <tr v-for="shipment in filteredShipments" :key="shipment.id">
                  <td>
                    <button
                      class="customer-list-page__cell-link"
                      type="button"
                      @click="openShipment(shipment.id)"
                    >
                      {{ shipmentReference(shipment) }}
                    </button>
                  </td>
                  <td>{{ shipmentRoute(shipment).split(" to ")[0] || "Not set" }}</td>
                  <td>
                    {{
                      shipmentRoute(shipment).split(" to ")[1] ||
                      shipment.consignee_name ||
                      "Not set"
                    }}
                  </td>
                  <td>
                    <span
                      class="customer-list-page__chip"
                      :class="`customer-list-page__chip--${modeColor(shipment.mode_of_transport)}`"
                    >
                      {{ modeLabel(shipment.mode_of_transport) }}
                    </span>
                  </td>
                  <td class="customer-list-page__cell-subtext">{{ carrier(shipment) }}</td>
                  <td class="customer-list-page__cell-subtext">{{ vesselOrFlight(shipment) }}</td>
                  <td class="customer-list-page__plain-value">{{ eta(shipment) }}</td>
                  <td>
                    <span
                      class="customer-list-page__chip"
                      :class="`customer-list-page__chip--${statusColor(shipment.status)}`"
                    >
                      {{ statusLabel(shipment.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="customer-list-page__row-actions">
                      <Button
                        class="btn btn--ghost"
                        label="Track"
                        @click="openShipment(shipment.id)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!filteredShipments.length" class="customer-list-page__empty">
            No shipments found.
          </div>
        </div>
      </div>
    </div>

    <Dialog
      :visible="detailVisible"
      modal
      class="customer-shipment-dialog"
      :style="{ width: 'min(900px, calc(100vw - 32px))' }"
      @update:visible="value => (value ? (detailVisible = true) : closeShipment())"
    >
      <template #header>
        <div class="customer-shipment-dialog__header">
          <span>Shipment</span>
          <strong>{{ selectedJob ? shipmentReference(selectedJob) : "" }}</strong>
        </div>
      </template>

      <div v-if="selectedJob" class="customer-shipment-dialog__body">
        <div class="customer-shipment-dialog__summary">
          <div>
            <span>Route</span>
            <strong>{{ shipmentRoute(selectedJob) }}</strong>
          </div>
          <div>
            <span>Mode</span>
            <strong>{{ modeLabel(selectedJob.mode_of_transport) }}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{{ statusLabel(selectedJob.status) }}</strong>
          </div>
          <div>
            <span>ETA</span>
            <strong>{{ eta(selectedJob) }}</strong>
          </div>
        </div>

        <section class="customer-shipment-dialog__section">
          <div class="customer-shipment-dialog__section-head">
            <h3>Invoices</h3>
            <span>{{ customerInvoices.length }} connected</span>
          </div>

          <div v-if="customerInvoices.length" class="customer-shipment-dialog__table-wrap">
            <table class="customer-shipment-dialog__table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in customerInvoices" :key="invoice.id">
                  <td>{{ invoice.invoiceNumber || `Invoice #${invoice.id}` }}</td>
                  <td>{{ formatDate(invoice.invoiceDate) }}</td>
                  <td>{{ formatDate(invoice.dueDate) }}</td>
                  <td>{{ invoice.status || invoice.generationStatus || "Pending" }}</td>
                  <td>{{ formatMoney(invoice) }}</td>
                  <td>
                    <Button
                      class="btn btn--primary btn--small"
                      label="PDF"
                      icon="pi pi-file-pdf"
                      :disabled="!invoice.pdfUrl"
                      @click="openInvoice(invoice)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="customer-shipment-dialog__empty">
            No customer invoices have been connected to this shipment yet.
          </div>
        </section>
      </div>
    </Dialog>
  </section>
</template>

<style scoped src="./CustomerShipmentsPage.css"></style>
