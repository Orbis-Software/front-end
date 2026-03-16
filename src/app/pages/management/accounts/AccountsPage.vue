<script setup lang="ts">
import "./AccountsPage.css"

import { computed, ref } from "vue"
import Button from "primevue/button"

import AccountsOverviewSection from "@/app/components/accounts/AccountsOverviewSection/AccountsOverviewSection.vue"
import AccountsInvoicingSection from "@/app/components/accounts/AccountsInvoicingSection/AccountsInvoicingSection.vue"
import AccountsSupplierPaymentsSection from "@/app/components/accounts/AccountsSupplierPaymentsSection/AccountsSupplierPaymentsSection.vue"
import AccountsReportingSection from "@/app/components/accounts/AccountsReportingSection/AccountsReportingSection.vue"
import AccountsCreditControlSection from "@/app/components/accounts/AccountsCreditControlSection/AccountsCreditControlSection.vue"
import AccountsExchangeRatesSection from "@/app/components/accounts/AccountsExchangeRatesSection/AccountsExchangeRatesSection.vue"
import AccountsChargeCodesSection from "@/app/components/accounts/AccountsChargeCodesSection/AccountsChargeCodesSection.vue"
import AccountsTaxCodesSection from "@/app/components/accounts/AccountsTaxCodesSection/AccountsTaxCodesSection.vue"
import AccountsClientBankDetailsSection from "@/app/components/accounts/AccountsClientBankDetailsSection/AccountsClientBankDetailsSection.vue"

export type AccountsTab =
  | "overview"
  | "invoicing"
  | "supplier-payments"
  | "reporting"
  | "credit-control"
  | "exchange-rates"
  | "charge-codes"
  | "tax-codes"
  | "client-bank-details"

type TabItem = {
  id: AccountsTab
  label: string
}

const activeTab = ref<AccountsTab>("overview")

const tabs: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "invoicing", label: "Invoicing" },
  { id: "supplier-payments", label: "Supplier Payments" },
  { id: "reporting", label: "Reporting" },
  { id: "credit-control", label: "Credit Control" },
  { id: "exchange-rates", label: "Exchange Rates" },
  { id: "charge-codes", label: "Charge Codes" },
  { id: "tax-codes", label: "Tax Codes" },
  { id: "client-bank-details", label: "Client Bank Details" },
]

const currentTabLabel = computed(() => {
  return tabs.find(tab => tab.id === activeTab.value)?.label ?? "Accounts"
})

function selectTab(tab: AccountsTab) {
  activeTab.value = tab
}

function exportJson() {
  const data = {
    active_tab: activeTab.value,
    exported_at: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "accounts-data.json"
  link.click()
  URL.revokeObjectURL(url)
}

function printCurrentView() {
  window.print()
}
</script>

<template>
  <div class="accounts-page">
    <section class="accounts-page__header">
      <div class="accounts-page__header-main">
        <div class="accounts-page__header-text">
          <h1 class="accounts-page__title">TMS Accounts</h1>
          <p class="accounts-page__subtitle">
            API-ready finance demo for freight forwarding workflows with sales invoicing, supplier
            payments, reporting, credit control, exchange rates, nominal codes, tax codes and bank
            master data.
          </p>
        </div>

        <div class="accounts-page__actions">
          <Button
            label="Export JSON"
            icon="pi pi-download"
            class="btn btn--ghost"
            @click="exportJson"
          />
          <Button
            label="Print Current View"
            icon="pi pi-print"
            class="btn btn--primary"
            @click="printCurrentView"
          />
        </div>
      </div>

      <div class="accounts-page__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="accounts-page__tab"
          :class="{ 'accounts-page__tab--active': activeTab === tab.id }"
          @click="selectTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </section>

    <section class="accounts-page__body">
      <AccountsOverviewSection v-if="activeTab === 'overview'" />
      <AccountsInvoicingSection v-else-if="activeTab === 'invoicing'" />
      <AccountsSupplierPaymentsSection v-else-if="activeTab === 'supplier-payments'" />
      <AccountsReportingSection v-else-if="activeTab === 'reporting'" />
      <AccountsCreditControlSection v-else-if="activeTab === 'credit-control'" />
      <AccountsExchangeRatesSection v-else-if="activeTab === 'exchange-rates'" />
      <AccountsChargeCodesSection v-else-if="activeTab === 'charge-codes'" />
      <AccountsTaxCodesSection v-else-if="activeTab === 'tax-codes'" />
      <AccountsClientBankDetailsSection v-else-if="activeTab === 'client-bank-details'" />

      <div v-else class="accounts-page__fallback">
        <h2>{{ currentTabLabel }}</h2>
      </div>
    </section>
  </div>
</template>
