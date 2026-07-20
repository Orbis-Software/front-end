<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"
import { useReferenceDataStore } from "@/app/stores/reference-data"
import type { ReferenceDataOption } from "@/app/types/referenceData"
import "./SystemSettingsTermsConditionsPage.css"

const store = useReferenceDataStore()
const dialogVisible = ref(false)
const editing = ref<ReferenceDataOption | null>(null)
const name = ref("")
const content = ref("")
const category = computed(() => store.getByKey("quote_terms_conditions"))
const options = computed(() => category.value?.options ?? [])

function openEditor(option: ReferenceDataOption | null = null) {
  editing.value = option
  name.value = option?.name ?? ""
  content.value = String(option?.metadata?.content ?? "")
  dialogVisible.value = true
}

async function save() {
  const title = name.value.trim()
  const body = content.value.trim()
  if (!title || !body) return

  if (editing.value) {
    await store.updateOption("quote_terms_conditions", editing.value.id, {
      name: title,
      metadata: { ...(editing.value.metadata ?? {}), content: body },
    })
  } else {
    await store.createOption("quote_terms_conditions", {
      name: title,
      metadata: { content: body },
    })
  }

  dialogVisible.value = false
}

async function remove(option: ReferenceDataOption) {
  await store.deleteOption("quote_terms_conditions", option.id)
}

onMounted(async () => {
  if (!store.categories.length) await store.fetchAll()
})
</script>

<template>
  <section class="quote-terms-settings">
    <header class="quote-terms-settings__header">
      <div>
        <h2>Terms & Conditions Presets</h2>
        <p>Presets maintained here are available in quotation Step 5 and on the customer PDF.</p>
      </div>
      <Button icon="pi pi-plus" label="Add Preset" @click="openEditor()" />
    </header>

    <div v-if="store.loading" class="quote-terms-settings__empty">Loading presets...</div>
    <div v-else-if="!options.length" class="quote-terms-settings__empty">
      No presets configured.
    </div>
    <div v-else class="quote-terms-settings__list">
      <article v-for="option in options" :key="option.id" class="quote-terms-settings__item">
        <div>
          <h3>{{ option.name }}</h3>
          <p>{{ option.metadata?.content }}</p>
        </div>
        <div class="quote-terms-settings__actions">
          <Button text icon="pi pi-pencil" label="Edit" @click="openEditor(option)" />
          <Button
            text
            severity="danger"
            icon="pi pi-trash"
            label="Remove"
            @click="remove(option)"
          />
        </div>
      </article>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="editing ? 'Edit Preset' : 'Add Preset'"
      :style="{ width: '620px' }"
    >
      <div class="quote-terms-settings__form">
        <label><span>Preset Name</span><InputText v-model="name" autofocus /></label>
        <label
          ><span>Terms & Conditions</span><Textarea v-model="content" rows="10" autoResize
        /></label>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" outlined @click="dialogVisible = false" />
        <Button
          label="Save Preset"
          icon="pi pi-save"
          :loading="store.saving"
          :disabled="!name.trim() || !content.trim()"
          @click="save"
        />
      </template>
    </Dialog>
  </section>
</template>
