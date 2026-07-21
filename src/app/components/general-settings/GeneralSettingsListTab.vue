<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useGeneralSettingsTab } from "./useGeneralSettingsTab"
import type { ReferenceDataCategory, ReferenceDataOption } from "@/app/types/referenceData"

const props = defineProps<{
  group: string
}>()

const { sections, loading, saving, error, addItem, hideItem, setDefault } = useGeneralSettingsTab(
  props.group,
)

const activeSectionKey = ref("")
const search = ref("")
const addDialogVisible = ref(false)
const newItemName = ref("")
const newItemDefault = ref(false)
const newVehicleLengthCm = ref<number | null>(null)
const newVehicleWidthCm = ref<number | null>(null)
const newVehicleHeightCm = ref<number | null>(null)
const newVehicleMaxWeightKg = ref<number | null>(null)
const newVehiclePalletBaseCm = ref<number | null>(15)

const activeSection = computed<ReferenceDataCategory | undefined>(() => {
  return sections.value.find(section => section.key === activeSectionKey.value) ?? sections.value[0]
})

const filteredOptions = computed(() => {
  const query = search.value.trim().toLowerCase()
  const options = activeSection.value?.options ?? []

  if (!query) return options

  return options.filter(option => option.name.toLowerCase().includes(query))
})

const isVehicleTypesSection = computed(() => activeSection.value?.key === "vehicle_types")

const vehicleMetadata = computed<Record<string, number> | null>(() => {
  if (!isVehicleTypesSection.value) return null

  const length = newVehicleLengthCm.value
  const width = newVehicleWidthCm.value
  const height = newVehicleHeightCm.value
  const maxWeight = newVehicleMaxWeightKg.value
  const palletBase = newVehiclePalletBaseCm.value ?? 15

  if (!length || !width || !height || !maxWeight) return null

  return {
    length_cm: length,
    width_cm: width,
    height_cm: height,
    max_weight_kg: maxWeight,
    pallet_base_cm: palletBase,
  }
})

const addDisabled = computed(() => {
  if (!newItemName.value.trim()) return true

  return isVehicleTypesSection.value && !vehicleMetadata.value
})

watch(
  sections,
  value => {
    if (!value.length) {
      activeSectionKey.value = ""
      return
    }

    if (!value.some(section => section.key === activeSectionKey.value)) {
      activeSectionKey.value = value[0]?.key ?? ""
    }
  },
  { immediate: true },
)

function openAddDialog() {
  newItemName.value = ""
  newItemDefault.value = false
  newVehicleLengthCm.value = null
  newVehicleWidthCm.value = null
  newVehicleHeightCm.value = null
  newVehicleMaxWeightKg.value = null
  newVehiclePalletBaseCm.value = 15
  addDialogVisible.value = true
}

async function submitAddItem() {
  const section = activeSection.value
  const name = newItemName.value.trim()

  if (!section || !name) return

  await addItem(section.key, section.id, {
    name,
    is_default: newItemDefault.value,
    metadata: vehicleMetadata.value,
  })

  addDialogVisible.value = false
}

function metadataNumber(option: ReferenceDataOption, key: string) {
  const value = option.metadata?.[key]

  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim()) {
    const numericValue = Number(value)

    return Number.isFinite(numericValue) ? numericValue : null
  }

  return null
}

function formatVehicleDimensions(option: ReferenceDataOption) {
  const length = metadataNumber(option, "length_cm")
  const width = metadataNumber(option, "width_cm")
  const height = metadataNumber(option, "height_cm")
  const maxWeight = metadataNumber(option, "max_weight_kg")

  if (!length || !width || !height || !maxWeight) return ""

  return `${length} x ${width} x ${height} cm | ${maxWeight} kg max`
}
</script>

