<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import Button from "primevue/button"
import Checkbox from "primevue/checkbox"
import Column from "primevue/column"
import ConfirmDialog from "primevue/confirmdialog"
import DataTable from "primevue/datatable"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Paginator from "primevue/paginator"
import Toast from "primevue/toast"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"
import companyEmailRecipientsService from "@/app/services/company-email-recipients"
import type {
  CompanyEmailRecipient,
  CompanyNotificationType,
} from "@/app/types/company-email-recipient"
import type { PageState } from "primevue/paginator"
import "./SystemSettingsEmailNotificationsPage.css"

type SourceFilter = "all" | "employee" | "custom"
type StatusFilter = "all" | "active" | "inactive"
type BulkAction = "activate" | "deactivate" | "add_notification" | "remove_notification"

type NotificationProfile = {
  key: string
  label: string
  types: string[]
}

const toast = useToast()
const confirm = useConfirm()

const loading = ref(false)
const creating = ref(false)
const savingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
const bulkSaving = ref(false)
const recipients = ref<CompanyEmailRecipient[]>([])
const notificationTypes = ref<CompanyNotificationType[]>([])
const selectedIds = ref<number[]>([])

const search = ref("")
const sourceFilter = ref<SourceFilter>("all")
const statusFilter = ref<StatusFilter>("all")
const notificationFilter = ref("all")
const page = ref(1)
const rowsPerPage = ref(15)
const bulkAction = ref<BulkAction>("activate")
const bulkNotificationType = ref("")
const bulkProfile = ref("operations")

const editVisible = ref(false)
const editRecipient = ref<CompanyEmailRecipient | null>(null)

const draft = reactive({
  name: "",
  email: "",
  is_active: true,
  notification_types: [] as string[],
  profile: "operations",
})

const sourceOptions = [
  { label: "All sources", value: "all" },
  { label: "Employee emails", value: "employee" },
  { label: "Shared inboxes", value: "custom" },
]
const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]
const bulkActionOptions = [
  { label: "Activate", value: "activate" },
  { label: "Deactivate", value: "deactivate" },
  { label: "Add notification", value: "add_notification" },
  { label: "Remove notification", value: "remove_notification" },
]
const activeRecipients = computed(
  () => recipients.value.filter(recipient => recipient.is_active).length,
)
const employeeRecipients = computed(
  () => recipients.value.filter(recipient => recipient.is_managed_user).length,
)
const customRecipients = computed(
  () => recipients.value.filter(recipient => !recipient.is_managed_user).length,
)
const selectedRecipients = computed(() =>
  recipients.value.filter(recipient => selectedIds.value.includes(recipient.id)),
)
const notificationProfiles = computed<NotificationProfile[]>(() => {
  const keys = notificationTypes.value.map(type => type.key)
  const pick = (preferred: string[]) => preferred.filter(key => keys.includes(key))

  return [
    { key: "all", label: "All notifications", types: keys },
    {
      key: "operations",
      label: "Operations",
      types: pick(["job_created", "job_booked", "job_departed", "job_arrived", "pod_received"]),
    },
    {
      key: "sales",
      label: "Sales",
      types: pick(["quote_sent", "quote_accepted"]),
    },
    {
      key: "accounts",
      label: "Accounts",
      types: pick(["quote_accepted", "invoice_ready"]),
    },
    {
      key: "management",
      label: "Management",
      types: pick(["quote_sent", "quote_accepted", "job_created", "pod_received", "invoice_ready"]),
    },
    {
      key: "system",
      label: "System Admin",
      types: pick(["system_alerts"]),
    },
  ]
})
const profileOptions = computed(() =>
  notificationProfiles.value.map(profile => ({
    label: profile.label,
    value: profile.key,
  })),
)
const notificationFilterOptions = computed(() => [
  { label: "All notifications", value: "all" },
  ...notificationTypes.value.map(type => ({ label: type.label, value: type.key })),
])
const notificationTypeOptions = computed(() =>
  notificationTypes.value.map(type => ({ label: type.label, value: type.key })),
)
const filteredRecipients = computed(() => {
  const term = search.value.trim().toLowerCase()

  return recipients.value.filter(recipient => {
    const matchesSearch =
      !term ||
      recipient.email.toLowerCase().includes(term) ||
      (recipient.name ?? "").toLowerCase().includes(term)

    const matchesSource =
      sourceFilter.value === "all" ||
      (sourceFilter.value === "employee" && recipient.is_managed_user) ||
      (sourceFilter.value === "custom" && !recipient.is_managed_user)

    const matchesStatus =
      statusFilter.value === "all" ||
      (statusFilter.value === "active" && recipient.is_active) ||
      (statusFilter.value === "inactive" && !recipient.is_active)

    const matchesNotification =
      notificationFilter.value === "all" ||
      recipient.notification_types.includes(notificationFilter.value)

    return matchesSearch && matchesSource && matchesStatus && matchesNotification
  })
})
const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredRecipients.value.length / rowsPerPage.value)),
)
const currentPage = computed(() => Math.min(page.value, pageCount.value))
const firstRow = computed(() => (currentPage.value - 1) * rowsPerPage.value)
const pagedRecipients = computed(() => {
  const start = firstRow.value

  return filteredRecipients.value.slice(start, start + rowsPerPage.value)
})
const paginationStart = computed(() => (filteredRecipients.value.length ? firstRow.value + 1 : 0))
const paginationEnd = computed(() =>
  Math.min(firstRow.value + rowsPerPage.value, filteredRecipients.value.length),
)
const pageSelected = computed(
  () =>
    pagedRecipients.value.length > 0 &&
    pagedRecipients.value.every(recipient => selectedIds.value.includes(recipient.id)),
)

