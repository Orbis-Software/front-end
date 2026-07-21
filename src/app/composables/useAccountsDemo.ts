import { computed, reactive } from "vue"
import type {
  AccountsDemoBankAccount as BankAccount,
  AccountsDemoBankFeedRow as BankFeedRow,
  AccountsDemoChargeCode as ChargeCode,
  AccountsDemoCreditCustomer as CreditCustomer,
  AccountsDemoExchangeRate as ExchangeRate,
  AccountsDemoInvoice as Invoice,
  AccountsDemoPendingJob as PendingJob,
  AccountsDemoSupplierInvoice as SupplierInvoice,
  AccountsDemoTaxCode as TaxCode,
  AccountsDemoTone as Tone,
} from "@/app/types/accounts-demo"

const STORAGE_KEY = "pc-cargo-accounts-demo-v1"

type LogRow = { id: string; ts: string; title: string; text: string }

type AccountsState = {
  invoices: Invoice[]
  supplierInvoices: SupplierInvoice[]
  pendingJobs: PendingJob[]
  creditCustomers: CreditCustomer[]
  exchangeRates: ExchangeRate[]
  chargeCodes: ChargeCode[]
  taxCodes: TaxCode[]
  bankAccounts: BankAccount[]
  bankFeed: BankFeedRow[]
  postingLog: LogRow[]
  supplierLog: LogRow[]
  selectedInvoiceId: string
  selectedSupplierId: string
}

