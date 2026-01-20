<template>
  <div class="contact-create-page">
    <ConfirmDialog />
    <div class="header">
      <div class="left">
        <h1 class="title">{{ isEdit ? "Edit Contact" : "Create Contact" }}</h1>
        <p class="subtitle">{{ isEdit ? "Edit a contact and at least 1 contact person." : "Create a contact and at least 1 contact person." }}</p>
      </div>

      <div class="right">
        <Button outlined class="orbis-primary" icon="pi pi-arrow-left" label="Back" @click="goBack" />
        <Button
          class="btn-primary"
          icon="pi pi-save"
          label="Save Contact"
          :loading="saving"
          :disabled="!canSubmit"
          @click="submit"
        />
      </div>
    </div>

    <div class="grid">
      <!-- Contact details -->
      <div class="card">
        <div class="card-title">Contact Details</div>

        <div class="form">
          <div class="field">
            <label>Contact Type</label>
            <Dropdown
              v-model="form.contact_type"
              :options="contactTypeOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              :disabled="typeLocked"
            />
            <small v-if="errors.contact_type" class="error">{{ errors.contact_type }}</small>
          </div>

          <div class="field">
            <label>Address</label>
            <InputText v-model="form.address" class="w-full" placeholder="e.g. London, UK" />
          </div>

          <div class="row">
            <div class="field">
              <label>Country (2-letter)</label>
              <InputText v-model="form.country" class="w-full" placeholder="GB" maxlength="2" />
            </div>

            <div class="field">
              <label>Currency (3-letter)</label>
              <InputText v-model="form.currency_preference" class="w-full" placeholder="GBP" maxlength="3" />
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label>EORI</label>
              <InputText v-model="form.eori" class="w-full" placeholder="Optional" />
            </div>

            <div class="field">
              <label>Credit Limit</label>
              <InputNumber v-model="form.credit_limit" class="w-full" :min="0" :useGrouping="true" />
            </div>
          </div>

          <div class="field">
            <label>Status</label>
            <Dropdown v-model="form.status" :options="statusOptions" class="w-full" />
          </div>
        </div>
      </div>

      <!-- Contact people -->
      <div class="card">
        <div class="card-title people-header">
          <span>Contact People</span>
          <Button text icon="pi pi-plus" class="orbis-primary" label="Add Person" @click="addPerson" />
        </div>

        <div v-if="errors.people" class="people-error">
          {{ errors.people }}
        </div>

        <div class="people">
          <div v-for="(p, idx) in people" :key="p._key" class="person">
            <div class="person-top">
              <strong>Person {{ idx + 1 }}</strong>

              <Button
                text
                severity="danger"
                icon="pi pi-trash"
                label="Remove"
                :disabled="people.length <= 1"
                @click="removePerson(idx)"
              />
            </div>

            <div class="form">
              <div class="field">
                <label>Name *</label>
                <InputText v-model="p.name" class="w-full" placeholder="Full name" />
                <small v-if="personErrors[idx]?.name" class="error">{{ personErrors[idx].name }}</small>
              </div>

              <div class="row">
                <div class="field">
                  <label>Email</label>
                  <InputText v-model="p.email" class="w-full" placeholder="Optional" />
                  <small v-if="personErrors[idx]?.email" class="error">{{ personErrors[idx].email }}</small>
                </div>

                <div class="field">
                  <label>Phone</label>
                  <InputText v-model="p.phone" class="w-full" placeholder="Optional" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hint">
          Minimum of <strong>1</strong> contact person is required.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "./ContactCreatePage.css"
import { useContactCreatePage } from "./ContactCreatePage"

const {
  form,
  people,
  errors,
  personErrors,
  saving,
  canSubmit,
  contactTypeOptions,
  statusOptions,
  typeLocked,
  addPerson,
  removePerson,
  submit,
  goBack,
  isEdit,
} = useContactCreatePage()
</script>
