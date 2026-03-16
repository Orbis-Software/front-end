<script setup lang="ts">
import "./AccountsClientBankDetailsSection.css"

import Button from "primevue/button"
import InputText from "primevue/inputtext"

type BankAccountRow = {
  id: number
  account: string
  currency: string
  branch: string
  accountNo: string
  sortCode: string
  iban: string
  swift: string
  bank: string
  country: string
}

const accountName = "PC Cargo UK Ltd - GBP"
const branchName = "London City Branch"
const prefix = "00"
const currency = "GBP"
const accountNumber = "12345678"
const sortCode = "12-34-56"
const bic = "BARCGB22"
const swift = "BARCGB22"
const iban = "GB00BARC12345612345678"
const bankName = "Barclays Bank PLC"
const addressLine1 = "1 Bank Street"
const addressLine2 = "Canary Wharf"
const addressLine3 = "Floor / Building"
const city = "London"
const countyState = "Greater London"
const postCodeZip = "E14 5HP"
const countryCode = "GB"

const bankAccounts: BankAccountRow[] = [
  {
    id: 1,
    account: "PC Cargo UK Ltd - GBP",
    currency: "GBP",
    branch: "London City Branch",
    accountNo: "12345678",
    sortCode: "12-34-56",
    iban: "GB12BARC12345612345678",
    swift: "BARCGB22",
    bank: "Barclays Bank PLC",
    country: "GB",
  },
  {
    id: 2,
    account: "PC Cargo UK Ltd - EUR",
    currency: "EUR",
    branch: "International Payments",
    accountNo: "99887766",
    sortCode: "",
    iban: "GB29LOYD30927699887766",
    swift: "LOYDGB2L",
    bank: "Lloyds Bank",
    country: "GB",
  },
]
</script>

<template>
  <div class="accounts-client-bank-details">
    <section class="accounts-client-bank-details__panel">
      <div class="accounts-client-bank-details__head">
        <div>
          <div class="accounts-client-bank-details__eyebrow">CLIENT BANK DETAILS</div>
          <h2 class="accounts-client-bank-details__title">Business bank accounts by currency</h2>
        </div>
      </div>

      <div class="accounts-client-bank-details__form-grid">
        <div class="accounts-client-bank-details__field">
          <label>Account Name</label>
          <InputText :model-value="accountName" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Branch Name</label>
          <InputText :model-value="branchName" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Prefix</label>
          <InputText :model-value="prefix" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Currency</label>
          <InputText :model-value="currency" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Account Number</label>
          <InputText :model-value="accountNumber" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Sort Code</label>
          <InputText :model-value="sortCode" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>BIC</label>
          <InputText :model-value="bic" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>SWIFT</label>
          <InputText :model-value="swift" />
        </div>

        <div class="accounts-client-bank-details__field accounts-client-bank-details__field--wide">
          <label>IBAN</label>
          <InputText :model-value="iban" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Bank Name</label>
          <InputText :model-value="bankName" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Address Line 1</label>
          <InputText :model-value="addressLine1" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Address Line 2</label>
          <InputText :model-value="addressLine2" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Address Line 3</label>
          <InputText :model-value="addressLine3" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>City</label>
          <InputText :model-value="city" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>County / State</label>
          <InputText :model-value="countyState" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Post Code / ZIP</label>
          <InputText :model-value="postCodeZip" />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Country Code</label>
          <InputText :model-value="countryCode" />
        </div>
      </div>

      <div class="accounts-client-bank-details__add-row">
        <Button label="Add Bank Account" class="btn btn--primary" />
      </div>

      <div class="accounts-client-bank-details__table-wrap">
        <table class="accounts-client-bank-details__table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Currency</th>
              <th>Branch</th>
              <th>Account No.</th>
              <th>Sort Code</th>
              <th>IBAN</th>
              <th>SWIFT</th>
              <th>Bank</th>
              <th>Country</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in bankAccounts" :key="row.id">
              <td>{{ row.account }}</td>
              <td>{{ row.currency }}</td>
              <td>{{ row.branch }}</td>
              <td>{{ row.accountNo }}</td>
              <td>{{ row.sortCode || "-" }}</td>
              <td>{{ row.iban }}</td>
              <td>{{ row.swift }}</td>
              <td>{{ row.bank }}</td>
              <td>{{ row.country }}</td>
              <td>
                <div class="accounts-client-bank-details__table-actions">
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
