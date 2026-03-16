<script setup lang="ts">
import "./AccountsChargeCodesSection.css"

import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"

type ChargeCodeRow = {
  id: number
  chargeDescription: string
  purchaseNominal: string
  salesNominal: string
  mot: string
  taxCode: string
}

const chargeDescription = "Ocean Freight"
const purchaseNominal = "5000"
const salesNominal = "4000"
const selectedMot = "sea"
const taxCode = "UK20"

const motOptions = [
  { label: "Sea", value: "sea" },
  { label: "Air", value: "air" },
  { label: "Road", value: "road" },
  { label: "Warehouse", value: "warehouse" },
]

const chargeCodes: ChargeCodeRow[] = [
  {
    id: 1,
    chargeDescription: "Ocean Freight",
    purchaseNominal: "5000",
    salesNominal: "4000",
    mot: "Sea",
    taxCode: "GBZR",
  },
  {
    id: 2,
    chargeDescription: "Air Freight",
    purchaseNominal: "5100",
    salesNominal: "4100",
    mot: "Air",
    taxCode: "EUZR",
  },
  {
    id: 3,
    chargeDescription: "Road Freight",
    purchaseNominal: "5200",
    salesNominal: "4200",
    mot: "Road",
    taxCode: "TR0",
  },
  {
    id: 4,
    chargeDescription: "Warehouse Storage",
    purchaseNominal: "5300",
    salesNominal: "4300",
    mot: "Warehouse",
    taxCode: "UK20",
  },
]
</script>

<template>
  <div class="accounts-charge-codes">
    <section class="accounts-charge-codes__panel">
      <div class="accounts-charge-codes__head">
        <div>
          <div class="accounts-charge-codes__eyebrow">CHARGE DESCRIPTIONS &amp; NOMINAL CODES</div>
          <h2 class="accounts-charge-codes__title">Charge master with MOT and tax mapping</h2>
        </div>

        <div class="accounts-charge-codes__actions">
          <Button label="Import CSV" class="btn btn--ghost" />
          <Button label="Export CSV" class="btn btn--ghost" />
        </div>
      </div>

      <div class="accounts-charge-codes__form-grid">
        <div class="accounts-charge-codes__field accounts-charge-codes__field--wide">
          <label>Charge Description</label>
          <InputText :model-value="chargeDescription" />
        </div>

        <div class="accounts-charge-codes__field">
          <label>Purchase Nominal</label>
          <InputText :model-value="purchaseNominal" />
        </div>

        <div class="accounts-charge-codes__field">
          <label>Sales Nominal</label>
          <InputText :model-value="salesNominal" />
        </div>

        <div class="accounts-charge-codes__field">
          <label>MOT</label>
          <Dropdown
            :model-value="selectedMot"
            :options="motOptions"
            option-label="label"
            option-value="value"
            class="accounts-charge-codes__control"
          />
        </div>

        <div class="accounts-charge-codes__field">
          <label>Tax Code</label>
          <InputText :model-value="taxCode" />
        </div>
      </div>

      <div class="accounts-charge-codes__add-row">
        <Button label="Add Charge" class="btn btn--primary" />
      </div>

      <div class="accounts-charge-codes__table-wrap">
        <table class="accounts-charge-codes__table">
          <thead>
            <tr>
              <th>Charge Description</th>
              <th>Purchase Nominal</th>
              <th>Sales Nominal</th>
              <th>MOT</th>
              <th>Tax Code</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in chargeCodes" :key="row.id">
              <td>{{ row.chargeDescription }}</td>
              <td>{{ row.purchaseNominal }}</td>
              <td>{{ row.salesNominal }}</td>
              <td>{{ row.mot }}</td>
              <td>{{ row.taxCode }}</td>
              <td>
                <div class="accounts-charge-codes__table-actions">
                  <Button label="Edit" class="btn btn--ghost" />
                  <Button label="Delete" class="btn btn--ghost" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
