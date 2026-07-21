<script setup lang="ts">
import "../CustomerPortalListPage.css"
import { computed, ref } from "vue"
import http from "@/api/http"
import { useAuthStore } from "@/app/stores/auth"
import type { JobFile } from "@/app/types/job-file"
import type { JobInvoiceSummary, TransportJob } from "@/app/types/transport-job"
import type { CustomerDocumentRow, CustomerDocumentType } from "@/app/types/customer"

const activeTab = ref("all")
const search = ref("")
const auth = useAuthStore()

const jobs = computed(() => auth.customer?.transport_jobs ?? [])

const documents = computed<CustomerDocumentRow[]>(() => {
  return [
    ...jobs.value.flatMap(job => [...invoiceRows(job), ...fileRows(job)]),
    ...supplierInvoiceRows(),
  ].sort((a, b) => b.sortDate - a.sortDate)
})

const documentTabs = computed(() => [
  { label: "All", value: "all" },
  { label: "Invoices", value: "invoice" },
  { label: "PODs", value: "pod" },
  { label: "Quotes", value: "quote" },
  { label: "Warehouse Reports", value: "report" },
  { label: "Other Documents", value: "document" },
])

const filteredDocuments = computed(() => {
  const query = search.value.trim().toLowerCase()

  return documents.value.filter(document => {
    const tabMatch = activeTab.value === "all" || document.type === activeTab.value
    const searchMatch =
      !query ||
      [document.name, document.reference, document.typeLabel, document.fileType]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query))

    return tabMatch && searchMatch
  })
})

function tabCount(value: string) {
  if (value === "all") return documents.value.length
  return documents.value.filter(document => document.type === value).length
}

function invoiceRows(job: TransportJob): CustomerDocumentRow[] {
  return (job.invoices ?? [])
    .filter(invoice => String(invoice.invoiceType ?? "customer").toLowerCase() === "customer")
    .map(invoice => invoiceRow(job, invoice))
}

function supplierInvoiceRows(): CustomerDocumentRow[] {
  return (auth.customer?.supplier_invoices ?? [])
    .filter(invoice => String(invoice.invoiceType ?? "").toLowerCase() === "supplier")
    .map(invoice => {
      const number = invoice.invoiceNumber || `Supplier Invoice #${invoice.id}`
      const reference =
        invoice.job?.jobNumber || invoice.job?.shipmentRef || `Job #${invoice.jobId}`

      return {
        id: `supplier-invoice-${invoice.id}`,
        name: `${number} - ${reference}`,
        reference,
        type: "invoice",
        typeLabel: "Supplier Invoice",
        fileType: invoice.pdfUrl ? "PDF" : statusLabel(invoice.generationStatus),
        size: "-",
        date: invoice.invoiceDate ?? invoice.pdfGeneratedAt ?? null,
        sortDate: dateValue(invoice.invoiceDate ?? invoice.pdfGeneratedAt),
        url: invoice.pdfUrl ?? null,
        invoiceId: invoice.id,
      }
    })
}

function invoiceRow(job: TransportJob, invoice: JobInvoiceSummary): CustomerDocumentRow {
  const number = invoice.invoiceNumber || `Invoice #${invoice.id}`
  const reference = shipmentReference(job)

  return {
    id: `invoice-${invoice.id}`,
    name: `${number} - ${reference}`,
    reference,
    type: "invoice",
    typeLabel: "Invoice",
    fileType: invoice.pdfUrl ? "PDF" : statusLabel(invoice.generationStatus),
    size: "-",
    date: invoice.invoiceDate ?? invoice.pdfGeneratedAt ?? null,
    sortDate: dateValue(invoice.invoiceDate ?? invoice.pdfGeneratedAt),
    url: invoice.pdfUrl ?? null,
    invoiceId: invoice.id,
  }
}

function fileRows(job: TransportJob): CustomerDocumentRow[] {
  return (job.files ?? []).map(file => fileRow(job, file))
}

function fileRow(job: TransportJob, file: JobFile): CustomerDocumentRow {
  const type = documentType(file.type, file.path)
  const name = fileName(file.path) || `${documentTypeLabel(type)} - ${shipmentReference(job)}`

  return {
    id: `file-${file.id}`,
    name,
    reference: shipmentReference(job),
    type,
    typeLabel: documentTypeLabel(type),
    fileType: fileExtension(file.path),
    size: "-",
    date: file.created_at ?? null,
    sortDate: dateValue(file.created_at),
    url: file.url ?? null,
    invoiceId: null,
  }
}

function documentType(type: string | null | undefined, path: string): CustomerDocumentType {
  const value = `${type ?? ""} ${path}`.toLowerCase()

  if (value.includes("invoice")) return "invoice"
  if (value.includes("pod") || value.includes("proof")) return "pod"
  if (value.includes("quote")) return "quote"
  if (value.includes("report")) return "report"

  return "document"
}

function documentTypeLabel(type: CustomerDocumentType): string {
  if (type === "pod") return "POD"
  if (type === "quote") return "Quote"
  if (type === "report") return "Warehouse Report"
  if (type === "invoice") return "Invoice"
  return "Document"
}

function shipmentReference(job: TransportJob): string {
  return job.job_number || job.consignment_number || `Job #${job.id}`
}

function statusLabel(status: string | null | undefined): string {
  return status ? status.replace(/_/g, " ") : "Pending"
}

function fileName(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? ""
}

function fileExtension(path: string): string {
  const name = fileName(path)
  const extension = name.includes(".") ? name.split(".").pop() : ""

  return extension ? extension.toUpperCase() : "File"
}

function dateValue(date: string | null | undefined): number {
  if (!date) return 0

  const value = new Date(date).getTime()
  return Number.isNaN(value) ? 0 : value
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "Not set"

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

async function openDocument(document: CustomerDocumentRow) {
  if (document.invoiceId) {
    const response = await http.get(`/customer/invoices/${document.invoiceId}/download`, {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    })

    openBlob(response.data)
    return
  }

  if (!document.url) return

  window.open(document.url, "_blank", "noopener,noreferrer")
}

function openBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)

  window.open(url, "_blank", "noopener,noreferrer")
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}
</script>

<template>
  <section class="customer-list-page">
    <header class="customer-list-page__header">
      <div class="customer-list-page__title-wrap">
        <h1 class="customer-list-page__title">Documents</h1>
      </div>

      <input
        v-model="search"
        class="customer-list-page__search-input"
        placeholder="Search documents..."
      />
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
            {{ tab.label }}
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
                <tr v-for="document in filteredDocuments" :key="document.id">
                  <td>
                    <div class="customer-list-page__cell-stack">
                      <span class="customer-list-page__cell-title">{{ document.name }}</span>
                      <span class="customer-list-page__cell-subtext">{{ document.fileType }}</span>
                    </div>
                  </td>
                  <td>{{ document.reference }}</td>
                  <td>
                    <span
                      class="customer-list-page__chip"
                      :class="`customer-list-page__chip--${document.type}`"
                    >
                      {{ document.typeLabel }}
                    </span>
                  </td>
                  <td>{{ formatDate(document.date) }}</td>
                  <td>{{ document.size }}</td>
                  <td>
                    <div class="customer-list-page__row-actions">
                      <Button
                        class="btn btn--primary"
                        label="Open"
                        icon="pi pi-external-link"
                        :disabled="!document.url && !document.invoiceId"
                        @click="openDocument(document)"
                      />
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
