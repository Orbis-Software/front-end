<template>
  <section class="consolidation-page">
    <header class="consolidation-page__hero">
      <div class="consolidation-page__hero-main">
        <div class="consolidation-page__eyebrow">CONSOLIDATED JOB</div>
        <h1>{{ overview.jobNo }}</h1>
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
        <Button label="Save Draft" icon="pi pi-save" class="btn btn--ghost" />
        <Button
          label="Create Collection Order"
          icon="pi pi-plus"
          class="btn btn--primary"
          @click="activeTab = 'collections'"
        />
      </div>
    </header>

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
              <InputText v-model="overview.jobNo" readonly />
            </label>
            <label class="consolidation-field">
              <span>Job Date</span>
              <InputText v-model="overview.jobDate" type="date" />
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
              <InputText v-model="overview.shipDate" type="date" />
            </label>
            <label class="consolidation-field">
              <span>Ship From</span>
              <Dropdown
                v-model="overview.shipFrom"
                :options="shipFromOptions"
                option-label="label"
                option-value="value"
              />
            </label>
            <label class="consolidation-field">
              <span>Exit Incoterm</span>
              <Dropdown v-model="overview.exitIncoterm" :options="incotermOptions" />
            </label>
            <label class="consolidation-field">
              <span>Entry Incoterm</span>
              <Dropdown v-model="overview.entryIncoterm" :options="incotermOptions" />
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
                <InputText v-model="overview.deliveryAddress" />
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
                <InputText v-model="transport[field.key]" />
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
            <table
              class="consolidation-table consolidation-table--inputs consolidation-table--wide"
            >
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Collie</th>
                  <th>Length</th>
                  <th>Width</th>
                  <th>Height</th>
                  <th>Net kg</th>
                  <th>Gross kg</th>
                  <th>ADR</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in supplierDraft.items" :key="item.id">
                  <td><Dropdown v-model="item.packageType" :options="packageOptions" /></td>
                  <td><InputNumber v-model="item.collie" :min="1" /></td>
                  <td><InputNumber v-model="item.length" :min="0" /></td>
                  <td><InputNumber v-model="item.width" :min="0" /></td>
                  <td><InputNumber v-model="item.height" :min="0" /></td>
                  <td><InputNumber v-model="item.net" :min="0" :min-fraction-digits="1" /></td>
                  <td><InputNumber v-model="item.gross" :min="0" :min-fraction-digits="1" /></td>
                  <td><Dropdown v-model="item.adr" :options="yesNoOptions" /></td>
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
              <span>Draft gross</span
              ><strong>{{ supplierDraftTotals.weight.toFixed(1) }} kg</strong>
            </article>
            <article>
              <span>Draft volume</span
              ><strong>{{ supplierDraftTotals.volume.toFixed(3) }} cbm</strong>
            </article>
            <article>
              <span>Draft value</span
              ><strong>{{ money(supplierDraft.currency, supplierDraft.invoiceValue) }}</strong>
            </article>
          </div>

          <div class="consolidation-section__footer">
            <Button
              label="Save Supplier Invoice"
              icon="pi pi-save"
              class="btn btn--primary"
              @click="saveSupplierInvoice"
            />
            <Button
              label="Add Supplier Invoice to Collection"
              icon="pi pi-link"
              class="btn btn--ghost"
            />
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
              <InputText
                v-model="collectionDraft.customerRef"
                placeholder="Enter customer reference"
              />
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
            <table
              class="consolidation-table consolidation-table--inputs consolidation-table--wide"
            >
              <thead>
                <tr>
                  <th>Packaging</th>
                  <th>Qty</th>
                  <th>Length</th>
                  <th>Width</th>
                  <th>Height</th>
                  <th>Net kg</th>
                  <th>Gross kg</th>
                  <th>CBM</th>
                  <th>LDM</th>
                  <th>ADR</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in collectionDraft.lines" :key="line.id">
                  <td><Dropdown v-model="line.packageType" :options="packageOptions" /></td>
                  <td><InputNumber v-model="line.qty" :min="1" /></td>
                  <td><InputNumber v-model="line.length" :min="0" /></td>
                  <td><InputNumber v-model="line.width" :min="0" /></td>
                  <td><InputNumber v-model="line.height" :min="0" /></td>
                  <td>
                    <InputNumber v-model="line.netWeight" :min="0" :min-fraction-digits="1" />
                  </td>
                  <td>
                    <InputNumber v-model="line.grossWeight" :min="0" :min-fraction-digits="1" />
                  </td>
                  <td>{{ cbm(line).toFixed(3) }}</td>
                  <td>{{ ldm(line).toFixed(3) }}</td>
                  <td><Checkbox v-model="line.adr" binary /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="consolidation-page__summary-row">
            <article>
              <span>Total pieces</span><strong>{{ collectionDraftTotals.pieces }}</strong>
            </article>
            <article>
              <span>Gross weight</span
              ><strong>{{ collectionDraftTotals.weight.toFixed(1) }} kg</strong>
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
                <span>Total haulier charge</span
                ><strong>{{ money("GBP", collectionChargeTotal) }}</strong>
              </article>
              <article>
                <span>Generated preview</span
                ><strong>{{ nextCollectionRef }} / {{ nextGrnRef }}</strong>
              </article>
            </div>
            <Textarea v-model="haulierQuoteText" rows="6" class="consolidation-quote-text" />
          </div>

          <div class="consolidation-section__footer">
            <Button
              label="Save Collection Order"
              icon="pi pi-save"
              class="btn btn--primary"
              @click="saveCollectionOrder"
            />
            <Button
              label="Refresh Quote Request"
              icon="pi pi-refresh"
              class="btn btn--ghost"
              @click="refreshHaulierQuote"
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
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import Button from "primevue/button"
import Checkbox from "primevue/checkbox"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"
import "./ConsolidationPage.css"