function seedState(): AccountsState {
  return {
    invoices: [
      {
        id: "INV-1001",
        invoice: "INV-1001",
        job: "JOB-24091",
        customer: "Acme Retail UK",
        customerCode: "ACME",
        user: "Maral",
        mode: "Sea",
        invoiceDate: "2026-03-02",
        dueDate: "2026-04-01",
        amount: 4850,
        cost: 3660,
        currency: "GBP",
        paid: false,
        paidDate: "",
        status: "sent",
        postedPlatform: "",
        postedAt: "",
        route: "Valencia, ES -> Tbilisi, GE",
        transportRefs: ["Master: MEDU3482172", "House/Job Ref: PCCUK24091", "FCL / DAP"],
        lines: [
          { description: "Ocean Freight", amount: 3200, taxCode: "GBZR" },
          { description: "Destination Handling", amount: 850, taxCode: "GBZR" },
          { description: "Customs Clearance", amount: 800, taxCode: "UK20" },
        ],
      },
      {
        id: "INV-1002",
        invoice: "INV-1002",
        job: "JOB-24092",
        customer: "Nomad Tech GmbH",
        customerCode: "NOMAD",
        user: "Ian",
        mode: "Air",
        invoiceDate: "2026-01-12",
        dueDate: "2026-02-11",
        amount: 9200,
        cost: 6120,
        currency: "EUR",
        paid: false,
        paidDate: "",
        status: "overdue",
        postedPlatform: "Xero",
        postedAt: "2026-01-13 09:42",
        route: "Frankfurt, DE -> Manchester, GB",
        transportRefs: ["AWB: 020-88417731", "House Ref: PCCUK24092"],
        lines: [{ description: "Air Freight", amount: 9200, taxCode: "EUZR" }],
      },
      {
        id: "INV-1003",
        invoice: "INV-1003",
        job: "JOB-24093",
        customer: "Silk Route Logistics",
        customerCode: "SILK",
        user: "John",
        mode: "Road",
        invoiceDate: "2026-02-18",
        dueDate: "2026-03-20",
        amount: 6400,
        cost: 5100,
        currency: "USD",
        paid: true,
        paidDate: "2026-02-28",
        status: "paid",
        postedPlatform: "QuickBooks",
        postedAt: "2026-02-19 11:25",
        route: "Istanbul, TR -> Dover, GB",
        transportRefs: ["CMR: TRK-56781", "Trailer: PCU4591"],
        lines: [{ description: "Road Freight", amount: 6400, taxCode: "TR0" }],
      },
      {
        id: "INV-1004",
        invoice: "INV-1004",
        job: "JOB-24094",
        customer: "Acme Retail UK",
        customerCode: "ACME",
        user: "Maral",
        mode: "Warehouse",
        invoiceDate: "2025-12-10",
        dueDate: "2026-01-09",
        amount: 2800,
        cost: 2530,
        currency: "GBP",
        paid: false,
        paidDate: "",
        status: "overdue",
        postedPlatform: "",
        postedAt: "",
        route: "Haydock storage",
        transportRefs: ["Warehouse Ref: WH-22931"],
        lines: [{ description: "Warehouse Storage", amount: 2800, taxCode: "UK20" }],
      },
    ],
    supplierInvoices: [
      {
        id: "PINV-7001",
        supplierInvoice: "MSC-UK-10482",
        job: "JOB-24091",
        supplier: "MSC Mediterranean Shipping Co.",
        supplierCode: "MSC",
        user: "Maral",
        mode: "Sea",
        invoiceDate: "2026-03-01",
        dueDate: "2026-03-15",
        amount: 2750,
        currency: "GBP",
        approved: true,
        approvedDate: "2026-03-02",
        paid: false,
        paidDate: "",
        status: "approved",
        paymentMethod: "Bank Transfer",
        chargeDescription: "Ocean Freight",
        taxCode: "GBZR",
        bank: {
          bankName: "HSBC UK",
          iban: "GB22HBUK04005112345678",
          swift: "MIDLGB22",
          accountNumber: "12345678",
          country: "GB",
        },
      },
      {
        id: "PINV-7002",
        supplierInvoice: "LH-CARGO-8841",
        job: "JOB-24092",
        supplier: "Lufthansa Cargo",
        supplierCode: "LHC",
        user: "Ian",
        mode: "Air",
        invoiceDate: "2026-01-12",
        dueDate: "2026-02-10",
        amount: 6100,
        currency: "EUR",
        approved: true,
        approvedDate: "2026-01-13",
        paid: false,
        paidDate: "",
        status: "overdue",
        paymentMethod: "SEPA Transfer",
        chargeDescription: "Air Freight",
        taxCode: "EUZR",
        bank: {
          bankName: "Deutsche Bank",
          iban: "DE89370400440532013000",
          swift: "DEUTDEFF",
          accountNumber: "0532013000",
          country: "DE",
        },
      },
      {
        id: "PINV-7003",
        supplierInvoice: "TRK-56781",
        job: "JOB-24093",
        supplier: "Anatolia Road Transport",
        supplierCode: "ART",
        user: "John",
        mode: "Road",
        invoiceDate: "2026-02-20",
        dueDate: "2026-03-05",
        amount: 5100,
        currency: "USD",
        approved: true,
        approvedDate: "2026-02-21",
        paid: true,
        paidDate: "2026-02-28",
        status: "paid",
        paymentMethod: "SWIFT Transfer",
        chargeDescription: "Road Freight",
        taxCode: "TR0",
        bank: {
          bankName: "Garanti BBVA",
          iban: "TR330006100519786457841326",
          swift: "TGBATRIS",
          accountNumber: "6457841326",
          country: "TR",
        },
      },
      {
        id: "PINV-7004",
        supplierInvoice: "WH-22931-CST",
        job: "JOB-24094",
        supplier: "Haydock Storage Services",
        supplierCode: "HSS",
        user: "Maral",
        mode: "Warehouse",
        invoiceDate: "2025-12-12",
        dueDate: "2026-01-11",
        amount: 1750,
        currency: "GBP",
        approved: false,
        approvedDate: "",
        paid: false,
        paidDate: "",
        status: "overdue",
        paymentMethod: "Bank Transfer",
        chargeDescription: "Warehouse Storage",
        taxCode: "UK20",
        bank: {
          bankName: "Barclays Bank PLC",
          iban: "GB12BARC12345612345678",
          swift: "BARCGB22",
          accountNumber: "12345678",
          country: "GB",
        },
      },
    ],
    pendingJobs: [
      {
        job: "JOB-24095",
        customer: "Acme Retail UK",
        user: "Maral",
        mode: "Road",
        stage: "Delivered",
        targetInvoiceDate: "2026-03-12",
        estimatedSell: 3250,
        estimatedCost: 2480,
        currency: "GBP",
      },
      {
        job: "JOB-24096",
        customer: "Nomad Tech GmbH",
        user: "Ian",
        mode: "Air",
        stage: "Awaiting costs",
        targetInvoiceDate: "2026-03-15",
        estimatedSell: 7850,
        estimatedCost: 6120,
        currency: "GBP",
      },
      {
        job: "JOB-24097",
        customer: "Silk Route Logistics",
        user: "John",
        mode: "Sea",
        stage: "Discharged",
        targetInvoiceDate: "2026-03-18",
        estimatedSell: 9100,
        estimatedCost: 6980,
        currency: "USD",
      },
      {
        job: "JOB-24098",
        customer: "Baltic Industrial",
        user: "Maral",
        mode: "Warehouse",
        stage: "Ready to bill",
        targetInvoiceDate: "2026-03-11",
        estimatedSell: 1600,
        estimatedCost: 820,
        currency: "GBP",
      },
    ],
    creditCustomers: [
      { customer: "Acme Retail UK", terms: 30, creditLimit: 10000, onHold: true },
      { customer: "Nomad Tech GmbH", terms: 30, creditLimit: 12000, onHold: false },
      { customer: "Silk Route Logistics", terms: 14, creditLimit: 8000, onHold: false },
    ],
    exchangeRates: [
      { id: "RATE-1", base: "GBP", quote: "EUR", rate: 1.17, effectiveDate: "2026-03-10" },
      { id: "RATE-2", base: "GBP", quote: "USD", rate: 1.28, effectiveDate: "2026-03-10" },
      { id: "RATE-3", base: "EUR", quote: "USD", rate: 1.09, effectiveDate: "2026-03-10" },
    ],
    chargeCodes: [
      {
        id: "CHG-1",
        chargeDescription: "Ocean Freight",
        purchaseNominal: "5000",
        salesNominal: "4000",
        mot: "Sea",
        taxCode: "GBZR",
      },
      {
        id: "CHG-2",
        chargeDescription: "Air Freight",
        purchaseNominal: "5100",
        salesNominal: "4100",
        mot: "Air",
        taxCode: "EUZR",
      },
      {
        id: "CHG-3",
        chargeDescription: "Road Freight",
        purchaseNominal: "5200",
        salesNominal: "4200",
        mot: "Road",
        taxCode: "TR0",
      },
      {
        id: "CHG-4",
        chargeDescription: "Warehouse Storage",
        purchaseNominal: "5300",
        salesNominal: "4300",
        mot: "Warehouse",
        taxCode: "UK20",
      },
    ],
    taxCodes: [
      {
        id: "TAX-1",
        country: "United Kingdom",
        code: "GB",
        taxCode: "UK20",
        rate: 20,
        description: "Standard VAT",
      },
      {
        id: "TAX-2",
        country: "United Kingdom",
        code: "GB",
        taxCode: "GBZR",
        rate: 0,
        description: "Zero Rated",
      },
      {
        id: "TAX-3",
        country: "Germany",
        code: "DE",
        taxCode: "EUZR",
        rate: 0,
        description: "EU Reverse Charge / Zero Rated",
      },
      {
        id: "TAX-4",
        country: "Turkiye",
        code: "TR",
        taxCode: "TR0",
        rate: 0,
        description: "Export Zero Rated",
      },
    ],
    bankAccounts: [
      {
        id: "BANK-1",
        account: "PC Cargo UK Ltd - GBP",
        branch: "London City Branch",
        prefix: "00",
        currency: "GBP",
        accountNo: "12345678",
        sortCode: "12-34-56",
        bic: "BARCGB22",
        swift: "BARCGB22",
        iban: "GB12BARC12345612345678",
        bank: "Barclays Bank PLC",
        addressLine1: "1 Bank Street",
        addressLine2: "Canary Wharf",
        addressLine3: "Floor / Building",
        city: "London",
        countyState: "Greater London",
        postCodeZip: "E14 5HP",
        country: "GB",
      },
      {
        id: "BANK-2",
        account: "PC Cargo UK Ltd - EUR",
        branch: "International Payments",
        prefix: "00",
        currency: "EUR",
        accountNo: "99887766",
        sortCode: "",
        bic: "LOYDGB2L",
        swift: "LOYDGB2L",
        iban: "GB29LOYD30927699887766",
        bank: "Lloyds Bank",
        addressLine1: "25 Gresham Street",
        addressLine2: "",
        addressLine3: "",
        city: "London",
        countyState: "Greater London",
        postCodeZip: "EC2V 7HN",
        country: "GB",
      },
    ],
    bankFeed: [
      {
        id: "BF-1",
        date: "2026-02-28",
        reference: "PAY-8821",
        description: "Silk Route remittance",
        direction: "IN",
        currency: "USD",
        amount: 6400,
        matchedInvoice: "INV-1003",
      },
      {
        id: "BF-2",
        date: "2026-03-05",
        reference: "BK-5521",
        description: "Carrier payment",
        direction: "OUT",
        currency: "EUR",
        amount: 4300,
        matchedInvoice: "",
      },
      {
        id: "BF-3",
        date: "2026-03-06",
        reference: "PAY-9182",
        description: "Partial client receipt",
        direction: "IN",
        currency: "GBP",
        amount: 2000,
        matchedInvoice: "INV-1001",
      },
    ],
    postingLog: [
      { id: "LOG-1", ts: "2026-01-13 09:42", title: "Xero INV-1002", text: "Posted successfully" },
      {
        id: "LOG-2",
        ts: "2026-02-19 11:25",
        title: "QuickBooks INV-1003",
        text: "Posted successfully",
      },
    ],
    supplierLog: [
      { id: "SLOG-1", ts: "2026-03-02 09:15", title: "PINV-7001", text: "Approved for payment" },
      { id: "SLOG-2", ts: "2026-02-28 14:10", title: "PINV-7003", text: "Paid by SWIFT Transfer" },
    ],
    selectedInvoiceId: "INV-1001",
    selectedSupplierId: "PINV-7001",
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? ({ ...seedState(), ...JSON.parse(saved) } as AccountsState) : seedState()
  } catch {
    return seedState()
  }
}

