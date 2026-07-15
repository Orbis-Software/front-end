import http from "@/api/http"
import transformer from "@/app/transformers/xero"
import type { XeroSettingsPayload } from "@/app/types/xero"

const xeroService = {
  async status() {
    const response = await http.get("/accounting/xero/status")
    return transformer.status(response.data.data)
  },
  async connect(reconnect = false) {
    const response = await http.post(`/accounting/xero/${reconnect ? "reconnect" : "connect"}`)
    return {
      authorizationUrl: String(response.data.data.authorization_url),
      expiresAt: response.data.data.expires_at ?? null,
    }
  },
  async pendingOrganisations(selectionId: string) {
    const response = await http.get(`/accounting/xero/pending-organisations/${selectionId}`)
    return transformer.pending(response.data.data)
  },
  async selectOrganisation(payload: {
    selectionId: string
    organisationId: string
    confirmReplace: boolean
  }) {
    const response = await http.post("/accounting/xero/select-organisation", {
      selection_id: payload.selectionId,
      organisation_id: payload.organisationId,
      confirm_replace: payload.confirmReplace,
    })
    return transformer.connection(response.data.data)
  },
  async options() {
    const response = await http.get("/accounting/xero/options")
    return transformer.options(response.data.data)
  },
  async saveSettings(payload: XeroSettingsPayload) {
    const response = await http.put("/accounting/xero/settings", {
      default_sales_account_code: payload.defaultSalesAccountCode,
      default_tax_type: payload.defaultTaxType,
      default_invoice_status: payload.defaultInvoiceStatus,
      auto_sync_customer_invoices: payload.autoSyncCustomerInvoices,
      sync_customer_contacts: payload.syncCustomerContacts,
      use_orbis_invoice_number: payload.useOrbisInvoiceNumber,
    })
    return transformer.settings(response.data.data)
  },
  async test() {
    const response = await http.post("/accounting/xero/test")
    return transformer.connection(response.data.data)
  },
  async disconnect() {
    const response = await http.delete("/accounting/xero/disconnect")
    return transformer.connection(response.data.data)
  },
  async syncInvoice(invoiceId: number) {
    const response = await http.post(`/customer-invoices/${invoiceId}/sync/xero`)
    return transformer.syncResult(response.data.data)
  },
}

export default xeroService
