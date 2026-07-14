import { computed, onMounted, reactive, ref, watch } from "vue"
import { useToast } from "primevue/usetoast"
import { onBeforeRouteLeave } from "vue-router"
import { useAccountSettingsStore } from "@/app/stores/account-settings"
import { useAuthStore } from "@/app/stores/auth"
import { useTaxCodeStore } from "@/app/stores/tax-codes"
import type {
  AccountSetting,
  AccountSettingPayload,
  AccountingSystem,
} from "@/app/types/account-setting"

type AccountingSystemConfig = {
  key: AccountingSystem
  label: string
  description: string
  connectionTitle: string
  connectionSummary: string
  instructions: string[]
}

export const accountingSystems: AccountingSystemConfig[] = [
  {
    key: "xero",
    label: "Xero",
    description: "Account codes and Xero tax type names",
    connectionTitle: "Connect Xero account",
    connectionSummary:
      "Xero requires an OAuth app connection before Orbis can post invoices, bills, contacts, and tax mappings.",
    instructions: [
      "Create or select a Xero app in the Xero Developer portal.",
      "Add the Orbis callback URL and enable accounting scopes for invoices, contacts, settings, and offline access.",
      "Copy the client ID and client secret into the integration setup when the secure connector is enabled.",
      "Authorise the Xero organisation, then return here to complete nominal and tax mappings.",
    ],
  },
  {
    key: "sage",
    label: "Sage",
    description: "Nominal codes and Sage T-code mapping",
    connectionTitle: "Connect Sage account",
    connectionSummary:
      "Sage needs its business cloud app credentials and company authorisation before export defaults can be used.",
    instructions: [
      "Register the Orbis integration in Sage Developer and enable Accounting API access.",
      "Configure the redirect URL supplied by Orbis and request offline refresh access.",
      "Confirm the company, department, nominal code, and VAT T-code structure with accounts.",
      "Authorise Sage, then return here to map nominal codes, T-codes, and export references.",
    ],
  },
  {
    key: "quickbooks",
    label: "QuickBooks",
    description: "Income/expense accounts and VAT agency codes",
    connectionTitle: "Connect QuickBooks account",
    connectionSummary:
      "QuickBooks requires an Intuit developer app and company authorisation before Orbis can sync accounting data.",
    instructions: [
      "Create an Intuit Developer app and enable QuickBooks Online Accounting API access.",
      "Add the Orbis redirect URI and prepare the client ID, client secret, and environment.",
      "Authorise the QuickBooks company and confirm VAT agency/account names with accounts.",
      "Return here to configure income accounts, expense accounts, VAT codes, and memo formats.",
    ],
  },
]

type FormState = AccountSettingPayload & { id: number | null }
type PendingChangeAction = "switch-tab" | "leave-page"
type PendingChangeResolver = (value: boolean) => void

type UnsavedChangesDialog = {
  visible: boolean
  action: PendingChangeAction | null
  targetSystem: AccountingSystem | null
  resolve: PendingChangeResolver | null
}

function emptyForm(system: AccountingSystem): FormState {
  return {
    id: null,
    accountingSystem: system,
    isDefault: system === "xero",
    isActive: true,
    isConnected: false,
    nominalCodes: {
      sales: "",
      purchase: "",
      freight: "",
      fuel: "",
      credit: "",
      trackingCategory: "",
      sageDepartment: "",
      qbClass: "",
    },
    taxMappings: [],
    exportSettings: {
      invoicePrefix: "INV-",
      defaultPaymentTerms: 30,
      exportCurrency: "GBP",
      xeroBrandingTheme: "",
      sageReferenceFormat: "TMS-{JOB}",
      qbMemoFormat: "TMS Job {JOB}",
    },
  }
}

function cloneSetting(setting: AccountSetting | null, system: AccountingSystem): FormState {
  if (!setting) return emptyForm(system)

  return JSON.parse(
    JSON.stringify({
      id: setting.id,
      accountingSystem: setting.accountingSystem,
      isDefault: setting.isDefault,
      isActive: setting.isActive,
      nominalCodes: setting.nominalCodes,
      taxMappings: setting.taxMappings,
      exportSettings: setting.exportSettings,
    }),
  )
}

