import { computed, reactive, ref, watch } from "vue"
import { useToast } from "primevue/usetoast"

import transportJobs from "@/app/services/transport-jobs"
import type {
  InvoiceEmailDialogProps,
  InvoiceEmailRecipientOption,
} from "@/app/types/invoice-email"
import { invoiceEmailSummaryValue, isValidInvoiceEmail } from "@/app/utils/invoice-email"

type InvoiceEmailDialogEmit = {
  (event: "update:visible", value: boolean): void
  (event: "openPdf"): void
}

export function useInvoiceEmailDialog(
  props: InvoiceEmailDialogProps,
  emit: InvoiceEmailDialogEmit,
) {
  const toast = useToast()
  const selectedRecipients = ref<string[]>([])
  const manualEmail = ref("")
  const sending = ref(false)
  const emailDraft = reactive({
    subject: "",
    body: "",
  })

  const recipientOptionsWithManual = computed<InvoiceEmailRecipientOption[]>(() => {
    const seen = new Set(props.recipientOptions.map(option => option.value.toLowerCase()))
    const manualOptions = selectedRecipients.value
      .map(email => email.trim())
      .filter(email => email && !seen.has(email.toLowerCase()))
      .map(email => ({
        group: "Manual",
        label: email,
        value: email,
      }))

    return [...props.recipientOptions, ...manualOptions]
  })

  const groupedRecipientOptions = computed(() => {
    const groups = new Map<string, InvoiceEmailRecipientOption[]>()

    recipientOptionsWithManual.value.forEach(option => {
      if (!groups.has(option.group)) groups.set(option.group, [])
      groups.get(option.group)!.push(option)
    })

    return [...groups.entries()].map(([label, items]) => ({ label, items }))
  })

  const selectedEmails = computed(() =>
    selectedRecipients.value
      .map(email => email.trim())
      .filter((email, index, emails) => email && emails.indexOf(email) === index),
  )

  const jobSummaryLines = computed(() =>
    Object.entries(props.jobSummary ?? {})
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
      .map(
        ([label, value]) =>
          `${label}: ${invoiceEmailSummaryValue(value as string | number | Date)}`,
      ),
  )

  function resetDraft() {
    selectedRecipients.value = props.recipientOptions.slice(0, 1).map(option => option.value)
    manualEmail.value = ""
    emailDraft.subject = `${props.invoiceLabel} ${props.invoiceNumber}`
    emailDraft.body = [
      "Hello,",
      "",
      `Please find attached ${props.invoiceLabel.toLowerCase()} ${props.invoiceNumber} for your review.`,
      "",
      ...jobSummaryLines.value,
      "",
      "Kind regards,",
    ].join("\n")
  }

  function addManualEmail() {
    const email = manualEmail.value.trim()

    if (!isValidInvoiceEmail(email)) {
      toast.add({
        severity: "warn",
        summary: "Email needed",
        detail: "Enter a valid manual email address.",
        life: 2500,
      })
      return
    }

    if (!selectedRecipients.value.includes(email)) {
      selectedRecipients.value = [...selectedRecipients.value, email]
    }

    manualEmail.value = ""
  }

  async function sendEmail() {
    if (!selectedEmails.value.length) {
      toast.add({
        severity: "warn",
        summary: "Recipient needed",
        detail: "Select or add at least one email recipient.",
        life: 2500,
      })
      return
    }

    const jobId = Number(props.jobId)
    const invoiceId = Number(props.invoiceId)

    if (!Number.isFinite(jobId) || jobId <= 0 || !Number.isFinite(invoiceId) || invoiceId <= 0) {
      toast.add({
        severity: "warn",
        summary: "Invoice needed",
        detail: "Generate or select an invoice before sending the email.",
        life: 2800,
      })
      return
    }

    sending.value = true

    try {
      await transportJobs.emailInvoice(jobId, {
        invoiceId,
        recipients: selectedEmails.value,
        subject: emailDraft.subject,
        body: emailDraft.body,
      })

      toast.add({
        severity: "success",
        summary: "Email sent",
        detail: `${props.invoiceLabel} was sent with the PDF attached.`,
        life: 3000,
      })
      emit("update:visible", false)
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Email failed",
        detail:
          error?.response?.data?.message ?? error?.message ?? "Unable to send the invoice email.",
        life: 4500,
      })
    } finally {
      sending.value = false
    }
  }

  watch(
    () => props.visible,
    visible => {
      if (visible) resetDraft()
    },
  )

  return {
    addManualEmail,
    emailDraft,
    groupedRecipientOptions,
    manualEmail,
    selectedRecipients,
    sendEmail,
    sending,
  }
}
