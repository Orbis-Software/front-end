<script setup lang="ts">
import "./ContactOverviewCard.css"
import { computed } from "vue"

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

  branches?: Array<unknown>
  collection_addresses?: Array<unknown>

  total_jobs?: number | null
  total_quotes?: number | null
  total_invoices?: number | null
  total_sales?: number | string | null
}

const props = defineProps<{
  contact: ContactOverview
}>()

const formattedCreditLimit = computed(() => {
  const value = props.contact.credit_limit

  if (value === null || value === undefined || value === "") return "-"

  const numeric = Number(value)
  if (Number.isNaN(numeric)) return String(value)

  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)
})

const formattedTotalSales = computed(() => {
  const value = props.contact.total_sales

  if (value === null || value === undefined || value === "") return "0.00"

  const numeric = Number(value)
  if (Number.isNaN(numeric)) return String(value)

  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)
})

const stats = computed(() => [
  {
    label: "Branches",
    value: props.contact.branches?.length ?? 0,
    tone: "neutral",
  },
  {
    label: "Addresses",
    value: props.contact.collection_addresses?.length ?? 0,
    tone: "neutral",
  },
  {
    label: "Jobs",
    value: props.contact.total_jobs ?? 0,
    tone: "blue",
  },
  {
    label: "Quotes",
    value: props.contact.total_quotes ?? 0,
    tone: "amber",
  },
  {
    label: "Invoices",
    value: props.contact.total_invoices ?? 0,
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
  { label: "Company Name", value: props.contact.company_name || "-" },
  { label: "Account Number", value: props.contact.account_number || "-" },
  { label: "Email", value: props.contact.email || "-" },
  { label: "Phone", value: props.contact.phone || "-" },
  { label: "Website", value: props.contact.website || "-" },
  { label: "VAT Number", value: props.contact.vat_number || "-" },
  { label: "EORI Number", value: props.contact.eori_number || "-" },
  { label: "Payment Terms", value: props.contact.payment_terms || "-" },
  { label: "Credit Limit", value: formattedCreditLimit.value, prefix: "£" },
])
</script>

<template>
  <div class="contact-overview">
    <section class="contact-overview__hero">
      <div class="contact-overview__hero-main">
        <div class="contact-overview__eyebrow">Customer Overview</div>
        <h2 class="contact-overview__title">
          {{ contact.company_name || "Unnamed Contact" }}
        </h2>

        <div class="contact-overview__meta">
          <span class="contact-overview__chip"> Account: {{ contact.account_number || "-" }} </span>

          <span class="contact-overview__chip">
            Payment Terms: {{ contact.payment_terms || "-" }}
          </span>
        </div>
      </div>

      <div class="contact-overview__hero-side">
        <div class="contact-overview__mini-card">
          <span class="contact-overview__mini-label">Credit Limit</span>
          <strong class="contact-overview__mini-value">
            {{ formattedCreditLimit === "-" ? "-" : `£${formattedCreditLimit}` }}
          </strong>
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
            <span class="overview-details__value">
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
