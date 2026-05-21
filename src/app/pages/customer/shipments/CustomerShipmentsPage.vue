<script setup lang="ts">
import "../CustomerPortalListPage.css"
import { computed, ref } from "vue"
import Button from "primevue/button"
import { shipments } from "./CustomerShipmentsPage"

const tabs = [
  { label: "All Shipments", value: "all" },
  { label: "In Transit", value: "transit" },
  { label: "Customs", value: "customs" },
  { label: "Arrived", value: "arrived" },
]

const activeTab = ref("all")

const filteredShipments = computed(() => {
  if (activeTab.value === "all") return shipments
  if (activeTab.value === "transit") return shipments.filter(item => item.status === "In Transit")
  if (activeTab.value === "customs") return shipments.filter(item => item.status === "Customs")
  if (activeTab.value === "arrived") return shipments.filter(item => item.status === "Arrived")
  return shipments
})

function tabCount(value: string) {
  if (value === "all") return shipments.length
  if (value === "transit") return shipments.filter(item => item.status === "In Transit").length
  if (value === "customs") return shipments.filter(item => item.status === "Customs").length
  if (value === "arrived") return shipments.filter(item => item.status === "Arrived").length
  return 0
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
            class="customer-list-page__search-input"
            placeholder="Search by reference, route..."
          />

          <select class="customer-list-page__filter-select">
            <option>All Modes</option>
            <option>Sea FCL</option>
            <option>Sea LCL</option>
            <option>Air</option>
            <option>Road</option>
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
                <tr v-for="shipment in filteredShipments" :key="shipment.reference">
                  <td>
                    <button class="customer-list-page__cell-link" type="button">
                      {{ shipment.reference }}
                    </button>
                  </td>
                  <td>{{ shipment.origin }}</td>
                  <td>{{ shipment.destination }}</td>
                  <td>
                    <span
                      class="customer-list-page__chip"
                      :class="`customer-list-page__chip--${shipment.modeColor}`"
                    >
                      {{ shipment.mode }}
                    </span>
                  </td>
                  <td class="customer-list-page__cell-subtext">{{ shipment.carrier }}</td>
                  <td class="customer-list-page__cell-subtext">{{ shipment.vessel }}</td>
                  <td class="customer-list-page__plain-value">{{ shipment.eta }}</td>
                  <td>
                    <span
                      class="customer-list-page__chip"
                      :class="`customer-list-page__chip--${shipment.statusColor}`"
                    >
                      {{ shipment.status }}
                    </span>
                  </td>
                  <td>
                    <div class="customer-list-page__row-actions">
                      <Button class="btn btn--ghost" label="Track" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped src="./CustomerShipmentsPage.css"></style>
