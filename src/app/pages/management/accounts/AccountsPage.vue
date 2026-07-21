<script setup lang="ts">
import "./AccountsPage.css"

import { computed, ref } from "vue"
import AccountsOverviewSection from "@/app/components/accounts/AccountsOverviewSection/AccountsOverviewSection.vue"
import AccountsInvoicingSection from "@/app/components/accounts/AccountsInvoicingSection/AccountsInvoicingSection.vue"
import AccountsSupplierPaymentsSection from "@/app/components/accounts/AccountsSupplierPaymentsSection/AccountsSupplierPaymentsSection.vue"
import AccountsReportingSection from "@/app/components/accounts/AccountsReportingSection/AccountsReportingSection.vue"
import AccountsCreditControlSection from "@/app/components/accounts/AccountsCreditControlSection/AccountsCreditControlSection.vue"
import AccountsExchangeRatesSection from "@/app/components/accounts/AccountsExchangeRatesSection/AccountsExchangeRatesSection.vue"
import AccountsChargeCodesSection from "@/app/components/accounts/AccountsChargeCodesSection/AccountsChargeCodesSection.vue"
import AccountsTaxCodesSection from "@/app/components/accounts/AccountsTaxCodesSection/AccountsTaxCodesSection.vue"
import AccountsClientBankDetailsSection from "@/app/components/accounts/AccountsClientBankDetailsSection/AccountsClientBankDetailsSection.vue"
import type { AccountsTab, AccountsTabItem } from "@/app/types/page-tabs"

const activeTab = ref<AccountsTab>("overview")

const tabs: AccountsTabItem[] = [
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

function printCurrentView() {
  window.print()
}
</script>

<template>
  <section class="accounts-page">
    <header class="accounts-page__header">
      <div class="accounts-page__title-wrap">
        <h1 class="accounts-page__title">Accounts</h1>
      </div>

      <div class="accounts-page__actions">
        <Button
          label="Print Current View"
          icon="pi pi-print"
          class="accounts-page__action accounts-page__action--primary"
          @click="printCurrentView"
        />
      </div>
    </header>

    <div class="accounts-page__card">
      <nav class="accounts-page__tabs">
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
      </nav>

      <div class="accounts-page__content">
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
    </div>
  </section>
</template>
