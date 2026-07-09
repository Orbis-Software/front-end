<script setup lang="ts">
import "./JobNormalCustomerInvoiceTab.css"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import InvoiceEmailDialog from "../InvoiceEmailDialog/InvoiceEmailDialog.vue"
import { useJobNormalCustomerInvoiceTab } from "./JobNormalCustomerInvoiceTab"

const {
  emailDialogVisible,
  emailInvoice,
  emailJobSummary,
  emailRecipientOptions,
  confirmDeleteInvoice,
  deleteBlockedDialogVisible,
  deleteConfirmation,
  deleteDialogVisible,
  deleteInvoiceTarget,
  deletingInvoice,
  generateInvoice,
  generating,
  grandTotal,
  currencyCode,
  invoiceCurrency,
  invoiceNumber,
  invoicePdfUrl,
  invoiceStatusLabel,
  invoices,
  isPrinted,
  jobContext,
  money,
  numberValue,
  openDeleteInvoice,
  openPendingInvoice,
  rows,
  subtotal,
  vatTotal,
} = useJobNormalCustomerInvoiceTab()
</script>

<template>
  <section class="job-normal-invoice-tab">
    <div class="job-normal-invoice-tab__section">
      <header class="job-normal-invoice-tab__header">
        <div>
          <h2>Customer Invoice</h2>
          <p>Customer invoice lines are based on the job Sell Charges.</p>
        </div>

        <div class="job-normal-invoice-tab__actions">
          <Button
            :label="generating ? 'Opening...' : 'Generate Customer Invoice'"
            icon="pi pi-file-pdf"
            :loading="generating"
            :disabled="!rows.length || jobContext.saving.value"
            @click="generateInvoice"
          />
        </div>
      </header>

      <div v-if="!rows.length" class="job-normal-invoice-tab__placeholder">
        <strong>No sell charges yet</strong>
        <p class="job-normal-invoice-tab__empty">
          Add Sell Charges in Costs & Charges to build the customer invoice.
        </p>
      </div>

      <template v-else>
        <div class="job-normal-invoice-tab__table-wrap">
          <table class="job-normal-invoice-tab__table job-normal-invoice-tab__table--customer">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>Description</th>
                <th class="job-normal-invoice-tab__quantity">Qty</th>
                <th class="job-normal-invoice-tab__money">Unit Price</th>
                <th class="job-normal-invoice-tab__currency">Currency</th>
                <th class="job-normal-invoice-tab__quantity">VAT %</th>
                <th class="job-normal-invoice-tab__money">Net</th>
                <th class="job-normal-invoice-tab__money">VAT</th>
                <th class="job-normal-invoice-tab__money">Gross</th>
                <th>Invoice Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td>{{ row.description || "Customer charge" }}</td>
                <td class="job-normal-invoice-tab__quantity">{{ numberValue(row.quantity) }}</td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount),
                    )
                  }}
                </td>
                <td class="job-normal-invoice-tab__currency">{{ currencyCode(row.currency) }}</td>
                <td class="job-normal-invoice-tab__quantity">
                  {{ numberValue(row.vatRate ?? row.vat_rate).toFixed(2) }}%
                </td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.quantity) *
                        numberValue(
                          row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount,
                        ),
                    )
                  }}
                </td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.quantity) *
                        numberValue(
                          row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount,
                        ) *
                        (numberValue(row.vatRate ?? row.vat_rate) / 100),
                    )
                  }}
                </td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.quantity) *
                        numberValue(
                          row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount,
                        ) *
                        (1 + numberValue(row.vatRate ?? row.vat_rate) / 100),
                    )
                  }}
                </td>
                <td>
                  <span
                    v-if="isPrinted(row)"
                    class="job-normal-invoice-tab__status job-normal-invoice-tab__status--printed"
                  >
                    Printed
                    <a
                      v-if="invoicePdfUrl(row)"
                      :href="invoicePdfUrl(row)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ invoiceNumber(row) }}
                    </a>
                    <span v-else>{{ invoiceNumber(row) }}</span>
                  </span>
                  <span v-else class="job-normal-invoice-tab__status">Not invoiced</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="job-normal-invoice-tab__summary">
          <div class="job-normal-invoice-tab__metric">
            <span>Lines</span>
            <strong>{{ rows.length }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>Net</span>
            <strong>{{ money(invoiceCurrency, subtotal) }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>VAT</span>
            <strong>{{ money(invoiceCurrency, vatTotal) }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>Gross</span>
            <strong>{{ money(invoiceCurrency, grandTotal) }}</strong>
          </div>
        </div>
      </template>
    </div>

    <div class="job-normal-invoice-tab__section">
      <header class="job-normal-invoice-tab__subheader">
        <div>
          <h3>Invoice List</h3>
          <p>Customer invoices generated from this job's Sell Charges.</p>
        </div>
      </header>

      <div v-if="!invoices.length" class="job-normal-invoice-tab__placeholder">
        <strong>No invoices printed yet</strong>
        <p class="job-normal-invoice-tab__empty">Generated invoices will appear here.</p>
      </div>

      <div v-else class="job-normal-invoice-tab__table-wrap">
        <table
          class="job-normal-invoice-tab__table job-normal-invoice-tab__table--invoice-list job-normal-invoice-tab__table--customer-invoice-list"
        >
          <colgroup>
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Status</th>
              <th class="job-normal-invoice-tab__money">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id">
              <td>
                <a
                  v-if="invoice.pdfUrl"
                  class="job-normal-invoice-tab__link"
                  :href="invoice.pdfUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ invoice.invoiceNumber }}
                </a>
                <span v-else>{{ invoice.invoiceNumber }}</span>
              </td>
              <td>{{ invoice.invoiceDate || "-" }}</td>
              <td>
                <span
                  class="job-normal-invoice-tab__status job-normal-invoice-tab__status--printed"
                >
                  {{ invoiceStatusLabel(invoice.status) }}
                </span>
              </td>
              <td class="job-normal-invoice-tab__money">
                {{ money(invoice.currency, numberValue(invoice.total)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      header="Delete Customer Invoice"
      class="job-normal-invoice-tab__dialog"
      :style="{ width: 'min(520px, 94vw)' }"
    >
      <div class="job-normal-invoice-tab__dialog-body">
        <p class="job-normal-invoice-tab__note">
          This will delete the latest invoice only. To confirm, type the invoice number exactly:
          <strong>{{ deleteInvoiceTarget?.invoiceNumber }}</strong>
        </p>
        <label class="job-normal-invoice-tab__field">
          <span>Invoice Number</span>
          <InputText v-model="deleteConfirmation" autocomplete="off" />
        </label>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          text
          :disabled="deletingInvoice"
          @click="deleteDialogVisible = false"
        />
        <Button
          label="Delete Invoice"
          icon="pi pi-trash"
          severity="danger"
          :loading="deletingInvoice"
          :disabled="deleteConfirmation.trim() !== String(deleteInvoiceTarget?.invoiceNumber ?? '')"
          @click="confirmDeleteInvoice"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteBlockedDialogVisible"
      modal
      header="Invoice Cannot Be Deleted"
      class="job-normal-invoice-tab__dialog"
      :style="{ width: 'min(520px, 94vw)' }"
    >
      <div class="job-normal-invoice-tab__dialog-body">
        <p class="job-normal-invoice-tab__note">
          This invoice cannot be deleted because it is not the latest invoice. This keeps the
          invoice audit trail and numbering sequence intact.
        </p>
      </div>

      <template #footer>
        <Button label="OK" @click="deleteBlockedDialogVisible = false" />
      </template>
    </Dialog>

    <InvoiceEmailDialog
      v-model:visible="emailDialogVisible"
      title="Send Customer Invoice"
      :job-id="jobContext.job.value?.id || null"
      :invoice-id="emailInvoice?.id || null"
      invoice-label="Customer Invoice"
      :invoice-number="emailInvoice?.invoiceNumber || 'Invoice'"
      :pdf-url="emailInvoice?.pdfUrl || null"
      :recipient-options="emailRecipientOptions"
      :job-summary="emailJobSummary"
      @open-pdf="openPendingInvoice"
    />
  </section>
</template>
