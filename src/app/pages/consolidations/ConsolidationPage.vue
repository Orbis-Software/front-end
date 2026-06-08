<template>
  <section class="consolidation-page">
    <header class="consolidation-page__hero">
      <div class="consolidation-page__hero-main">
        <div class="consolidation-page__eyebrow">CONSOLIDATED JOB</div>
        <h1>{{ overview.jobNo || "New Consolidation" }}</h1>
        <p>
          {{ overview.customer || "New customer consolidation" }} · {{ overview.shipFrom }} to
          {{ overview.deliveryAddress || "Final destination" }}
        </p>
        <div class="consolidation-page__chips">
          <span>{{ overview.mode }}</span>
          <span>{{ overview.invoiceCurrency }}</span>
          <span>{{ hasAdr ? "ADR" : "Non ADR" }}</span>
        </div>
      </div>

      <div class="consolidation-page__actions">
        <Button
          label="Create Job"
          icon="pi pi-check"
          class="btn btn--primary"
          :loading="creatingJob"
          :disabled="creatingJob"
          @click="createConsolidationJob"
        />
        <Button
          label="Create Collection Order"
          icon="pi pi-plus"
          class="btn btn--ghost"
          @click="openCollectionOrderModal"
        />
      </div>
    </header>

    <p v-if="createError" class="consolidation-page__error">{{ createError }}</p>

    <section class="consolidation-page__metrics">
      <article v-for="metric in metrics" :key="metric.label" class="consolidation-metric">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </article>
    </section>

    <section class="consolidation-page__tabs-card">
      <nav class="consolidation-page__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="consolidation-page__tab"
          :class="{ 'consolidation-page__tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="consolidation-page__tab-body">
        <ConsolidationOverviewTab v-if="activeTab === 'overview'" :context="consolidationPage" />
        <ConsolidationSupplierInvoicesTab
          v-else-if="activeTab === 'orders'"
          :context="consolidationPage"
        />
        <ConsolidationCollectionsTab
          v-else-if="activeTab === 'collections'"
          :context="consolidationPage"
        />
        <LoadPlannerPanel
          v-else-if="activeTab === 'load-planner'"
          :packages="loadPlannerPackages"
          :plan-ref="overview.jobNo || 'Consolidation Load Plan'"
          reference-label="Job Ref"
          :transport-mode="overview.mode || 'road'"
          empty-message="Add package lines in Collection Orders or add a manual load unit here."
        />
        <ConsolidationInvoicesTab
          v-else-if="activeTab === 'invoices'"
          :context="consolidationPage"
        />
        <ConsolidationCustomerInvoiceTab
          v-else-if="activeTab === 'custinv'"
          :context="consolidationPage"
        />
        <ConsolidationGoodsWmsTab v-else :context="consolidationPage" />
      </div>
    </section>

    <ConsolidationDialogs :context="consolidationPage" />
  </section>
</template>

<script setup lang="ts">
import "./ConsolidationPage.css"

import Button from "primevue/button"

import ConsolidationDialogs from "@/app/components/consolidations/ConsolidationDialogs.vue"
import ConsolidationCollectionsTab from "@/app/components/consolidations/tabs/ConsolidationCollectionsTab.vue"
import ConsolidationCustomerInvoiceTab from "@/app/components/consolidations/tabs/ConsolidationCustomerInvoiceTab.vue"
import ConsolidationGoodsWmsTab from "@/app/components/consolidations/tabs/ConsolidationGoodsWmsTab.vue"
import ConsolidationInvoicesTab from "@/app/components/consolidations/tabs/ConsolidationInvoicesTab.vue"
import ConsolidationOverviewTab from "@/app/components/consolidations/tabs/ConsolidationOverviewTab.vue"
import ConsolidationSupplierInvoicesTab from "@/app/components/consolidations/tabs/ConsolidationSupplierInvoicesTab.vue"
import LoadPlannerPanel from "@/app/components/load-planner/LoadPlannerPanel.vue"
import { useConsolidationPage } from "./ConsolidationPage.logic"

const consolidationPage = useConsolidationPage()

const {
  activeTab,
  createConsolidationJob,
  createError,
  creatingJob,
  hasAdr,
  loadPlannerPackages,
  metrics,
  openCollectionOrderModal,
  overview,
  tabs,
} = consolidationPage
</script>
