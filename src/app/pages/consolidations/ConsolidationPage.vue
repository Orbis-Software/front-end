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
        <section v-if="activeTab === 'overview'" class="consolidation-section">
          <div class="consolidation-section__head">
            <div>
              <h2>Overview</h2>
              <p>Job header, shipment terms, parties, customs and transport details.</p>
            </div>
          </div>

          <div class="consolidation-form-grid consolidation-form-grid--three">
            <label class="consolidation-field">
              <span>Job Number</span>
              <InputText
                v-model="overview.jobNo"
                :readonly="jobNumberUsesSystem"
                :placeholder="jobNumberPlaceholder"
                @input="jobNumberAuto = false"
              />
            </label>
            <label class="consolidation-field">
              <span>Job Date</span>
              <Calendar
                :model-value="calendarDate(overview.jobDate)"
                date-format="dd/mm/yy"
                placeholder="dd/mm/yyyy"
                show-icon
                show-button-bar
                :manual-input="false"
                @update:model-value="setOverviewDate('jobDate', $event)"
              />
            </label>
            <label class="consolidation-field">
              <span>Mode of Transport</span>
              <Dropdown
                v-model="overview.mode"
                :options="modeOptions"
                option-label="label"
                option-value="value"
              />
            </label>
            <label class="consolidation-field">
              <span>Invoice Currency</span>
              <Dropdown
                v-model="overview.invoiceCurrency"
                :options="currencyOptions"
                option-label="label"
                option-value="value"
              />
            </label>
            <label class="consolidation-field">
              <span>Ship Date</span>
              <Calendar
                :model-value="calendarDate(overview.shipDate)"
                date-format="dd/mm/yy"
                placeholder="dd/mm/yyyy"
                show-icon
                show-button-bar
                :manual-input="false"
                @update:model-value="setOverviewDate('shipDate', $event)"
              />
            </label>
            <label class="consolidation-field">
              <span>Ship From</span>
              <Dropdown
                v-model="overview.shipFrom"
                :options="shipFromOptions"
                option-label="label"
                option-value="value"
                placeholder="Select city"
                filter
                filter-by="label,value,subLabel,searchText"
              >
                <template #option="{ option }">
                  <div class="consolidation-reference-option">
                    <strong>{{ option.label }}</strong>
                    <small v-if="option.subLabel">{{ option.subLabel }}</small>
                  </div>
                </template>
              </Dropdown>
            </label>
            <label class="consolidation-field">
              <span>Exit Incoterm</span>
              <Dropdown
                v-model="overview.exitIncoterm"
                :options="incotermOptions"
                option-label="label"
                option-value="value"
                placeholder="Select incoterm"
                show-clear
              />
            </label>
            <label class="consolidation-field">
              <span>Entry Incoterm</span>
              <Dropdown
                v-model="overview.entryIncoterm"
                :options="incotermOptions"
                option-label="label"
                option-value="value"
                placeholder="Select incoterm"
                show-clear
              />
            </label>
            <label class="consolidation-field">
              <span>ADR</span>
              <InputText
                :model-value="hasAdr ? 'Yes' : 'No'"
                readonly
                :class="{ 'adr-yes': hasAdr }"
              />
            </label>
          </div>

          <div class="consolidation-subsection">
            <div class="consolidation-subsection__title">Parties and Delivery</div>
            <div class="consolidation-form-grid consolidation-form-grid--two">
              <label class="consolidation-field">
                <span>Customer if different from Job Customer</span>
                <InputText v-model="overview.customer" placeholder="Optional customer override" />
              </label>
              <label class="consolidation-field">
                <span>Notify Party</span>
                <InputText v-model="overview.notifyParty" />
              </label>
              <label class="consolidation-field">
                <span>Shipper</span>
                <InputText v-model="overview.shipper" />
              </label>
              <label class="consolidation-field">
                <span>Delivery Address</span>
                <Dropdown
                  v-model="overview.deliveryAddress"
                  :options="deliveryAddressOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select delivery address"
                  editable
                  filter
                  show-clear
                  filter-by="label,value,subLabel,searchText"
                >
                  <template #option="{ option }">
                    <div class="consolidation-reference-option">
                      <strong>{{ option.label }}</strong>
                      <small v-if="option.subLabel">{{ option.subLabel }}</small>
                    </div>
                  </template>
                </Dropdown>
              </label>
            </div>
          </div>

          <div class="consolidation-subsection">
            <div class="consolidation-subsection__title">Customs and Goods</div>
            <div class="consolidation-form-grid consolidation-form-grid--two">
              <label class="consolidation-field">
                <span>Goods Description</span>
                <Textarea v-model="overview.goodsDescription" rows="3" />
              </label>
              <label class="consolidation-field">
                <span>Special Instructions</span>
                <Textarea v-model="overview.instructions" rows="3" />
              </label>
              <label class="consolidation-field">
                <span>Export Customs Ref</span>
                <InputText v-model="overview.exportCustomsRef" />
              </label>
              <label class="consolidation-field">
                <span>Import Customs Ref</span>
                <InputText v-model="overview.importCustomsRef" />
              </label>
            </div>
          </div>

          <div class="consolidation-subsection">
            <div class="consolidation-subsection__title">{{ overview.mode }} Transport Details</div>
            <div class="consolidation-form-grid consolidation-form-grid--three">
              <label v-for="field in transportFields" :key="field.key" class="consolidation-field">
                <span>{{ field.label }}</span>
                <Calendar
                  v-if="transportFieldInputType(field.key) === 'calendar'"
                  :model-value="calendarDate(transport[field.key])"
                  date-format="dd/mm/yy"
                  placeholder="dd/mm/yyyy"
                  show-icon
                  show-button-bar
                  :manual-input="false"
                  @update:model-value="setTransportDate(field.key, $event)"
                />
                <Dropdown
                  v-else-if="
                    transportFieldInputType(field.key) === 'location' ||
                    transportFieldInputType(field.key) === 'dropdown'
                  "
                  v-model="transport[field.key]"
                  :options="transportFieldOptions(field.key)"
                  option-label="label"
                  option-value="value"
                  :placeholder="transportFieldPlaceholder(field.key)"
                  filter
                  show-clear
                  filter-by="label,value,subLabel,searchText"
                >
                  <template #option="{ option }">
                    <div class="consolidation-reference-option">
                      <strong>{{ option.label }}</strong>
                      <small v-if="option.subLabel">{{ option.subLabel }}</small>
                    </div>
                  </template>
                </Dropdown>
                <InputText v-else v-model="transport[field.key]" />
              </label>
            </div>
          </div>

          <div class="consolidation-subsection">
            <div class="consolidation-subsection__title">Consolidation Summary</div>
            <div class="consolidation-page__summary-row consolidation-page__summary-row--five">
              <article>
                <span>Supplier Cost</span
                ><strong>{{ formatCurrencyTotals(supplierTotalsMap) }}</strong>
              </article>
              <article>
                <span>Commercial Invoice</span
                ><strong>{{ formatCurrencyTotals(consolidatedTotalsMap) }}</strong>
              </article>
              <article>
                <span>Customer Invoice</span
                ><strong>{{ money("GBP", customerInvoiceTotal) }}</strong>
              </article>
              <article>
                <span>Margin</span
                ><strong>{{
                  money("GBP", customerInvoiceTotal - domesticTotal - exportTotal)
                }}</strong>
              </article>
              <article><span>Status</span><strong>Draft</strong></article>
            </div>
          </div>

          <div class="consolidation-subsection">
            <div class="consolidation-subsection__title">Total Number of Packages</div>
            <div class="consolidation-page__summary-row">
              <article>
                <span>Crates</span><strong>{{ packageBreakdown.crates }}</strong>
              </article>
              <article>
                <span>Pallets</span><strong>{{ packageBreakdown.pallets }}</strong>
              </article>
              <article>
                <span>Cartons / Boxes</span><strong>{{ packageBreakdown.cartons }}</strong>
              </article>
              <article>
                <span>Jiffy Bags</span><strong>{{ packageBreakdown.jiffies }}</strong>
              </article>
            </div>
          </div>

          <div class="consolidation-subsection">
            <div class="consolidation-subsection__title">Total Weight and Loading Meters</div>
            <div class="consolidation-page__summary-row">
              <article>
                <span>Total Net Weight</span
                ><strong>{{ packageBreakdown.net.toFixed(1) }} kg</strong>
              </article>
              <article>
                <span>Total Gross Weight</span
                ><strong>{{ packageBreakdown.gross.toFixed(1) }} kg</strong>
              </article>
              <article>
                <span>Total CBM</span><strong>{{ packageBreakdown.cbm.toFixed(3) }}</strong>
              </article>
              <article>
                <span>Total LDM</span><strong>{{ packageBreakdown.ldm.toFixed(3) }}</strong>
              </article>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'orders'" class="consolidation-section">
          <div class="consolidation-section__head">
            <div>
              <h2>Supplier Invoices</h2>
              <p>Capture supplier invoice header data and item dimensions before consolidation.</p>
            </div>
            <div class="consolidation-section__actions">
              <Button
                label="Add Supplier Invoice"
                icon="pi pi-plus"
                class="btn btn--primary"
                @click="openSupplierInvoiceModal"
              />
              <Button
                label="Add Supplier Invoice to Collection"
                icon="pi pi-link"
                class="btn btn--ghost"
                @click="openSupplierCollectionLinkModal"
              />
            </div>
          </div>

          <div class="consolidation-subsection">
            <div class="consolidation-subsection__head-row">
              <div>
                <div class="consolidation-subsection__title">Supplier Overview</div>
                <p class="consolidation-note">
                  Each supplier gets a tab with invoice totals and the EXA customs document number.
                </p>
              </div>
            </div>

            <nav class="consolidation-supplier-tabs" aria-label="Supplier invoice tabs">
              <button
                v-for="supplier in supplierSummaries"
                :key="supplier.name"
                type="button"
                class="consolidation-supplier-tab"
                :class="{
                  'consolidation-supplier-tab--active': activeSupplierName === supplier.name,
                }"
                @click="activeSupplierName = supplier.name"
              >
                <span>{{ supplier.name }}</span>
                <small>{{ supplier.invoiceCount }} invoices</small>
              </button>
            </nav>

            <div v-if="selectedSupplierSummary" class="consolidation-supplier-panel">
              <div class="consolidation-form-grid consolidation-form-grid--three">
                <label class="consolidation-field">
                  <span>Supplier</span>
                  <InputText :model-value="selectedSupplierSummary.name" readonly />
                </label>
                <label class="consolidation-field">
                  <span>EXA Number / Customs Document</span>
                  <InputText
                    v-model="supplierExaNumbers[selectedSupplierSummary.name]"
                    placeholder="Enter EXA number"
                  />
                </label>
                <label class="consolidation-field">
                  <span>Total Value</span>
                  <InputText
                    :model-value="formatCurrencyTotals(selectedSupplierSummary.valueByCurrency)"
                    readonly
                  />
                </label>
              </div>

              <div class="consolidation-page__summary-row">
                <article>
                  <span>Collies / Packages</span
                  ><strong>{{ selectedSupplierSummary.totalCollies }}</strong>
                </article>
                <article>
                  <span>Total Net Weight</span
                  ><strong>{{ selectedSupplierSummary.totalNet.toFixed(1) }} kg</strong>
                </article>
                <article>
                  <span>Total Gross Weight</span
                  ><strong>{{ selectedSupplierSummary.totalGross.toFixed(1) }} kg</strong>
                </article>
                <article>
                  <span>Invoices</span><strong>{{ selectedSupplierSummary.invoiceCount }}</strong>
                </article>
              </div>

              <DataTable
                :value="selectedSupplierSummary.invoices"
                responsive-layout="scroll"
                class="consolidation-datatable consolidation-datatable--mt"
              >
                <Column field="supplierInvoiceNumber" header="Invoice No" />
                <Column field="customerPoRef" header="Customer PO" />
                <Column field="invoiceDate" header="Invoice Date" />
                <Column field="collectionRef" header="Collection" />
                <Column header="Collies">
                  <template #body="{ data }">{{ invoiceTotals(data).collies }}</template>
                </Column>
                <Column header="Net kg">
                  <template #body="{ data }">{{ invoiceTotals(data).net.toFixed(1) }}</template>
                </Column>
                <Column header="Gross kg">
                  <template #body="{ data }">{{ invoiceTotals(data).gross.toFixed(1) }}</template>
                </Column>
                <Column header="Value">
                  <template #body="{ data }">{{
                    money(data.currency, data.invoiceValue)
                  }}</template>
                </Column>
              </DataTable>
            </div>
          </div>

          <DataTable
            :value="supplierInvoices"
            responsive-layout="scroll"
            class="consolidation-datatable consolidation-datatable--mt"
          >
            <Column field="supplierName" header="Supplier" />
            <Column field="customerPoRef" header="Customer PO" />
            <Column field="supplierInvoiceNumber" header="Invoice No" />
            <Column field="collectionRef" header="Collection" />
            <Column field="label" header="Label" />
            <Column header="Value">
              <template #body="{ data }">{{ money(data.currency, data.invoiceValue) }}</template>
            </Column>
            <Column header="Items">
              <template #body="{ data }">{{ data.items.length }}</template>
            </Column>
          </DataTable>

          <div class="consolidation-currency-sections">
            <article
              v-for="currency in invoiceCurrencies"
              :key="currency"
              class="consolidation-currency-card"
            >
              <div class="consolidation-subsection__head-row">
                <div class="consolidation-subsection__title">{{ currency }} Supplier Invoices</div>
                <span class="consolidation-status">
                  {{ money(currency, supplierTotalsMap.get(currency) || 0) }}
                </span>
              </div>
              <DataTable
                :value="supplierInvoicesByCurrency(currency)"
                responsive-layout="scroll"
                class="consolidation-datatable"
              >
                <Column field="supplierName" header="Supplier" />
                <Column field="customerPoRef" header="PO Ref" />
                <Column field="supplierInvoiceNumber" header="Inv No" />
                <Column field="invoiceDate" header="Date" />
                <Column header="Value">
                  <template #body="{ data }">{{
                    money(data.currency, data.invoiceValue)
                  }}</template>
                </Column>
                <Column header="Collie">
                  <template #body="{ data }">{{ invoiceTotals(data).collies }}</template>
                </Column>
                <Column header="Gross">
                  <template #body="{ data }">{{ invoiceTotals(data).gross.toFixed(1) }}</template>
                </Column>
                <Column field="collectionRef" header="Collection Ref" />
                <Column field="label" header="Label" />
              </DataTable>
            </article>
          </div>
        </section>

        <section v-else-if="activeTab === 'collections'" class="consolidation-section">
          <div class="consolidation-section__head">
            <div>
              <h2>Collection Orders</h2>
              <p>Create collection orders, package details, haulier charges and WMS handoff.</p>
            </div>
            <Button
              label="Add Collection Order"
              icon="pi pi-plus"
              class="btn btn--primary"
              @click="openCollectionOrderModal"
            />
          </div>

          <DataTable
            :value="collectionOrders"
            responsive-layout="scroll"
            class="consolidation-datatable consolidation-datatable--mt"
          >
            <Column field="coRef" header="CO Ref" />
            <Column field="supplier" header="Carrier" />
            <Column field="pickupDate" header="Pickup" />
            <Column field="vehicle" header="Vehicle" />
            <Column field="pcs" header="Pieces" />
            <Column field="weightKg" header="Weight kg" />
            <Column field="status" header="Status" />
            <Column header="WMS">
              <template #body="{ data }">
                <span
                  class="consolidation-status"
                  :class="{ 'consolidation-status--success': data.wmsRef }"
                >
                  {{ data.wmsRef || "Pending" }}
                </span>
              </template>
            </Column>
          </DataTable>
        </section>

        <section v-else-if="activeTab === 'invoices'" class="consolidation-section">
          <div class="consolidation-section__head">
            <div>
              <h2>Consolidated Invoices</h2>
              <p>Build the consolidated commercial invoice by currency for customs clearance.</p>
            </div>
            <div class="consolidation-page__actions">
              <Button label="Print Invoice" icon="pi pi-print" class="btn btn--ghost" />
              <Button
                label="Add Item"
                icon="pi pi-plus"
                class="btn btn--primary"
                @click="addConsolidatedItem"
              />
            </div>
          </div>

          <div class="consolidation-invoice-total-bar">
            <div>
              <div class="consolidation-subsection__title">Supplier Invoice Totals</div>
              <div
                class="consolidation-page__summary-row consolidation-page__summary-row--currency"
              >
                <article v-for="currency in invoiceCurrencies" :key="`supplier-${currency}`">
                  <span>{{ currency }}</span>
                  <strong>{{ money(currency, supplierTotalsMap.get(currency) || 0) }}</strong>
                </article>
              </div>
            </div>
            <div>
              <div class="consolidation-subsection__title">Consolidated Invoice Totals</div>
              <div
                class="consolidation-page__summary-row consolidation-page__summary-row--currency"
              >
                <article v-for="currency in invoiceCurrencies" :key="`goods-${currency}`">
                  <span>{{ currency }}</span>
                  <strong>{{ money(currency, consolidatedTotalsMap.get(currency) || 0) }}</strong>
                </article>
              </div>
            </div>
          </div>

          <div class="consolidation-currency-switch">
            <Button
              v-for="currency in invoiceCurrencies"
              :key="currency"
              :label="currency"
              class="btn"
              :class="selectedInvoiceCurrency === currency ? 'btn--primary' : 'btn--ghost'"
              @click="selectedInvoiceCurrency = currency"
            />
          </div>

          <div class="consolidation-table-wrap consolidation-table-wrap--mt">
            <table
              class="consolidation-table consolidation-table--inputs consolidation-table--wide"
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>PO Ref</th>
                  <th>Supplier</th>
                  <th>Shipping Label</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>UOM</th>
                  <th>COO</th>
                  <th>HS Code</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(line, index) in filteredConsolidatedLines" :key="line.id">
                  <td>{{ index + 1 }}</td>
                  <td><InputText v-model="line.poRef" /></td>
                  <td>{{ line.supplier || "-" }}</td>
                  <td><InputText v-model="line.shippingLabelNo" /></td>
                  <td><InputText v-model="line.description" /></td>
                  <td><InputNumber v-model="line.qty" :min="0" /></td>
                  <td><Dropdown v-model="line.uom" :options="unitOptions" /></td>
                  <td><InputText v-model="line.countryOfOrigin" /></td>
                  <td><InputText v-model="line.hsCode" /></td>
                  <td><InputNumber v-model="line.unitPrice" :min-fraction-digits="2" /></td>
                  <td>{{ money(line.invoiceCurrency, line.qty * line.unitPrice) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="consolidation-invoice-bottom">
            <section class="consolidation-invoice-sheet">
              <div class="consolidation-subsection__title">Package Counts and Weight</div>
              <div class="consolidation-page__summary-row">
                <article>
                  <span>Crates</span><strong>{{ packageBreakdown.crates }}</strong>
                </article>
                <article>
                  <span>Pallets</span><strong>{{ packageBreakdown.pallets }}</strong>
                </article>
                <article>
                  <span>Cartons</span><strong>{{ packageBreakdown.cartons }}</strong>
                </article>
                <article>
                  <span>Jiffy Bags</span><strong>{{ packageBreakdown.jiffies }}</strong>
                </article>
                <article>
                  <span>Total Net Weight</span
                  ><strong>{{ packageBreakdown.net.toFixed(1) }} kg</strong>
                </article>
                <article>
                  <span>Total Gross Weight</span
                  ><strong>{{ packageBreakdown.gross.toFixed(1) }} kg</strong>
                </article>
              </div>
            </section>

            <section class="consolidation-invoice-sheet">
              <div class="consolidation-subsection__title">
                Value Breakdown - {{ selectedInvoiceCurrency }}
              </div>
              <div class="consolidation-form-grid consolidation-form-grid--three">
                <label class="consolidation-field">
                  <span>Total Value of Goods EXW</span>
                  <InputText
                    :model-value="money(selectedInvoiceCurrency, selectedCurrencyGoodsTotal)"
                    readonly
                  />
                </label>
                <label class="consolidation-field">
                  <span>Freight Charges</span>
                  <InputNumber v-model="consolidatedFreightCharge" :min-fraction-digits="2" />
                </label>
                <label class="consolidation-field">
                  <span>Total Value of Goods DAP</span>
                  <InputText
                    :model-value="money(selectedInvoiceCurrency, selectedCurrencyDapTotal)"
                    readonly
                  />
                </label>
              </div>
            </section>
          </div>
        </section>

        <section v-else-if="activeTab === 'custinv'" class="consolidation-section">
          <div class="consolidation-section__head">
            <div>
              <h2>Customer Invoice</h2>
              <p>
                Post Domestic and Export invoices separately, then build the customer delivery
                quotation.
              </p>
            </div>
            <div class="consolidation-page__actions">
              <Button
                label="Add Domestic Charge"
                icon="pi pi-plus"
                class="btn btn--ghost"
                @click="addDomesticCharge"
              />
              <Button
                label="Add Export Charge"
                icon="pi pi-plus"
                class="btn btn--ghost"
                @click="addExportCharge"
              />
              <Button
                :label="showQuotePanel ? 'Hide Quote' : 'View Quote'"
                icon="pi pi-file-edit"
                class="btn btn--primary"
                @click="showQuotePanel = !showQuotePanel"
              />
            </div>
          </div>

          <div class="consolidation-invoice-grid">
            <div>
              <div class="consolidation-subsection">
                <div class="consolidation-subsection__head-row">
                  <div>
                    <div class="consolidation-subsection__title">
                      Domestic Charges - from Collection Orders
                    </div>
                    <p class="consolidation-note">
                      Domestic charges are calculated from collection order weight breaks plus any
                      manual charges.
                    </p>
                  </div>
                  <span
                    class="consolidation-status"
                    :class="{ 'consolidation-status--success': domesticInvoice.posted }"
                  >
                    {{ domesticInvoice.posted ? `Posted - ${domesticInvoice.ref}` : "Unposted" }}
                  </span>
                </div>
                <DataTable
                  :value="domesticInvoiceRows"
                  responsive-layout="scroll"
                  class="consolidation-datatable"
                >
                  <Column field="coRef" header="Collection Ref" />
                  <Column field="supplier" header="Supplier / Carrier" />
                  <Column field="pickupDate" header="Collection Date" />
                  <Column field="deliveryDate" header="Delivery Date" />
                  <Column field="pcs" header="Pieces" />
                  <Column field="weightKg" header="Weight kg" />
                  <Column field="status" header="Status" />
                  <Column header="Cost">
                    <template #body="{ data }">{{ money("GBP", data.cost) }}</template>
                    <template #footer>{{ money("GBP", domesticTotal) }}</template>
                  </Column>
                </DataTable>

                <div
                  v-if="domesticChargeRows.length"
                  class="consolidation-table-wrap consolidation-table-wrap--mt"
                >
                  <table class="consolidation-table consolidation-table--inputs">
                    <thead>
                      <tr>
                        <th>Additional Domestic Charge</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Rate</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="line in domesticChargeRows" :key="line.id">
                        <td><Dropdown v-model="line.description" :options="chargeOptions" /></td>
                        <td><InputNumber v-model="line.qty" :min="0" /></td>
                        <td><Dropdown v-model="line.unit" :options="unitOptions" /></td>
                        <td><InputNumber v-model="line.rate" :min-fraction-digits="2" /></td>
                        <td>{{ money("GBP", line.qty * line.rate) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="consolidation-ci-footer">
                  <div class="consolidation-page__actions">
                    <Button
                      label="Create / View Quote"
                      icon="pi pi-file-edit"
                      class="btn btn--ghost"
                      @click="addDomesticToQuote"
                    />
                    <Button
                      label="Post Domestic Invoice"
                      icon="pi pi-check"
                      class="btn btn--primary"
                      @click="postDomesticInvoice"
                    />
                  </div>
                </div>
              </div>

              <div class="consolidation-subsection">
                <div class="consolidation-subsection__head-row">
                  <div>
                    <div class="consolidation-subsection__title">Export Invoice Charges</div>
                    <p class="consolidation-note">
                      Export charges can be quoted line-by-line or posted as the export invoice.
                    </p>
                  </div>
                  <span
                    class="consolidation-status"
                    :class="{ 'consolidation-status--success': exportInvoice.posted }"
                  >
                    {{ exportInvoice.posted ? `Posted - ${exportInvoice.ref}` : "Unposted" }}
                  </span>
                </div>
                <div class="consolidation-table-wrap">
                  <table class="consolidation-table consolidation-table--inputs">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Rate</th>
                        <th>Total</th>
                        <th>Quote</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="line in exportChargeRows" :key="line.id">
                        <td><Dropdown v-model="line.description" :options="chargeOptions" /></td>
                        <td><InputNumber v-model="line.qty" :min="0" /></td>
                        <td><Dropdown v-model="line.unit" :options="unitOptions" /></td>
                        <td><InputNumber v-model="line.rate" :min-fraction-digits="2" /></td>
                        <td>{{ money("GBP", line.qty * line.rate) }}</td>
                        <td>
                          <Button
                            :label="isExportLineInQuote(line.id) ? 'In Quote' : '+ Quote'"
                            class="btn btn--ghost btn--small"
                            @click="toggleExportLineQuote(line.id)"
                          />
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="4">Export Total</td>
                        <td colspan="2">{{ money("GBP", exportTotal) }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div class="consolidation-ci-footer">
                  <div class="consolidation-page__actions">
                    <Button
                      label="Create / View Quote"
                      icon="pi pi-file-edit"
                      class="btn btn--ghost"
                      @click="addExportToQuote"
                    />
                    <Button
                      label="Post Export Invoice"
                      icon="pi pi-check"
                      class="btn btn--primary"
                      @click="postExportInvoice"
                    />
                  </div>
                </div>
              </div>

              <div v-if="showQuotePanel" class="consolidation-quote-panel">
                <div class="consolidation-quote-panel__head">
                  <div>
                    <h3>Delivery Quotation</h3>
                    <span class="consolidation-status">{{ quote.status }}</span>
                  </div>
                  <div class="consolidation-page__actions">
                    <Button
                      label="Add Line"
                      icon="pi pi-plus"
                      class="btn btn--ghost btn--small"
                      @click="addQuoteLine"
                    />
                    <Button label="Preview" icon="pi pi-eye" class="btn btn--ghost btn--small" />
                    <Button
                      label="Convert to Export Invoice"
                      icon="pi pi-arrow-right"
                      class="btn btn--primary btn--small"
                      @click="convertQuoteToExportInvoice"
                    />
                    <Button
                      label="Cancel Quote"
                      icon="pi pi-times"
                      class="btn btn--ghost btn--small"
                      @click="cancelQuote"
                    />
                  </div>
                </div>

                <div class="consolidation-form-grid consolidation-form-grid--three">
                  <label class="consolidation-field">
                    <span>Quote Reference</span>
                    <InputText v-model="quote.reference" />
                  </label>
                  <label class="consolidation-field">
                    <span>Valid Until</span>
                    <InputText v-model="quote.validUntil" type="date" />
                  </label>
                  <label class="consolidation-field">
                    <span>Status</span>
                    <Dropdown v-model="quote.status" :options="quoteStatusOptions" />
                  </label>
                </div>

                <div class="consolidation-table-wrap consolidation-table-wrap--mt">
                  <table class="consolidation-table consolidation-table--inputs">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Rate</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="line in quoteLines" :key="line.id">
                        <td><Dropdown v-model="line.description" :options="chargeOptions" /></td>
                        <td><InputNumber v-model="line.qty" :min="0" /></td>
                        <td><Dropdown v-model="line.unit" :options="unitOptions" /></td>
                        <td><InputNumber v-model="line.rate" :min-fraction-digits="2" /></td>
                        <td>{{ money("GBP", line.qty * line.rate) }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="4">Quote Subtotal</td>
                        <td>{{ money("GBP", quoteSubtotal) }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div
                  class="consolidation-form-grid consolidation-form-grid--two consolidation-table-wrap--mt"
                >
                  <label class="consolidation-field">
                    <span>Notes to Customer</span>
                    <Textarea v-model="quote.notes" rows="3" />
                  </label>
                  <label class="consolidation-field">
                    <span>Terms and Conditions</span>
                    <Textarea v-model="quote.terms" rows="3" />
                  </label>
                </div>
              </div>
            </div>

            <aside class="consolidation-totals-card">
              <div class="consolidation-weight-breaks">
                <span>Weight Break Rate Reference</span>
                <table>
                  <tbody>
                    <tr v-for="rate in weightBreakRates" :key="rate.label">
                      <td>{{ rate.label }}</td>
                      <td>{{ money("GBP", rate.rate) }}{{ rate.perKg ? " / kg" : "" }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <span>Domestic Total</span><strong>{{ money("GBP", domesticTotal) }}</strong>
              </div>
              <div>
                <span>Export Total</span><strong>{{ money("GBP", exportTotal) }}</strong>
              </div>
              <div>
                <span>Subtotal</span><strong>{{ money("GBP", customerInvoiceSubtotal) }}</strong>
              </div>
              <div class="consolidation-tax-row">
                <span>Tax Rate</span>
                <InputNumber
                  v-model="taxRate"
                  suffix="%"
                  :min="0"
                  :max="100"
                  :min-fraction-digits="1"
                />
              </div>
              <div>
                <span>Tax</span><strong>{{ money("GBP", customerInvoiceTax) }}</strong>
              </div>
              <div class="consolidation-totals-card__grand">
                <span>Invoice Total</span><strong>{{ money("GBP", customerInvoiceTotal) }}</strong>
              </div>
            </aside>
          </div>
        </section>

        <section v-else class="consolidation-section">
          <div class="consolidation-section__head">
            <div>
              <h2>Goods In/Out (WMS)</h2>
              <p>Warehouse receipt records generated from collections and supplier invoices.</p>
            </div>
            <Button label="Link GRN" icon="pi pi-link" class="btn btn--ghost" />
          </div>

          <DataTable
            :value="goodsInRows"
            responsive-layout="scroll"
            class="consolidation-datatable"
          >
            <Column field="grn" header="GRN" />
            <Column field="supplier" header="Supplier" />
            <Column field="supplierInvoice" header="Supplier Invoice" />
            <Column field="supplierPO" header="Supplier PO" />
            <Column field="partNo" header="Part No" />
            <Column field="desc" header="Description" />
            <Column field="pcs" header="Pieces" />
            <Column field="weightKg" header="Weight kg" />
            <Column field="cbm" header="CBM" />
            <Column field="location" header="Location" />
            <Column field="status" header="Status" />
          </DataTable>
        </section>
      </div>
    </section>

    <Dialog
      v-model:visible="showSupplierInvoiceModal"
      header="Add Supplier Invoice"
      modal
      :style="{ width: '1180px', maxWidth: '96vw' }"
    >
      <div class="consolidation-modal-toolbar">
        <Button
          label="Add Item"
          icon="pi pi-plus"
          class="btn btn--ghost"
          @click="addSupplierItem"
        />
      </div>

      <div class="consolidation-form-grid consolidation-form-grid--four">
        <label class="consolidation-field">
          <span>Supplier Name</span>
          <InputText v-model="supplierDraft.supplierName" />
        </label>
        <label class="consolidation-field">
          <span>Customer PO Ref</span>
          <InputText v-model="supplierDraft.customerPoRef" />
        </label>
        <label class="consolidation-field">
          <span>Supplier Invoice Number</span>
          <InputText v-model="supplierDraft.supplierInvoiceNumber" />
        </label>
        <label class="consolidation-field">
          <span>Invoice Date</span>
          <InputText v-model="supplierDraft.invoiceDate" type="date" />
        </label>
        <label class="consolidation-field">
          <span>Currency</span>
          <Dropdown
            v-model="supplierDraft.currency"
            :options="currencyOptions"
            option-label="label"
            option-value="value"
          />
        </label>
        <label class="consolidation-field">
          <span>Invoice Value</span>
          <InputNumber
            v-model="supplierDraft.invoiceValue"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
          />
        </label>
        <label class="consolidation-field">
          <span>Collection Ref</span>
          <Dropdown v-model="supplierDraft.collectionRef" :options="collectionRefOptions" />
        </label>
        <label class="consolidation-field">
          <span>Shipping Label No</span>
          <InputText v-model="supplierDraft.label" />
        </label>
      </div>

      <div class="consolidation-table-wrap consolidation-table-wrap--mt">
        <table class="consolidation-table consolidation-table--inputs consolidation-table--wide">
          <thead>
            <tr>
              <th class="consolidation-table__item-heading">#</th>
              <th>Package</th>
              <th class="consolidation-table__compact-heading">Collie</th>
              <th class="consolidation-table__compact-heading">Length</th>
              <th class="consolidation-table__compact-heading">Width</th>
              <th class="consolidation-table__compact-heading">Height</th>
              <th>Net kg</th>
              <th>Gross kg</th>
              <th>ADR</th>
              <th class="consolidation-table__check-heading">Stackable</th>
              <th class="consolidation-table__check-heading">Non-Stack</th>
              <th class="consolidation-table__check-heading">Top-Loadable</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in supplierDraft.items" :key="item.id">
              <td class="consolidation-table__item-number">{{ index + 1 }}</td>
              <td><Dropdown v-model="item.packageType" :options="packageOptions" /></td>
              <td class="consolidation-table__compact-cell">
                <InputNumber
                  v-model="item.collie"
                  class="consolidation-number--compact"
                  :min="1"
                  :max="9999"
                />
              </td>
              <td class="consolidation-table__compact-cell">
                <InputNumber
                  v-model="item.length"
                  class="consolidation-number--compact"
                  :min="0"
                  :max="9999"
                />
              </td>
              <td class="consolidation-table__compact-cell">
                <InputNumber
                  v-model="item.width"
                  class="consolidation-number--compact"
                  :min="0"
                  :max="9999"
                />
              </td>
              <td class="consolidation-table__compact-cell">
                <InputNumber
                  v-model="item.height"
                  class="consolidation-number--compact"
                  :min="0"
                  :max="9999"
                />
              </td>
              <td><InputNumber v-model="item.net" :min="0" :min-fraction-digits="1" /></td>
              <td><InputNumber v-model="item.gross" :min="0" :min-fraction-digits="1" /></td>
              <td><Dropdown v-model="item.adr" :options="yesNoOptions" /></td>
              <td class="consolidation-table__check-cell">
                <Checkbox
                  :model-value="getPackageStackOption(item) === 'stackable'"
                  binary
                  @update:model-value="setPackageStackOption(item, 'stackable')"
                />
              </td>
              <td class="consolidation-table__check-cell">
                <Checkbox
                  :model-value="getPackageStackOption(item) === 'non_stack'"
                  binary
                  @update:model-value="setPackageStackOption(item, 'non_stack')"
                />
              </td>
              <td class="consolidation-table__check-cell">
                <Checkbox
                  :model-value="getPackageStackOption(item) === 'top_loadable'"
                  binary
                  @update:model-value="setPackageStackOption(item, 'top_loadable')"
                />
              </td>
              <td>
                <Button
                  label="Delete"
                  class="btn btn--ghost btn--small"
                  :disabled="supplierDraft.items.length === 1"
                  @click="removeSupplierItem(index)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="consolidation-page__summary-row">
        <article>
          <span>Draft pieces</span><strong>{{ supplierDraftTotals.pieces }}</strong>
        </article>
        <article>
          <span>Draft gross</span><strong>{{ supplierDraftTotals.weight.toFixed(1) }} kg</strong>
        </article>
        <article>
          <span>Draft volume</span><strong>{{ supplierDraftTotals.volume.toFixed(3) }} cbm</strong>
        </article>
        <article>
          <span>Draft value</span>
          <strong>{{ money(supplierDraft.currency, supplierDraft.invoiceValue) }}</strong>
        </article>
      </div>

      <template #footer>
        <div class="consolidation-dialog-footer">
          <Button label="Cancel" class="btn btn--ghost" @click="showSupplierInvoiceModal = false" />
          <Button
            label="Save Supplier Invoice"
            icon="pi pi-save"
            class="btn btn--primary"
            @click="saveSupplierInvoice"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showCollectionOrderModal"
      header="Add Collection Order"
      modal
      :style="{ width: '1180px', maxWidth: '96vw' }"
    >
      <div class="consolidation-modal-toolbar">
        <Button
          label="Add Package"
          icon="pi pi-plus"
          class="btn btn--ghost"
          @click="addCollectionLine"
        />
      </div>

      <div class="consolidation-form-grid consolidation-form-grid--three">
        <label class="consolidation-field">
          <span>Collection Order Ref</span>
          <InputText v-model="collectionDraft.coRef" />
        </label>
        <label class="consolidation-field">
          <span>Customer Ref</span>
          <InputText v-model="collectionDraft.customerRef" placeholder="Enter customer reference" />
        </label>
        <label class="consolidation-field">
          <span>Collection Ref</span>
          <InputText
            v-model="collectionDraft.collectionRef"
            placeholder="Enter collection reference"
          />
        </label>
        <label class="consolidation-field">
          <span>Pickup Date</span>
          <InputText v-model="collectionDraft.pickupDate" type="date" />
        </label>
        <label class="consolidation-field">
          <span>Pickup Time</span>
          <InputText v-model="collectionDraft.pickupTime" type="time" />
        </label>
        <label class="consolidation-field">
          <span>Mode Type</span>
          <Dropdown v-model="collectionDraft.vehicle" :options="vehicleOptions" />
        </label>
        <label class="consolidation-field">
          <span>Collection Address</span>
          <Dropdown v-model="collectionDraft.collectionAddress" :options="addressOptions" />
        </label>
        <label class="consolidation-field">
          <span>Delivery Address</span>
          <Dropdown v-model="collectionDraft.deliveryAddress" :options="addressOptions" />
        </label>
        <label class="consolidation-field">
          <span>Required Delivery Date</span>
          <InputText v-model="collectionDraft.deliveryDate" type="date" />
        </label>
        <label class="consolidation-field">
          <span>Delivery Time</span>
          <InputText v-model="collectionDraft.deliveryTime" type="time" />
        </label>
        <label class="consolidation-field">
          <span>Carrier</span>
          <Dropdown v-model="collectionDraft.supplier" :options="carrierOptions" />
        </label>
        <label class="consolidation-field">
          <span>Goods Description</span>
          <InputText v-model="collectionDraft.goodsDescription" />
        </label>
      </div>

      <div class="consolidation-subsection">
        <div class="consolidation-subsection__title">Hazardous</div>
        <div class="consolidation-hazard-row">
          <label class="consolidation-check-row">
            <Checkbox v-model="collectionDraft.hazardous" binary />
            <span>ADR / Hazardous goods</span>
          </label>
          <label
            v-if="collectionDraft.hazardous"
            class="consolidation-field consolidation-field--adr"
          >
            <span>ADR Class</span>
            <Dropdown
              v-model="collectionDraft.adrClass"
              :options="adrClassOptions"
              option-label="label"
              option-value="value"
            />
          </label>
        </div>
      </div>

      <div class="consolidation-table-wrap consolidation-table-wrap--mt">
        <table class="consolidation-table consolidation-table--inputs consolidation-table--wide">
          <thead>
            <tr>
              <th class="consolidation-table__item-heading">#</th>
              <th>Packaging</th>
              <th class="consolidation-table__compact-heading">Qty</th>
              <th class="consolidation-table__compact-heading">Length</th>
              <th class="consolidation-table__compact-heading">Width</th>
              <th class="consolidation-table__compact-heading">Height</th>
              <th>Net kg</th>
              <th>Gross kg</th>
              <th>CBM</th>
              <th>LDM</th>
              <th>ADR</th>
              <th class="consolidation-table__check-heading">Stackable</th>
              <th class="consolidation-table__check-heading">Non-Stack</th>
              <th class="consolidation-table__check-heading">Top-Loadable</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(line, index) in collectionDraft.lines" :key="line.id">
              <td class="consolidation-table__item-number">{{ index + 1 }}</td>
              <td><Dropdown v-model="line.packageType" :options="packageOptions" /></td>
              <td class="consolidation-table__compact-cell">
                <InputNumber
                  v-model="line.qty"
                  class="consolidation-number--compact"
                  :min="1"
                  :max="9999"
                />
              </td>
              <td class="consolidation-table__compact-cell">
                <InputNumber
                  v-model="line.length"
                  class="consolidation-number--compact"
                  :min="0"
                  :max="9999"
                />
              </td>
              <td class="consolidation-table__compact-cell">
                <InputNumber
                  v-model="line.width"
                  class="consolidation-number--compact"
                  :min="0"
                  :max="9999"
                />
              </td>
              <td class="consolidation-table__compact-cell">
                <InputNumber
                  v-model="line.height"
                  class="consolidation-number--compact"
                  :min="0"
                  :max="9999"
                />
              </td>
              <td><InputNumber v-model="line.netWeight" :min="0" :min-fraction-digits="1" /></td>
              <td>
                <InputNumber v-model="line.grossWeight" :min="0" :min-fraction-digits="1" />
              </td>
              <td>{{ cbm(line).toFixed(3) }}</td>
              <td>{{ ldm(line).toFixed(3) }}</td>
              <td><Checkbox v-model="line.adr" binary /></td>
              <td class="consolidation-table__check-cell">
                <Checkbox
                  :model-value="getPackageStackOption(line) === 'stackable'"
                  binary
                  @update:model-value="setPackageStackOption(line, 'stackable')"
                />
              </td>
              <td class="consolidation-table__check-cell">
                <Checkbox
                  :model-value="getPackageStackOption(line) === 'non_stack'"
                  binary
                  @update:model-value="setPackageStackOption(line, 'non_stack')"
                />
              </td>
              <td class="consolidation-table__check-cell">
                <Checkbox
                  :model-value="getPackageStackOption(line) === 'top_loadable'"
                  binary
                  @update:model-value="setPackageStackOption(line, 'top_loadable')"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="consolidation-page__summary-row">
        <article>
          <span>Total pieces</span><strong>{{ collectionDraftTotals.pieces }}</strong>
        </article>
        <article>
          <span>Gross weight</span><strong>{{ collectionDraftTotals.weight.toFixed(1) }} kg</strong>
        </article>
        <article>
          <span>Volume</span><strong>{{ collectionDraftTotals.volume.toFixed(3) }} cbm</strong>
        </article>
        <article>
          <span>LDM</span><strong>{{ collectionDraftTotals.ldm.toFixed(3) }}</strong>
        </article>
      </div>

      <div class="consolidation-subsection">
        <div class="consolidation-subsection__title">Haulier Charges</div>
        <div class="consolidation-form-grid consolidation-form-grid--four">
          <label class="consolidation-field">
            <span>Freight</span>
            <InputNumber v-model="collectionDraft.freight" :min-fraction-digits="2" />
          </label>
          <label class="consolidation-field">
            <span>FSC %</span>
            <InputNumber v-model="collectionDraft.fscPct" :min-fraction-digits="1" suffix="%" />
          </label>
          <label class="consolidation-field">
            <span>FSC Amount</span>
            <InputText :model-value="money('GBP', collectionFscAmount)" readonly />
          </label>
          <label class="consolidation-field">
            <span>Additional</span>
            <InputNumber v-model="collectionDraft.additional" :min-fraction-digits="2" />
          </label>
        </div>
        <div class="consolidation-page__summary-row consolidation-page__summary-row--compact">
          <article>
            <span>Total haulier charge</span>
            <strong>{{ money("GBP", collectionChargeTotal) }}</strong>
          </article>
          <article>
            <span>Generated preview</span
            ><strong>{{ nextCollectionRef }} / {{ nextGrnRef }}</strong>
          </article>
        </div>
        <Textarea v-model="haulierQuoteText" rows="6" class="consolidation-quote-text" />
      </div>

      <template #footer>
        <div class="consolidation-dialog-footer">
          <Button label="Cancel" class="btn btn--ghost" @click="showCollectionOrderModal = false" />
          <Button
            label="Refresh Quote Request"
            icon="pi pi-refresh"
            class="btn btn--ghost"
            @click="refreshHaulierQuote"
          />
          <Button
            label="Save Collection Order"
            icon="pi pi-save"
            class="btn btn--primary"
            @click="saveCollectionOrder"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showSupplierItemModal"
      header="Add Supplier Package Item"
      modal
      :style="{ width: '720px', maxWidth: '94vw' }"
    >
      <div class="consolidation-form-grid consolidation-form-grid--three">
        <label class="consolidation-field">
          <span>Package</span>
          <Dropdown v-model="supplierItemDraft.packageType" :options="packageOptions" />
        </label>
        <label class="consolidation-field">
          <span>Collie</span>
          <InputNumber v-model="supplierItemDraft.collie" :min="1" />
        </label>
        <label class="consolidation-field">
          <span>ADR</span>
          <Dropdown v-model="supplierItemDraft.adr" :options="yesNoOptions" />
        </label>
        <label class="consolidation-field">
          <span>Length</span>
          <InputNumber v-model="supplierItemDraft.length" :min="0" />
        </label>
        <label class="consolidation-field">
          <span>Width</span>
          <InputNumber v-model="supplierItemDraft.width" :min="0" />
        </label>
        <label class="consolidation-field">
          <span>Height</span>
          <InputNumber v-model="supplierItemDraft.height" :min="0" />
        </label>
        <label class="consolidation-field">
          <span>Net kg</span>
          <InputNumber v-model="supplierItemDraft.net" :min="0" :min-fraction-digits="1" />
        </label>
        <label class="consolidation-field">
          <span>Gross kg</span>
          <InputNumber v-model="supplierItemDraft.gross" :min="0" :min-fraction-digits="1" />
        </label>
      </div>
      <div class="consolidation-modal-checks">
        <label class="consolidation-check-row">
          <Checkbox
            :model-value="getPackageStackOption(supplierItemDraft) === 'stackable'"
            binary
            @update:model-value="setPackageStackOption(supplierItemDraft, 'stackable')"
          />
          <span>Stackable</span>
        </label>
        <label class="consolidation-check-row">
          <Checkbox
            :model-value="getPackageStackOption(supplierItemDraft) === 'non_stack'"
            binary
            @update:model-value="setPackageStackOption(supplierItemDraft, 'non_stack')"
          />
          <span>Non-Stack</span>
        </label>
        <label class="consolidation-check-row">
          <Checkbox
            :model-value="getPackageStackOption(supplierItemDraft) === 'top_loadable'"
            binary
            @update:model-value="setPackageStackOption(supplierItemDraft, 'top_loadable')"
          />
          <span>Top-Loadable</span>
        </label>
      </div>
      <template #footer>
        <div class="consolidation-dialog-footer">
          <Button label="Cancel" class="btn btn--ghost" @click="showSupplierItemModal = false" />
          <Button
            label="Add Item"
            icon="pi pi-plus"
            class="btn btn--primary"
            @click="confirmSupplierItem"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showSupplierCollectionLinkModal"
      header="Add Supplier Invoice to Collection"
      modal
      :style="{ width: '560px', maxWidth: '94vw' }"
    >
      <div class="consolidation-form-grid consolidation-form-grid--two">
        <label class="consolidation-field consolidation-field--wide">
          <span>Supplier Invoice</span>
          <Dropdown
            v-model="supplierCollectionLinkDraft.supplierInvoiceId"
            :options="supplierInvoiceLinkOptions"
            option-label="label"
            option-value="value"
            placeholder="Select supplier invoice"
          />
        </label>
        <label class="consolidation-field consolidation-field--wide">
          <span>Collection Ref</span>
          <Dropdown
            v-if="collectionRefOptions.length"
            v-model="supplierCollectionLinkDraft.collectionRef"
            :options="collectionRefOptions"
            placeholder="Select collection"
          />
          <InputText
            v-else
            v-model="supplierCollectionLinkDraft.collectionRef"
            placeholder="Enter collection ref"
          />
        </label>
      </div>
      <template #footer>
        <div class="consolidation-dialog-footer">
          <Button
            label="Cancel"
            class="btn btn--ghost"
            @click="showSupplierCollectionLinkModal = false"
          />
          <Button
            label="Add Link"
            icon="pi pi-link"
            class="btn btn--primary"
            :disabled="!supplierCollectionLinkDraft.supplierInvoiceId"
            @click="confirmSupplierCollectionLink"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showCollectionLineModal"
      header="Add Collection Package"
      modal
      :style="{ width: '760px', maxWidth: '94vw' }"
    >
      <div class="consolidation-form-grid consolidation-form-grid--three">
        <label class="consolidation-field">
          <span>Packaging</span>
          <Dropdown v-model="collectionLineDraft.packageType" :options="packageOptions" />
        </label>
        <label class="consolidation-field">
          <span>Qty</span>
          <InputNumber v-model="collectionLineDraft.qty" :min="1" />
        </label>
        <label class="consolidation-check-row">
          <Checkbox v-model="collectionLineDraft.adr" binary />
          <span>ADR</span>
        </label>
        <label class="consolidation-field">
          <span>Length</span>
          <InputNumber v-model="collectionLineDraft.length" :min="0" />
        </label>
        <label class="consolidation-field">
          <span>Width</span>
          <InputNumber v-model="collectionLineDraft.width" :min="0" />
        </label>
        <label class="consolidation-field">
          <span>Height</span>
          <InputNumber v-model="collectionLineDraft.height" :min="0" />
        </label>
        <label class="consolidation-field">
          <span>Net kg</span>
          <InputNumber v-model="collectionLineDraft.netWeight" :min="0" :min-fraction-digits="1" />
        </label>
        <label class="consolidation-field">
          <span>Gross kg</span>
          <InputNumber
            v-model="collectionLineDraft.grossWeight"
            :min="0"
            :min-fraction-digits="1"
          />
        </label>
      </div>
      <div class="consolidation-modal-checks">
        <label class="consolidation-check-row">
          <Checkbox
            :model-value="getPackageStackOption(collectionLineDraft) === 'stackable'"
            binary
            @update:model-value="setPackageStackOption(collectionLineDraft, 'stackable')"
          />
          <span>Stackable</span>
        </label>
        <label class="consolidation-check-row">
          <Checkbox
            :model-value="getPackageStackOption(collectionLineDraft) === 'non_stack'"
            binary
            @update:model-value="setPackageStackOption(collectionLineDraft, 'non_stack')"
          />
          <span>Non-Stack</span>
        </label>
        <label class="consolidation-check-row">
          <Checkbox
            :model-value="getPackageStackOption(collectionLineDraft) === 'top_loadable'"
            binary
            @update:model-value="setPackageStackOption(collectionLineDraft, 'top_loadable')"
          />
          <span>Top-Loadable</span>
        </label>
      </div>
      <template #footer>
        <div class="consolidation-dialog-footer">
          <Button label="Cancel" class="btn btn--ghost" @click="showCollectionLineModal = false" />
          <Button
            label="Add Package"
            icon="pi pi-plus"
            class="btn btn--primary"
            @click="confirmCollectionLine"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showConsolidatedItemModal"
      header="Add Consolidated Invoice Item"
      modal
      :style="{ width: '820px', maxWidth: '94vw' }"
    >
      <div class="consolidation-form-grid consolidation-form-grid--three">
        <label class="consolidation-field">
          <span>Currency</span>
          <Dropdown v-model="consolidatedLineDraft.invoiceCurrency" :options="invoiceCurrencies" />
        </label>
        <label class="consolidation-field">
          <span>PO Ref</span>
          <InputText v-model="consolidatedLineDraft.poRef" />
        </label>
        <label class="consolidation-field">
          <span>Shipping Label No</span>
          <InputText v-model="consolidatedLineDraft.shippingLabelNo" />
        </label>
        <label class="consolidation-field consolidation-field--wide">
          <span>Description</span>
          <InputText v-model="consolidatedLineDraft.description" />
        </label>
        <label class="consolidation-field">
          <span>Qty</span>
          <InputNumber v-model="consolidatedLineDraft.qty" :min="0" />
        </label>
        <label class="consolidation-field">
          <span>UOM</span>
          <Dropdown v-model="consolidatedLineDraft.uom" :options="unitOptions" />
        </label>
        <label class="consolidation-field">
          <span>Origin</span>
          <InputText v-model="consolidatedLineDraft.countryOfOrigin" />
        </label>
        <label class="consolidation-field">
          <span>HS Code</span>
          <InputText v-model="consolidatedLineDraft.hsCode" />
        </label>
        <label class="consolidation-field">
          <span>Unit Price</span>
          <InputNumber v-model="consolidatedLineDraft.unitPrice" :min-fraction-digits="2" />
        </label>
        <label class="consolidation-field">
          <span>Supplier</span>
          <InputText v-model="consolidatedLineDraft.supplier" />
        </label>
        <label class="consolidation-field">
          <span>GRN</span>
          <InputText v-model="consolidatedLineDraft.grn" />
        </label>
      </div>
      <template #footer>
        <div class="consolidation-dialog-footer">
          <Button
            label="Cancel"
            class="btn btn--ghost"
            @click="showConsolidatedItemModal = false"
          />
          <Button
            label="Add Item"
            icon="pi pi-plus"
            class="btn btn--primary"
            @click="confirmConsolidatedItem"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showChargeModal"
      :header="chargeModalTitle"
      modal
      :style="{ width: '560px', maxWidth: '94vw' }"
    >
      <div class="consolidation-form-grid consolidation-form-grid--two">
        <label class="consolidation-field consolidation-field--wide">
          <span>Description</span>
          <Dropdown v-model="chargeDraft.description" :options="chargeOptions" />
        </label>
        <label class="consolidation-field">
          <span>Qty</span>
          <InputNumber v-model="chargeDraft.qty" :min="0" />
        </label>
        <label class="consolidation-field">
          <span>Unit</span>
          <Dropdown v-model="chargeDraft.unit" :options="unitOptions" />
        </label>
        <label class="consolidation-field">
          <span>Rate</span>
          <InputNumber v-model="chargeDraft.rate" :min-fraction-digits="2" />
        </label>
      </div>
      <template #footer>
        <div class="consolidation-dialog-footer">
          <Button label="Cancel" class="btn btn--ghost" @click="showChargeModal = false" />
          <Button
            label="Add Charge"
            icon="pi pi-plus"
            class="btn btn--primary"
            @click="confirmCharge"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showQuoteLineModal"
      header="Add Quote Line"
      modal
      :style="{ width: '560px', maxWidth: '94vw' }"
    >
      <div class="consolidation-form-grid consolidation-form-grid--two">
        <label class="consolidation-field consolidation-field--wide">
          <span>Description</span>
          <Dropdown v-model="quoteLineDraft.description" :options="chargeOptions" />
        </label>
        <label class="consolidation-field">
          <span>Qty</span>
          <InputNumber v-model="quoteLineDraft.qty" :min="0" />
        </label>
        <label class="consolidation-field">
          <span>Unit</span>
          <Dropdown v-model="quoteLineDraft.unit" :options="unitOptions" />
        </label>
        <label class="consolidation-field">
          <span>Rate</span>
          <InputNumber v-model="quoteLineDraft.rate" :min-fraction-digits="2" />
        </label>
      </div>
      <template #footer>
        <div class="consolidation-dialog-footer">
          <Button label="Cancel" class="btn btn--ghost" @click="showQuoteLineModal = false" />
          <Button
            label="Add Line"
            icon="pi pi-plus"
            class="btn btn--primary"
            @click="confirmQuoteLine"
          />
        </div>
      </template>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import "./ConsolidationPage.css"

import Button from "primevue/button"
import Calendar from "primevue/calendar"
import Checkbox from "primevue/checkbox"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"
import { useConsolidationPage } from "./ConsolidationPage.logic"

const {
  activeSupplierName,
  activeTab,
  addCollectionLine,
  addConsolidatedItem,
  addDomesticCharge,
  addDomesticToQuote,
  addExportCharge,
  addExportToQuote,
  addQuoteLine,
  addressOptions,
  addSupplierItem,
  adrClassOptions,
  cancelQuote,
  calendarDate,
  carrierOptions,
  cbm,
  chargeDraft,
  chargeModalTitle,
  chargeOptions,
  collectionChargeTotal,
  collectionDraft,
  collectionDraftTotals,
  collectionFscAmount,
  collectionLineDraft,
  collectionOrders,
  collectionRefOptions,
  confirmCharge,
  confirmCollectionLine,
  confirmConsolidatedItem,
  confirmQuoteLine,
  confirmSupplierCollectionLink,
  confirmSupplierItem,
  consolidatedFreightCharge,
  consolidatedLineDraft,
  consolidatedTotalsMap,
  convertQuoteToExportInvoice,
  createConsolidationJob,
  createError,
  creatingJob,
  currencyOptions,
  customerInvoiceSubtotal,
  customerInvoiceTax,
  customerInvoiceTotal,
  deliveryAddressOptions,
  domesticChargeRows,
  domesticInvoice,
  domesticInvoiceRows,
  domesticTotal,
  exportChargeRows,
  exportInvoice,
  exportTotal,
  filteredConsolidatedLines,
  formatCurrencyTotals,
  getPackageStackOption,
  goodsInRows,
  hasAdr,
  haulierQuoteText,
  incotermOptions,
  invoiceCurrencies,
  invoiceTotals,
  isExportLineInQuote,
  jobNumberAuto,
  jobNumberPlaceholder,
  jobNumberUsesSystem,
  ldm,
  metrics,
  modeOptions,
  money,
  nextCollectionRef,
  nextGrnRef,
  openCollectionOrderModal,
  openSupplierInvoiceModal,
  openSupplierCollectionLinkModal,
  overview,
  packageBreakdown,
  packageOptions,
  postDomesticInvoice,
  postExportInvoice,
  quote,
  quoteLineDraft,
  quoteLines,
  quoteStatusOptions,
  quoteSubtotal,
  refreshHaulierQuote,
  removeSupplierItem,
  saveCollectionOrder,
  saveSupplierInvoice,
  selectedCurrencyDapTotal,
  selectedCurrencyGoodsTotal,
  selectedInvoiceCurrency,
  selectedSupplierSummary,
  setOverviewDate,
  setPackageStackOption,
  setTransportDate,
  shipFromOptions,
  showChargeModal,
  showCollectionOrderModal,
  showCollectionLineModal,
  showConsolidatedItemModal,
  showQuoteLineModal,
  showQuotePanel,
  showSupplierCollectionLinkModal,
  showSupplierInvoiceModal,
  showSupplierItemModal,
  supplierCollectionLinkDraft,
  supplierDraft,
  supplierDraftTotals,
  supplierExaNumbers,
  supplierInvoiceId,
  supplierInvoiceLinkOptions,
  supplierInvoices,
  supplierInvoicesByCurrency,
  supplierItemDraft,
  supplierSummaries,
  supplierTotalsMap,
  tabs,
  taxRate,
  toggleExportLineQuote,
  transport,
  transportFields,
  transportFieldOptions,
  transportFieldInputType,
  transportFieldPlaceholder,
  unitOptions,
  vehicleOptions,
  weightBreakRates,
  yesNoOptions,
} = useConsolidationPage()
</script>
