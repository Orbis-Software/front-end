<script setup lang="ts">
import "./JobNormalSupplierInvoicesTab.css"
import Button from "primevue/button"
import Calendar from "primevue/calendar"
import Checkbox from "primevue/checkbox"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import MultiSelect from "primevue/multiselect"
import Textarea from "primevue/textarea"
import { useJobNormalSupplierInvoicesTab } from "./JobNormalSupplierInvoicesTab"

const {
  addBillLine,
  addInvoiceLine,
  addManualEmailRecipient,
  billLineTotal,
  billSubtotal,
  billTaxTotal,
  billTotal,
  accountingProviderLabel,
  activeAccountingSetting,
  availableSupplierBillRows,
  chargeDescriptionOptions,
  chargeCodeAccount,
  closeGenerateDialog,
  continueSupplierInvoiceAccounting,
  currencyOptions,
  emailInvoice,
  emailSending,
  emailRecipientOptions,
  confirmDeleteInvoice,
  deleteBlockedDialogVisible,
  deleteConfirmation,
  deleteDialogVisible,
  deleteInvoiceTarget,
  deletingInvoice,
  generateDialogVisible,
  generateActionInProgress,
  generateLoading,
  generateStep,
  generateSupplierId,
  generateSupplierInvoice,
  invoiceDraft,
  currencyCode,
  invoiceCurrency,
  invoiceDisplayNumber,
  invoiceListHref,
  invoiceNumber,
  invoicePdfUrl,
  invoiceStatusLabel,
  invoices,
  isPrinted,
  jobContext,
  money,
  numberValue,
  openDeleteInvoice,
  openGenerateDialog,
  openInvoiceFromList,
  openPassDialog,
  openPendingInvoice,
  openSupplierBillForInvoice,
  openSupplierInvoiceEmailStep,
  onPassInvoiceFileSelected,
  passSupplierOptions,
  passDialogVisible,
  passDraft,
  passSupplierOutstanding,
  passTotalInvoiceAmount,
  passSaving,
  passSupplierInvoice,
  removeBillLine,
  removeInvoiceLine,
  rows,
  saveSupplierInvoice,
  clearPassInvoiceAttachment,
  setSupplierInvoiceNumber,
  setGenerateDialogVisible,
  supplierInvoiceOptions,
  supplierBillReference,
  supplierEmailDraft,
  supplierInvoiceProgress,
  supplierInvoiceStepSummary,
  supplierName,
  supplierOptions,
  suppliersLoading,
  selectedSupplierBillRows,
  totalCost,
  updateBillLineDescription,
  uploadDialogVisible,
  uploadSaving,
  sendSupplierInvoiceEmail,
} = useJobNormalSupplierInvoicesTab()
</script>

