<script setup lang="ts">
import type { InvoiceEmailDialogProps } from "@/app/types/invoice-email"
import { useInvoiceEmailDialog } from "./InvoiceEmailDialog"
import "./InvoiceEmailDialog.css"

const props = defineProps<InvoiceEmailDialogProps>()

const emit = defineEmits<{
  "update:visible": [value: boolean]
  openPdf: []
}>()

const {
  addManualEmail,
  emailDraft,
  groupedRecipientOptions,
  manualEmail,
  selectedRecipients,
  sendEmail,
  sending,
} = useInvoiceEmailDialog(props, emit)
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="title"
    class="job-normal-invoice-tab__dialog"
    :style="{ width: 'min(760px, 96vw)' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="job-normal-invoice-tab__dialog-body">
      <div class="job-normal-invoice-tab__email-summary">
        <span>{{ invoiceLabel }}</span>
        <strong>{{ invoiceNumber || "Invoice ready" }}</strong>
      </div>

      <label class="job-normal-invoice-tab__field">
        <span>Recipients</span>
        <MultiSelect
          v-model="selectedRecipients"
          :options="groupedRecipientOptions"
          option-label="label"
          option-value="value"
          option-group-label="label"
          option-group-children="items"
          display="chip"
          filter
          placeholder="Choose related emails"
        />
      </label>

      <label class="job-normal-invoice-tab__field">
        <span>Manual email</span>
        <div class="job-normal-invoice-tab__manual-email">
          <InputText
            v-model="manualEmail"
            type="email"
            placeholder="name@example.com"
            @keyup.enter="addManualEmail"
          />
          <Button label="Add" icon="pi pi-plus" outlined @click="addManualEmail" />
        </div>
      </label>

      <label class="job-normal-invoice-tab__field">
        <span>Subject</span>
        <InputText v-model="emailDraft.subject" />
      </label>

      <label class="job-normal-invoice-tab__field">
        <span>Message</span>
        <Textarea v-model="emailDraft.body" rows="7" auto-resize />
      </label>
    </div>

    <template #footer>
      <Button label="Close" text :disabled="sending" @click="emit('update:visible', false)" />
      <Button
        label="Open Invoice"
        icon="pi pi-external-link"
        outlined
        :disabled="sending"
        @click="emit('openPdf')"
      />
      <Button
        :label="sending ? 'Sending...' : 'Send Email'"
        icon="pi pi-send"
        :loading="sending"
        @click="sendEmail"
      />
    </template>
  </Dialog>
</template>
