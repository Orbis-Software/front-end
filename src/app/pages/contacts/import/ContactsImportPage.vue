<!-- src/app/pages/contacts/import/ContactsImportPage.vue -->
<script setup lang="ts">
import './ContactsImportPage.css'
import { useContactsImportPage } from './ContactsImportPage'

const {
  companyName,
  file,
  importing,
  result,
  errorMessage,
  canImport,
  onFileSelect,
  onImport,
} = useContactsImportPage()
</script>

<template>
  <div class="contacts-import-page">
    <div class="page-header">
      <div>
        <div class="page-title">Import Contacts</div>
        <div class="page-subtitle">
          Upload a CSV or Excel file to import into <b>{{ companyName }}</b>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="row">
        <label class="label">CSV / Excel File</label>
        <input
          class="input"
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          @change="onFileSelect"
        />
        <div v-if="file" class="hint">Selected: {{ file.name }}</div>
      </div>

      <div class="actions">
        <button class="btn primary" :disabled="!canImport" @click="onImport">
          {{ importing ? 'Importing…' : 'Import File' }}
        </button>
      </div>

      <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>

      <div v-if="result" class="result">
        <div class="alert success">
          Import finished: Created {{ result.created }}, Updated {{ result.updated }}, Skipped {{ result.skipped }}
        </div>

        <div v-if="result.errors.length" class="errors">
          <div class="errors-title">Row Errors</div>
          <div class="errors-list">
            <div v-for="(e, idx) in result.errors" :key="idx" class="error-row">
              Row {{ e.row }}: {{ e.message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
