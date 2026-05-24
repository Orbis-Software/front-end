<script setup lang="ts">
import "./AccountsClientBankDetailsSection.css"

import { reactive, ref } from "vue"
import Button from "primevue/button"
import InputText from "primevue/inputtext"

import { useAccountsDemo } from "@/app/composables/useAccountsDemo"

const { state, saveState } = useAccountsDemo()
const editingId = ref("")
const form = reactive({
  account: "PC Cargo UK Ltd - GBP",
  branch: "London City Branch",
  prefix: "00",
  currency: "GBP",
  accountNo: "12345678",
  sortCode: "12-34-56",
  bic: "BARCGB22",
  swift: "BARCGB22",
  iban: "GB00BARC12345612345678",
  bank: "Barclays Bank PLC",
  addressLine1: "1 Bank Street",
  addressLine2: "Canary Wharf",
  addressLine3: "Floor / Building",
  city: "London",
  countyState: "Greater London",
  postCodeZip: "E14 5HP",
  country: "GB",
})

function resetForm() {
  editingId.value = ""
  Object.keys(form).forEach(key => {
    form[key as keyof typeof form] = ""
  })
}

function saveBankAccount() {
  const record = {
    id: editingId.value || `BANK-${Date.now()}`,
    ...form,
    currency: form.currency.toUpperCase(),
    country: form.country.toUpperCase(),
  }
  const index = state.bankAccounts.findIndex(row => row.id === editingId.value)
  if (index >= 0) state.bankAccounts[index] = record
  else state.bankAccounts.unshift(record)
  saveState()
  resetForm()
}

function editBankAccount(id: string) {
  const row = state.bankAccounts.find(item => item.id === id)
  if (!row) return
  editingId.value = id
  Object.assign(form, row)
}

function deleteBankAccount(id: string) {
  state.bankAccounts = state.bankAccounts.filter(row => row.id !== id)
  saveState()
}
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
          <InputText v-model="form.account" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Branch Name</label>
          <InputText v-model="form.branch" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Prefix</label>
          <InputText v-model="form.prefix" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Currency</label>
          <InputText v-model="form.currency" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Account Number</label>
          <InputText v-model="form.accountNo" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Sort Code</label>
          <InputText v-model="form.sortCode" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>BIC</label>
          <InputText v-model="form.bic" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>SWIFT</label>
          <InputText v-model="form.swift" />
        </div>
        <div class="accounts-client-bank-details__field accounts-client-bank-details__field--wide">
          <label>IBAN</label>
          <InputText v-model="form.iban" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Bank Name</label>
          <InputText v-model="form.bank" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Address Line 1</label>
          <InputText v-model="form.addressLine1" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Address Line 2</label>
          <InputText v-model="form.addressLine2" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Address Line 3</label>
          <InputText v-model="form.addressLine3" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>City</label>
          <InputText v-model="form.city" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>County / State</label>
          <InputText v-model="form.countyState" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Post Code / ZIP</label>
          <InputText v-model="form.postCodeZip" />
        </div>
        <div class="accounts-client-bank-details__field">
          <label>Country Code</label>
          <InputText v-model="form.country" />
        </div>
      </div>

      <div class="accounts-client-bank-details__add-row">
        <Button
          :label="editingId ? 'Save Bank Account' : 'Add Bank Account'"
          class="btn btn--primary"
          @click="saveBankAccount"
        />
        <Button v-if="editingId" label="Cancel Edit" class="btn btn--ghost" @click="resetForm" />
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
            <tr v-for="row in state.bankAccounts" :key="row.id">
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
                  <Button label="Edit" class="btn btn--ghost" @click="editBankAccount(row.id)" />
                  <Button
                    label="Delete"
                    class="btn btn--ghost"
                    @click="deleteBankAccount(row.id)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