<template>
  <section class="job-normal-invoice-tab">
    <div class="job-normal-invoice-tab__section">
      <header class="job-normal-invoice-tab__header">
        <div>
          <h2>Supplier Invoices</h2>
          <p>Supplier invoice framework is based on the job Buy Costs.</p>
        </div>

        <div class="job-normal-invoice-tab__actions">
          <Button
            :label="generateLoading ? 'Generating...' : 'Generate Supplier Invoice'"
            icon="pi pi-file-pdf"
            :loading="generateLoading"
            :disabled="!supplierInvoiceOptions.length || jobContext.saving.value || generateLoading"
            @click="openGenerateDialog"
          />
          <Button
            :label="passSaving ? 'Passing...' : 'Pass Supplier Invoice'"
            icon="pi pi-check-square"
            severity="secondary"
            :loading="passSaving"
            :disabled="
              !passSupplierOptions.length ||
              jobContext.saving.value ||
              generateLoading ||
              passSaving
            "
            @click="openPassDialog"
          />
        </div>
      </header>

      <div v-if="!rows.length" class="job-normal-invoice-tab__placeholder">
        <strong>No buy costs yet</strong>
        <p class="job-normal-invoice-tab__empty">
          Add Buy Costs in Costs & Charges to prepare supplier invoice matching.
        </p>
      </div>

      <template v-else>
        <div class="job-normal-invoice-tab__table-wrap">
          <table class="job-normal-invoice-tab__table job-normal-invoice-tab__table--supplier">
            <colgroup>
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
                <th>Supplier</th>
                <th>Cost Description</th>
                <th class="job-normal-invoice-tab__quantity">Qty</th>
                <th class="job-normal-invoice-tab__money">Unit Cost</th>
                <th class="job-normal-invoice-tab__currency">Currency</th>
                <th class="job-normal-invoice-tab__money">Net Cost</th>
                <th>Invoice Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td>
                  <span v-if="supplierName(row.supplier_id)">
                    {{ supplierName(row.supplier_id) }}
                  </span>
                  <span v-else-if="row.supplier_id">Supplier #{{ row.supplier_id }}</span>
                  <span v-else class="job-normal-invoice-tab__muted">Not selected</span>
                </td>
                <td>{{ row.description || "Supplier cost" }}</td>
                <td class="job-normal-invoice-tab__quantity">{{ numberValue(row.quantity) }}</td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount),
                    )
                  }}
                </td>
                <td class="job-normal-invoice-tab__currency">{{ currencyCode(row.currency) }}</td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(
                      row.currency,
                      numberValue(row.quantity) *
                        numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount),
                    )
                  }}
                </td>
                <td>
                  <span
                    v-if="isPrinted(row)"
                    class="job-normal-invoice-tab__status job-normal-invoice-tab__status--printed"
                  >
                    {{ invoiceStatusLabel(row.invoice_status) }}
                    <a
                      v-if="invoicePdfUrl(row)"
                      :href="invoicePdfUrl(row)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ invoiceDisplayNumber(row) }}
                    </a>
                    <span v-else>{{ invoiceDisplayNumber(row) }}</span>
                  </span>
                  <span v-else class="job-normal-invoice-tab__status">Not invoiced</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="job-normal-invoice-tab__summary">
          <div class="job-normal-invoice-tab__metric">
            <span>Cost Lines</span>
            <strong>{{ rows.length }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>Matched Invoices</span>
            <strong>{{ invoices.length }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>Not Invoiced</span>
            <strong>{{ availableSupplierBillRows.length }}</strong>
          </div>
          <div class="job-normal-invoice-tab__metric">
            <span>Total Cost</span>
            <strong>{{ money(invoiceCurrency, totalCost) }}</strong>
          </div>
        </div>
      </template>
    </div>

    <div class="job-normal-invoice-tab__section">
      <header class="job-normal-invoice-tab__subheader">
        <div>
          <h3>Invoice List</h3>
          <p>Supplier invoices generated from this job's Buy Costs.</p>
        </div>
      </header>

      <div v-if="!invoices.length" class="job-normal-invoice-tab__placeholder">
        <strong>No invoices printed yet</strong>
        <p class="job-normal-invoice-tab__empty">Generated supplier invoices will appear here.</p>
      </div>

      <div v-else class="job-normal-invoice-tab__table-wrap">
        <table
          class="job-normal-invoice-tab__table job-normal-invoice-tab__table--invoice-list job-normal-invoice-tab__table--supplier-invoice-list"
        >
          <colgroup>
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Status</th>
              <th class="job-normal-invoice-tab__money">Total</th>
              <th class="job-normal-invoice-tab__actions-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id">
              <td>
                <a
                  class="job-normal-invoice-tab__link"
                  :href="invoiceListHref(invoice)"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click="openInvoiceFromList($event, invoice)"
                >
                  {{ invoice.invoiceNumber }}
                </a>
              </td>
              <td>
                {{ supplierName(invoice.supplierId) || invoice.metadata?.supplierName || "-" }}
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
              <td class="job-normal-invoice-tab__actions-cell">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  aria-label="Edit supplier bill"
                  @click="openSupplierBillForInvoice(invoice)"
                />
                <Button
                  icon="pi pi-send"
                  text
                  rounded
                  aria-label="Send supplier invoice"
                  @click="openSupplierInvoiceEmailStep(invoice)"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  aria-label="Delete supplier invoice"
                  @click="openDeleteInvoice(invoice)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog
      v-model:visible="uploadDialogVisible"
      modal
      header="Upload Supplier Invoice"
      class="job-normal-invoice-tab__dialog"
      :style="{ width: 'min(980px, 96vw)' }"
    >
      <div class="job-normal-invoice-tab__dialog-body">
        <label class="job-normal-invoice-tab__field">
          <span>Supplier</span>
          <Dropdown
            v-model="invoiceDraft.supplierId"
            :options="supplierOptions"
            option-label="label"
            option-value="value"
            placeholder="Select supplier"
            filter
            auto-filter-focus
            :loading="suppliersLoading"
          />
        </label>

        <div class="job-normal-invoice-tab__dialog-head">
          <div>
            <strong>Cost Description Rows</strong>
            <p class="job-normal-invoice-tab__note">
              These rows will be added to Buy Costs using the selected supplier.
            </p>
          </div>
          <Button label="Add Row" icon="pi pi-plus" text @click="addInvoiceLine" />
        </div>

        <div class="job-normal-invoice-tab__table-wrap">
          <table class="job-normal-invoice-tab__table job-normal-invoice-tab__table--dialog">
            <thead>
              <tr>
                <th>Cost Description</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Currency</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in invoiceDraft.lines" :key="line.id">
                <td>
                  <Dropdown
                    v-model="line.description"
                    :options="chargeDescriptionOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="Select cost description"
                    filter
                    editable
                    show-clear
                  />
                </td>
                <td><InputNumber v-model="line.quantity" :min="0" /></td>
                <td>
                  <InputNumber
                    v-model="line.unitCost"
                    :min="0"
                    :min-fraction-digits="2"
                    :max-fraction-digits="2"
                  />
                </td>
                <td>
                  <Dropdown
                    v-model="line.currency"
                    :options="currencyOptions"
                    option-label="label"
                    option-value="value"
                  />
                </td>
                <td class="job-normal-invoice-tab__money">
                  {{
                    money(line.currency, numberValue(line.quantity) * numberValue(line.unitCost))
                  }}
                </td>
                <td>
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    aria-label="Remove invoice row"
                    @click="removeInvoiceLine(line.id)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text :disabled="uploadSaving" @click="uploadDialogVisible = false" />
        <Button
          :label="uploadSaving ? 'Saving...' : 'Save Supplier Invoice'"
          icon="pi pi-check"
          :loading="uploadSaving"
          @click="saveSupplierInvoice"
        />
      </template>
    </Dialog>

    <Dialog
      :visible="generateDialogVisible"
      modal
      header="Supplier Bill"
      class="job-normal-invoice-tab__dialog"
      :style="{ width: 'min(1180px, 96vw)' }"
      :closable="!generateActionInProgress"
      :close-on-escape="!generateActionInProgress"
      @update:visible="setGenerateDialogVisible"
    >
      <div class="job-normal-invoice-tab__dialog-body">
        <div class="job-normal-invoice-tab__steps">
          <button
            type="button"
            class="job-normal-invoice-tab__step"
            :class="{ 'job-normal-invoice-tab__step--active': generateStep === 'bill' }"
            @click="generateStep = 'bill'"
          >
            <span>1</span>
            <strong>Billing Details</strong>
          </button>
          <span class="job-normal-invoice-tab__step-arrow" aria-hidden="true">
            <i class="pi pi-arrow-right" />
          </span>
          <button
            type="button"
            class="job-normal-invoice-tab__step"
            :class="{ 'job-normal-invoice-tab__step--active': generateStep === 'email' }"
            :disabled="!emailInvoice?.id"
            @click="generateStep = 'email'"
          >
            <span>2</span>
            <strong>Send Invoice</strong>
          </button>
          <span class="job-normal-invoice-tab__step-arrow" aria-hidden="true">
            <i class="pi pi-arrow-right" />
          </span>
          <button
            type="button"
            class="job-normal-invoice-tab__step"
            :class="{ 'job-normal-invoice-tab__step--active': generateStep === 'accounting' }"
            :disabled="!emailInvoice?.id"
            @click="generateStep = 'accounting'"
          >
            <span>3</span>
            <strong>Connecting to Third Party</strong>
          </button>
          <span class="job-normal-invoice-tab__step-arrow" aria-hidden="true">
            <i class="pi pi-arrow-right" />
          </span>
          <button
            type="button"
            class="job-normal-invoice-tab__step"
            :class="{ 'job-normal-invoice-tab__step--active': generateStep === 'finish' }"
            :disabled="!emailInvoice?.id"
            @click="generateStep = 'finish'"
          >
            <span>4</span>
            <strong>Finish</strong>
          </button>
        </div>

        <template v-if="generateStep === 'bill'">
          <div class="job-normal-invoice-tab__bill-head">
            <label class="job-normal-invoice-tab__field job-normal-invoice-tab__field--from">
              <span>From</span>
              <Dropdown
                v-model="passDraft.supplierId"
                :options="passSupplierOptions"
                option-label="label"
                option-value="value"
                placeholder="Select supplier"
                filter
                auto-filter-focus
              />
            </label>

            <label class="job-normal-invoice-tab__field">
              <span>Date</span>
              <Calendar v-model="passDraft.invoiceDate" date-format="yy-mm-dd" show-icon />
            </label>

            <label class="job-normal-invoice-tab__field">
              <span>Due Date</span>
              <Calendar v-model="passDraft.dueDate" date-format="yy-mm-dd" show-icon />
            </label>

            <label class="job-normal-invoice-tab__field">
              <span>Reference</span>
              <InputText v-model="passDraft.reference" autocomplete="off" />
            </label>

            <label class="job-normal-invoice-tab__field">
              <span>Invoice Number</span>
              <InputText
                :model-value="passDraft.invoiceNumber"
                autocomplete="off"
                @update:model-value="setSupplierInvoiceNumber(String($event ?? ''))"
              />
            </label>

            <label class="job-normal-invoice-tab__field job-normal-invoice-tab__field--total">
              <span>Total</span>
              <InputText :model-value="money(passDraft.currency, billTotal)" readonly />
            </label>
          </div>

          <div class="job-normal-invoice-tab__table-wrap">
            <table class="job-normal-invoice-tab__table job-normal-invoice-tab__table--bill">
              <colgroup>
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
                  <th>Item</th>
                  <th>Description</th>
                  <th class="job-normal-invoice-tab__quantity">Qty</th>
                  <th class="job-normal-invoice-tab__money">Unit Price</th>
                  <th>Account</th>
                  <th>Tax Rate</th>
                  <th class="job-normal-invoice-tab__money">Amount {{ passDraft.currency }}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in selectedSupplierBillRows" :key="row.id">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <Dropdown
                      v-model="row.description"
                      :options="chargeDescriptionOptions"
                      option-label="label"
                      option-value="value"
                      placeholder="Select item"
                      filter
                      editable
                      show-clear
                      @change="updateBillLineDescription(row, row.description)"
                    />
                  </td>
                  <td><InputNumber v-model="row.quantity" :min="0" /></td>
                  <td>
                    <InputNumber
                      v-model="row.unitCost"
                      :min="0"
                      :min-fraction-digits="2"
                      :max-fraction-digits="2"
                    />
                  </td>
                  <td>{{ chargeCodeAccount(row) || "-" }}</td>
                  <td>
                    <InputNumber
                      v-model="row.vatRate"
                      suffix="%"
                      :min="0"
                      :min-fraction-digits="0"
                      :max-fraction-digits="3"
                    />
                  </td>
                  <td class="job-normal-invoice-tab__money">
                    {{ money(passDraft.currency, billLineTotal(row)) }}
                  </td>
                  <td class="job-normal-invoice-tab__actions-cell">
                    <Button
                      icon="pi pi-times"
                      text
                      rounded
                      severity="secondary"
                      aria-label="Remove bill line"
                      @click="removeBillLine(row)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="job-normal-invoice-tab__bill-actions">
            <Button
              class="job-normal-invoice-tab__add-line-btn"
              label="Add a new line"
              icon="pi pi-plus"
              severity="secondary"
              outlined
              @click="addBillLine"
            />
            <div class="job-normal-invoice-tab__bill-totals">
              <div class="job-normal-invoice-tab__bill-total-row">
                <span>Subtotal</span>
                <strong>{{ money(passDraft.currency, billSubtotal) }}</strong>
              </div>
              <div class="job-normal-invoice-tab__bill-total-row">
                <span>Tax</span>
                <strong>{{ money(passDraft.currency, billTaxTotal) }}</strong>
              </div>
              <div
                class="job-normal-invoice-tab__bill-total-row job-normal-invoice-tab__bill-total-row--grand"
              >
                <span>TOTAL</span>
                <strong>{{ money(passDraft.currency, billTotal) }}</strong>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="generateStep === 'email'">
          <div class="job-normal-invoice-tab__email-grid">
            <label class="job-normal-invoice-tab__field">
              <span>Recipients</span>
              <MultiSelect
                v-model="supplierEmailDraft.recipients"
                :options="emailRecipientOptions"
                option-label="label"
                option-value="value"
                display="chip"
                placeholder="Select recipients"
              />
            </label>

            <div class="job-normal-invoice-tab__manual-email">
              <label class="job-normal-invoice-tab__field">
                <span>Add Email</span>
                <InputText v-model="supplierEmailDraft.manualEmail" autocomplete="off" />
              </label>
              <Button
                label="Add"
                icon="pi pi-plus"
                severity="secondary"
                @click="addManualEmailRecipient"
              />
            </div>

            <label class="job-normal-invoice-tab__field">
              <span>Subject</span>
              <InputText v-model="supplierEmailDraft.subject" autocomplete="off" />
            </label>

            <label class="job-normal-invoice-tab__field">
              <span>Message</span>
              <Textarea v-model="supplierEmailDraft.body" rows="8" auto-resize />
            </label>
          </div>

          <div class="job-normal-invoice-tab__outstanding">
            <div>
              <span>Job Reference</span>
              <strong>{{ supplierBillReference }}</strong>
            </div>
            <div>
              <span>Invoice Number</span>
              <strong>{{ emailInvoice?.invoiceNumber || passDraft.invoiceNumber }}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{{ money(passDraft.currency, billTotal) }}</strong>
            </div>
          </div>
        </template>

        <template v-else-if="generateStep === 'accounting'">
          <div class="job-normal-invoice-tab__handoff">
            <div class="job-normal-invoice-tab__handoff-icon">
              <i class="pi pi-link" />
            </div>
            <div>
              <span>Third Party Accounting</span>
              <h3>{{ accountingProviderLabel }}</h3>
              <p v-if="activeAccountingSetting">
                The supplier invoice is ready for the configured {{ accountingProviderLabel }}
                handoff using this job's billing details, totals, tax values, and invoice PDF.
              </p>
              <p v-else>
                No default accounting system is active yet. The invoice can still be finished now,
                then connected later once Xero, Sage, or QuickBooks is configured.
              </p>
            </div>
          </div>

          <div class="job-normal-invoice-tab__outstanding">
            <div>
              <span>Invoice Number</span>
              <strong>{{ emailInvoice?.invoiceNumber || passDraft.invoiceNumber }}</strong>
            </div>
            <div>
              <span>Provider</span>
              <strong>{{ accountingProviderLabel }}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{{ activeAccountingSetting ? "Ready" : "Not configured" }}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{{ money(passDraft.currency, billTotal) }}</strong>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="job-normal-invoice-tab__finish">
            <div class="job-normal-invoice-tab__finish-mark">
              <i class="pi pi-check" />
            </div>
            <div>
              <span>Supplier invoice workflow complete</span>
              <h3>{{ emailInvoice?.invoiceNumber || passDraft.invoiceNumber }}</h3>
              <p>
                The supplier invoice has been generated, the invoice PDF is available, and the
                workflow is ready for the next accounts action.
              </p>
            </div>
          </div>

          <div class="job-normal-invoice-tab__summary-list">
            <div v-for="item in supplierInvoiceStepSummary" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </template>
      </div>

      <template #footer>
        <Button
          :label="generateStep === 'finish' ? 'Close' : 'Cancel'"
          text
          :disabled="generateActionInProgress"
          @click="closeGenerateDialog"
        />
        <Button
          v-if="generateStep === 'email'"
          label="Back"
          severity="secondary"
          outlined
          :disabled="emailSending"
          @click="generateStep = 'bill'"
        />
        <Button
          v-if="generateStep === 'accounting'"
          label="Back"
          severity="secondary"
          outlined
          @click="generateStep = 'email'"
        />
        <Button
          v-if="generateStep === 'finish'"
          label="Back"
          severity="secondary"
          outlined
          @click="generateStep = 'accounting'"
        />
        <Button
          v-if="generateStep === 'email' || generateStep === 'finish'"
          label="Open PDF"
          icon="pi pi-external-link"
          severity="secondary"
          outlined
          :disabled="emailSending"
          @click="openPendingInvoice"
        />
        <Button
          v-if="generateStep === 'email'"
          label="Skip Email"
          severity="secondary"
          outlined
          :disabled="emailSending"
          @click="generateStep = 'accounting'"
        />
        <Button
          v-if="generateStep === 'bill'"
          :label="generateLoading ? 'Generating...' : 'Generate Supplier Invoice'"
          icon="pi pi-file-pdf"
          :loading="generateLoading"
          @click="generateSupplierInvoice"
        />
        <Button
          v-else-if="generateStep === 'email'"
          :label="emailSending ? 'Sending...' : 'Send Email'"
          icon="pi pi-send"
          :loading="emailSending"
          @click="sendSupplierInvoiceEmail"
        />
        <Button
          v-else-if="generateStep === 'accounting'"
          label="Continue to Finish"
          icon="pi pi-arrow-right"
          @click="continueSupplierInvoiceAccounting"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="passDialogVisible"
      modal
      header="Pass Supplier Invoice"
      class="job-normal-invoice-tab__dialog"
      :style="{ width: 'min(760px, 96vw)' }"
    >
      <div class="job-normal-invoice-tab__dialog-body">
        <div class="job-normal-invoice-tab__form-grid">
          <label class="job-normal-invoice-tab__field">
            <span>Supplier</span>
            <Dropdown
              v-model="passDraft.supplierId"
              :options="passSupplierOptions"
              option-label="label"
              option-value="value"
              placeholder="Select supplier"
              filter
              auto-filter-focus
            />
          </label>

          <label class="job-normal-invoice-tab__field">
            <span>Date Passed</span>
            <Calendar v-model="passDraft.datePassed" date-format="yy-mm-dd" show-icon />
          </label>

          <label class="job-normal-invoice-tab__field">
            <span>Currency</span>
            <Dropdown
              v-model="passDraft.currency"
              :options="currencyOptions"
              option-label="label"
              option-value="value"
            />
          </label>

          <label class="job-normal-invoice-tab__field">
            <span>Invoice Number</span>
            <InputText v-model="passDraft.invoiceNumber" autocomplete="off" />
          </label>

          <label class="job-normal-invoice-tab__field">
            <span>Invoice Date</span>
            <Calendar v-model="passDraft.invoiceDate" date-format="yy-mm-dd" show-icon />
          </label>

          <label class="job-normal-invoice-tab__field">
            <span>Due Date</span>
            <Calendar v-model="passDraft.dueDate" date-format="yy-mm-dd" show-icon />
          </label>

          <label class="job-normal-invoice-tab__field">
            <span>Invoice Amount</span>
            <InputNumber
              v-model="passDraft.invoiceAmount"
              :min="0"
              :min-fraction-digits="2"
              :max-fraction-digits="2"
            />
          </label>

          <label class="job-normal-invoice-tab__field">
            <span>Tax Amount</span>
            <InputNumber
              v-model="passDraft.taxAmount"
              :min="0"
              :min-fraction-digits="2"
              :max-fraction-digits="2"
            />
          </label>

          <label class="job-normal-invoice-tab__field">
            <span>Total Invoice Amount</span>
            <InputNumber
              :model-value="passTotalInvoiceAmount"
              :min-fraction-digits="2"
              :max-fraction-digits="2"
              disabled
            />
          </label>
        </div>

        <div class="job-normal-invoice-tab__outstanding">
          <div>
            <span>Supplier Total Due</span>
            <strong>{{ money(passDraft.currency, passSupplierOutstanding.total) }}</strong>
          </div>
          <div>
            <span>Already Passed</span>
            <strong>{{ money(passDraft.currency, passSupplierOutstanding.passed) }}</strong>
          </div>
          <div>
            <span>Outstanding Before</span>
            <strong>{{
              money(passDraft.currency, passSupplierOutstanding.outstandingBefore)
            }}</strong>
          </div>
          <div>
            <span>Outstanding After</span>
            <strong>{{
              money(passDraft.currency, passSupplierOutstanding.outstandingAfter)
            }}</strong>
          </div>
        </div>

        <label class="job-normal-invoice-tab__checkbox-row">
          <Checkbox v-model="passDraft.residualAmount" binary />
          <span>Residual amount - leave the remaining outstanding amount as unpassed</span>
        </label>

        <label class="job-normal-invoice-tab__field">
          <span>Attach Invoice</span>
          <input
            type="file"
            class="job-normal-invoice-tab__file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            @change="onPassInvoiceFileSelected"
          />
        </label>
        <div v-if="passDraft.attachedInvoice" class="job-normal-invoice-tab__attachment">
          <span>{{ passDraft.attachedInvoice.name }}</span>
          <Button label="Remove" text severity="danger" @click="clearPassInvoiceAttachment" />
        </div>

        <p class="job-normal-invoice-tab__note">
          This links the supplier's actual invoice number to job
          {{ jobContext.form.job_number || jobContext.job.value?.job_number }}.
        </p>
      </div>

      <template #footer>
        <Button label="Cancel" text :disabled="passSaving" @click="passDialogVisible = false" />
        <Button
          :label="passSaving ? 'Passing...' : 'Pass Supplier Invoice'"
          icon="pi pi-check"
          :loading="passSaving"
          @click="passSupplierInvoice"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      header="Delete Supplier Invoice"
      class="job-normal-invoice-tab__dialog"
      :style="{ width: 'min(520px, 94vw)' }"
    >
      <div class="job-normal-invoice-tab__dialog-body">
        <p class="job-normal-invoice-tab__note">
          This will delete the latest supplier invoice only. To confirm, type the invoice number
          exactly: <strong>{{ deleteInvoiceTarget?.invoiceNumber }}</strong>
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
  </section>
</template>
