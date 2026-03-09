<script setup lang="ts">
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

defineProps<{
  contact: ContactOverview
}>()
</script>

<template>
  <div class="contact-overview">
    <div class="overview-grid">
      <section class="overview-card">
        <div class="overview-card__title">Customer Information</div>

        <div class="overview-fields">
          <div class="field">
            <span class="field__label">Company Name</span>
            <span class="field__value">{{ contact.company_name || "-" }}</span>
          </div>

          <div class="field">
            <span class="field__label">Account Number</span>
            <span class="field__value">{{ contact.account_number || "-" }}</span>
          </div>

          <div class="field">
            <span class="field__label">Email</span>
            <span class="field__value">{{ contact.email || "-" }}</span>
          </div>

          <div class="field">
            <span class="field__label">Phone</span>
            <span class="field__value">{{ contact.phone || "-" }}</span>
          </div>

          <div class="field">
            <span class="field__label">Website</span>
            <span class="field__value">{{ contact.website || "-" }}</span>
          </div>

          <div class="field">
            <span class="field__label">VAT Number</span>
            <span class="field__value">{{ contact.vat_number || "-" }}</span>
          </div>

          <div class="field">
            <span class="field__label">EORI Number</span>
            <span class="field__value">{{ contact.eori_number || "-" }}</span>
          </div>

          <div class="field">
            <span class="field__label">Payment Terms</span>
            <span class="field__value">{{ contact.payment_terms || "-" }}</span>
          </div>

          <div class="field">
            <span class="field__label">Credit Limit</span>
            <span class="field__value">{{ contact.credit_limit ?? "-" }}</span>
          </div>
        </div>
      </section>

      <section class="overview-card">
        <div class="overview-card__title">Business Overview</div>

        <div class="overview-stats">
          <div class="stat-box">
            <div class="stat-box__label">Branches</div>
            <div class="stat-box__value">{{ contact.branches?.length ?? 0 }}</div>
          </div>

          <div class="stat-box">
            <div class="stat-box__label">Addresses</div>
            <div class="stat-box__value">{{ contact.collection_addresses?.length ?? 0 }}</div>
          </div>

          <div class="stat-box">
            <div class="stat-box__label">Jobs</div>
            <div class="stat-box__value">{{ contact.total_jobs ?? 0 }}</div>
          </div>

          <div class="stat-box">
            <div class="stat-box__label">Quotes</div>
            <div class="stat-box__value">{{ contact.total_quotes ?? 0 }}</div>
          </div>

          <div class="stat-box">
            <div class="stat-box__label">Invoices</div>
            <div class="stat-box__value">{{ contact.total_invoices ?? 0 }}</div>
          </div>

          <div class="stat-box">
            <div class="stat-box__label">Sales</div>
            <div class="stat-box__value">{{ contact.total_sales ?? 0 }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>