const state = reactive<AccountsState>(loadState())

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function timestamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ")
}

function gbp(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value)
}

export function money(value: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(value)
}

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

export function downloadCsv(filename: string, rows: unknown[][]) {
  const blob = new Blob([rows.map(row => row.map(csvEscape).join(",")).join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function parseCsvFile(file: File) {
  const text = await file.text()
  const rows: string[][] = []
  let row: string[] = []
  let cur = ""
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        cur += '"'
        i += 1
      } else quoted = !quoted
    } else if (ch === "," && !quoted) {
      row.push(cur)
      cur = ""
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i += 1
      row.push(cur)
      if (row.some(cell => cell.trim())) rows.push(row)
      row = []
      cur = ""
    } else cur += ch
  }
  row.push(cur)
  if (row.some(cell => cell.trim())) rows.push(row)
  return rows
}

function ageInDays(dateText: string) {
  const due = new Date(`${dateText}T00:00:00`)
  const now = new Date()
  return Math.max(0, Math.floor((now.getTime() - due.getTime()) / 86400000))
}

function statusLabel(status: Invoice["status"] | SupplierInvoice["status"], dueDate: string) {
  if (status === "overdue") return `Overdue ${ageInDays(dueDate)}d`
  return status.replace("-", " ").replace(/\b\w/g, char => char.toUpperCase())
}

