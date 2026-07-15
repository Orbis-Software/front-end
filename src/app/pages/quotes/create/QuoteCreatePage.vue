<template>
  <div class="quote-page">
    <Toast />

    <div class="quote-top">
      <div class="quote-title">
        <i class="pi pi-file-edit" />
        <span>{{ pageTitle }}</span>
      </div>

      <div class="quote-actions">
        <span class="status-tag">
          <span class="status-dot" />
          {{ pageStatusLabel }}
        </span>

        <Button class="btn orbis-primary" outlined type="button" @click="onBrowseQuotes">
          <i class="pi pi-folder-open" style="margin-right: 8px" />
          Browse Quotes
        </Button>

        <Button class="btn orbis-primary" type="button" @click="onFindQuote">
          <i class="pi pi-search" style="margin-right: 8px" />
          Find Quote
        </Button>
      </div>
    </div>

    <div v-if="error" class="card section" style="border-color: #fecaca; color: #991b1b">
      {{ error }}
    </div>

    <section class="card section">
      <QuoteStepHeader
        title="Quote Type"
        badge="STEP 1"
        subtitle="Choose what you want to create"
      />
      <QuoteTypeSelector :items="QUOTE_TYPES" :selected="quoteType" @select="selectQuoteType" />
    </section>

    <section v-if="quoteType && showModeSelector" class="card section">
      <QuoteStepHeader
        :title="`Mode of Transport for ${quoteTypeLabel}`"
        badge="STEP 2"
        subtitle="Choose the transport mode"
      />
      <ModeSelector :items="availableModes" :selected="mode" @select="selectMode" />
    </section>

    <section v-if="canShowForm" class="card section">
      <div class="meta-title">
        {{ formTitle }}<span v-if="modeLabel"> — {{ modeLabel }}</span>
      </div>

      <QuoteStepHeader
        title="Quote Information"
        badge="STEP 3"
        subtitle="Customer, contact, references, dates, currency, and incoterms"
      />

      <div class="grid-4">
        <div class="field">
          <label class="label">Customer Name *</label>
          <AutoComplete
            v-model="selectedCustomer"
            :suggestions="customerSuggestions"
            :optionLabel="customerOptionLabel"
            placeholder="Start typing... (select from CRM)"
            class="control"
            inputClass="control"
            dropdown
            forceSelection
            :completeOnFocus="true"
            @complete="onCustomerComplete"
            @item-select="onCustomerSelect"
            @clear="onCustomerClear"
          />
        </div>

        <div class="field">
          <label class="label">Account Number</label>
          <InputText :modelValue="accountNumberPreview" class="control" readonly />
        </div>

        <div class="field">
          <label class="label">Contact Person *</label>
          <Select
            v-model="selectedContactIndex"
            :options="contactOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select contact"
            :disabled="!selectedCustomer"
          />
        </div>

        <div class="field">
          <label class="label">Customer Ref</label>
          <InputText v-model="form.customer_ref" class="control" placeholder="e.g. PO-2026-001" />
        </div>
      </div>

      <div class="grid-4 mt-12">
        <div class="field">
          <label class="label">Email</label>
          <InputText v-model="form.contact_email" class="control" readonly />
        </div>

        <div class="field">
          <label class="label">Phone Number</label>
          <InputText v-model="form.contact_phone" class="control" readonly />
        </div>

        <div class="field">
          <label class="label">Quote Ref</label>
          <InputText
            v-model="form.quote_ref"
            class="control"
            readonly
            placeholder="System generated on save"
          />
        </div>

        <div class="field">
          <label class="label">Quote Date</label>
          <Calendar
            v-model="form.quote_date"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>
      </div>

      <div class="grid-4 mt-12">
        <div class="field">
          <label class="label">Follow Up Date</label>
          <Calendar
            v-model="form.follow_up_date"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>

        <div class="field">
          <label class="label">Valid Until</label>
          <Calendar
            v-model="form.valid_until"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>

        <div class="field">
          <label class="label">Currency</label>
          <Select
            v-model="form.currency"
            :options="currencyOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select currency"
          />
        </div>

        <div class="field">
          <label class="label">Incoterms</label>
          <Select
            v-model="form.incoterm"
            :options="incotermOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select incoterm"
          />
        </div>
      </div>
    </section>

    <section v-if="canShowForm" class="card section">
      <QuoteStepHeader
        title="Shipment Summary"
        badge="STEP 4"
        subtitle="Routing, cargo summary, and package details"
      />

      <div class="grid-4">
        <div class="field">
          <label class="label">Origin Port / Location</label>
          <AutoComplete
            :modelValue="form.origin"
            :suggestions="originLocationOptions"
            optionLabel="label"
            class="control quote-location-autocomplete"
            inputClass="control"
            placeholder="Select origin"
            dropdown
            :completeOnFocus="true"
            :minLength="0"
            :delay="150"
            emptySearchMessage="No matching location"
            @update:modelValue="updateLocationValue('origin', $event)"
            @complete="onGlobalReferenceComplete"
          >
            <template #option="{ option }">
              <div class="quote-location-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </AutoComplete>
        </div>

        <div class="field">
          <label class="label">Destination Port / Location</label>
          <AutoComplete
            :modelValue="form.destination"
            :suggestions="destinationLocationOptions"
            optionLabel="label"
            class="control quote-location-autocomplete"
            inputClass="control"
            placeholder="Select destination"
            dropdown
            :completeOnFocus="true"
            :minLength="0"
            :delay="150"
            emptySearchMessage="No matching location"
            @update:modelValue="updateLocationValue('destination', $event)"
            @complete="onGlobalReferenceComplete"
          >
            <template #option="{ option }">
              <div class="quote-location-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </AutoComplete>
        </div>

        <div class="field">
          <label class="label">Estimated Departure</label>
          <Calendar
            v-model="form.etd"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>

        <div class="field">
          <label class="label">Estimated Arrival</label>
          <Calendar
            v-model="form.eta"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>
      </div>

      <div class="summary-tiles mt-16">
        <div class="summary-tile">
          <span class="tile-label">{{ mode === "road" ? "No. of Pallets" : "No. of Pieces" }}</span>
          <strong>{{ totalPieces }}</strong>
          <small>{{ mode === "road" ? "Plts" : "Pcs" }}</small>
        </div>

        <div class="summary-tile">
          <span class="tile-label">Actual / Gross Weight</span>
          <strong>{{ totalActualWeight.toFixed(2) }}</strong>
          <small>KG</small>
        </div>

        <div v-if="mode === 'air'" class="summary-tile">
          <span class="tile-label">Volumetric Weight</span>
          <strong>{{ totalVolumetricWeight.toFixed(2) }}</strong>
          <small>KG</small>
        </div>

        <div class="summary-tile">
          <span class="tile-label">Chargeable Weight</span>
          <strong>{{ chargeableWeight.toFixed(2) }}</strong>
          <small>KG</small>
        </div>

        <div class="summary-tile">
          <span class="tile-label">Total Cube</span>
          <strong>{{ totalCbm.toFixed(3) }}</strong>
          <small>CBM</small>
        </div>

        <div v-if="mode === 'road'" class="summary-tile">
          <span class="tile-label">Loading Metres</span>
          <strong>{{ totalLdm.toFixed(2) }}</strong>
          <small>LDM</small>
        </div>

        <div v-if="mode === 'sea'" class="summary-tile">
          <span class="tile-label">Revenue Tonne</span>
          <strong>{{ revenueTonne.toFixed(3) }}</strong>
          <small>RT</small>
        </div>

        <div class="summary-tile">
          <span class="tile-label">Commodity</span>
          <strong>{{ form.commodity || "General" }}</strong>
          <small>&nbsp;</small>
        </div>
      </div>

      <div class="grid-4 mt-16">
        <div class="field">
          <label class="label">Commodity</label>
          <InputText v-model="form.commodity" class="control" placeholder="General cargo" />
        </div>

        <div v-if="mode === 'road'" class="field">
          <label class="label">Vehicle Type</label>
          <InputText v-model="form.vehicle_type" class="control" placeholder="FTL / LTL" />
        </div>

        <div v-if="mode === 'rail'" class="field">
          <label class="label">Cargo Class</label>
          <InputText v-model="form.cargo_class" class="control" placeholder="Cargo class" />
        </div>

        <div v-if="mode === 'sea' || mode === 'rail'" class="field">
          <label class="label">Container Type</label>
          <Select
            v-model="form.container_type"
            :options="containerOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select container"
          />
        </div>

        <div v-if="mode === 'sea'" class="field">
          <label class="label">Load Type</label>
          <InputText v-model="form.load_type" class="control" placeholder="FCL / LCL" />
        </div>
      </div>

      <div class="table-head-row">
        <div class="section-subtitle">Package Details</div>
        <Button class="btn-add" type="button" outlined @click="addDimensionRow">+ Add Row</Button>
      </div>

      <div class="table-wrap">
        <table class="quote-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Packaging</th>
              <th class="quote-table__compact-heading">Qty</th>
              <th class="quote-table__compact-heading">Length</th>
              <th class="quote-table__compact-heading">Width</th>
              <th class="quote-table__compact-heading">Height</th>
              <th>Gross KG</th>
              <th v-if="mode === 'air'">Vol. Wt (KG)</th>
              <th>CBM</th>
              <th v-if="mode === 'road'">LDM</th>
              <th v-if="mode === 'sea' || mode === 'rail'">Container</th>
              <th class="quote-table__check-heading">ADR</th>
              <th class="quote-table__check-heading">Stackable</th>
              <th class="quote-table__check-heading">Non-Stack</th>
              <th class="quote-table__check-heading">Top-Loadable</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, index) in dimensionRows" :key="row.id">
              <td>{{ index + 1 }}</td>
              <td>
                <Select
                  v-model="row.package_type"
                  :options="packageTypeOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="table-select wide"
                  placeholder="Select charge description"
                  filter
                  autoFilterFocus
                  editable
                  showClear
                  :loading="chargeDescriptionsLoading"
                />
              </td>
              <td class="quote-table__compact-cell">
                <InputNumber
                  v-model="row.pieces"
                  inputClass="table-input table-input--compact"
                  :min="1"
                  :max="9999"
                />
              </td>
              <td class="quote-table__compact-cell">
                <InputNumber
                  v-model="row.length"
                  inputClass="table-input table-input--compact"
                  :min="0"
                  :max="9999"
                />
              </td>
              <td class="quote-table__compact-cell">
                <InputNumber
                  v-model="row.width"
                  inputClass="table-input table-input--compact"
                  :min="0"
                  :max="9999"
                />
              </td>
              <td class="quote-table__compact-cell">
                <InputNumber
                  v-model="row.height"
                  inputClass="table-input table-input--compact"
                  :min="0"
                  :max="9999"
                />
              </td>
              <td><InputNumber v-model="row.weight" inputClass="table-input" :min="0" /></td>
              <td v-if="mode === 'air'">{{ getRowVolumetricWeight(row).toFixed(2) }}</td>
              <td>{{ getRowCbm(row).toFixed(3) }}</td>
              <td v-if="mode === 'road'">{{ getRowLdm(row).toFixed(2) }}</td>
              <td v-if="mode === 'sea' || mode === 'rail'">
                <Select
                  v-model="row.container_type"
                  :options="containerOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="table-select"
                />
              </td>
              <td class="quote-table__check-cell">
                <Checkbox v-model="row.adr" binary />
              </td>
              <td class="quote-table__check-cell">
                <Checkbox
                  :model-value="getPackageStackOption(row) === 'stackable'"
                  binary
                  @update:model-value="setPackageStackOption(row, 'stackable')"
                />
              </td>
              <td class="quote-table__check-cell">
                <Checkbox
                  :model-value="getPackageStackOption(row) === 'non_stack'"
                  binary
                  @update:model-value="setPackageStackOption(row, 'non_stack')"
                />
              </td>
              <td class="quote-table__check-cell">
                <Checkbox
                  :model-value="getPackageStackOption(row) === 'top_loadable'"
                  binary
                  @update:model-value="setPackageStackOption(row, 'top_loadable')"
                />
              </td>
              <td>
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  text
                  rounded
                  type="button"
                  @click="removeDimensionRow(row.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <LoadPlannerPanel
        class="mt-16"
        :packages="loadPlannerPackages"
        :plan-ref="loadPlannerReference"
        reference-label="Quote Ref"
        :transport-mode="mode || 'road'"
        empty-message="Add package rows above or add a manual load unit here."
      />
    </section>

    <section v-if="canShowForm" class="card section">
      <QuoteStepHeader
        title="Goods Details & Charges"
        badge="STEP 5"
        subtitle="Goods description, hazardous details, charge lines, terms, and totals"
      />

      <div class="field">
        <label class="label">Description of Goods</label>
        <InputText
          v-model="form.goods_description"
          class="control"
          placeholder="e.g. General Cargo – Electronic Components"
        />
      </div>

      <div class="haz-row mt-16">
        <label class="toggle-line">
          <InputSwitch v-model="form.is_hazardous" />
          <span>Hazardous Goods</span>
          <strong>{{ form.is_hazardous ? "Yes" : "No" }}</strong>
        </label>
      </div>

      <div v-if="form.is_hazardous" class="haz-box mt-12">
        <div class="haz-badge">Hazardous</div>

        <div class="field">
          <label class="label">Hazardous Class</label>
          <Select
            v-model="form.hazardous_class"
            :options="hazardousClassOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select class"
          />
        </div>

        <div class="field">
          <label class="label">UN Number</label>
          <InputText v-model="form.un_number" class="control" placeholder="e.g. UN1234" />
        </div>

        <div class="field">
          <label class="label">Packing Group</label>
          <Select
            v-model="form.packing_group"
            :options="packingGroupOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select PG"
          />
        </div>
      </div>

      <div class="table-head-row">
        <div class="section-subtitle">Internal Buy Costs</div>
        <Button class="btn-add" type="button" outlined @click="addBuyCostLine()">+ Add Cost</Button>
      </div>

      <div class="table-wrap">
        <table class="quote-table quote-table--charges quote-table--buy-costs">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Supplier</th>
              <th>Qty</th>
              <th>UOM</th>
              <th>Unit Cost</th>
              <th>Mark-up</th>
              <th>Currency</th>
              <th>Ex. Rate</th>
              <th class="text-right">Net</th>
              <th class="quote-table__check-heading">Add to Sell</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(line, index) in buyCostLines" :key="line.id">
              <td>{{ index + 1 }}</td>
              <td>
                <Select
                  v-model="line.description"
                  :options="chargeDescriptionOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="table-select wide"
                  placeholder="Select charge description"
                  filter
                  autoFilterFocus
                  editable
                  showClear
                  :loading="chargeDescriptionsLoading"
                  @change="syncBuyLineToSell(line)"
                />
              </td>
              <td>
                <Select
                  v-model="line.supplier_id"
                  :options="supplierOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="table-select wide"
                  placeholder="Select supplier"
                  filter
                  autoFilterFocus
                  showClear
                  :loading="suppliersLoading"
                />
              </td>
              <td>
                <InputNumber
                  v-model="line.qty"
                  inputClass="table-input"
                  :min="0"
                  @update:modelValue="syncBuyLineToSell(line)"
                />
              </td>
              <td>
                <Select
                  v-model="line.uom"
                  :options="uomOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="table-select"
                  @change="syncBuyLineToSell(line)"
                />
              </td>
              <td>
                <InputNumber
                  v-model="line.unit_cost"
                  inputClass="table-input"
                  mode="decimal"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                  :min="0"
                  @update:modelValue="syncBuyLineToSell(line)"
                />
              </td>
              <td>
                <InputNumber
                  v-model="line.markup_percent"
                  inputClass="table-input"
                  suffix="%"
                  :minFractionDigits="0"
                  :maxFractionDigits="2"
                  :min="0"
                  @update:modelValue="syncBuyLineToSell(line)"
                />
              </td>
              <td>
                <Select
                  v-model="line.currency"
                  :options="currencyOptions"
                  optionLabel="value"
                  optionValue="value"
                  class="table-select table-select--currency"
                  @change="syncBuyLineToSell(line)"
                />
              </td>
              <td>
                <InputNumber
                  v-model="line.exchange_rate"
                  inputClass="table-input"
                  mode="decimal"
                  :minFractionDigits="4"
                  :maxFractionDigits="4"
                  :min="0"
                  @update:modelValue="syncBuyLineToSell(line)"
                />
              </td>
              <td class="text-right">{{ getChargeLineTotal(line).toFixed(2) }}</td>
              <td class="quote-table__check-cell">
                <Checkbox
                  :modelValue="Boolean(line.add_to_sell)"
                  binary
                  :inputId="`quote-buy-${line.id}-add-to-sell`"
                  @update:modelValue="toggleBuyLineAddToSell(line, Boolean($event))"
                />
              </td>
              <td>
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  text
                  rounded
                  type="button"
                  @click="removeBuyCostLine(line.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="quote-section-total">
        <span>Buy Total</span>
        <strong>{{ subtotalCostDisplay }}</strong>
      </div>

      <div class="table-head-row">
        <div class="section-subtitle">Customer-Facing Sell Charges</div>
        <Button class="btn-add" type="button" outlined @click="addSellChargeLine()"
          >+ Add Charge</Button
        >
      </div>

      <div class="table-wrap">
        <table class="quote-table quote-table--charges">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Qty</th>
              <th>UOM</th>
              <th>Unit Price</th>
              <th>Currency</th>
              <th>Ex. Rate</th>
              <th>VAT %</th>
              <th class="text-right">Net</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(line, index) in sellChargeLines" :key="line.id">
              <td>{{ index + 1 }}</td>
              <td>
                <Select
                  v-model="line.description"
                  :options="chargeDescriptionOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="table-select wide"
                />
              </td>
              <td><InputNumber v-model="line.qty" inputClass="table-input" :min="0" /></td>
              <td>
                <Select
                  v-model="line.uom"
                  :options="uomOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="table-select"
                />
              </td>
              <td>
                <InputNumber
                  v-model="line.unit_price"
                  inputClass="table-input"
                  mode="decimal"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                  :min="0"
                />
              </td>
              <td>
                <Select
                  v-model="line.currency"
                  :options="currencyOptions"
                  optionLabel="value"
                  optionValue="value"
                  class="table-select table-select--currency"
                />
              </td>
              <td>
                <InputNumber
                  v-model="line.exchange_rate"
                  inputClass="table-input"
                  mode="decimal"
                  :minFractionDigits="4"
                  :maxFractionDigits="4"
                  :min="0"
                />
              </td>
              <td>
                <InputNumber
                  v-model="line.vat_rate"
                  inputClass="table-input"
                  mode="decimal"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                  :min="0"
                />
              </td>
              <td class="text-right">{{ getChargeLineTotal(line).toFixed(2) }}</td>
              <td>
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  text
                  rounded
                  type="button"
                  @click="removeSellChargeLine(line.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="quote-section-total">
        <span>Sell Total</span>
        <strong>{{ subtotalSellDisplay }}</strong>
      </div>

      <div class="bottom-section">
        <div class="conditions-box">
          <div class="section-subtitle">Terms & Conditions</div>

          <div class="field">
            <label class="label">Preset Conditions</label>
            <Select
              v-model="form.conditions_preset"
              :options="conditionsOptions"
              optionLabel="label"
              optionValue="value"
              class="control"
              placeholder="Select preset"
              @change="onConditionsPresetChange"
            />
          </div>

          <div class="field">
            <label class="label">Conditions</label>
            <Textarea
              v-model="form.terms_conditions"
              class="control textarea"
              placeholder="Conditions of carriage..."
              autoResize
            />
          </div>

          <div class="field">
            <label class="label">Validity Period</label>
            <Select
              v-model="form.validity_period"
              :options="validityOptions"
              optionLabel="label"
              optionValue="value"
              class="control"
            />
          </div>

          <div class="field">
            <label class="label">Internal Notes (not printed)</label>
            <Textarea
              v-model="form.note"
              class="control textarea small-textarea"
              placeholder="Internal notes only..."
              autoResize
            />
          </div>
        </div>

        <div class="totals-card">
          <div class="section-subtitle text-right">Quote Totals</div>

          <div class="totals-box">
            <div class="totals-row">
              <span>Subtotal (Sell)</span><strong>{{ subtotalSellDisplay }}</strong>
            </div>
            <div class="totals-row">
              <span>Subtotal (Cost)</span><strong>{{ subtotalCostDisplay }}</strong>
            </div>

            <div class="totals-row">
              <span>Tax Rate</span>
              <Select
                v-model="form.tax_rate"
                :options="taxRateOptions"
                optionLabel="label"
                optionValue="value"
                class="totals-select"
              />
            </div>

            <div class="totals-row">
              <span>Tax on Sell</span><strong>{{ taxAmountDisplay }}</strong>
            </div>
            <div class="totals-row">
              <span>Total excl. Tax</span><strong>{{ totalExclTaxDisplay }}</strong>
            </div>
            <div class="totals-row grand">
              <span>Total incl. Tax</span><strong>{{ totalInclTaxDisplay }}</strong>
            </div>
            <div class="totals-row profit">
              <span>Profit Total</span><strong>{{ profitTotalDisplay }}</strong>
            </div>
            <div class="totals-row profit">
              <span>Profit %</span><strong>{{ profitPercentDisplay }}</strong>
            </div>
          </div>

          <div class="final-actions">
            <span
              class="quote-draft-status"
              :class="`quote-draft-status--${autosaveState}`"
              role="status"
            >
              <i
                class="pi"
                :class="autosaveState === 'error' ? 'pi-exclamation-triangle' : 'pi-cloud'"
              />
              {{ autosaveStatus }}
            </span>

            <Button class="btn" outlined type="button" :disabled="saving" @click="onCancel"
              >Cancel</Button
            >

            <Button
              class="btn quote-save-draft"
              outlined
              type="button"
              :loading="autosaveState === 'saving'"
              :disabled="saving"
              @click="onSaveDraft"
            >
              <i v-if="autosaveState !== 'saving'" class="pi pi-save" />
              Save as Draft
            </Button>

            <Button
              class="btn orbis-primary"
              type="button"
              :loading="saving"
              :disabled="saving"
              @click="onSave"
            >
              <i v-if="!saving" class="pi pi-check" style="margin-right: 8px" />
              {{ saveButtonLabel }}
            </Button>
          </div>
        </div>
      </div>
    </section>

    <Dialog
      v-model:visible="leaveDraftDialogVisible"
      modal
      :closable="false"
      :closeOnEscape="false"
      :dismissableMask="false"
      header="Leave Quote Builder?"
      class="quote-leave-dialog"
    >
      <div class="quote-leave-dialog__body">
        <span class="quote-leave-dialog__icon"><i class="pi pi-exclamation-triangle" /></span>
        <div>
          <p>Would you like to save the current quote as a draft before leaving?</p>
          <small>
            Previously autosaved information will remain in the existing draft. Choosing “Leave
            Without Saving” discards only the latest pending changes.
          </small>
        </div>
      </div>

      <template #footer>
        <Button
          label="Stay on Quote"
          severity="secondary"
          text
          type="button"
          :disabled="leaveDraftDialogSaving"
          @click="stayOnQuote"
        />
        <Button
          label="Leave Without Saving"
          severity="danger"
          outlined
          type="button"
          :disabled="leaveDraftDialogSaving || autosaveState === 'saving'"
          @click="leaveWithoutSavingLatestChanges"
        />
        <Button
          label="Save Draft & Leave"
          icon="pi pi-save"
          type="button"
          :loading="leaveDraftDialogSaving"
          @click="saveDraftAndLeave"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import "./QuoteCreatePage.css"

