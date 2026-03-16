<script setup lang="ts">
import "./AccountsTaxCodesSection.css"

import Button from "primevue/button"
import InputText from "primevue/inputtext"

type TaxCodeRow = {
  id: number
  country: string
  code: string
  taxCode: string
  rate: string
  description: string
}

const country = "United Kingdom"
const countryCode = "GB"
const taxCode = "UK20"
const rate = "20"
const description = "Standard VAT"

const taxCodes: TaxCodeRow[] = [
  {
    id: 1,
    country: "United Kingdom",
    code: "GB",
    taxCode: "UK20",
    rate: "20.00",
    description: "Standard VAT",
  },
  {
    id: 2,
    country: "United Kingdom",
    code: "GB",
    taxCode: "GBZR",
    rate: "0.00",
    description: "Zero Rated",
  },
  {
    id: 3,
    country: "Germany",
    code: "DE",
    taxCode: "EUZR",
    rate: "0.00",
    description: "EU Reverse Charge / Zero Rated",
  },
  {
    id: 4,
    country: "Türkiye",
    code: "TR",
    taxCode: "TR0",
    rate: "0.00",
    description: "Export Zero Rated",
  },
]
</script>

<template>
  <div class="accounts-tax-codes">
    <section class="accounts-tax-codes__panel">
      <div class="accounts-tax-codes__head">
        <div>
          <div class="accounts-tax-codes__eyebrow">TAX CODES</div>
          <h2 class="accounts-tax-codes__title">Country tax matrix for customer invoicing</h2>
        </div>
      </div>

      <div class="accounts-tax-codes__form-grid">
        <div class="accounts-tax-codes__field">
          <label>Country</label>
          <InputText :model-value="country" />
        </div>

        <div class="accounts-tax-codes__field">
          <label>Country Code</label>
          <InputText :model-value="countryCode" />
        </div>

        <div class="accounts-tax-codes__field">
          <label>Tax Code</label>
          <InputText :model-value="taxCode" />
        </div>

        <div class="accounts-tax-codes__field">
          <label>Rate %</label>
          <InputText :model-value="rate" />
        </div>

        <div class="accounts-tax-codes__field">
          <label>Description</label>
          <InputText :model-value="description" />
        </div>
      </div>

      <div class="accounts-tax-codes__add-row">
        <Button label="Add Tax Code" class="btn btn--primary" />
      </div>

      <div class="accounts-tax-codes__table-wrap">
        <table class="accounts-tax-codes__table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Code</th>
              <th>Tax Code</th>
              <th>Rate %</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in taxCodes" :key="row.id">
              <td>{{ row.country }}</td>
              <td>{{ row.code }}</td>
              <td>{{ row.taxCode }}</td>
              <td>{{ row.rate }}</td>
              <td>{{ row.description }}</td>
              <td>
                <div class="accounts-tax-codes__table-actions">
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
