<script setup lang="ts">
import "../CustomerPortalListPage.css"
import { computed, ref } from "vue"
import Button from "primevue/button"
import { documents, documentTabs } from "./CustomerDocumentsPage"

const activeTab = ref("all")

const filteredDocuments = computed(() => {
  if (activeTab.value === "all") return documents
  return documents.filter(document => document.type === activeTab.value)
})

function tabCount(value: string) {
  if (value === "all") return documents.length
  return documents.filter(document => document.type === value).length
}
</script>

<template>
  <section class="customer-list-page">
    <header class="customer-list-page__header">
      <div class="customer-list-page__title-wrap">
        <h1 class="customer-list-page__title">Documents</h1>
      </div>

      <input class="customer-list-page__search-input" placeholder="Search documents..." />
    </header>

    <div class="customer-list-page__card">
      <div class="customer-list-page__tabs-bar">
        <nav class="customer-list-page__tabs">
          <button
            v-for="tab in documentTabs"
            :key="tab.value"
            class="customer-list-page__tab"
            :class="{ 'customer-list-page__tab--active': activeTab === tab.value }"
            type="button"
            @click="activeTab = tab.value"
          >
            {{ tab.label.replace(/\s*\(.+\)$/, "") }}
            <span class="customer-list-page__tab-count">{{ tabCount(tab.value) }}</span>
          </button>
        </nav>
      </div>

      <div class="customer-list-page__content">
        <div class="customer-list-page__table-card">
          <div class="customer-list-page__table-scroll">
            <table class="customer-list-page__table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                <tr v-for="document in filteredDocuments" :key="document.name">
                  <td>
                    <div class="customer-list-page__cell-stack">
                      <span class="customer-list-page__cell-title">{{ document.name }}</span>
                      <span class="customer-list-page__cell-subtext">{{ document.fileType }}</span>
                    </div>
                  </td>
                  <td>{{ document.reference }}</td>
                  <td>
                    <span class="customer-list-page__chip">{{ document.type }}</span>
                  </td>
                  <td>{{ document.date }}</td>
                  <td>{{ document.size }}</td>
                  <td>
                    <div class="customer-list-page__row-actions">
                      <Button class="btn btn--primary" label="Download" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!filteredDocuments.length" class="customer-list-page__empty">
            No documents found.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped src="./CustomerDocumentsPage.css"></style>
