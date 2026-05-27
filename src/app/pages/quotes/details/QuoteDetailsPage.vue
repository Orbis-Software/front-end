<template>
  <section class="quote-details-page">
    <Toast />

    <div v-if="loading" class="quote-details-page__envelope">
      <section class="quote-details-page__card">Loading quotation...</section>
    </div>

    <div v-else-if="!quote" class="quote-details-page__envelope">
      <section class="quote-details-page__card">Quotation not found.</section>
    </div>

    <div v-else class="quote-details-page__envelope">
      <header class="quote-details-page__header">
        <div>
          <Button
            label="Back to Quotes"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            class="quote-details-page__back-btn"
            @click="onBack"
          />

          <h1 class="quote-details-page__title">
            {{ quote.quote_number }}
            <small>
              {{ quote.customer_name }} · {{ prettify(quote.mode_of_transport) }} Freight
            </small>
          </h1>
        </div>

        <div class="quote-details-page__actions">
          <span class="quote-details-page__status-chip" :class="statusClass(quote.status)">
            {{ prettify(quote.status) }}
          </span>

          <Button
            v-if="quote.status === 'draft'"
            label="Edit"
            icon="pi pi-pencil"
            severity="secondary"
            outlined
            @click="onEdit"
          />

          <Button
            v-if="quote.status === 'draft'"
            label="Send to User"
            icon="pi pi-send"
            class="quote-details-page__approve-btn"
            @click="openActionModal('sent')"
          />

          <Button
            v-if="quote.status === 'sent'"
            label="Accept"
            icon="pi pi-check"
            class="quote-details-page__approve-btn"
            @click="openActionModal('approve')"
          />

          <Button
            v-if="quote.status === 'sent'"
            label="Reject"
            icon="pi pi-times"
            severity="danger"
            outlined
            @click="openActionModal('decline')"
          />

          <Button
            v-if="quote.status === 'accepted'"
            label="Convert to Job"
            icon="pi pi-briefcase"
            class="quote-details-page__approve-btn"
            @click="openActionModal('convert')"
          />
        </div>
      </header>

      <section class="quote-details-page__hero">
        <div>
          <h2>{{ quote.customer_name }}</h2>

          <div class="quote-details-page__meta-grid">
            <div>
              <span>Contact</span>
              <strong>{{ quote.contact_name || "—" }}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{{ quote.contact_email || "—" }}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>{{ quote.contact_phone || "—" }}</strong>
            </div>

            <div>
              <span>Quote Date</span>
              <strong>{{ quote.quote_date || "—" }}</strong>
            </div>

            <div>
              <span>Follow Up</span>
              <strong>{{ quote.follow_up_date || "—" }}</strong>
            </div>

            <div>
              <span>Customer Ref</span>
              <strong>{{ quote.customer_reference || "—" }}</strong>
            </div>

            <div>
              <span>Incoterms</span>
              <strong>{{ quote.incoterms || "—" }}</strong>
            </div>

            <div>
              <span>Validity</span>
              <strong>{{ quote.validity || "—" }}</strong>
            </div>
          </div>
        </div>

        <div class="quote-details-page__hero-total">
          <span>Total Incl. Tax</span>
          <strong>{{ money(quote.totals.incl_tax) }}</strong>
        </div>
      </section>

      <div class="quote-details-page__grid">
        <section class="quote-details-page__card">
          <div class="quote-details-page__card-header">
            <h2>Shipment Details</h2>
          </div>

          <div class="quote-details-page__info-grid">
            <div>
              <span>Origin</span>
              <strong>{{ quote.origin || "—" }}</strong>
            </div>

            <div>
              <span>Destination</span>
              <strong>{{ quote.destination || "—" }}</strong>
            </div>

            <div>
              <span>Est. Departure</span>
              <strong>{{ quote.etd || "—" }}</strong>
            </div>

            <div>
              <span>Est. Arrival</span>
              <strong>{{ quote.eta || "—" }}</strong>
            </div>

            <div>
              <span>Mode</span>
              <strong>{{ prettify(quote.mode_of_transport) }}</strong>
            </div>

            <div>
              <span>Quote Type</span>
              <strong>{{ prettify(quote.quote_type) }}</strong>
            </div>
          </div>

          <div class="quote-details-page__goods">
            <span>Goods Description</span>
            <strong>{{ quote.goods_description || "—" }}</strong>
          </div>

          <div v-if="quote.is_hazardous" class="quote-details-page__hazard">
            Hazardous · {{ quote.hazard_class }} · {{ quote.un_number }} ·
            {{ quote.packing_group }}
          </div>
        </section>

        <section class="quote-details-page__card">
          <div class="quote-details-page__card-header">
            <h2>Quote Totals</h2>
          </div>

          <div class="quote-details-page__totals">
            <div>
              <span>Subtotal Sell</span>
              <strong>{{ money(quote.totals.sell) }}</strong>
            </div>

            <div>
              <span>Subtotal Cost</span>
              <strong>{{ money(quote.totals.cost) }}</strong>
            </div>

            <div>
              <span>Discount</span>
              <strong>{{ money(quote.totals.discount) }}</strong>
            </div>

            <div>
              <span>Tax</span>
              <strong>{{ money(quote.totals.tax) }}</strong>
            </div>

            <div>
              <span>Total Excl. Tax</span>
              <strong>{{ money(quote.totals.excl_tax) }}</strong>
            </div>

            <div class="quote-details-page__totals-grand">
              <span>Total Incl. Tax</span>
              <strong>{{ money(quote.totals.incl_tax) }}</strong>
            </div>

            <div class="quote-details-page__totals-profit">
              <span>Profit</span>
              <strong>{{ money(quote.totals.profit) }}</strong>
            </div>

            <div class="quote-details-page__totals-profit">
              <span>Profit %</span>
              <strong>{{ quote.totals.profit_percentage.toFixed(2) }}%</strong>
            </div>
          </div>
        </section>
      </div>

      <section class="quote-details-page__card">
        <div class="quote-details-page__card-header">
          <h2>Charge Lines</h2>
        </div>

        <DataTable
          :value="quote.charge_lines"
          responsiveLayout="scroll"
          class="quote-details-page__table"
        >
          <Column field="description" header="Description" />
          <Column field="quantity" header="Qty" />
          <Column field="uom" header="UOM" />

          <Column header="Cost">
            <template #body="{ data }">
              {{ money(data.cost) }}
            </template>
          </Column>

          <Column header="Markup %">
            <template #body="{ data }"> {{ data.markup_percent }}% </template>
          </Column>

          <Column header="Total Sell">
            <template #body="{ data }">
              <strong>{{ money(data.total_sell) }}</strong>
            </template>
          </Column>
        </DataTable>
      </section>

      <section class="quote-details-page__card">
        <div class="quote-details-page__card-header">
          <h2>Terms & Conditions</h2>
        </div>

        <pre class="quote-details-page__terms">{{ quote.terms_conditions || "—" }}</pre>
      </section>

      <section v-if="quote.internal_notes" class="quote-details-page__card">
        <div class="quote-details-page__card-header">
          <h2>Internal Notes</h2>
        </div>

        <p class="quote-details-page__notes">{{ quote.internal_notes }}</p>
      </section>

      <Dialog
        v-model:visible="actionDialogVisible"
        modal
        class="quote-details-page__dialog"
        :header="actionDialogTitle"
        :style="{ width: '440px' }"
      >
        <div class="quote-details-page__dialog-body">
          <p>{{ actionDialogMessage }}</p>

          <div class="quote-details-page__dialog-summary">
            <div>
              <span>Quotation</span>
              <strong>{{ quote.quote_number }}</strong>
            </div>

            <div>
              <span>Customer</span>
              <strong>{{ quote.customer_name }}</strong>
            </div>

            <div>
              <span>Total</span>
              <strong>{{ money(quote.totals.incl_tax) }}</strong>
            </div>
          </div>

          <div v-if="selectedAction !== 'convert'" class="quote-details-page__dialog-field">
            <label>Notes</label>
            <Textarea
              v-model="actionNotes"
              rows="4"
              autoResize
              placeholder="Add optional notes..."
            />
          </div>
        </div>

        <template #footer>
          <Button
            label="Cancel"
            severity="secondary"
            outlined
            :disabled="actionProcessing"
            @click="closeActionModal"
          />

          <Button
            :label="actionConfirmLabel"
            :icon="actionConfirmIcon"
            :class="actionConfirmClass"
            :loading="actionProcessing"
            :disabled="actionProcessing"
            @click="confirmAction"
          />
        </template>
      </Dialog>
    </div>
  </section>
</template>

<script setup lang="ts">
import "./QuoteDetailsPage.css"

import Button from "primevue/button"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import Dialog from "primevue/dialog"
import Textarea from "primevue/textarea"
import Toast from "primevue/toast"

import { useQuoteDetailsPage } from "./QuoteDetailsPage"

const {
  quote,
  loading,
  actionProcessing,
  actionDialogVisible,
  selectedAction,
  actionNotes,
  actionDialogTitle,
  actionDialogMessage,
  actionConfirmLabel,
  actionConfirmIcon,
  actionConfirmClass,
  onBack,
  onEdit,
  openActionModal,
  closeActionModal,
  confirmAction,
  prettify,
  statusClass,
  money,
} = useQuoteDetailsPage()
</script>
