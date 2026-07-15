import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"
import { useAuthStore } from "@/app/stores/auth"
import { useXeroIntegrationStore } from "@/app/stores/xero-integration"
import type { AccountingSystem } from "@/app/types/account-setting"
import type { XeroSettingsPayload } from "@/app/types/xero"

export const accountingSystems = [
  { key: "xero" as AccountingSystem, label: "Xero", description: "Customer invoices and contacts" },
  { key: "sage" as AccountingSystem, label: "Sage", description: "Integration coming soon" },
  {
    key: "quickbooks" as AccountingSystem,
    label: "QuickBooks",
    description: "Integration coming soon",
  },
]

const callbackErrors: Record<string, string> = {
  invalid_state:
    "The Xero authorisation request is invalid or has already been used. Please try again.",
  expired_state: "The Xero authorisation request expired. Please try again.",
  cancelled: "The Xero connection was cancelled.",
  missing_code: "Xero did not complete the authorisation. Please try again.",
  no_organisation: "No Xero organisation was available for this account.",
  organisation_in_use: "That Xero organisation is already connected to another Orbis company.",
  authorization_failed: "Xero could not be connected. Please try again.",
}

function defaultSettings(): XeroSettingsPayload {
  return {
    defaultSalesAccountCode: "",
    defaultTaxType: "",
    defaultInvoiceStatus: "DRAFT",
    autoSyncCustomerInvoices: false,
    syncCustomerContacts: true,
    useOrbisInvoiceNumber: true,
  }
}

