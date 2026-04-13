<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <section class="rail-card">
    <div class="rail-card__header">
      <h3 class="rail-card__title">Documents & Attachments</h3>
    </div>

    <div class="rail-card__body">
      <div class="rail-grid rail-grid--3" style="margin-bottom: 16px">
        <div class="rail-field">
          <label>SMGS Consignment Note</label>
          <select :disabled="disabled">
            <option value="">Not yet issued</option>
            <option>Attached – Uploaded</option>
            <option>Sent separately</option>
          </select>
        </div>

        <div class="rail-field">
          <label>Commercial Invoice Ref</label>
          <input type="text" :disabled="disabled" placeholder="INV-2026-XXXXX" />
        </div>

        <div class="rail-field">
          <label>Packing List Ref</label>
          <input type="text" :disabled="disabled" placeholder="PL-2026-XXXXX" />
        </div>

        <div class="rail-field">
          <label>Certificate of Origin</label>
          <select :disabled="disabled">
            <option value="">Not required</option>
            <option>Required – Pending</option>
            <option>Received – Attached</option>
          </select>
        </div>

        <div class="rail-field">
          <label>Phytosanitary Certificate</label>
          <select :disabled="disabled">
            <option value="">Not required</option>
            <option>Required – Pending</option>
            <option>Received</option>
          </select>
        </div>

        <div class="rail-field">
          <label>T1 / Transit Document</label>
          <select :disabled="disabled">
            <option value="">Not required</option>
            <option>Pending</option>
            <option>Issued</option>
          </select>
        </div>
      </div>

      <div class="rail-note">
        Drop files here or connect your backend upload component for PDF, JPG, PNG, DOCX, XLSX.
      </div>
    </div>
  </section>
</template>