type TabId = "overview" | "orders" | "collections" | "invoices" | "custinv" | "goodsin"
type Currency = "GBP" | "USD" | "EUR"
type TransportKey = "bookingRef" | "carrier" | "originPort" | "destinationPort" | "etd" | "eta"

type PackageLine = {
  id: number
  packageType: string
  qty: number
  length: number
  width: number
  height: number
  netWeight: number
  grossWeight: number
  adr: boolean
}

type SupplierItem = {
  id: number
  packageType: string
  collie: number
  length: number
  width: number
  height: number
  net: number
  gross: number
  adr: "Yes" | "No"
}

type SupplierInvoice = {
  supplierName: string
  customerPoRef: string
  supplierInvoiceNumber: string
  invoiceDate: string
  currency: Currency
  invoiceValue: number
  collectionRef: string
  label: string
  items: SupplierItem[]
}

type InvoiceChargeLine = {
  id: number
  description: string
  qty: number
  unit: string
  rate: number
  sourceType?: "domestic" | "export" | "manual"
  sourceId?: number | string
}

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Supplier Invoices" },
  { id: "collections", label: "Collection Orders" },
  { id: "invoices", label: "Consolidated Invoices" },
  { id: "custinv", label: "Customer Invoice" },
  { id: "goodsin", label: "Goods In/Out (WMS)" },
]

const activeTab = ref<TabId>("overview")
const activeSupplierName = ref("DHL")
const selectedInvoiceCurrency = ref<Currency>("GBP")
const collectionLineId = ref(3)
const supplierItemId = ref(2)
const consolidatedLineId = ref(4)
const domesticChargeId = ref(2)
const exportChargeId = ref(4)
const quoteLineId = ref(3)
const taxRate = ref(20)
const showQuotePanel = ref(false)
const consolidatedFreightCharge = ref(0)

const modeOptions = ["Road", "Rail", "Air", "Sea"].map(value => ({ label: value, value }))
const currencyOptions = ["GBP", "USD", "EUR"].map(value => ({ label: value, value }))
const shipFromOptions = ["PC Cargo UK Depot", "London Gateway", "Felixstowe", "Manchester Hub"].map(
  value => ({ label: value, value }),
)
const incotermOptions = ["EXW", "FCA", "FOB", "CIF", "DAP", "DDP"]
const packageOptions = ["Carton", "Pallet", "Crate", "Jiffy", "Loose"]
const unitOptions = ["Fixed", "Per kg", "Per CBM", "Per Piece", "Per Pallet", "Per Container"]
const yesNoOptions = ["No", "Yes"]
const vehicleOptions = ["Van", "7.5t", "18t", "Artic", "Container"]
const addressOptions = [
  "PC Cargo UK Depot",
  "Customer Collection Address",
  "Supplier Warehouse",
  "Final Destination",
]
const carrierOptions = ["DHL", "Kuehne+Nagel", "DSV", "FedEx", "Manual Entry"]
const chargeOptions = [
  "Consolidation handling",
  "Export documentation",
  "Domestic collection",
  "Fuel surcharge",
  "Customs clearance",
  "Delivery",
]
const quoteStatusOptions = ["Draft", "Sent", "Accepted", "Declined"]
const invoiceCurrencies: Currency[] = ["GBP", "USD", "EUR"]
const adrClassOptions = [
  { label: "Class 1 - Explosives", value: "1" },
  { label: "Class 2.1 - Flammable Gas", value: "2.1" },
  { label: "Class 2.2 - Non-Flammable Gas", value: "2.2" },
  { label: "Class 3 - Flammable Liquid", value: "3" },
  { label: "Class 4.1 - Flammable Solid", value: "4.1" },
  { label: "Class 5.1 - Oxidising Substance", value: "5.1" },
  { label: "Class 6.1 - Toxic Substance", value: "6.1" },
  { label: "Class 8 - Corrosive Substance", value: "8" },
  { label: "Class 9 - Miscellaneous Dangerous Goods", value: "9" },
]