import AutoComplete from "primevue/autocomplete"
import InputText from "primevue/inputtext"
import Calendar from "primevue/calendar"
import Textarea from "primevue/textarea"
import Button from "primevue/button"
import Select from "primevue/select"
import InputNumber from "primevue/inputnumber"
import InputSwitch from "primevue/inputswitch"
import Checkbox from "primevue/checkbox"
import Dialog from "primevue/dialog"

import ModeSelector from "@/app/components/jobs/ModeSelector.vue"
import LoadPlannerPanel from "@/app/components/load-planner/LoadPlannerPanel.vue"
import QuoteStepHeader from "@/app/components/quotes/create/QuoteStepHeader.vue"
import QuoteTypeSelector from "@/app/components/quotes/create/QuoteTypeSelector.vue"
import { useQuoteCreatePage } from "./QuoteCreatePage"

const {
  pageTitle,
  pageStatusLabel,
  formTitle,
  saveButtonLabel,
  autosaveStatus,
  autosaveState,
  leaveDraftDialogVisible,
  leaveDraftDialogSaving,
  saving,
  error,

  QUOTE_TYPES,
  availableModes,
  quoteType,
  mode,
  quoteTypeLabel,
  modeLabel,
  showModeSelector,
  canShowForm,

  form,
  selectedCustomer,
  selectedContactIndex,
  customerSuggestions,
  contactOptions,
  accountNumberPreview,
  originLocationOptions,
  destinationLocationOptions,
  onGlobalReferenceComplete,
  updateLocationValue,

  currencyOptions,
  incotermOptions,
  containerOptions,
  uomOptions,
  chargeDescriptionOptions,
  chargeDescriptionsLoading,
  supplierOptions,
  suppliersLoading,
  hazardousClassOptions,
  packingGroupOptions,
  conditionsOptions,
  validityOptions,
  taxRateOptions,
  packageTypeOptions,

  dimensionRows,
  buyCostLines,
  sellChargeLines,

  totalPieces,
  totalActualWeight,
  totalVolumetricWeight,
  chargeableWeight,
  totalCbm,
  totalLdm,
  revenueTonne,
  loadPlannerPackages,
  loadPlannerReference,

  subtotalSellDisplay,
  subtotalCostDisplay,
  totalExclTaxDisplay,
  taxAmountDisplay,
  totalInclTaxDisplay,
  profitTotalDisplay,
  profitPercentDisplay,

  selectQuoteType,
  selectMode,
  customerOptionLabel,
  onCustomerComplete,
  onCustomerSelect,
  onCustomerClear,
  addDimensionRow,
  removeDimensionRow,
  getPackageStackOption,
  setPackageStackOption,
  addBuyCostLine,
  addSellChargeLine,
  removeBuyCostLine,
  removeSellChargeLine,
  syncBuyLineToSell,
  toggleBuyLineAddToSell,
  getRowCbm,
  getRowVolumetricWeight,
  getRowLdm,
  getChargeLineTotal,
  onConditionsPresetChange,
  onBrowseQuotes,
  onFindQuote,
  onSave,
  onSaveDraft,
  saveDraftAndLeave,
  leaveWithoutSavingLatestChanges,
  stayOnQuote,
  onCancel,
} = useQuoteCreatePage()
</script>
