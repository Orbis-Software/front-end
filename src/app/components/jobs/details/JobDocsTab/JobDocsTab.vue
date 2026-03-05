<script setup lang="ts">
import { computed, ref } from "vue"
import Button from "primevue/button"

export type JobDocFileType = "pdf" | "doc" | "xls" | "img" | "other"

export type JobUploadedDocument = {
  id: number | string
  name: string
  size_label?: string | null // "2.4 MB"
  uploaded_at_label?: string | null // "03/02/2026"
  uploaded_by?: string | null
  type?: JobDocFileType
}

export type JobExportDoc = {
  key: string
  title: string
  icon?: string // primeicon class
  status?: "ready" | "generate" // ready => Download (green), generate => Generate (orange)
}

const props = defineProps<{
  disabled?: boolean
  uploaded?: JobUploadedDocument[]
}>()

const emit = defineEmits<{
  (e: "upload", files: File[]): void
  (e: "view", id: JobUploadedDocument["id"]): void
  (e: "download", id: JobUploadedDocument["id"]): void
  (e: "remove", id: JobUploadedDocument["id"]): void

  (e: "export", key: string): void
  (e: "printAll"): void
  (e: "downloadZip"): void
  (e: "emailCustomer"): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const uploadedList = computed<JobUploadedDocument[]>(() => {
  // fallback sample data (until backend is ready)
  return (
    props.uploaded ?? [
      { id: 1, name: "Commercial Invoice.pdf", size_label: "2.4 MB", uploaded_at_label: "03/02/2026", uploaded_by: "John Smith", type: "pdf" },
      { id: 2, name: "Packing List.docx", size_label: "1.1 MB", uploaded_at_label: "03/02/2026", uploaded_by: "Sarah Johnson", type: "doc" },
      { id: 3, name: "Certificate of Origin.pdf", size_label: "1.8 MB", uploaded_at_label: "02/02/2026", uploaded_by: "John Smith", type: "pdf" },
      { id: 4, name: "Insurance Certificate.pdf", size_label: "1.5 MB", uploaded_at_label: "02/02/2026", uploaded_by: "Sarah Johnson", type: "pdf" },
      { id: 5, name: "Customer Purchase Order.xlsx", size_label: "3.2 MB", uploaded_at_label: "01/02/2026", uploaded_by: "Mike Wilson", type: "xls" },
    ]
  )
})

const exportDocs: JobExportDoc[] = [
  { key: "transport_order", title: "Transport Order", icon: "pi pi-truck", status: "ready" },
  { key: "collection_order", title: "Collection Order", icon: "pi pi-inbox", status: "ready" },
  { key: "shipping_instructions", title: "Shipping Instructions", icon: "pi pi-file-edit", status: "generate" },
  { key: "commercial_invoice", title: "Commercial Invoice", icon: "pi pi-receipt", status: "generate" },
  { key: "delivery_note", title: "Delivery Note", icon: "pi pi-file", status: "generate" },
  { key: "proof_of_delivery", title: "Proof of Delivery", icon: "pi pi-verified", status: "generate" },
]

function openFilePicker() {
  if (props.disabled) return
  fileInputRef.value?.click()
}

function onFilesPicked(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (!files.length) return
  emit("upload", files)
  input.value = ""
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  if (props.disabled) return
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (!files.length) return
  emit("upload", files)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

function fileBadgeType(t?: JobDocFileType) {
  if (t === "pdf") return "PDF"
  if (t === "doc") return "DOC"
  if (t === "xls") return "XLS"
  if (t === "img") return "IMG"
  return "FILE"
}

function badgeClass(t?: JobDocFileType) {
  if (t === "pdf") return "docBadge docBadge--pdf"
  if (t === "doc") return "docBadge docBadge--doc"
  if (t === "xls") return "docBadge docBadge--xls"
  if (t === "img") return "docBadge docBadge--img"
  return "docBadge"
}
</script>

<template>
  <div class="job-docs">
    <div class="docs-card">
      <div class="docs-title">Job Documents</div>

      <div class="docs-grid">
        <!-- LEFT -->
        <div class="docs-left">
          <div class="block">
            <div class="blockHead">
              <i class="pi pi-upload" />
              <div class="blockHead__title">Upload Documents</div>
            </div>

            <div class="dropzone" :class="{ 'dropzone--disabled': disabled }" @drop="onDrop" @dragover="onDragOver">
              <div class="dzIcon">
                <i class="pi pi-cloud-upload" />
              </div>

              <div class="dzText">
                <div class="dzTitle">Drag &amp; drop files here</div>
                <div class="dzSub">or click to browse</div>
                <div class="dzMeta">Supports PDF, Word, Excel, Images (Max 10MB)</div>
              </div>

              <Button
                class="dzBtn"
                type="button"
                label="Browse Files"
                icon="pi pi-folder-open"
                :disabled="disabled"
                @click="openFilePicker"
              />

              <input
                ref="fileInputRef"
                type="file"
                class="hiddenInput"
                multiple
                @change="onFilesPicked"
              />
            </div>
          </div>

          <div class="block" style="margin-top: 14px;">
            <div class="blockHead">
              <i class="pi pi-file" />
              <div class="blockHead__title">Uploaded Documents ({{ uploadedList.length }})</div>
            </div>

            <div class="uploadedList">
              <div v-for="d in uploadedList" :key="d.id" class="uploadedRow">
                <div :class="badgeClass(d.type)">
                  {{ fileBadgeType(d.type) }}
                </div>

                <div class="uploadedInfo">
                  <div class="uploadedName">{{ d.name }}</div>
                  <div class="uploadedMeta">
                    <span>{{ d.size_label ?? "-" }}</span>
                    <span class="dot">•</span>
                    <span>Uploaded: {{ d.uploaded_at_label ?? "-" }}</span>
                    <span class="dot">•</span>
                    <span>By: {{ d.uploaded_by ?? "-" }}</span>
                  </div>
                </div>

                <div class="uploadedActions">
                  <button class="iconBtn" type="button" title="View" :disabled="disabled" @click="emit('view', d.id)">
                    <i class="pi pi-eye" />
                  </button>
                  <button class="iconBtn" type="button" title="Download" :disabled="disabled" @click="emit('download', d.id)">
                    <i class="pi pi-download" />
                  </button>
                  <button class="iconBtn iconBtn--danger" type="button" title="Delete" :disabled="disabled" @click="emit('remove', d.id)">
                    <i class="pi pi-trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="docs-right">
          <div class="block">
            <div class="blockHead">
              <i class="pi pi-bolt" />
              <div class="blockHead__title">Export Documents</div>
            </div>

            <div class="blockSub">Generate and export standard documents for this job</div>

            <div class="exportGrid">
              <div v-for="x in exportDocs" :key="x.key" class="exportCard">
                <div class="exportIcon">
                  <i :class="x.icon || 'pi pi-file'" />
                </div>

                <div class="exportTitle">{{ x.title }}</div>

                <Button
                  v-if="x.status === 'ready'"
                  class="exportBtn exportBtn--download"
                  type="button"
                  label="Download"
                  icon="pi pi-download"
                  :disabled="disabled"
                  @click="emit('export', x.key)"
                />

                <Button
                  v-else
                  class="exportBtn exportBtn--generate"
                  type="button"
                  label="Generate"
                  icon="pi pi-bolt"
                  :disabled="disabled"
                  @click="emit('export', x.key)"
                />
              </div>
            </div>

            <div class="quickActions">
              <div class="qaTitle">
                <i class="pi pi-bolt" />
                <span>Quick Actions</span>
              </div>

              <div class="qaBtns">
                <Button
                  class="qaBtn qaBtn--primary"
                  type="button"
                  label="Print All Documents"
                  icon="pi pi-print"
                  :disabled="disabled"
                  @click="emit('printAll')"
                />
                <Button
                  class="qaBtn"
                  type="button"
                  label="Download as ZIP"
                  icon="pi pi-download"
                  :disabled="disabled"
                  @click="emit('downloadZip')"
                />
                <Button
                  class="qaBtn"
                  type="button"
                  label="Email to Customer"
                  icon="pi pi-envelope"
                  :disabled="disabled"
                  @click="emit('emailCustomer')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- /grid -->
    </div>
  </div>
</template>

<style scoped>
@import "./JobDocsTab.css";
</style>