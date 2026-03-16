<script setup lang="ts">
import "./AccountsExchangeRatesSection.css"

import Button from "primevue/button"
import Calendar from "primevue/calendar"
import InputText from "primevue/inputtext"

type ExchangeRateRow = {
  id: number
  base: string
  quote: string
  rate: string
  effectiveDate: string
}

const baseCurrency = "GBP"
const quoteCurrency = "EUR"
const rate = "1.1700"
const effectiveDate = new Date("2026-03-10")

const exchangeRates: ExchangeRateRow[] = [
  {
    id: 1,
    base: "GBP",
    quote: "EUR",
    rate: "1.1700",
    effectiveDate: "2026-03-10",
  },
  {
    id: 2,
    base: "GBP",
    quote: "USD",
    rate: "1.2800",
    effectiveDate: "2026-03-10",
  },
  {
    id: 3,
    base: "EUR",
    quote: "USD",
    rate: "1.0900",
    effectiveDate: "2026-03-10",
  },
]
</script>

<template>
  <div class="accounts-exchange-rates">
    <section class="accounts-exchange-rates__panel">
      <div class="accounts-exchange-rates__head">
        <div>
          <div class="accounts-exchange-rates__eyebrow">EXCHANGE RATES</div>
          <h2 class="accounts-exchange-rates__title">Manual entry and CSV upload</h2>
        </div>

        <div class="accounts-exchange-rates__actions">
          <Button label="Import CSV" class="btn btn--ghost" />
          <Button label="Export CSV" class="btn btn--ghost" />
        </div>
      </div>

      <div class="accounts-exchange-rates__form-grid">
        <div class="accounts-exchange-rates__field">
          <label>Base Currency</label>
          <InputText :model-value="baseCurrency" />
        </div>

        <div class="accounts-exchange-rates__field">
          <label>Quote Currency</label>
          <InputText :model-value="quoteCurrency" />
        </div>

        <div class="accounts-exchange-rates__field">
          <label>Rate</label>
          <InputText :model-value="rate" />
        </div>

        <div class="accounts-exchange-rates__field">
          <label>Effective Date</label>
          <Calendar
            :model-value="effectiveDate"
            date-format="dd/mm/yy"
            show-icon
            class="accounts-exchange-rates__calendar"
          />
        </div>
      </div>

      <div class="accounts-exchange-rates__add-row">
        <Button label="Add Exchange Rate" class="btn btn--primary" />
      </div>

      <div class="accounts-exchange-rates__table-wrap">
        <table class="accounts-exchange-rates__table">
          <thead>
            <tr>
              <th>Base</th>
              <th>Quote</th>
              <th>Rate</th>
              <th>Effective Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in exchangeRates" :key="row.id">
              <td>{{ row.base }}</td>
              <td>{{ row.quote }}</td>
              <td>{{ row.rate }}</td>
              <td>{{ row.effectiveDate }}</td>
              <td>
                <div class="accounts-exchange-rates__table-actions">
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