const overview = reactive({
  jobNo: "CON-PE-000245",
  jobDate: "2026-03-19",
  mode: "Road",
  invoiceCurrency: "GBP" as Currency,
  shipDate: "2026-03-20",
  shipFrom: "PC Cargo UK Depot",
  exitIncoterm: "EXW",
  entryIncoterm: "DAP",
  customer: "",
  notifyParty: "",
  shipper: "PC Cargo UK Depot",
  deliveryAddress: "",
  goodsDescription: "Mixed supplier cargo for consolidation.",
  instructions: "",
  exportCustomsRef: "",
  importCustomsRef: "",
})

const transport = reactive<Record<TransportKey, string>>({
  bookingRef: "BK-ROAD-245",
  carrier: "DHL",
  originPort: "Collection Hub",
  destinationPort: "Final Destination",
  etd: "2026-03-20",
  eta: "2026-03-22",
})

const transportFields = computed<Array<{ key: TransportKey; label: string }>>(() => {
  const roadFields: Array<{ key: TransportKey; label: string }> = [
    { key: "bookingRef", label: "Transport Ref" },
    { key: "carrier", label: "Haulier" },
    { key: "originPort", label: "Collection Point" },
    { key: "destinationPort", label: "Delivery Point" },
    { key: "etd", label: "Pickup Date" },
    { key: "eta", label: "Delivery Date" },
  ]
  const labelsByMode: Record<string, Array<{ key: TransportKey; label: string }>> = {
    Air: [
      { key: "bookingRef", label: "AWB / Booking Ref" },
      { key: "carrier", label: "Airline" },
      { key: "originPort", label: "Origin Airport" },
      { key: "destinationPort", label: "Destination Airport" },
      { key: "etd", label: "Flight ETD" },
      { key: "eta", label: "Flight ETA" },
    ],
    Sea: [
      { key: "bookingRef", label: "Booking / Container Ref" },
      { key: "carrier", label: "Shipping Line" },
      { key: "originPort", label: "Port of Loading" },
      { key: "destinationPort", label: "Port of Discharge" },
      { key: "etd", label: "Vessel ETD" },
      { key: "eta", label: "Vessel ETA" },
    ],
    Rail: [
      { key: "bookingRef", label: "Rail Booking Ref" },
      { key: "carrier", label: "Rail Operator" },
      { key: "originPort", label: "Origin Terminal" },
      { key: "destinationPort", label: "Destination Terminal" },
      { key: "etd", label: "Departure" },
      { key: "eta", label: "Arrival" },
    ],
    Road: roadFields,
  }
  return labelsByMode[overview.mode] ?? roadFields
})

const collectionDraft = reactive({
  coRef: "CO-NEW",
  customerRef: "",
  collectionRef: "",
  pickupDate: "2026-03-20",
  pickupTime: "09:30",
  vehicle: "7.5t",
  collectionAddress: "Supplier Warehouse",
  deliveryAddress: "PC Cargo UK Depot",
  deliveryDate: "2026-03-22",
  deliveryTime: "17:00",
  supplier: "DHL",
  goodsDescription: "Collection goods",
  hazardous: false,
  adrClass: "",
  freight: 125,
  fscPct: 12.5,
  additional: 25,
  lines: [
    {
      id: 1,
      packageType: "Pallet",
      qty: 1,
      length: 120,
      width: 80,
      height: 100,
      netWeight: 95,
      grossWeight: 100,
      adr: false,
    },
    {
      id: 2,
      packageType: "Carton",
      qty: 4,
      length: 60,
      width: 40,
      height: 35,
      netWeight: 72,
      grossWeight: 78,
      adr: false,
    },
  ] as PackageLine[],
})

const supplierDraft = reactive({
  supplierName: "Shenzhen ABC Components Co., Ltd.",
  customerPoRef: "PO-1002",
  supplierInvoiceNumber: "SZ-8841",
  invoiceDate: "2026-03-17",
  currency: "USD" as Currency,
  invoiceValue: 845,
  collectionRef: "CO-771",
  label: "2",
  items: [
    {
      id: 1,
      packageType: "Carton",
      collie: 4,
      length: 60,
      width: 40,
      height: 35,
      net: 72,
      gross: 78,
      adr: "No",
    },
  ] as SupplierItem[],
})

