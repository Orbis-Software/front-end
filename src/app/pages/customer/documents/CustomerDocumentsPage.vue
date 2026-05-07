<script setup lang="ts">
import { computed, ref } from "vue"
import { documents, documentTabs } from "./CustomerDocumentsPage"

const activeTab = ref("all")

const filteredDocuments = computed(() => {
  if (activeTab.value === "all") return documents
  return documents.filter(document => document.type === activeTab.value)
})
</script>

<template>
  <div class="customer-page">
    <div class="page-header">
      <div>
        <h1>Documents</h1>
        <p>24 files available — quotes, invoices, PODs & reports</p>
      </div>

      <input class="search-input" placeholder="Search documents…" />
    </div>

    <div class="tabs">
      <button
        v-for="tab in documentTabs"
        :key="tab.value"
        class="tab-btn"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <section class="doc-grid">
      <article v-for="document in filteredDocuments" :key="document.name" class="doc-card">
        <div class="doc-main">
          <div class="doc-icon">📄</div>

          <div>
            <strong>{{ document.name }}</strong>
            <p>{{ document.reference }} · {{ document.date }}</p>
          </div>
        </div>

        <div class="doc-footer">
          <span>{{ document.fileType }} · {{ document.size }}</span>
          <button class="primary-btn small">Download</button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped src="./CustomerDocumentsPage.css"></style>