<template>
  <section class="general-settings-tab-page">
    <div v-if="loading" class="general-settings-tab-page__empty">Loading reference data...</div>

    <div v-else-if="error" class="general-settings-tab-page__empty">
      {{ error }}
    </div>

    <div v-else-if="!sections.length" class="general-settings-tab-page__empty">
      No reference data found.
    </div>

    <div v-else class="general-settings-tab-page__list-card">
      <nav class="general-settings-tab-page__inner-tabs">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          class="general-settings-tab-page__inner-tab"
          :class="{
            'general-settings-tab-page__inner-tab--active': activeSection?.key === section.key,
          }"
          @click="activeSectionKey = section.key"
        >
          <span>{{ section.label }}</span>
          <span class="general-settings-tab-page__tab-count">{{ section.options.length }}</span>
        </button>
      </nav>

      <div class="general-settings-tab-page__toolbar">
        <div class="general-settings-tab-page__search">
          <i class="pi pi-search general-settings-tab-page__search-icon" />
          <input v-model="search" type="search" placeholder="Search list..." />
        </div>

        <Button
          class="btn btn--primary"
          icon="pi pi-plus"
          :label="`Add ${activeSection?.label ?? 'Item'}`"
          :disabled="saving"
          @click="openAddDialog"
        />
      </div>

      <div class="general-settings-tab-page__table-wrap">
        <table v-if="filteredOptions.length" class="general-settings-tab-page__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Default</th>
              <th>Sort</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="option in filteredOptions" :key="option.id">
              <td>
                <strong>{{ option.name }}</strong>
                <span
                  v-if="activeSection?.key === 'vehicle_types' && formatVehicleDimensions(option)"
                  class="general-settings-tab-page__option-meta"
                >
                  {{ formatVehicleDimensions(option) }}
                </span>
              </td>
              <td>
                <span
                  class="general-settings-tab-page__status"
                  :class="{
                    'general-settings-tab-page__status--active': option.is_active,
                    'general-settings-tab-page__status--inactive': !option.is_active,
                  }"
                >
                  {{ option.is_active ? "Active" : "Inactive" }}
                </span>
              </td>
              <td>
                <span
                  v-if="option.is_default"
                  class="general-settings-tab-page__status general-settings-tab-page__status--default"
                >
                  Default
                </span>
                <span v-else class="general-settings-tab-page__muted">No</span>
              </td>
              <td>{{ option.sort_order }}</td>
              <td>
                <div class="general-settings-tab-page__row-actions">
                  <Button
                    v-if="!option.is_default"
                    text
                    icon="pi pi-star"
                    label="Set Default"
                    :disabled="saving || !activeSection"
                    @click="activeSection && setDefault(activeSection.key, option.id)"
                  />
                  <Button
                    text
                    severity="danger"
                    icon="pi pi-trash"
                    label="Remove"
                    :disabled="saving || !activeSection"
                    @click="activeSection && hideItem(activeSection.key, option.id)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="general-settings-tab-page__empty">No records match your search.</div>
      </div>
    </div>

    <Dialog
      v-model:visible="addDialogVisible"
      modal
      class="general-settings-tab-page__dialog"
      :header="`Add ${activeSection?.label ?? 'Item'}`"
      :style="{ width: '420px' }"
    >
      <div class="general-settings-tab-page__dialog-body">
        <label class="general-settings-tab-page__field">
          <span>Name</span>
          <InputText
            v-model="newItemName"
            autofocus
            placeholder="Enter name"
            :disabled="saving"
            @keydown.enter="submitAddItem"
          />
        </label>

        <div v-if="isVehicleTypesSection" class="general-settings-tab-page__dimension-fields">
          <label class="general-settings-tab-page__field">
            <span>Length (cm)</span>
            <InputNumber
              v-model="newVehicleLengthCm"
              input-id="newVehicleLengthCm"
              :min="0"
              :use-grouping="false"
              :disabled="saving"
            />
          </label>

          <label class="general-settings-tab-page__field">
            <span>Width (cm)</span>
            <InputNumber
              v-model="newVehicleWidthCm"
              input-id="newVehicleWidthCm"
              :min="0"
              :use-grouping="false"
              :disabled="saving"
            />
          </label>

          <label class="general-settings-tab-page__field">
            <span>Height (cm)</span>
            <InputNumber
              v-model="newVehicleHeightCm"
              input-id="newVehicleHeightCm"
              :min="0"
              :use-grouping="false"
              :disabled="saving"
            />
          </label>

          <label class="general-settings-tab-page__field">
            <span>Max Load (kg)</span>
            <InputNumber
              v-model="newVehicleMaxWeightKg"
              input-id="newVehicleMaxWeightKg"
              :min="0"
              :use-grouping="false"
              :disabled="saving"
            />
          </label>

          <label class="general-settings-tab-page__field">
            <span>Pallet Base Height (cm)</span>
            <InputNumber
              v-model="newVehiclePalletBaseCm"
              input-id="newVehiclePalletBaseCm"
              :min="0"
              :use-grouping="false"
              :disabled="saving"
            />
          </label>
        </div>

        <label class="general-settings-tab-page__checkbox">
          <Checkbox v-model="newItemDefault" binary :disabled="saving" />
          <span>Set as default</span>
        </label>
      </div>

      <template #footer>
        <Button
          class="btn btn--ghost"
          label="Cancel"
          :disabled="saving"
          @click="addDialogVisible = false"
        />
        <Button
          class="btn btn--primary"
          icon="pi pi-plus"
          label="Add"
          :loading="saving"
          :disabled="addDisabled"
          @click="submitAddItem"
        />
      </template>
    </Dialog>
  </section>
</template>