const supplierInvoices = ref<SupplierInvoice[]>([
  {
    supplierName: "DHL",
    customerPoRef: "PO-1001",
    supplierInvoiceNumber: "INV-001",
    invoiceDate: "2026-03-18",
    currency: "GBP" as Currency,
    invoiceValue: 125,
    collectionRef: "CO-771",
    label: "1",
    items: [
      {
        id: 1,
        packageType: "Pallet",
        collie: 1,
        length: 120,
        width: 80,
        height: 100,
        net: 95,
        gross: 100,
        adr: "No",
      },
    ],
  },
  {
    supplierName: "Shenzhen ABC Components Co., Ltd.",
    customerPoRef: "PO-1002",
    supplierInvoiceNumber: "SZ-8841",
    invoiceDate: "2026-03-17",
    currency: "USD" as Currency,
    invoiceValue: 845,
    collectionRef: "CO-771",
    label: "2",
    items: [
      {
        id: 2,
        packageType: "Carton",
        collie: 4,
        length: 60,
        width: 40,
        height: 35,
        net: 72,
        gross: 78,
        adr: "No",
      },
    ],
  },
  {
    supplierName: "Guangzhou DEF Plastics Ltd.",
    customerPoRef: "PO-1003",
    supplierInvoiceNumber: "GZ-4412",
    invoiceDate: "2026-03-16",
    currency: "EUR" as Currency,
    invoiceValue: 610,
    collectionRef: "CO-812",
    label: "3",
    items: [
      {
        id: 3,
        packageType: "Crate",
        collie: 2,
        length: 100,
        width: 80,
        height: 90,
        net: 110,
        gross: 118,
        adr: "Yes",
      },
    ],
  },
])

const supplierExaNumbers = reactive<Record<string, string>>({
  DHL: "EXA-GB-000771",
  "Shenzhen ABC Components Co., Ltd.": "EXA-CN-0008841",
  "Guangzhou DEF Plastics Ltd.": "",
})

const collectionOrders = ref([
  {
    coRef: "CO-771",
    supplier: "DHL",
    pickupDate: "2026-03-12",
    pickupTime: "09:30",
    vehicle: "7.5t",
    pcs: 5,
    weightKg: 178,
    status: "Booked",
    hazardous: false,
    deliveryDate: "",
    notes: "",
    wmsRef: "WMS-10021",
  },
  {
    coRef: "CO-812",
    supplier: "Kuehne+Nagel",
    pickupDate: "2026-03-12",
    pickupTime: "14:00",
    vehicle: "Van",
    pcs: 2,
    weightKg: 118,
    status: "Pending",
    hazardous: true,
    deliveryDate: "",
    notes: "",
    wmsRef: "",
  },
])

const goodsInRows = ref([
  {
    grn: "GRN-0001",
    supplier: "DHL",
    supplierInvoice: "INV-001",
    supplierPO: "CO-771",
    partNo: "-",
    desc: "Domestic collection",
    pcs: 1,
    weightKg: 100,
    cbm: 0.96,
    location: "STAGING",
    status: "Received",
  },
  {
    grn: "GRN-0002",
    supplier: "Shenzhen ABC Components Co., Ltd.",
    supplierInvoice: "SZ-8841",
    supplierPO: "PO-1002",
    partNo: "-",
    desc: "Integrated circuits",
    pcs: 4,
    weightKg: 78,
    cbm: 0.202,
    location: "STAGING",
    status: "Received",
  },
  {
    grn: "GRN-0003",
    supplier: "Guangzhou DEF Plastics Ltd.",
    supplierInvoice: "GZ-4412",
    supplierPO: "PO-1003",
    partNo: "-",
    desc: "Plastic housings",
    pcs: 2,
    weightKg: 118,
    cbm: 1.44,
    location: "QA",
    status: "Pending QA",
  },
])

const consolidatedLines = ref([
  {
    id: 1,
    invoiceCurrency: "GBP" as Currency,
    poRef: "PO-1001",
    shippingLabelNo: "1",
    description: "Domestic collection",
    qty: 1,
    uom: "Fixed",
    countryOfOrigin: "GB",
    hsCode: "",
    unitPrice: 125,
    supplier: "DHL",
    grn: "GRN-0001",
  },
  {
    id: 2,
    invoiceCurrency: "USD" as Currency,
    poRef: "PO-1002",
    shippingLabelNo: "2",
    description: "Integrated circuits",
    qty: 3000,
    uom: "Per Piece",
    countryOfOrigin: "CN",
    hsCode: "854239",
    unitPrice: 0.28,
    supplier: "Shenzhen ABC Components Co., Ltd.",
    grn: "GRN-0002",
  },
  {
    id: 3,
    invoiceCurrency: "EUR" as Currency,
    poRef: "PO-1003",
    shippingLabelNo: "3",
    description: "Plastic housings",
    qty: 500,
    uom: "Per Piece",
    countryOfOrigin: "CN",
    hsCode: "392690",
    unitPrice: 1.22,
    supplier: "Guangzhou DEF Plastics Ltd.",
    grn: "GRN-0003",
  },
])