function normalizeString(value: unknown): string | null {
  const text = String(value ?? "").trim()

  return text || null
}

function comparableForm(state: FormState) {
  return {
    accountingSystem: state.accountingSystem,
    isDefault: Boolean(state.isDefault),
    isActive: Boolean(state.isActive),
    isConnected: Boolean(state.isConnected),
    nominalCodes: {
      sales: normalizeString(state.nominalCodes.sales),
      purchase: normalizeString(state.nominalCodes.purchase),
      freight: normalizeString(state.nominalCodes.freight),
      fuel: normalizeString(state.nominalCodes.fuel),
      credit: normalizeString(state.nominalCodes.credit),
      trackingCategory: normalizeString(state.nominalCodes.trackingCategory),
      sageDepartment: normalizeString(state.nominalCodes.sageDepartment),
      qbClass: normalizeString(state.nominalCodes.qbClass),
    },
    taxMappings: state.taxMappings.map(row => ({
      rateType: normalizeString(row.rateType),
      label: normalizeString(row.label),
      rate: Number(row.rate ?? 0),
      internalTaxCode: normalizeString(row.internalTaxCode),
      salesTaxCode: normalizeString(row.salesTaxCode),
      purchaseTaxCode: normalizeString(row.purchaseTaxCode),
      isActive: Boolean(row.isActive),
    })),
    exportSettings: {
      invoicePrefix: normalizeString(state.exportSettings.invoicePrefix),
      defaultPaymentTerms: Number(state.exportSettings.defaultPaymentTerms ?? 30),
      exportCurrency: String(state.exportSettings.exportCurrency || "GBP")
        .trim()
        .toUpperCase(),
      xeroBrandingTheme: normalizeString(state.exportSettings.xeroBrandingTheme),
      sageReferenceFormat: normalizeString(state.exportSettings.sageReferenceFormat),
      qbMemoFormat: normalizeString(state.exportSettings.qbMemoFormat),
    },
  }
}