onMounted(loadRecipients)

async function loadRecipients() {
  loading.value = true

  try {
    const response = await companyEmailRecipientsService.list()
    notificationTypes.value = response.notification_types
    recipients.value = response.data.map(normalizeRecipient)
    resetDraft()
  } catch (error: any) {
    showError("Unable to load company email recipients.", error)
  } finally {
    loading.value = false
  }
}

async function createRecipient() {
  if (!draft.email.trim()) {
    showWarn("Email address is required.")
    return
  }

  creating.value = true

  try {
    const recipient = await companyEmailRecipientsService.create({
      name: draft.name.trim() || null,
      email: draft.email.trim(),
      is_active: draft.is_active,
      notification_types: [...draft.notification_types],
    })

    recipients.value = [normalizeRecipient(recipient), ...recipients.value]
    resetDraft()

    toast.add({
      severity: "success",
      summary: "Email Added",
      detail: "Company notification email has been added.",
      life: 3000,
    })
  } catch (error: any) {
    showError("Unable to add email recipient.", error)
  } finally {
    creating.value = false
  }
}

async function saveRecipient(recipient: CompanyEmailRecipient) {
  savingId.value = recipient.id

  try {
    const updated = await companyEmailRecipientsService.update(recipient.id, {
      ...(recipient.is_managed_user ? {} : { name: recipient.name, email: recipient.email }),
      is_active: recipient.is_active,
      notification_types: recipient.notification_types,
    })

    replaceRecipient(updated)
    toast.add({
      severity: "success",
      summary: "Email Updated",
      detail: "Notification preferences were saved.",
      life: 2500,
    })
  } catch (error: any) {
    showError("Unable to save email recipient.", error)
  } finally {
    savingId.value = null
  }
}

async function saveEditRecipient() {
  if (!editRecipient.value) return

  await saveRecipient(editRecipient.value)
  editVisible.value = false
  editRecipient.value = null
}

async function saveStatus(recipient: CompanyEmailRecipient) {
  await saveRecipient(recipient)
}

function openEdit(recipient: CompanyEmailRecipient) {
  editRecipient.value = normalizeRecipient(recipient)
  editVisible.value = true
}

