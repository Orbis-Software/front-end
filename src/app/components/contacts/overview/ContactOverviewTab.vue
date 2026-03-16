<script setup lang="ts">
import "./ContactOverviewCard.css"
import { computed, ref } from "vue"

interface ContactOverview {
  id?: number
  company_name?: string | null
  account_number?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  vat_number?: string | null
  eori_number?: string | null

  payment_terms?: string | null
  credit_limit?: number | string | null
  total_sales?: number | string | null

  branches?: Array<unknown>
  collection_addresses?: Array<unknown>

  total_jobs?: number | null
  total_quotes?: number | null
  total_invoices?: number | null

  days_overdue?: number | null
  overage_percentage?: number | string | null
}

const props = defineProps<{
  contact: ContactOverview
}>()

const testMode = ref(true)
const testCreditLimit = ref<number>(25000)
const testTotalSales = ref<number>(23000)
const testDaysOverdue = ref<number>(0)
const testOveragePercentage = ref<number>(5)
const testJobValue = ref<number>(2100)

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback

  const numeric = Number(value)
  return Number.isNaN(numeric) ? fallback : numeric
}

function formatMoney(value: number | string | null | undefined, fallback = "-"): string {
  if (value === null || value === undefined || value === "") return fallback

  const numeric = Number(value)
  if (Number.isNaN(numeric)) return String(value)

  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)
}

const activeContact = computed<ContactOverview>(() => {
  if (!testMode.value) return props.contact

  return {
    ...props.contact,
    credit_limit: testCreditLimit.value,
    total_sales: testTotalSales.value,
    days_overdue: testDaysOverdue.value,
    overage_percentage: testOveragePercentage.value,
  }
})

const creditLimitNumber = computed(() => toNumber(activeContact.value.credit_limit, 0))
const totalSalesNumber = computed(() => toNumber(activeContact.value.total_sales, 0))
const daysOverdueNumber = computed(() => toNumber(activeContact.value.days_overdue, 0))
const overagePercentageNumber = computed(() => toNumber(activeContact.value.overage_percentage, 0))

const availableCreditNumber = computed(() => {
  return creditLimitNumber.value - totalSalesNumber.value
})

const overageAmountNumber = computed(() => {
  return creditLimitNumber.value * (overagePercentageNumber.value / 100)
})

const maximumBookableAmountNumber = computed(() => {
  return availableCreditNumber.value + overageAmountNumber.value
})

const isLowAvailableCredit = computed(() => {
  return availableCreditNumber.value <= 5000
})

const isCreditLimitExceeded = computed(() => {
  return availableCreditNumber.value < 0
})

const isPaymentOverdue = computed(() => {
  return daysOverdueNumber.value > 0
})

const isOnStop = computed(() => {
  return isCreditLimitExceeded.value || isPaymentOverdue.value
})

const accountStatusLabel = computed(() => {
  if (daysOverdueNumber.value > 0) {
    return `${daysOverdueNumber.value} day${daysOverdueNumber.value === 1 ? "" : "s"} overdue`
  }

  return "Up to date"
})

const accountStatusTone = computed(() => {
  return daysOverdueNumber.value > 0 ? "danger" : "good"
})

const formattedCreditLimit = computed(() => formatMoney(activeContact.value.credit_limit))
const formattedTotalSales = computed(() => formatMoney(activeContact.value.total_sales, "0.00"))
const formattedAvailableCredit = computed(() => formatMoney(availableCreditNumber.value, "0.00"))
const formattedOverageAmount = computed(() => formatMoney(overageAmountNumber.value, "0.00"))
const formattedMaximumBookableAmount = computed(() =>
  formatMoney(maximumBookableAmountNumber.value, "0.00"),
)

const bookingCheck = computed(() => {
  return testJobValue.value <= maximumBookableAmountNumber.value
})

const stats = computed(() => [
  {
    label: "Branches",
    value: activeContact.value.branches?.length ?? 0,
    tone: "neutral",
  },
  {
    label: "Addresses",
    value: activeContact.value.collection_addresses?.length ?? 0,
    tone: "neutral",
  },
  {
    label: "Jobs",
    value: activeContact.value.total_jobs ?? 0,
    tone: "blue",
  },
  {
    label: "Quotes",
    value: activeContact.value.total_quotes ?? 0,
    tone: "amber",
  },
  {
    label: "Invoices",
    value: activeContact.value.total_invoices ?? 0,
    tone: "green",
  },
  {
    label: "Sales",
    value: formattedTotalSales.value,
    tone: "orange",
    prefix: "£",
  },
])

