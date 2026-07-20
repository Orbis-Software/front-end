<script setup lang="ts">
import "@/app/pages/general-settings/GeneralSettingsPage.css"
import GeneralSettingsListTab from "@/app/components/general-settings/GeneralSettingsListTab.vue"
</script>

<template>
  <section>
    <div class="quotation-settings-intro">
      <h2>Goods Descriptions</h2>
      <p>
        Maintain the learned descriptions offered in quotation Step 5. New descriptions entered on a
        quotation are added here automatically.
      </p>
    </div>
    <GeneralSettingsListTab group="User quotation settings" />
  </section>
</template>

<style scoped>
.quotation-settings-intro {
  margin-bottom: 16px;
}
.quotation-settings-intro h2 {
  margin: 0 0 4px;
  font-size: 18px;
}
.quotation-settings-intro p {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
