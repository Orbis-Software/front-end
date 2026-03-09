<script setup lang="ts">
import "./ContactDetailsPage.css"
import { useContactDetailsPage } from "./useContactDetailsPage"

import Button from "primevue/button"

import ContactDetailsTabs from "@/app/components/contacts/ContactDetailsTabs.vue"
import ContactOverviewTab from "@/app/components/contacts/ContactOverviewTab.vue"
import BranchesBillingTab from "@/app/components/contacts/BranchesBillingTab.vue"
import CollectionAddressesTab from "@/app/components/contacts/CollectionAddressesTab.vue"
import ContactWeightChargesTab from "@/app/components/contacts/weight-charges/ContactWeightChargesTab.vue"
import ContactCustomerChargesTab from "@/app/components/contacts/ContactCustomerChargesTab.vue"
import ContactCalculationDemoTab from "@/app/components/contacts/ContactCalculationDemoTab.vue"

const {
  loading,
  contact,
  activeTab,
  setTab,

  onEditContact,
  onSendInvoice,

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
  <div class="page">
    <div v-if="!contact" class="loading">Loading…</div>

    <template v-else>
      <div class="pageHeader">
        <div class="pageHeader__left">
          <div class="pageTitle">{{ contact.company_name || "Contact" }}</div>

          <div class="pageMeta">
            <span class="pill">
              <span class="pill__label">Account:</span>
              <span class="pill__value">{{ contact.account_number || "-" }}</span>
            </span>

            <span class="dot">•</span>
            <span class="metaItem">
              {{ contact.collection_addresses?.length ?? 0 }} addresses
            </span>

            <span class="dot">•</span>
            <span class="metaItem">
              {{ contact.branches?.length ?? 0 }} branches
            </span>
          </div>
        </div>

        <div class="pageHeader__right">
          <Button
            type="button"
            class="btn btn--ghost orbis-muted"
            icon="pi pi-pencil"
            label="Edit customer"
            @click="onEditContact"
          />

          <Button
            type="button"
            class="btn btn--primary orbis-primary"
            icon="pi pi-receipt"
            label="Send invoice"
            @click="onSendInvoice"
          />
        </div>
      </div>

      <div class="panel">
        <ContactDetailsTabs :active="activeTab" @change="setTab" />

        <div class="panelBody">
          <div v-if="loading" class="loading">Loading…</div>

          <template v-else>
            <ContactOverviewTab
              v-if="activeTab === 'overview'"
              :contact="contact"
            />

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

            <ContactWeightChargesTab
              v-else-if="activeTab === 'weight_break'"
            />

            <ContactCustomerChargesTab
              v-else-if="activeTab === 'customer'"
            />

            <ContactCalculationDemoTab
              v-else-if="activeTab === 'demo'"
            />
          </template>
        </div>
      </div>
    </template>
  </div>
</template>