const infoRows = computed(() => [
  { label: "Company Name", value: activeContact.value.company_name || "-" },
  { label: "Account Number", value: activeContact.value.account_number || "-" },
  { label: "Email", value: activeContact.value.email || "-" },
  { label: "Phone", value: activeContact.value.phone || "-" },
  { label: "Website", value: activeContact.value.website || "-" },
  { label: "VAT Number", value: activeContact.value.vat_number || "-" },
  { label: "EORI Number", value: activeContact.value.eori_number || "-" },
  {
    label: "Account Status",
    value: accountStatusLabel.value,
    tone: accountStatusTone.value,
  },
  { label: "Credit Limit", value: formattedCreditLimit.value, prefix: "£" },
  { label: "Available Credit", value: formattedAvailableCredit.value, prefix: "£" },
  {
    label: "Overage Allowance",
    value: `${overagePercentageNumber.value}%`,
  },
  {
    label: "Overage Amount",
    value: formattedOverageAmount.value,
    prefix: "£",
  },
  {
    label: "Max Bookable Before Hard Stop",
    value: formattedMaximumBookableAmount.value,
    prefix: "£",
  },
])

function canBookJob(jobValue: number | string | null | undefined): boolean {
  const amount = toNumber(jobValue, 0)
  return amount <= maximumBookableAmountNumber.value
}

defineExpose({
  canBookJob,
})
</script>

<template>
  <div class="contact-overview">
    <section v-if="testMode" class="contact-overview__test-panel">
      <div class="contact-overview__test-header">
        <strong>Notification Test Panel</strong>
      </div>

      <div class="contact-overview__test-grid">
        <label class="contact-overview__test-field">
          <span>Credit Limit</span>
          <input v-model.number="testCreditLimit" type="number" />
        </label>

        <label class="contact-overview__test-field">
          <span>Total Sales</span>
          <input v-model.number="testTotalSales" type="number" />
        </label>

        <label class="contact-overview__test-field">
          <span>Days Overdue</span>
          <input v-model.number="testDaysOverdue" type="number" />
        </label>

        <label class="contact-overview__test-field">
          <span>Overage %</span>
          <input v-model.number="testOveragePercentage" type="number" />
        </label>

        <label class="contact-overview__test-field">
          <span>Test Job Value</span>
          <input v-model.number="testJobValue" type="number" />
        </label>
      </div>

      <div class="contact-overview__test-results">
        <div>Available Credit: £{{ formattedAvailableCredit }}</div>
        <div>ON STOP: {{ isOnStop ? "YES" : "NO" }}</div>
        <div>Low Credit Warning: {{ isLowAvailableCredit ? "YES" : "NO" }}</div>
        <div>Booking Allowed: {{ bookingCheck ? "YES" : "NO" }}</div>
      </div>
    </section>

    <section class="contact-overview__hero">
      <div class="contact-overview__hero-main">
        <div class="contact-overview__eyebrow">Customer Overview</div>
        <h2 class="contact-overview__title">
          {{ activeContact.company_name || "Unnamed Contact" }}
        </h2>

        <div class="contact-overview__meta">
          <span class="contact-overview__chip">
            Account: {{ activeContact.account_number || "-" }}
          </span>

          <span
            class="contact-overview__chip"
            :class="[
              'contact-overview__chip--status',
              accountStatusTone === 'danger'
                ? 'contact-overview__chip--danger'
                : 'contact-overview__chip--success',
            ]"
          >
            Account Status: {{ accountStatusLabel }}
          </span>
        </div>
      </div>

      <div class="contact-overview__hero-side">
        <div class="contact-overview__mini-card">
          <div class="contact-overview__mini-top">
            <span class="contact-overview__mini-label">Available Credit</span>

            <span v-if="isOnStop" class="contact-overview__stop-badge"> ON STOP </span>
          </div>

          <strong
            class="contact-overview__mini-value"
            :class="{
              'contact-overview__mini-value--warning': isLowAvailableCredit,
            }"
          >
            £{{ formattedAvailableCredit }}
          </strong>

          <div class="contact-overview__mini-subtext">
            Credit Limit £{{ formattedCreditLimit }} · Sales £{{ formattedTotalSales }}
          </div>
        </div>
      </div>
    </section>

    <div class="contact-overview__grid">
      <section class="overview-panel overview-panel--info">
        <div class="overview-panel__head">
          <div>
            <div class="overview-panel__eyebrow">Details</div>
            <h3 class="overview-panel__title">Customer Information</h3>
          </div>
        </div>

        <div class="overview-details">
          <div v-for="item in infoRows" :key="item.label" class="overview-details__item">
            <span class="overview-details__label">{{ item.label }}</span>

            <span
              class="overview-details__value"
              :class="{
                'overview-details__value--danger': item.tone === 'danger',
                'overview-details__value--success': item.tone === 'good',
              }"
            >
              {{ item.prefix && item.value !== "-" ? item.prefix : "" }}{{ item.value }}
            </span>
          </div>
        </div>
      </section>

      <section class="overview-panel overview-panel--stats">
        <div class="overview-panel__head">
          <div>
            <div class="overview-panel__eyebrow">Summary</div>
            <h3 class="overview-panel__title">Business Overview</h3>
          </div>
        </div>

        <div class="overview-stats">
          <article
            v-for="stat in stats"
            :key="stat.label"
            class="overview-stat"
            :class="`overview-stat--${stat.tone}`"
          >
            <span class="overview-stat__label">{{ stat.label }}</span>
            <strong class="overview-stat__value"> {{ stat.prefix || "" }}{{ stat.value }} </strong>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