export function useSystemSettingsAccountSettingsPage() {
  const auth = useAuthStore()
  const store = useXeroIntegrationStore()
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const activeSystem = ref<AccountingSystem>("xero")
  const disconnectDialogVisible = ref(false)
  const organisationDialogVisible = ref(false)
  const selectedOrganisationId = ref("")
  const confirmReplacement = ref(false)
  const settingsForm = reactive<XeroSettingsPayload>(defaultSettings())

  const canEdit = computed(
    () => auth.hasPermission("mgmt.system.master_settings.manage") || auth.isAdmin || auth.isDev,
  )
  const xeroStatus = computed(() => store.status)
  const isConnected = computed(() => xeroStatus.value?.status === "connected")
  const needsAttention = computed(() => xeroStatus.value?.status === "needs_reconnect")
  const isBusy = computed(
    () =>
      store.loading ||
      store.connecting ||
      store.testing ||
      store.saving ||
      store.disconnecting ||
      store.selecting,
  )
  const accountOptions = computed(() =>
    store.accounts.map(account => ({
      label: `${account.code} — ${account.name}`,
      value: account.code,
    })),
  )
  const taxOptions = computed(() =>
    store.taxRates.map(tax => ({
      label: `${tax.name} (${tax.rate}%)`,
      value: tax.taxType,
    })),
  )
  const organisationOptions = computed(() =>
    (store.pending?.organisations ?? []).map(organisation => ({
      label: organisation.name,
      value: organisation.tenantId,
    })),
  )
  const replacementRequired = computed(
    () =>
      Boolean(store.pending?.currentOrganisationId) &&
      Boolean(selectedOrganisationId.value) &&
      store.pending?.currentOrganisationId !== selectedOrganisationId.value,
  )
  const savedSettingsComparable = computed(() => {
    const settings = xeroStatus.value?.settings
    if (!settings) return JSON.stringify(defaultSettings())
    return JSON.stringify({
      defaultSalesAccountCode: settings.defaultSalesAccountCode ?? "",
      defaultTaxType: settings.defaultTaxType ?? "",
      defaultInvoiceStatus: settings.defaultInvoiceStatus,
      autoSyncCustomerInvoices: settings.autoSyncCustomerInvoices,
      syncCustomerContacts: settings.syncCustomerContacts,
      useOrbisInvoiceNumber: settings.useOrbisInvoiceNumber,
    })
  })
  const hasUnsavedChanges = computed(
    () => isConnected.value && JSON.stringify(settingsForm) !== savedSettingsComparable.value,
  )

  function hydrateSettings() {
    const settings = xeroStatus.value?.settings
    Object.assign(
      settingsForm,
      settings
        ? {
            defaultSalesAccountCode: settings.defaultSalesAccountCode ?? "",
            defaultTaxType: settings.defaultTaxType ?? "",
            defaultInvoiceStatus: settings.defaultInvoiceStatus,
            autoSyncCustomerInvoices: settings.autoSyncCustomerInvoices,
            syncCustomerContacts: settings.syncCustomerContacts,
            useOrbisInvoiceNumber: settings.useOrbisInvoiceNumber,
          }
        : defaultSettings(),
    )
  }

  function friendlyError(error: any, fallback: string) {
    return error?.response?.data?.message || error?.message || fallback
  }

  async function startConnection(reconnect = false) {
    try {
      await store.startConnection(reconnect)
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Xero connection failed",
        detail: friendlyError(error, "Unable to prepare the Xero connection."),
        life: 5000,
      })
    }
  }

  async function testConnection() {
    try {
      await store.testConnection()
      toast.add({
        severity: "success",
        summary: "Connection successful",
        detail: "Orbis can access the connected Xero organisation.",
        life: 3200,
      })
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Connection needs attention",
        detail: friendlyError(error, "The Xero connection could not be verified."),
        life: 5000,
      })
    }
  }

  async function saveSettings() {
    if (!settingsForm.defaultSalesAccountCode || !settingsForm.defaultTaxType) {
      toast.add({
        severity: "warn",
        summary: "Settings incomplete",
        detail: "Please select a sales account and tax rate.",
        life: 4000,
      })
      return
    }

    try {
      await store.saveSettings({ ...settingsForm })
      toast.add({
        severity: "success",
        summary: "Xero settings saved",
        detail: "Customer invoice sync settings are ready.",
        life: 3000,
      })
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Settings not saved",
        detail: friendlyError(error, "Unable to save Xero settings."),
        life: 5000,
      })
    }
  }

  async function disconnect() {
    try {
      await store.disconnect()
      disconnectDialogVisible.value = false
      hydrateSettings()
      toast.add({
        severity: "success",
        summary: "Xero disconnected",
        detail: "Future synchronisation has stopped. Existing Xero invoices were not deleted.",
        life: 4200,
      })
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Disconnect failed",
        detail: friendlyError(error, "Unable to disconnect Xero."),
        life: 5000,
      })
    }
  }

  async function selectOrganisation() {
    if (!selectedOrganisationId.value) return
    if (replacementRequired.value && !confirmReplacement.value) return

    try {
      await store.selectOrganisation(selectedOrganisationId.value, confirmReplacement.value)
      organisationDialogVisible.value = false
      hydrateSettings()
      toast.add({
        severity: "success",
        summary: "Xero connected",
        detail: `Connected to ${store.status?.connection?.organisationName ?? "your Xero organisation"}.`,
        life: 3600,
      })
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Organisation not connected",
        detail: friendlyError(error, "Unable to select the Xero organisation."),
        life: 5000,
      })
    }
  }

  function statusFor(system: AccountingSystem) {
    if (system !== "xero") return "Coming soon"
    if (needsAttention.value) return "Needs attention"
    return isConnected.value ? "Connected" : "Not connected"
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return "Not yet"
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value),
    )
  }

  async function handleCallback() {
    const result = String(route.query.xero_result ?? "")
    const selectionId = String(route.query.selection_id ?? "")
    const errorCode = String(route.query.xero_error ?? "")

    if (!result) return

    const nextQuery = { ...route.query }
    delete nextQuery.xero_result
    delete nextQuery.selection_id
    delete nextQuery.xero_error
    await router.replace({ query: nextQuery })

    if (result === "select_organisation" && selectionId) {
      try {
        await store.fetchPending(selectionId)
        selectedOrganisationId.value =
          store.pending?.organisations.length === 1
            ? (store.pending.organisations[0]?.tenantId ?? "")
            : ""
        confirmReplacement.value = false
        organisationDialogVisible.value = true
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Selection expired",
          detail: friendlyError(error, "The organisation selection expired. Please connect again."),
          life: 5000,
        })
      }
      return
    }

    if (result === "connected") {
      toast.add({
        severity: "success",
        summary: "Xero connected",
        detail: "Your Xero organisation is now connected to Orbis.",
        life: 3600,
      })
      return
    }

    if (result === "error") {
      toast.add({
        severity: "error",
        summary: "Xero was not connected",
        detail: callbackErrors[errorCode] ?? "Xero could not be connected. Please try again.",
        life: 5500,
      })
    }
  }

  watch(xeroStatus, hydrateSettings, { deep: true })

  onMounted(async () => {
    try {
      await store.fetchStatus()
      hydrateSettings()
      await handleCallback()
      if (String(route.query.xero_result ?? "") === "connected") await store.fetchStatus()
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Xero unavailable",
        detail: friendlyError(error, "Unable to load Xero connection information."),
        life: 5000,
      })
    }
  })

  return {
    accountingSystems,
    activeSystem,
    canEdit,
    store,
    xeroStatus,
    isConnected,
    needsAttention,
    isBusy,
    settingsForm,
    accountOptions,
    taxOptions,
    organisationOptions,
    disconnectDialogVisible,
    organisationDialogVisible,
    selectedOrganisationId,
    confirmReplacement,
    replacementRequired,
    hasUnsavedChanges,
    startConnection,
    testConnection,
    saveSettings,
    disconnect,
    selectOrganisation,
    statusFor,
    formatDate,
  }
}