function confirmDelete(recipient: CompanyEmailRecipient) {
  confirm.require({
    header: "Remove Email",
    message: `Remove ${recipient.email} from company notifications?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Remove",
    rejectLabel: "Cancel",
    acceptClass: "p-button-danger",
    accept: () => deleteRecipient(recipient),
  })
}

async function deleteRecipient(recipient: CompanyEmailRecipient) {
  deletingId.value = recipient.id

  try {
    await companyEmailRecipientsService.remove(recipient.id)
    recipients.value = recipients.value.filter(item => item.id !== recipient.id)
    selectedIds.value = selectedIds.value.filter(id => id !== recipient.id)
    toast.add({
      severity: "success",
      summary: "Email Removed",
      detail: "Company notification email has been removed.",
      life: 2500,
    })
  } catch (error: any) {
    showError("Unable to remove email recipient.", error)
  } finally {
    deletingId.value = null
  }
}

async function applyBulkAction() {
  if (!selectedRecipients.value.length) {
    showWarn("Select at least one email first.")
    return
  }

  if (
    (bulkAction.value === "add_notification" || bulkAction.value === "remove_notification") &&
    !bulkNotificationType.value
  ) {
    showWarn("Choose a notification type for this bulk action.")
    return
  }

  bulkSaving.value = true

  try {
    await Promise.all(
      selectedRecipients.value.map(recipient => {
        const next = normalizeRecipient(recipient)

        if (bulkAction.value === "activate") next.is_active = true
        if (bulkAction.value === "deactivate") next.is_active = false
        if (bulkAction.value === "add_notification") {
          next.notification_types = toggleKey(
            next.notification_types,
            bulkNotificationType.value,
            true,
          )
        }
        if (bulkAction.value === "remove_notification") {
          next.notification_types = toggleKey(
            next.notification_types,
            bulkNotificationType.value,
            false,
          )
        }

        return companyEmailRecipientsService.update(next.id, {
          ...(next.is_managed_user ? {} : { name: next.name, email: next.email }),
          is_active: next.is_active,
          notification_types: next.notification_types,
        })
      }),
    )

    await loadRecipients()
    selectedIds.value = []
    toast.add({
      severity: "success",
      summary: "Bulk Update Complete",
      detail: "Selected email preferences were updated.",
      life: 3000,
    })
  } catch (error: any) {
    showError("Unable to apply bulk update.", error)
  } finally {
    bulkSaving.value = false
  }
}

async function applyBulkProfile() {
  if (!selectedRecipients.value.length) {
    showWarn("Select at least one email first.")
    return
  }

  const profile = notificationProfiles.value.find(item => item.key === bulkProfile.value)
  if (!profile) return

  bulkSaving.value = true

  try {
    await Promise.all(
      selectedRecipients.value.map(recipient =>
        companyEmailRecipientsService.update(recipient.id, {
          ...(recipient.is_managed_user ? {} : { name: recipient.name, email: recipient.email }),
          is_active: recipient.is_active,
          notification_types: [...profile.types],
        }),
      ),
    )

    await loadRecipients()
    selectedIds.value = []
    toast.add({
      severity: "success",
      summary: "Profile Applied",
      detail: `${profile.label} was applied to selected emails.`,
      life: 3000,
    })
  } catch (error: any) {
    showError("Unable to apply notification profile.", error)
  } finally {
    bulkSaving.value = false
  }
}

function applyProfileToDraft(profileKey: string) {
  draft.profile = profileKey
  draft.notification_types = [
    ...(notificationProfiles.value.find(item => item.key === profileKey)?.types ?? []),
  ]
}

function applyProfileToEdit(profileKey: string) {
  if (!editRecipient.value) return

  editRecipient.value.notification_types = [
    ...(notificationProfiles.value.find(item => item.key === profileKey)?.types ?? []),
  ]
}

function toggleDraftNotification(key: string) {
  draft.notification_types = toggleKey(draft.notification_types, key)
}

function toggleEditNotification(key: string) {
  if (!editRecipient.value) return
  editRecipient.value.notification_types = toggleKey(editRecipient.value.notification_types, key)
}

function toggleAllForDraft() {
  draft.notification_types =
    draft.notification_types.length === notificationTypes.value.length
      ? []
      : notificationTypes.value.map(type => type.key)
}

function toggleAllForEdit() {
  if (!editRecipient.value) return
  editRecipient.value.notification_types =
    editRecipient.value.notification_types.length === notificationTypes.value.length
      ? []
      : notificationTypes.value.map(type => type.key)
}

function toggleKey(values: string[], key: string, force?: boolean): string[] {
  if (force === true) return values.includes(key) ? values : [...values, key]
  if (force === false) return values.filter(value => value !== key)

  return values.includes(key) ? values.filter(value => value !== key) : [...values, key]
}

function resetFilters() {
  search.value = ""
  sourceFilter.value = "all"
  statusFilter.value = "all"
  notificationFilter.value = "all"
  page.value = 1
}

function onPage(event: PageState) {
  const rows = Number(event.rows ?? rowsPerPage.value)
  rowsPerPage.value = rows
  page.value = Math.floor(Number(event.first ?? 0) / rows) + 1
}

function resetPage() {
  page.value = 1
}

function toggleSelected(id: number) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter(selectedId => selectedId !== id)
    : [...selectedIds.value, id]
}

function togglePageSelected() {
  const pageIds = pagedRecipients.value.map(recipient => recipient.id)

  selectedIds.value = pageSelected.value
    ? selectedIds.value.filter(id => !pageIds.includes(id))
    : Array.from(new Set([...selectedIds.value, ...pageIds]))
}

function notificationLabels(keys: string[]): string[] {
  const labels = new Map(notificationTypes.value.map(type => [type.key, type.label]))

  return keys.map(key => labels.get(key) ?? key)
}

function normalizeRecipient(recipient: CompanyEmailRecipient): CompanyEmailRecipient {
  return {
    ...recipient,
    user_id: recipient.user_id ?? null,
    source: recipient.source ?? "custom",
    is_managed_user: Boolean(recipient.is_managed_user),
    notification_types: [...(recipient.notification_types ?? [])],
  }
}

function replaceRecipient(recipient: CompanyEmailRecipient) {
  const normalized = normalizeRecipient(recipient)
  recipients.value = recipients.value.map(item => (item.id === normalized.id ? normalized : item))
}

function resetDraft() {
  draft.name = ""
  draft.email = ""
  draft.is_active = true
  draft.profile = "operations"
  draft.notification_types = [
    ...(notificationProfiles.value.find(profile => profile.key === draft.profile)?.types ??
      notificationTypes.value.map(type => type.key)),
  ]
}

function showWarn(detail: string) {
  toast.add({
    severity: "warn",
    summary: "Check Email",
    detail,
    life: 3000,
  })
}

function showError(fallback: string, error: any) {
  const validation = firstValidationMessage(error)

  toast.add({
    severity: "error",
    summary: "Email Settings",
    detail: error?.response?.data?.message ?? validation ?? fallback,
    life: 4500,
  })
}

function firstValidationMessage(error: any): string | null {
  const errors = error?.response?.data?.errors
  if (!errors || typeof errors !== "object") return null

  const first = Object.values(errors)[0]
  return Array.isArray(first) ? String(first[0] ?? "") : null
}
</script>

<template>
  <section class="system-settings-email-page">
    <Toast />
    <ConfirmDialog />

    <header class="system-settings-email-page__header">
      <div>
        <h2 class="system-settings-email-page__title">Email & Notifications</h2>
        <p class="system-settings-email-page__subtitle">
          Manage company emails in a searchable table and edit notification routing per inbox.
        </p>
      </div>
      <Button
        icon="pi pi-refresh"
        label="Refresh"
        class="p-button-outlined"
        type="button"
        :loading="loading"
        @click="loadRecipients"
      />
    </header>

    <div class="system-settings-email-page__summary">
      <article>
        <span>Total Emails</span>
        <strong>{{ recipients.length }}</strong>
      </article>
      <article>
        <span>Active Emails</span>
        <strong>{{ activeRecipients }}</strong>
      </article>
      <article>
        <span>Employee Emails</span>
        <strong>{{ employeeRecipients }}</strong>
      </article>
      <article>
        <span>Shared Inboxes</span>
        <strong>{{ customRecipients }}</strong>
      </article>
    </div>

    <section class="system-settings-email-page__panel">
      <div class="system-settings-email-page__panel-head">
        <div>
          <h3>Add Shared Inbox</h3>
          <p>Employee emails sync automatically. Add extra company inboxes here.</p>
        </div>
      </div>

      <div class="system-settings-email-page__form">
        <label>
          <span>Name</span>
          <InputText v-model="draft.name" placeholder="Operations inbox" />
        </label>
        <label>
          <span>Email Address</span>
          <InputText v-model="draft.email" type="email" placeholder="ops@example.com" />
        </label>
        <label>
          <span>Profile</span>
          <Dropdown
            v-model="draft.profile"
            :options="profileOptions"
            optionLabel="label"
            optionValue="value"
            class="system-settings-email-page__dropdown"
            @change="applyProfileToDraft(draft.profile)"
          />
        </label>
        <label class="system-settings-email-page__switch">
          <Checkbox v-model="draft.is_active" binary />
          <span>Active</span>
        </label>
        <Button
          label="Add Email"
          icon="pi pi-plus"
          class="orbis-primary"
          type="button"
          :loading="creating"
          @click="createRecipient"
        />
      </div>
    </section>

    <section class="system-settings-email-page__panel">
      <div class="system-settings-email-page__panel-head">
        <div>
          <h3>Company Emails</h3>
          <p>Search, filter, bulk update, or edit notification preferences from one table.</p>
        </div>
      </div>

      <div class="system-settings-email-page__toolbar">
        <div class="system-settings-email-page__search">
          <i class="pi pi-search" />
          <InputText v-model="search" placeholder="Search name or email" @input="resetPage" />
        </div>

        <Dropdown
          v-model="sourceFilter"
          :options="sourceOptions"
          optionLabel="label"
          optionValue="value"
          class="system-settings-email-page__dropdown"
          @change="resetPage"
        />

        <Dropdown
          v-model="statusFilter"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          class="system-settings-email-page__dropdown"
          @change="resetPage"
        />

        <Dropdown
          v-model="notificationFilter"
          :options="notificationFilterOptions"
          optionLabel="label"
          optionValue="value"
          class="system-settings-email-page__dropdown system-settings-email-page__dropdown--wide"
          @change="resetPage"
        />

        <Button
          label="Reset"
          icon="pi pi-filter-slash"
          class="p-button-outlined"
          type="button"
          @click="resetFilters"
        />
      </div>

      <div v-if="selectedIds.length" class="system-settings-email-page__bulk">
        <strong>{{ selectedIds.length }} selected</strong>
        <Dropdown
          v-model="bulkAction"
          :options="bulkActionOptions"
          optionLabel="label"
          optionValue="value"
          class="system-settings-email-page__dropdown"
        />
        <Dropdown
          v-if="bulkAction === 'add_notification' || bulkAction === 'remove_notification'"
          v-model="bulkNotificationType"
          :options="notificationTypeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select notification"
          class="system-settings-email-page__dropdown system-settings-email-page__dropdown--wide"
        />
        <Button
          label="Apply"
          icon="pi pi-check"
          class="orbis-primary"
          type="button"
          :loading="bulkSaving"
          @click="applyBulkAction"
        />
        <Dropdown
          v-model="bulkProfile"
          :options="profileOptions"
          optionLabel="label"
          optionValue="value"
          class="system-settings-email-page__dropdown"
        />
        <Button
          label="Apply Profile"
          icon="pi pi-sliders-h"
          class="p-button-outlined"
          type="button"
          :loading="bulkSaving"
          @click="applyBulkProfile"
        />
      </div>

      <DataTable
        :value="pagedRecipients"
        dataKey="id"
        responsiveLayout="scroll"
        class="system-settings-email-page__table"
        :loading="loading"
        :rowClass="recipient => (!recipient.is_active ? 'is-inactive' : '')"
      >
        <template #empty>
          <div class="system-settings-email-page__empty">
            {{
              loading ? "Loading company emails..." : "No company emails match the current filters."
            }}
          </div>
        </template>

        <Column headerStyle="width: 56px" bodyStyle="width: 56px">
          <template #header>
            <Checkbox :modelValue="pageSelected" binary @update:modelValue="togglePageSelected" />
          </template>
          <template #body="{ data }">
            <Checkbox
              :modelValue="selectedIds.includes(data.id)"
              binary
              @update:modelValue="toggleSelected(data.id)"
            />
          </template>
        </Column>

        <Column header="Email" style="min-width: 300px">
          <template #body="{ data }">
            <button class="email-link" type="button" @click="openEdit(data)">
              {{ data.email }}
            </button>
            <div class="email-subline">{{ data.name || "No name set" }}</div>
          </template>
        </Column>

        <Column header="Source" style="width: 180px">
          <template #body="{ data }">
            <span
              class="system-settings-email-page__source"
              :class="{ 'system-settings-email-page__source--employee': data.is_managed_user }"
            >
              {{ data.is_managed_user ? "Employee" : "Shared inbox" }}
            </span>
          </template>
        </Column>

        <Column header="Status" style="width: 150px">
          <template #body="{ data }">
            <label class="status-toggle">
              <Checkbox
                v-model="data.is_active"
                binary
                :disabled="savingId === data.id"
                @change="saveStatus(data)"
              />
              <span>{{ data.is_active ? "Active" : "Inactive" }}</span>
            </label>
          </template>
        </Column>

        <Column header="Notifications" style="min-width: 340px">
          <template #body="{ data }">
            <button class="notification-count" type="button" @click="openEdit(data)">
              {{ data.notification_types.length }} selected
            </button>
            <div class="notification-preview">
              {{ notificationLabels(data.notification_types).slice(0, 2).join(", ") || "None" }}
            </div>
          </template>
        </Column>

        <Column
          header="Actions"
          style="width: 140px"
          bodyClass="actions-col"
          headerClass="actions-col"
        >
          <template #body="{ data }">
            <Button
              icon="pi pi-pencil"
              class="p-button-outlined"
              type="button"
              aria-label="Edit notifications"
              @click="openEdit(data)"
            />
            <Button
              v-if="!data.is_managed_user"
              icon="pi pi-trash"
              class="p-button-outlined p-button-danger"
              type="button"
              aria-label="Remove email"
              :loading="deletingId === data.id"
              @click="confirmDelete(data)"
            />
          </template>
        </Column>
      </DataTable>

      <div v-if="filteredRecipients.length" class="system-settings-email-page__pagination">
        <span>
          Showing {{ paginationStart }} - {{ paginationEnd }} of {{ filteredRecipients.length }}
        </span>
        <Paginator
          :rows="rowsPerPage"
          :total-records="filteredRecipients.length"
          :first="firstRow"
          :rows-per-page-options="[10, 15, 25, 50]"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          @page="onPage"
        />
      </div>
    </section>

    <Dialog
      v-model:visible="editVisible"
      modal
      class="system-settings-email-page__dialog"
      header="Edit Email Notifications"
      :style="{ width: '720px', maxWidth: '94vw' }"
    >
      <div v-if="editRecipient" class="system-settings-email-page__dialog-body">
        <div class="system-settings-email-page__form system-settings-email-page__form--dialog">
          <label>
            <span>Name</span>
            <InputText
              v-model="editRecipient.name"
              :readonly="editRecipient.is_managed_user"
              placeholder="Name"
            />
          </label>
          <label>
            <span>Email Address</span>
            <InputText
              v-model="editRecipient.email"
              :readonly="editRecipient.is_managed_user"
              type="email"
              placeholder="email@example.com"
            />
          </label>
          <label class="system-settings-email-page__switch">
            <Checkbox v-model="editRecipient.is_active" binary />
            <span>{{ editRecipient.is_active ? "Active" : "Inactive" }}</span>
          </label>
        </div>

        <div class="system-settings-email-page__profile-row">
          <span>Apply preset</span>
          <button
            v-for="profile in notificationProfiles"
            :key="profile.key"
            type="button"
            @click="applyProfileToEdit(profile.key)"
          >
            {{ profile.label }}
          </button>
        </div>

        <div class="system-settings-email-page__notification-head">
          <span>Notifications to receive</span>
          <button type="button" @click="toggleAllForEdit">
            {{
              editRecipient.notification_types.length === notificationTypes.length
                ? "Clear all"
                : "Select all"
            }}
          </button>
        </div>

        <div class="system-settings-email-page__checks system-settings-email-page__checks--dialog">
          <label v-for="type in notificationTypes" :key="`edit-${type.key}`">
            <Checkbox
              :modelValue="editRecipient.notification_types.includes(type.key)"
              binary
              @update:modelValue="toggleEditNotification(type.key)"
            />
            <span>{{ type.label }}</span>
          </label>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          class="p-button-outlined"
          type="button"
          @click="editVisible = false"
        />
        <Button
          label="Save Changes"
          icon="pi pi-save"
          class="orbis-primary"
          type="button"
          :loading="!!editRecipient && savingId === editRecipient.id"
          @click="saveEditRecipient"
        />
      </template>
    </Dialog>
  </section>
</template>
