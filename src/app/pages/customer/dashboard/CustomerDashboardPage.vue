<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/app/stores/auth"
import { useTransportQuoteStore } from "@/app/stores/transportQuote"
import type { TransportJob, TransportMode } from "@/app/types/transport-job"
import type { TransportQuote } from "@/app/types/transportQuote"
import type { CustomerDashboardStat as DashboardStat } from "@/app/types/customer"

const router = useRouter()
const auth = useAuthStore()
const quoteStore = useTransportQuoteStore()
const quoteLoadError = ref("")

const customerName = computed(() => {
  return auth.customer?.contact?.company_name ?? auth.customer?.name ?? "Customer"
})

function shortenCustomerName(name: string): string {
  const clean = name.trim().replace(/\s+/g, " ")
  if (clean.length <= 34) return clean

  const suffixMatch = clean.match(/\b(Ltd|Limited|Inc|Incorporated|Corp|Corporation|LLC|PLC)\.?$/i)
  const suffix = suffixMatch?.[0]?.replace(/\.$/, ".") ?? ""
  const nameWithoutSuffix = suffix ? clean.slice(0, suffixMatch!.index).trim() : clean
  const words = nameWithoutSuffix.split(" ").filter(Boolean)
  const initials = words
    .filter(word => !["and", "&", "the", "of", "for"].includes(word.toLowerCase()))
    .map(word => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase()

  if (initials.length >= 2) {
    return suffix ? `${initials} ${suffix}` : initials
  }

  return `${clean.slice(0, 31).trim()}...`
}

const displayCustomerName = computed(() => shortenCustomerName(customerName.value))

const jobs = computed(() => auth.customer?.transport_jobs ?? [])
const quotes = computed(() => quoteStore.quotes)
const quotesLoading = computed(() => quoteStore.loading)

const pendingQuoteCount = computed(() => {
  return quotes.value.filter(quote => normalizedStatus(quote.status) === "sent").length
})

const recentQuotes = computed(() => {
  return [...quotes.value]
    .sort(
      (a, b) =>
        dateValue(b.updated_at ?? b.created_at ?? b.quote_date) -
        dateValue(a.updated_at ?? a.created_at ?? a.quote_date),
    )
    .slice(0, 4)
})

const activeJobs = computed(() => {
  return jobs.value.filter(job => !isDelivered(job.status))
})

const recentJobs = computed(() => {
  return [...jobs.value]
    .sort(
      (a, b) => dateValue(b.updated_at ?? b.created_at) - dateValue(a.updated_at ?? a.created_at),
    )
    .slice(0, 4)
})

const tableJobs = computed(() => {
  return sortedJobs(activeJobs.value).slice(0, 6)
})

const documentCount = computed(() => {
  return jobs.value.reduce((total, job) => total + (job.files?.length ?? 0), 0)
})

const activeModeCount = computed(() => {
  return new Set(jobs.value.map(job => job.mode_of_transport).filter(Boolean)).size
})

const stats = computed<DashboardStat[]>(() => [
  {
    label: "Active Shipments",
    value: activeJobs.value.length,
    note: `${jobs.value.length} total transport jobs`,
    icon: "pi pi-truck",
    tone: "orange",
  },
  {
    label: "Transport Modes",
    value: activeModeCount.value,
    note: "Modes used across shipments",
    icon: "pi pi-sitemap",
    tone: "gray",
  },
  {
    label: "Quotes",
    value: quotes.value.length,
    note: `${pendingQuoteCount.value} awaiting your response`,
    icon: "pi pi-file-edit",
    tone: "dark",
  },
  {
    label: "Documents",
    value: documentCount.value,
    note: "Files attached to jobs",
    icon: "pi pi-file",
    tone: "light",
  },
])

function sortedJobs(items: TransportJob[]): TransportJob[] {
  return [...items].sort((a, b) => dateValue(b.job_date) - dateValue(a.job_date))
}

function dateValue(date: string | null | undefined): number {
  if (!date) return 0
  const value = new Date(date).getTime()
  return Number.isNaN(value) ? 0 : value
}

function normalizedStatus(status: string | null | undefined): string {
  return String(status ?? "")
    .trim()
    .toLowerCase()
}

function isDelivered(status: string | null | undefined): boolean {
  return ["delivered", "arrived", "completed", "closed"].includes(normalizedStatus(status))
}

function statusClass(status: string | null | undefined): string {
  const value = normalizedStatus(status)

  if (isDelivered(value)) return "badge--green"
  if (["in transit", "transit", "customs", "collected", "departed"].includes(value)) {
    return "badge--amber"
  }

  return "badge--gray"
}

function statusLabel(status: string | null | undefined): string {
  return status || "Draft"
}

function quoteStatusLabel(status: string | null | undefined): string {
  const value = normalizedStatus(status)

  if (value === "sent") return "Pending"
  if (value === "accepted") return "Accepted"
  if (value === "rejected") return "Declined"
  if (value === "converted") return "Converted"

  return statusLabel(status)
}

function quoteStatusClass(status: string | null | undefined): string {
  const value = normalizedStatus(status)

  if (["accepted", "converted"].includes(value)) return "badge--green"
  if (value === "sent") return "badge--amber"
  if (value === "rejected") return "badge--red"

  return "badge--gray"
}

function modeLabel(mode: TransportMode | null): string {
  if (!mode) return "Not set"
  return mode.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase())
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "Not set"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function shipmentRoute(job: TransportJob): string {
  return job.consignee_name || job.customer_contact?.company_name || customerName.value
}

function activityText(job: TransportJob): string {
  return `${job.job_number} is ${statusLabel(job.status).toLowerCase()}`
}

function quoteReference(quote: TransportQuote): string {
  return quote.quote_ref || `QUOTE-${quote.id}`
}

function quoteRoute(quote: TransportQuote): string {
  return [quote.origin, quote.destination].filter(Boolean).join(" to ") || "Route pending"
}

function quoteAmount(quote: TransportQuote): string {
  const value = Number(quote.totals?.total_incl_tax || 0)

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: quote.currency || "GBP",
  }).format(value)
}