function statusTone(status: string): Tone {
  if (status === "paid") return "success"
  if (status === "overdue") return "danger"
  if (status === "sent" || status === "approved" || status === "scheduled") return "warning"
  return "neutral"
}

export function useAccountsDemo() {
  const invoices = computed(() => state.invoices)
  const supplierInvoices = computed(() => state.supplierInvoices)

  const selectedInvoice = computed(
    () =>
      state.invoices.find(invoice => invoice.id === state.selectedInvoiceId) ?? state.invoices[0],
  )
  const selectedSupplier = computed(
    () =>
      state.supplierInvoices.find(invoice => invoice.id === state.selectedSupplierId) ??
      state.supplierInvoices[0],
  )

  const invoiceSummary = computed(() => {
    const outstanding = state.invoices
      .filter(invoice => !invoice.paid)
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const paid = state.invoices
      .filter(invoice => invoice.paid)
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    return [
      { label: "Total Invoices", value: String(state.invoices.length) },
      { label: "Outstanding", value: gbp(outstanding) },
      { label: "Paid", value: gbp(paid) },
      {
        label: "Posted to Finance",
        value: String(state.invoices.filter(invoice => invoice.postedPlatform).length),
      },
      {
        label: "On Hold Customers",
        value: String(state.creditCustomers.filter(customer => customer.onHold).length),
      },
    ]
  })

  const supplierSummary = computed(() => {
    const outstanding = state.supplierInvoices
      .filter(invoice => !invoice.paid)
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const paid = state.supplierInvoices
      .filter(invoice => invoice.paid)
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    return [
      { label: "Total Supplier Invoices", value: String(state.supplierInvoices.length) },
      { label: "Outstanding to Pay", value: gbp(outstanding) },
      { label: "Paid to Suppliers", value: gbp(paid) },
      {
        label: "Approved",
        value: String(state.supplierInvoices.filter(invoice => invoice.approved).length),
      },
      {
        label: "Overdue",
        value: String(
          state.supplierInvoices.filter(invoice => invoice.status === "overdue").length,
        ),
      },
    ]
  })

  const overviewSummary = computed(() => {
    const totalInvoiced = state.invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const totalPending = state.pendingJobs.reduce((sum, job) => sum + job.estimatedSell, 0)
    const grossProfit =
      state.invoices.reduce((sum, invoice) => sum + invoice.amount - invoice.cost, 0) +
      state.pendingJobs.reduce((sum, job) => sum + job.estimatedSell - job.estimatedCost, 0)
    return [
      { label: "Total Jobs Invoiced", value: String(state.invoices.length) },
      { label: "Outstanding Jobs to Invoice", value: String(state.pendingJobs.length) },
      { label: "Total Invoiced Value", value: gbp(totalInvoiced) },
      { label: "Total To Be Invoiced", value: gbp(totalPending) },
      { label: "Gross Profit", value: gbp(grossProfit) },
    ]
  })

  const overviewRows = computed(() => {
    const invoicedSales = state.invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const pendingSales = state.pendingJobs.reduce((sum, job) => sum + job.estimatedSell, 0)
    const invoicedCosts = state.invoices.reduce((sum, invoice) => sum + invoice.cost, 0)
    const pendingCosts = state.pendingJobs.reduce((sum, job) => sum + job.estimatedCost, 0)
    const supplierLedger = state.supplierInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    return [
      {
        metric: "Recognised Sales (Invoiced)",
        value: gbp(invoicedSales),
        comment: `${state.invoices.length} sales invoices raised`,
      },
      {
        metric: "Open Sales Pipeline",
        value: gbp(pendingSales),
        comment: `${state.pendingJobs.length} jobs still to invoice`,
      },
      {
        metric: "Total Sales View",
        value: gbp(invoicedSales + pendingSales),
        comment: "Invoiced plus pending operational billing",
      },
      {
        metric: "Invoiced Job Costs",
        value: gbp(invoicedCosts),
        comment: "Costs carried on customer invoices/jobs",
      },
      {
        metric: "Pending Job Costs",
        value: gbp(pendingCosts),
        comment: "Estimated costs on unbilled jobs",
      },
      {
        metric: "Supplier Purchase Ledger",
        value: gbp(supplierLedger),
        comment: `${state.supplierInvoices.length} supplier invoices logged`,
      },
      {
        metric: "Gross Profit View",
        value: gbp(invoicedSales + pendingSales - invoicedCosts - pendingCosts),
        comment: "Sales less job costs",
      },
      {
        metric: "Net Position vs Supplier Ledger",
        value: gbp(invoicedSales + pendingSales - supplierLedger),
        comment: "Sales less supplier invoice value",
      },
    ]
  })

  const creditRows = computed(() =>
    state.creditCustomers.map(customer => {
      const open = state.invoices.filter(
        invoice => invoice.customer === customer.customer && !invoice.paid,
      )
      const outstanding = open.reduce((sum, invoice) => sum + invoice.amount, 0)
      const oldestDebt = Math.max(0, ...open.map(invoice => ageInDays(invoice.dueDate)))
      const warning = outstanding >= customer.creditLimit || oldestDebt > customer.terms
      return {
        ...customer,
        termsLabel: `${customer.terms} days`,
        creditLimitLabel: gbp(customer.creditLimit),
        outstanding,
        outstandingLabel: gbp(outstanding),
        oldestDebt,
        oldestDebtLabel: `${oldestDebt} days`,
        status: warning ? "Warning" : "OK",
        statusTone: warning ? "warning" : "success",
        hold: customer.onHold ? "ON HOLD" : "Active",
        holdTone: customer.onHold ? "danger" : "neutral",
        openInvoices: open,
      }
    }),
  )

  function resetDemo() {
    localStorage.removeItem(STORAGE_KEY)
    Object.assign(state, seedState())
    saveState()
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "tms_accounts_demo_data.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  function postInvoices(ids: string[], platform: string) {
    const ts = timestamp()
    ids.forEach(id => {
      const invoice = state.invoices.find(item => item.id === id)
      if (!invoice) return
      invoice.postedPlatform = platform
      invoice.postedAt = ts
      state.postingLog.unshift({
        id: `LOG-${Date.now()}-${id}`,
        ts,
        title: `${platform} ${id}`,
        text: "Posted successfully",
      })
    })
    saveState()
  }

  function markInvoicesPaid(ids: string[]) {
    const paidDate = today()
    ids.forEach(id => {
      const invoice = state.invoices.find(item => item.id === id)
      if (!invoice) return
      invoice.paid = true
      invoice.paidDate = paidDate
      invoice.status = "paid"
    })
    saveState()
  }

  function approveSuppliers(ids: string[]) {
    const approvedDate = today()
    ids.forEach(id => {
      const invoice = state.supplierInvoices.find(item => item.id === id)
      if (!invoice) return
      invoice.approved = true
      invoice.approvedDate = approvedDate
      if (invoice.status !== "paid") invoice.status = "approved"
      state.supplierLog.unshift({
        id: `SLOG-${Date.now()}-${id}`,
        ts: timestamp(),
        title: id,
        text: "Approved for payment",
      })
    })
    saveState()
  }

  function scheduleSuppliers(ids: string[]) {
    ids.forEach(id => {
      const invoice = state.supplierInvoices.find(item => item.id === id)
      if (!invoice || invoice.paid) return
      invoice.approved = true
      invoice.approvedDate ||= today()
      invoice.status = "scheduled"
      state.supplierLog.unshift({
        id: `SLOG-${Date.now()}-${id}`,
        ts: timestamp(),
        title: id,
        text: "Scheduled for payment",
      })
    })
    saveState()
  }

  function paySuppliers(ids: string[], method: string) {
    const paidDate = today()
    ids.forEach(id => {
      const invoice = state.supplierInvoices.find(item => item.id === id)
      if (!invoice) return
      invoice.approved = true
      invoice.approvedDate ||= paidDate
      invoice.paid = true
      invoice.paidDate = paidDate
      invoice.status = "paid"
      invoice.paymentMethod = method
      state.supplierLog.unshift({
        id: `SLOG-${Date.now()}-${id}`,
        ts: timestamp(),
        title: id,
        text: `Paid by ${method}`,
      })
    })
    saveState()
  }

  return {
    state,
    invoices,
    supplierInvoices,
    selectedInvoice,
    selectedSupplier,
    invoiceSummary,
    supplierSummary,
    overviewSummary,
    overviewRows,
    creditRows,
    money,
    statusLabel,
    statusTone,
    saveState,
    resetDemo,
    exportJson,
    postInvoices,
    markInvoicesPaid,
    approveSuppliers,
    scheduleSuppliers,
    paySuppliers,
  }
}