const domesticChargeRows = ref<InvoiceChargeLine[]>([
  { id: 1, description: "Collection - CO-771 (DHL)", qty: 1, unit: "Fixed", rate: 125 },
])

const exportChargeRows = ref<InvoiceChargeLine[]>([
  { id: 1, description: "Consolidation handling", qty: 1, unit: "Fixed", rate: 180 },
  { id: 2, description: "Export documentation", qty: 1, unit: "Fixed", rate: 45 },
  { id: 3, description: "Customs clearance", qty: 1, unit: "Fixed", rate: 95 },
])

const quoteLines = ref<InvoiceChargeLine[]>([
  {
    id: 1,
    description: "Domestic collection",
    qty: 1,
    unit: "Fixed",
    rate: 125,
    sourceType: "domestic",
    sourceId: "CO-771",
  },
  {
    id: 2,
    description: "Export documentation",
    qty: 1,
    unit: "Fixed",
    rate: 45,
    sourceType: "export",
    sourceId: 2,
  },
])

const domesticInvoice = reactive({
  posted: false,
  ref: "",
  date: "",
})

const exportInvoice = reactive({
  posted: false,
  ref: "",
  date: "",
})

const weightBreakRates = [
  { label: "0 - 50 kg", rate: 45, perKg: false },
  { label: "51 - 250 kg", rate: 0.85, perKg: true },
  { label: "251 - 500 kg", rate: 0.72, perKg: true },
  { label: "501+ kg", rate: 0.62, perKg: true },
]

const quote = reactive({
  reference: "QUO-2026-001",
  validUntil: "",
  status: "Draft",
  notes: "",
  terms:
    "This quotation is valid for 30 days from the date of issue. Rates are subject to fuel surcharge adjustments. Subject to carrier availability and standard terms of trading.",
})

const collectionRefOptions = computed(() => collectionOrders.value.map(order => order.coRef))
const nextCollectionRef = computed(
  () => `CO-${String(collectionOrders.value.length + 1).padStart(3, "0")}`,
)
const nextGrnRef = computed(() => `GRN-${String(goodsInRows.value.length + 1).padStart(4, "0")}`)

const collectionDraftTotals = computed(() => summarizePackageLines(collectionDraft.lines))
const supplierDraftTotals = computed(() => {
  return supplierDraft.items.reduce(
    (sum, item) => {
      sum.pieces += Number(item.collie || 0)
      sum.weight += Number(item.gross || 0)
      sum.volume +=
        (Number(item.collie || 0) *
          Number(item.length || 0) *
          Number(item.width || 0) *
          Number(item.height || 0)) /
        1_000_000
      return sum
    },
    { pieces: 0, weight: 0, volume: 0 },
  )
})