async function loadQuotes() {
  quoteLoadError.value = ""

  try {
    await quoteStore.fetchQuotes({
      page: 1,
      per_page: 100,
      q: null,
      quote_type: null,
      mode_of_transport: null,
      status: null,
    })
  } catch {
    quoteLoadError.value = "Quotes could not be loaded. Please try again shortly."
  }
}

function goShipments() {
  router.push({ name: "customer.shipments" })
}

function goQuotes() {
  router.push({ name: "customer.quotes" })
}

function openQuote(id: number) {
  router.push({ name: "customer.quotes.show", params: { id } })
}

function openShipment(id: number) {
  router.push({ name: "customer.shipments", query: { job: id } })
}

onMounted(loadQuotes)
</script>

<template>
  <div class="customer-dashboard-page">
    <section class="welcome-banner">
      <div>
        <div class="welcome-eyebrow">CUSTOMER PORTAL</div>
        <h1 class="welcome-title" :title="customerName">Welcome back, {{ displayCustomerName }}</h1>
        <p class="welcome-subtitle">Here's your logistics overview.</p>
      </div>

      <Button
        label="View Quotes"
        icon="pi pi-file-edit"
        class="btn btn--primary"
        @click="goQuotes"
      />
    </section>

    <section class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ stat.label }}</span>
          <div class="stat-icon" :class="`stat-icon--${stat.tone}`">
            <i :class="stat.icon" />
          </div>
        </div>

        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-note">{{ stat.note }}</div>
      </div>
    </section>

    <section class="dashboard-grid">
      <div class="table-card">
        <div class="table-header">
          <div>
            <h2>Active Shipments</h2>
            <p>Transport jobs currently visible to your account.</p>
          </div>

          <Button
            label="View all"
            icon="pi pi-arrow-right"
            iconPos="right"
            class="btn btn--ghost btn--small"
            @click="goShipments"
          />
        </div>

        <div class="table-wrap">
          <table class="shipments-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer / Route</th>
                <th>Mode</th>
                <th>Job Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="job in tableJobs" :key="job.id" @click="openShipment(job.id)">
                <td>
                  <strong>{{ job.job_number }}</strong>
                  <span>{{ job.quote_ref ?? job.customer_booking_ref ?? "No customer ref" }}</span>
                </td>
                <td>{{ shipmentRoute(job) }}</td>
                <td>{{ modeLabel(job.mode_of_transport) }}</td>
                <td>{{ formatDate(job.job_date) }}</td>
                <td>
                  <span class="badge" :class="statusClass(job.status)">
                    {{ statusLabel(job.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="tableJobs.length === 0" class="empty-state">No active shipments yet.</div>
        </div>
      </div>

      <div class="side-column">
        <div class="mini-card">
          <div class="mini-header">
            <h3>Recent Quotes</h3>

            <Button
              label="View all"
              icon="pi pi-arrow-right"
              iconPos="right"
              class="btn btn--ghost btn--small"
              @click="goQuotes"
            />
          </div>

          <div class="mini-list quote-list">
            <button
              v-for="quote in recentQuotes"
              :key="quote.id"
              class="quote-item"
              type="button"
              @click="openQuote(quote.id)"
            >
              <span class="quote-item__top">
                <strong>{{ quoteReference(quote) }}</strong>
                <span class="badge" :class="quoteStatusClass(quote.status)">
                  {{ quoteStatusLabel(quote.status) }}
                </span>
              </span>

              <span class="quote-item__route">{{ quoteRoute(quote) }}</span>

              <span class="quote-item__meta">
                <strong>{{ quoteAmount(quote) }}</strong>
                <span>Valid until {{ formatDate(quote.valid_until) }}</span>
              </span>
            </button>

            <div v-if="quotesLoading && !recentQuotes.length" class="empty-mini">
              <i class="pi pi-spin pi-spinner" />
              <div>
                <strong>Loading quotes</strong>
                <span>Getting your latest quotation details.</span>
              </div>
            </div>

            <div v-else-if="quoteLoadError" class="empty-mini empty-mini--error">
              <i class="pi pi-exclamation-circle" />
              <div>
                <strong>Quotes unavailable</strong>
                <span>{{ quoteLoadError }}</span>
              </div>
            </div>

            <div v-else-if="!recentQuotes.length" class="empty-mini">
              <i class="pi pi-file-edit" />
              <div>
                <strong>No recent quotes</strong>
                <span>Quotes sent to your company will appear here.</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mini-card">
          <div class="mini-header">
            <h3>Recent Activity</h3>
          </div>

          <div class="activity-list">
            <div v-for="job in recentJobs" :key="job.id" class="activity-item">
              <span class="activity-dot" :class="statusClass(job.status)" />

              <div>
                <div class="activity-text">{{ activityText(job) }}</div>
                <div class="activity-meta">{{ formatDate(job.updated_at ?? job.created_at) }}</div>
              </div>
            </div>

            <div v-if="recentJobs.length === 0" class="empty-mini">
              <i class="pi pi-clock" />
              <div>
                <strong>No recent activity</strong>
                <span>Shipment updates will appear here.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped src="./CustomerDashboardPage.css"></style>
