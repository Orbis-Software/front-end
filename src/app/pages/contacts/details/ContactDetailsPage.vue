<script setup lang="ts">
import "./ContactDetailsPage.css"
import { useContactDetailsPage } from "./useContactDetailsPage"

import Button from "primevue/button"

import ContactDetailsTabs from "@/app/components/contacts/ContactDetailsTabs.vue"
import ContactOverviewTab from "@/app/components/contacts/overview/ContactOverviewTab.vue"
import BranchesBillingTab from "@/app/components/contacts/BranchesBillingTab.vue"
import CollectionAddressesTab from "@/app/components/contacts/CollectionAddressesTab.vue"
import ContactWeightChargesTab from "@/app/components/contacts/weight-charges/ContactWeightChargesTab.vue"
import ContactCustomerChargesTab from "@/app/components/contacts/customer-charges/ContactCustomerChargesTab.vue"

const {
  loading,
  contact,
  activeTab,
  setTab,

  onEditContact,

  addBranch,
  removeBranch,
  saveBranch,

  addCollectionAddress,
  saveCollectionAddress,
  removeCollectionAddressById,

  load,
} = useContactDetailsPage()
</script>

<template>
  <section class="contact-details-page">
    <div v-if="!contact" class="contact-details-page__loading">Loading...</div>

    <template v-else>
      <div class="contact-header-card">
        <div class="contact-header-main">
          <div class="contact-header-left">
            <div class="contact-title">{{ contact.company_name || "Contact" }}</div>

            <div class="contact-meta">
              <span class="contact-meta__pill">
                <span class="contact-meta__label">Account</span>
                <span class="contact-meta__value">{{ contact.account_number || "-" }}</span>
              </span>

              <span class="contact-meta__item">
                {{ contact.collection_addresses?.length ?? 0 }} addresses
              </span>

              <span class="contact-meta__item"> {{ contact.branches?.length ?? 0 }} branches </span>
            </div>
          </div>

          <div class="contact-actions">
            <Button
              type="button"
              class="contact-action-btn contact-action-btn--primary"
              icon="pi pi-pencil"
              label="Edit customer"
              @click="onEditContact"
            />
          </div>
        </div>

        <ContactDetailsTabs
          :active="activeTab"
          :counts="{
            branches: contact.branches?.length ?? 0,
            collections: contact.collection_addresses?.length ?? 0,
          }"
          @change="setTab"
        />
      </div>

      <div class="contact-content-shell">
        <div v-if="loading" class="contact-details-page__loading">Loading...</div>

        <template v-else>
          <ContactOverviewTab v-if="activeTab === 'overview'" :contact="contact" />

          <BranchesBillingTab
            v-else-if="activeTab === 'branches'"
            :branches="contact.branches ?? []"
            @add="addBranch"
            @remove="removeBranch"
            @save="saveBranch"
          />

          <CollectionAddressesTab
            v-else-if="activeTab === 'collections'"
            :items="contact.collection_addresses ?? []"
            @add="addCollectionAddress"
            @remove="removeCollectionAddressById"
            @save="saveCollectionAddress"
            @cancel="load"
          />

          <ContactWeightChargesTab v-else-if="activeTab === 'weight_break'" />

          <ContactCustomerChargesTab v-else-if="activeTab === 'customer'" />
        </template>
      </div>
    </template>
  </section>
</template>
