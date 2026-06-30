import list from "./list"
import create from "./create"
import update from "./update"
import remove from "./remove"
import show from "./show"
import collectionNotePreview from "./collection-note-preview"
import jobPdf from "./job-pdf"
import emailInvoice from "./email-invoice"
import passSupplierInvoice from "./pass-supplier-invoice"
import {
  downloadInvoicePdf,
  generateCustomerInvoice,
  generateSupplierInvoice,
  invoiceGenerationTask,
  invoiceGenerationStatus,
} from "./invoice-generation"

export default {
  list,
  create,
  update,
  remove,
  show,
  collectionNotePreview,
  jobPdf,
  emailInvoice,
  passSupplierInvoice,
  generateCustomerInvoice,
  generateSupplierInvoice,
  invoiceGenerationTask,
  invoiceGenerationStatus,
  downloadInvoicePdf,
}