export function useSystemSettingsAccountSettingsPage() {
  const toast = useToast()
  const store = useAccountSettingsStore()
  const auth = useAuthStore()
  const taxCodeStore = useTaxCodeStore()
  const activeSystem = ref<AccountingSystem>("xero")
  const form = reactive<FormState>(emptyForm("xero"))
  const unsavedChangesDialog = reactive<UnsavedChangesDialog>({
    visible: false,
    action: null,
    targetSystem: null,
    resolve: null,
  })

  const loading = computed(() => store.loading || taxCodeStore.loading)
  const saving = computed(() => store.saving)
  const canEdit = computed(
    () => auth.hasPermission("mgmt.system.master_settings.manage") || auth.isAdmin || auth.isDev,
  )
  const activeSetting = computed(() => store.bySystem(activeSystem.value))
  const activeSystemConfig = computed<AccountingSystemConfig>(
    () =>
      accountingSystems.find(system => system.key === activeSystem.value) ??
      accountingSystems.find(system => system.key === "xero")!,
  )
  const isConnected = computed(() => Boolean(form.isConnected))
  const hasUnsavedChanges = computed(() => {
    if (loading.value || saving.value || !canEdit.value) return false

    return (
      JSON.stringify(comparableForm(form)) !==
      JSON.stringify(comparableForm(cloneSetting(activeSetting.value, activeSystem.value)))
    )
  })
  const taxCodeOptions = computed(() =>
    taxCodeStore.taxCodes.map(tax => ({
      label: `${tax.taxCode} - ${tax.description || tax.rate + "%"}`,
      value: tax.taxCode,
      rate: tax.rate,
      description: tax.description,
    })),
  )

  function hydrate(system = activeSystem.value) {
    Object.assign(form, cloneSetting(store.bySystem(system), system))
  }

  function requestUnsavedChangesDecision(
    action: PendingChangeAction,
    targetSystem: AccountingSystem | null = null,
  ) {
    unsavedChangesDialog.visible = true
    unsavedChangesDialog.action = action
    unsavedChangesDialog.targetSystem = targetSystem

    return new Promise<boolean>(resolve => {
      unsavedChangesDialog.resolve = resolve
    })
  }

  function resolveUnsavedChangesDialog(value: boolean) {
    unsavedChangesDialog.visible = false
    unsavedChangesDialog.action = null
    unsavedChangesDialog.targetSystem = null
    unsavedChangesDialog.resolve?.(value)
    unsavedChangesDialog.resolve = null
  }

  async function switchSystem(system: AccountingSystem) {
    if (system === activeSystem.value) return

    if (hasUnsavedChanges.value) {
      const canContinue = await requestUnsavedChangesDecision("switch-tab", system)
      if (!canContinue) return
    }

    activeSystem.value = system
    hydrate(system)
  }

  function addTaxMapping() {
    form.taxMappings.push({
      rateType: "custom",
      label: "",
      rate: 0,
      internalTaxCode: "",
      salesTaxCode: "",
      purchaseTaxCode: "",
      isActive: true,
    })
  }

  function removeTaxMapping(index: number) {
    form.taxMappings.splice(index, 1)
  }

  function isSystemConnected(system: AccountingSystem): boolean {
    if (system === activeSystem.value) return Boolean(form.isConnected)

    return Boolean(store.bySystem(system)?.isConnected)
  }

  function connectAccount() {
    form.isConnected = true
    form.isActive = true
    toast.add({
      severity: "info",
      summary: `${activeSystemConfig.value.label} setup unlocked`,
      detail: "Complete the connection outside Orbis, then save the account settings and mappings here.",
      life: 3600,
    })
  }

  function disconnectAccount() {
    form.isConnected = false
    form.isActive = false
    form.isDefault = false
    toast.add({
      severity: "warn",
      summary: `${activeSystemConfig.value.label} disconnected`,
      detail: "Mapping inputs are hidden until this accounting system is connected again.",
      life: 3600,
    })
  }

  async function save(): Promise<boolean> {
    try {
      await store.save(
        {
          accountingSystem: form.accountingSystem,
          isDefault: form.isDefault,
          isActive: form.isActive,
          isConnected: form.isConnected,
          nominalCodes: form.nominalCodes,
          taxMappings: form.taxMappings,
          exportSettings: form.exportSettings,
        },
        form.id,
      )
      hydrate()
      toast.add({
        severity: "success",
        summary: "Account settings saved",
        detail: `${accountingSystems.find(system => system.key === activeSystem.value)?.label} settings were saved.`,
        life: 2800,
      })
      return true
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Save failed",
        detail:
          error?.response?.data?.message || error?.message || "Unable to save account settings.",
        life: 4500,
      })
      return false
    }
  }

  async function saveAndContinue() {
    const saved = await save()
    resolveUnsavedChangesDialog(saved)
  }

  function discardAndContinue() {
    hydrate()
    resolveUnsavedChangesDialog(true)
  }

  function cancelPendingChange() {
    resolveUnsavedChangesDialog(false)
  }

  async function resetDefaults() {
    try {
      await store.reset()
      hydrate()
      toast.add({
        severity: "success",
        summary: "Defaults restored",
        detail: "Account settings were reset from the design defaults.",
        life: 2800,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Reset failed",
        detail:
          error?.response?.data?.message || error?.message || "Unable to reset account settings.",
        life: 4500,
      })
    }
  }

  watch(
    activeSetting,
    () => {
      if (!hasUnsavedChanges.value) hydrate()
    },
    { deep: true },
  )

  onBeforeRouteLeave(async () => {
    if (!hasUnsavedChanges.value) return true

    return requestUnsavedChangesDecision("leave-page")
  })

  onMounted(async () => {
    await Promise.all([store.fetch(), taxCodeStore.fetch({ perPage: 100 })])
    hydrate()
  })

  return {
    accountingSystems,
    activeSystem,
    form,
    loading,
    saving,
    canEdit,
    activeSystemConfig,
    isConnected,
    hasUnsavedChanges,
    unsavedChangesDialog,
    taxCodeOptions,
    switchSystem,
    addTaxMapping,
    removeTaxMapping,
    isSystemConnected,
    connectAccount,
    disconnectAccount,
    save,
    resetDefaults,
    saveAndContinue,
    discardAndContinue,
    cancelPendingChange,
  }
}