const supplierSummaries = computed(() => {
  const summaries = new Map<
    string,
    {
      name: string
      invoiceCount: number
      totalCollies: number
      totalNet: number
      totalGross: number
      valueByCurrency: Map<Currency, number>
      invoices: SupplierInvoice[]
    }
  >()

  supplierInvoices.value.forEach(invoice => {
    const name = invoice.supplierName || "Unnamed Supplier"
    const current = summaries.get(name) || {
      name,
      invoiceCount: 0,
      totalCollies: 0,
      totalNet: 0,
      totalGross: 0,
      valueByCurrency: new Map<Currency, number>(),
      invoices: [],
    }

    const totals = invoiceTotals(invoice)
    current.invoiceCount += 1
    current.totalCollies += totals.collies
    current.totalNet += totals.net
    current.totalGross += totals.gross
    current.valueByCurrency.set(
      invoice.currency,
      (current.valueByCurrency.get(invoice.currency) || 0) + Number(invoice.invoiceValue || 0),
    )
    current.invoices.push(invoice)

    summaries.set(name, current)
  })

  return Array.from(summaries.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const selectedSupplierSummary = computed(() => {
  return (
    supplierSummaries.value.find(supplier => supplier.name === activeSupplierName.value) ||
    supplierSummaries.value[0] ||
    null
  )
})

const hasAdr = computed(() => {
  return (
    collectionDraft.lines.some(line => line.adr) ||
    supplierInvoices.value.some(invoice => invoice.items.some(item => item.adr === "Yes"))
  )
})

const collectionFscAmount = computed(
  () => Number(collectionDraft.freight || 0) * (Number(collectionDraft.fscPct || 0) / 100),
)
const collectionChargeTotal = computed(
  () =>
    Number(collectionDraft.freight || 0) +
    collectionFscAmount.value +
    Number(collectionDraft.additional || 0),
)

const supplierCostTotal = computed(() =>
  supplierInvoices.value.reduce((sum, invoice) => sum + Number(invoice.invoiceValue || 0), 0),
)
const supplierTotalsMap = computed(() => {
  const totals = new Map<Currency, number>()
  invoiceCurrencies.forEach(currency => totals.set(currency, 0))
  supplierInvoices.value.forEach(invoice =>
    totals.set(
      invoice.currency,
      (totals.get(invoice.currency) || 0) + Number(invoice.invoiceValue || 0),
    ),
  )
  return totals
})
const supplierTotalsByCurrency = computed(() => {
  return Array.from(supplierTotalsMap.value.entries()).map(([currency, total]) => ({
    currency,
    total,
  }))
})
const consolidatedTotalsMap = computed(() => {
  const totals = new Map<Currency, number>()
  invoiceCurrencies.forEach(currency => totals.set(currency, 0))
  consolidatedLines.value.forEach(line => {
    totals.set(
      line.invoiceCurrency,
      (totals.get(line.invoiceCurrency) || 0) + Number(line.qty || 0) * Number(line.unitPrice || 0),
    )
  })
  return totals
})
const filteredConsolidatedLines = computed(() => {
  return consolidatedLines.value.filter(
    line => line.invoiceCurrency === selectedInvoiceCurrency.value,
  )
})
const selectedCurrencyGoodsTotal = computed(
  () => consolidatedTotalsMap.value.get(selectedInvoiceCurrency.value) || 0,
)
const selectedCurrencyDapTotal = computed(
  () => selectedCurrencyGoodsTotal.value + Number(consolidatedFreightCharge.value || 0),
)
const packageBreakdown = computed(() => {
  return supplierInvoices.value.reduce(
    (sum, invoice) => {
      invoice.items.forEach(item => {
        const qty = Number(item.collie || 0)
        const type = item.packageType.toLowerCase()
        if (type.includes("crate")) sum.crates += qty
        else if (type.includes("pallet")) sum.pallets += qty
        else if (type.includes("jiffy")) sum.jiffies += qty
        else sum.cartons += qty
        sum.net += Number(item.net || 0)
        sum.gross += Number(item.gross || 0)
        sum.cbm +=
          (qty * Number(item.length || 0) * Number(item.width || 0) * Number(item.height || 0)) /
          1_000_000
        sum.ldm += (qty * Number(item.length || 0) * Number(item.width || 0)) / 24000
      })
      return sum
    },
    { crates: 0, pallets: 0, cartons: 0, jiffies: 0, net: 0, gross: 0, cbm: 0, ldm: 0 },
  )
})

const domesticInvoiceRows = computed(() =>
  collectionOrders.value.map(order => ({
    ...order,
    cost: calcWeightBreakCost(Number(order.weightKg || 0)),
  })),
)
const domesticCollectionTotal = computed(() =>
  domesticInvoiceRows.value.reduce((sum, row) => sum + row.cost, 0),
)
const domesticAdditionalTotal = computed(() =>
  domesticChargeRows.value.reduce((sum, line) => sum + line.qty * line.rate, 0),
)
const domesticTotal = computed(() => domesticCollectionTotal.value + domesticAdditionalTotal.value)
const exportTotal = computed(() =>
  exportChargeRows.value.reduce((sum, line) => sum + line.qty * line.rate, 0),
)
const quoteSubtotal = computed(() =>
  quoteLines.value.reduce((sum, line) => sum + line.qty * line.rate, 0),
)
const customerInvoiceSubtotal = computed(() => domesticTotal.value + exportTotal.value)
const customerInvoiceTax = computed(
  () => customerInvoiceSubtotal.value * (Number(taxRate.value || 0) / 100),
)
const customerInvoiceTotal = computed(
  () => customerInvoiceSubtotal.value + customerInvoiceTax.value,
)

const metrics = computed(() => [
  { label: "Supplier Invoices", value: supplierInvoices.value.length },
  { label: "Collection Orders", value: collectionOrders.value.length },
  { label: "Goods In", value: goodsInRows.value.length },
  { label: "Pieces", value: goodsInRows.value.reduce((sum, row) => sum + Number(row.pcs || 0), 0) },
  { label: "Supplier Cost", value: money("GBP", supplierCostTotal.value) },
  { label: "Invoice Total", value: money("GBP", customerInvoiceTotal.value) },
])

const haulierQuoteText = ref("")
refreshHaulierQuote()

function summarizePackageLines(lines: PackageLine[]) {
  return lines.reduce(
    (sum, line) => {
      sum.pieces += Number(line.qty || 0)
      sum.weight += Number(line.grossWeight || 0)
      sum.volume += cbm(line)
      sum.ldm += ldm(line)
      return sum
    },
    { pieces: 0, weight: 0, volume: 0, ldm: 0 },
  )
}

function addCollectionLine() {
  collectionDraft.lines.push({
    id: collectionLineId.value++,
    packageType: "Carton",
    qty: 1,
    length: 0,
    width: 0,
    height: 0,
    netWeight: 0,
    grossWeight: 0,
    adr: false,
  })
}

function addSupplierItem() {
  supplierDraft.items.push({
    id: supplierItemId.value++,
    packageType: "Carton",
    collie: 1,
    length: 0,
    width: 0,
    height: 0,
    net: 0,
    gross: 0,
    adr: "No",
  })
}

function removeSupplierItem(index: number) {
  supplierDraft.items.splice(index, 1)
}

function saveSupplierInvoice() {
  const supplierName = supplierDraft.supplierName || "Unnamed Supplier"
  if (!(supplierName in supplierExaNumbers)) {
    supplierExaNumbers[supplierName] = ""
  }

  supplierInvoices.value = [
    {
      supplierName,
      customerPoRef: supplierDraft.customerPoRef,
      supplierInvoiceNumber: supplierDraft.supplierInvoiceNumber,
      invoiceDate: supplierDraft.invoiceDate,
      currency: supplierDraft.currency,
      invoiceValue: Number(supplierDraft.invoiceValue || 0),
      collectionRef: supplierDraft.collectionRef,
      label: supplierDraft.label,
      items: supplierDraft.items.map(item => ({ ...item })),
    },
    ...supplierInvoices.value,
  ]
  activeSupplierName.value = supplierName
}

function saveCollectionOrder() {
  const totals = collectionDraftTotals.value
  const coRef = collectionDraft.coRef === "CO-NEW" ? nextCollectionRef.value : collectionDraft.coRef
  const grn = nextGrnRef.value

  collectionOrders.value = [
    {
      coRef,
      supplier: collectionDraft.supplier,
      pickupDate: collectionDraft.pickupDate,
      pickupTime: collectionDraft.pickupTime,
      vehicle: collectionDraft.vehicle,
      pcs: totals.pieces,
      weightKg: Number(totals.weight.toFixed(1)),
      status: "Created",
      hazardous: collectionDraft.hazardous || collectionDraft.lines.some(line => line.adr),
      deliveryDate: collectionDraft.deliveryDate,
      notes: "",
      wmsRef: "",
    },
    ...collectionOrders.value,
  ]

  goodsInRows.value = [
    {
      grn,
      supplier: collectionDraft.supplier,
      supplierInvoice: "-",
      supplierPO: coRef,
      partNo: "-",
      desc: collectionDraft.goodsDescription,
      pcs: totals.pieces,
      weightKg: Number(totals.weight.toFixed(1)),
      cbm: Number(totals.volume.toFixed(3)),
      location: "STAGING",
      status: "Received",
    },
    ...goodsInRows.value,
  ]
}

function addConsolidatedItem() {
  consolidatedLines.value.push({
    id: consolidatedLineId.value++,
    invoiceCurrency: selectedInvoiceCurrency.value,
    poRef: "",
    shippingLabelNo: "",
    description: "New consolidated charge",
    qty: 1,
    uom: "Fixed",
    countryOfOrigin: "",
    hsCode: "",
    unitPrice: 0,
    supplier: "",
    grn: "",
  })
}

function addDomesticCharge() {
  domesticChargeRows.value.push({
    id: domesticChargeId.value++,
    description: "Additional domestic charge",
    qty: 1,
    unit: "Fixed",
    rate: 0,
  })
}

function addExportCharge() {
  exportChargeRows.value.push({
    id: exportChargeId.value++,
    description: "Consolidation handling",
    qty: 1,
    unit: "Fixed",
    rate: 0,
  })
}

function calcWeightBreakCost(weightKg: number) {
  if (weightKg <= 0) return 0
  if (weightKg <= 50) return 45
  if (weightKg <= 250) return weightKg * 0.85
  if (weightKg <= 500) return weightKg * 0.72
  return weightKg * 0.62
}

function addDomesticToQuote() {
  quoteLines.value = quoteLines.value.filter(line => line.sourceType !== "domestic")

  const collectionLines = domesticInvoiceRows.value.map(row => ({
    id: quoteLineId.value++,
    description: `Collection - ${row.coRef}${row.supplier ? ` (${row.supplier})` : ""}`,
    qty: 1,
    unit: "Fixed",
    rate: Number(row.cost || 0),
    sourceType: "domestic" as const,
    sourceId: row.coRef,
  }))

  const additionalLines = domesticChargeRows.value.map(line => ({
    ...line,
    id: quoteLineId.value++,
    sourceType: "domestic" as const,
    sourceId: `manual-${line.id}`,
  }))

  quoteLines.value = [...quoteLines.value, ...collectionLines, ...additionalLines]
  showQuotePanel.value = true
}

function addExportToQuote() {
  quoteLines.value = quoteLines.value.filter(line => line.sourceType !== "export")
  quoteLines.value = [
    ...quoteLines.value,
    ...exportChargeRows.value.map(line => ({
      ...line,
      id: quoteLineId.value++,
      sourceType: "export" as const,
      sourceId: line.id,
    })),
  ]
  showQuotePanel.value = true
}

function isExportLineInQuote(lineId: number) {
  return quoteLines.value.some(line => line.sourceType === "export" && line.sourceId === lineId)
}

function toggleExportLineQuote(lineId: number) {
  if (isExportLineInQuote(lineId)) {
    quoteLines.value = quoteLines.value.filter(
      line => !(line.sourceType === "export" && line.sourceId === lineId),
    )
    return
  }

  const source = exportChargeRows.value.find(line => line.id === lineId)
  if (!source) return
  quoteLines.value.push({
    ...source,
    id: quoteLineId.value++,
    sourceType: "export",
    sourceId: lineId,
  })
  showQuotePanel.value = true
}

function addQuoteLine() {
  quoteLines.value.push({
    id: quoteLineId.value++,
    description: chargeOptions[0] ?? "Consolidation handling",
    qty: 1,
    unit: "Fixed",
    rate: 0,
    sourceType: "manual",
    sourceId: `manual-${quoteLineId.value}`,
  })
}

function cancelQuote() {
  quoteLines.value = []
  showQuotePanel.value = false
}

function convertQuoteToExportInvoice() {
  exportChargeRows.value = quoteLines.value.map(line => ({
    id: exportChargeId.value++,
    description: line.description,
    qty: line.qty,
    unit: line.unit,
    rate: line.rate,
  }))
  quoteLines.value = []
  showQuotePanel.value = false
}

function postDomesticInvoice() {
  domesticInvoice.posted = true
  domesticInvoice.date = new Date().toLocaleDateString("en-GB")
  domesticInvoice.ref = `DI-${overview.jobNo}-${Date.now().toString().slice(-4)}`
}

function postExportInvoice() {
  exportInvoice.posted = true
  exportInvoice.date = new Date().toLocaleDateString("en-GB")
  exportInvoice.ref = `EI-${overview.jobNo}-${Date.now().toString().slice(-4)}`
}

function supplierInvoicesByCurrency(currency: Currency) {
  return supplierInvoices.value.filter(invoice => invoice.currency === currency)
}

function refreshHaulierQuote() {
  const totals = collectionDraftTotals.value
  haulierQuoteText.value = [
    `Subject: Collection / Transport Quote Request - ${collectionDraft.coRef} (${overview.jobNo})`,
    "",
    "Please quote for the following collection and transport service.",
    `Collection From: ${collectionDraft.collectionAddress}`,
    `Delivery To: ${collectionDraft.deliveryAddress}`,
    `Pickup: ${collectionDraft.pickupDate} ${collectionDraft.pickupTime}`,
    `Required Delivery: ${collectionDraft.deliveryDate}`,
    `Mode: ${overview.mode} - ${collectionDraft.vehicle}`,
    `Cargo: ${collectionDraft.goodsDescription}`,
    `Pieces: ${totals.pieces}`,
    `Gross Weight: ${totals.weight.toFixed(1)} kg`,
    `Volume: ${totals.volume.toFixed(3)} cbm`,
    `ADR: ${collectionDraft.lines.some(line => line.adr) ? "Yes" : "No"}`,
    `Budget / Target Rate: ${money("GBP", collectionDraft.freight)}`,
  ].join("\n")
}

function cbm(line: PackageLine) {
  return (
    (Number(line.qty || 0) *
      Number(line.length || 0) *
      Number(line.width || 0) *
      Number(line.height || 0)) /
    1_000_000
  )
}

function invoiceTotals(invoice: SupplierInvoice) {
  return invoice.items.reduce(
    (sum, item) => {
      sum.collies += Number(item.collie || 0)
      sum.net += Number(item.net || 0)
      sum.gross += Number(item.gross || 0)
      return sum
    },
    { collies: 0, net: 0, gross: 0 },
  )
}

function formatCurrencyTotals(totals: Map<Currency, number>) {
  const entries = Array.from(totals.entries())
  if (!entries.length) return "£0.00"
  return entries.map(([currency, value]) => money(currency, value)).join(" / ")
}

function ldm(line: PackageLine) {
  return (Number(line.qty || 0) * Number(line.length || 0) * Number(line.width || 0)) / 24000
}

function money(currency: Currency, value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}
</script>
