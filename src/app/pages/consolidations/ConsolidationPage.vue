<template>
  <div class="con-page">
    <!-- Top Header -->
    <div class="topbar">
      <div class="topbar-left">
        <div class="crumbline">
          <span class="link-icon pi pi-link" />
          <div class="titlewrap">
            <div class="top-title">
              Master Consol Ref <span class="mono">{{ consolidation.masterRef }}</span>
              <Tag
                :value="consolidation.status"
                :severity="statusSeverity(consolidation.status)"
                class="status-tag"
              />
            </div>
            <div class="top-sub">
              <span class="muted">{{ consolidation.customer }}</span>
              <span class="sep">•</span>
              <span class="muted">{{ consolidation.origin }}</span>
              <span class="arrow">→</span>
              <span class="muted">{{ consolidation.hub1 }}</span>
              <span class="arrow">→</span>
              <span class="muted">{{ consolidation.hub2 }}</span>
              <span class="sep">•</span>
              <span class="muted"><i class="pi pi-box" /> {{ consolidation.mode }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="topbar-right">
        <Button
          label="Add Supplier Order"
          icon="pi pi-plus"
          class="p-button-outlined orbis-primary"
        />
        <Button label="Lock" icon="pi pi-lock" class="p-button-outlined orbis-primary" />
        <Button label="Post Invoices" icon="pi pi-file" class="orbis-primary" />
      </div>
    </div>

    <!-- Consolidation Panel -->
    <Card class="panel">
      <template #content>
        <SectionHead title="Consolidation" subtitle="Control panel for this consolidation.">
          <template #actions>
            <Button label="New CO" icon="pi pi-copy" class="p-button-outlined orbis-primary" />
            <Button
              label="Link Orders"
              icon="pi pi-search"
              class="p-button-outlined orbis-primary"
            />
          </template>
        </SectionHead>

        <div class="formgrid">
          <div class="field">
            <label>Status</label>
            <Dropdown
              v-model="consolidation.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select"
              class="w-full"
            />
          </div>

          <div class="field">
            <label>Mode</label>
            <Dropdown
              v-model="consolidation.mode"
              :options="modeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select"
              class="w-full"
            />
          </div>

          <div class="field span-2">
            <label>Customer</label>
            <InputText v-model="consolidation.customer" class="w-full" />
          </div>

          <div class="field span-2">
            <label>Route</label>
            <InputText v-model="consolidation.route" class="w-full" />
          </div>

          <div class="field span-2">
            <label>Master Reference</label>
            <InputText v-model="consolidation.masterRef" class="mono w-full" />
          </div>

          <div class="field span-2">
            <label>Base Currency</label>
            <InputText v-model="consolidation.baseCurrency" class="w-full" disabled />
          </div>
        </div>
      </template>
    </Card>

    <!-- Summary -->
    <Card class="panel">
      <template #content>
        <div class="summary-head">
          <div>
            <div class="h2">Consolidation Summary</div>
            <div class="muted">Live totals from WMS goods-in and linked supplier orders.</div>
          </div>
          <Tag
            icon="pi pi-exclamation-triangle"
            value="Multi-currency (separate invoices)"
            class="warn-tag"
          />
        </div>

        <div class="tiles">
          <div class="tile">
            <div class="k">SUPPLIER ORDERS LINKED</div>
            <div class="v">{{ summary.supplierOrdersLinked }}</div>
          </div>
          <div class="tile">
            <div class="k">TOTAL PIECES</div>
            <div class="v">{{ summary.totalPieces }}</div>
          </div>
          <div class="tile">
            <div class="k">TOTAL WEIGHT</div>
            <div class="v">{{ summary.totalWeight }} <span class="unit">kg</span></div>
          </div>
          <div class="tile">
            <div class="k">TOTAL VOLUME</div>
            <div class="v">{{ summary.totalVolume }} <span class="unit">cbm</span></div>
          </div>

          <div class="tile">
            <div class="k">REVENUE (BASE GBP)</div>
            <div class="v money">£{{ fmt(summary.revenueBaseGbp) }}</div>
          </div>
          <div class="tile">
            <div class="k">COST (BASE GBP)</div>
            <div class="v money">£{{ fmt(summary.costBaseGbp) }}</div>
          </div>
          <div class="tile">
            <div class="k">MARGIN</div>
            <div class="v money">£{{ fmt(summary.marginBaseGbp) }}</div>
          </div>
          <div class="tile">
            <div class="k">MARGIN %</div>
            <div class="v">{{ fmtPct(summary.marginPct) }}</div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Tabs Card -->
    <div class="con-tabs-card">
      <div class="con-tabs-bar">
        <nav class="con-tabs-nav">
          <button
            class="con-tab"
            :class="{ 'con-tab--active': activeTab === 'draft' }"
            @click="activeTab = 'draft'"
            type="button"
          >
            Draft
          </button>

          <button
            class="con-tab"
            :class="{ 'con-tab--active': activeTab === 'sent' }"
            @click="activeTab = 'sent'"
            type="button"
          >
            Sent
          </button>

          <button
            class="con-tab"
            :class="{ 'con-tab--active': activeTab === 'approved' }"
            @click="activeTab = 'approved'"
            type="button"
          >
            Approved
          </button>

          <button
            class="con-tab"
            :class="{ 'con-tab--active': activeTab === 'rejected' }"
            @click="activeTab = 'rejected'"
            type="button"
          >
            Rejected
          </button>
        </nav>

        <div class="con-tabs-tools">
          <div class="con-tabs-mode">
            <span class="con-tabs-mode__label">Mode of Transport</span>
            <Dropdown
              v-model="selectedTabMode"
              :options="modeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select mode"
              class="con-tabs-mode__dropdown"
            />
          </div>
        </div>
      </div>

      <div class="con-tabs-content">
        <!-- Draft -->
        <Card v-if="activeTab === 'draft'" class="panel">
          <template #content>
            <SectionHead
              title="Draft"
              subtitle="Draft consolidation invoices and working records for review."
            >
              <template #actions>
                <Button
                  label="Generate from GRNs"
                  icon="pi pi-bolt"
                  class="p-button-outlined orbis-primary"
                />
                <Button
                  label="Import"
                  icon="pi pi-upload"
                  class="p-button-outlined orbis-primary"
                />
              </template>
            </SectionHead>

            <div class="invoice-toprow">
              <div class="currency-switch">
                <div class="label">INVOICE CURRENCY</div>
                <CurrencyPills v-model="invoiceCurrency" :options="invoiceCurrencies" />
              </div>

              <div class="totals-mini">
                <div>
                  <span class="muted">Total:</span> <b>{{ activeCurrencyTotalLabel }}</b>
                </div>
                <div>
                  <span class="muted">Base:</span> <b>£{{ fmt(activeCurrencyBaseTotalGbp) }}</b>
                </div>
              </div>
            </div>

            <div class="invoice-box">
              <div class="subhead">TOTALS BY CURRENCY (ALL DRAFTS)</div>
              <div class="totals-row">
                <div class="totchip" v-for="t in totalsByCurrency" :key="t.currency">
                  <span class="muted">{{ t.currency }}:</span> <b>{{ t.totalLabel }}</b>
                </div>
              </div>
            </div>

            <div class="invoice-box" v-if="supplierBreakdown.length">
              <div class="subhead">SUPPLIER BREAKDOWN (AUDIT) — {{ invoiceCurrency }}</div>
              <div class="chips">
                <span class="chip" v-for="s in supplierBreakdown" :key="s.supplier">
                  {{ s.supplier }}: {{ s.totalLabel }}
                </span>
              </div>
            </div>

            <DataTable :value="invoiceLinesFiltered" class="datatable" responsiveLayout="scroll">
              <Column field="shippingLabel" header="Shipping Label" />
              <Column field="description" header="Description" />
              <Column field="qty" header="Qty" />
              <Column field="uom" header="UOM" />
              <Column field="coo" header="COO" />
              <Column field="hsCode" header="HS Code" />

              <Column header="Unit Value">
                <template #body="{ data }">
                  {{ money(data.currency, data.unitValue) }}
                </template>
              </Column>

              <Column header="Total Value">
                <template #body="{ data }">
                  <b>{{ money(data.currency, data.totalValue) }}</b>
                </template>
              </Column>

              <Column field="currency" header="Currency" />

              <Column header="Supplier">
                <template #body="{ data }">
                  <span v-if="data.supplier" class="chip-inline">{{ data.supplier }}</span>
                  <span v-else>—</span>
                </template>
              </Column>

              <Column field="grn" header="GRN" />

              <Column header="FX → GBP">
                <template #body="{ data }">
                  <span v-if="data.currency === 'GBP'">—</span>
                  <b v-else>{{ Number(data.fxToGbp || 0).toFixed(4) }}</b>
                </template>
              </Column>

              <Column header="Total (Base)">
                <template #body="{ data }">
                  <b>£{{ fmt(lineBaseTotalGbp(data)) }}</b>
                </template>
              </Column>
            </DataTable>

            <div class="invoice-foot">
              <div class="tip muted">
                Tip: Shipping Label lines are what you'll print/store; invoices pull from these plus
                customs fields.
              </div>
              <div class="base-total">
                <div class="bt-label">ACTIVE DRAFT BASE TOTAL</div>
                <div class="bt-value">£{{ fmt(activeCurrencyBaseTotalGbp) }}</div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Sent -->
        <Card v-if="activeTab === 'sent'" class="panel">
          <template #content>
            <SectionHead
              title="Sent"
              subtitle="Invoices or documents that have been issued and sent to the customer."
            >
              <template #actions>
                <Button label="Resend" icon="pi pi-send" class="p-button-outlined orbis-primary" />
              </template>
            </SectionHead>

            <DataTable :value="invoiceLinesFiltered" class="datatable" responsiveLayout="scroll">
              <Column field="shippingLabel" header="Shipping Label" />
              <Column field="description" header="Description" />
              <Column field="qty" header="Qty" />
              <Column field="currency" header="Currency" />
              <Column header="Total Value">
                <template #body="{ data }">
                  <b>{{ money(data.currency, data.totalValue) }}</b>
                </template>
              </Column>
              <Column header="Supplier">
                <template #body="{ data }">
                  <span v-if="data.supplier" class="chip-inline">{{ data.supplier }}</span>
                  <span v-else>—</span>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>

        <!-- Approved -->
        <Card v-if="activeTab === 'approved'" class="panel">
          <template #content>
            <SectionHead
              title="Approved"
              subtitle="Approved records ready for posting and downstream accounting processes."
            >
              <template #actions>
                <Button
                  label="Post Invoices"
                  icon="pi pi-check"
                  class="p-button-outlined orbis-primary"
                />
              </template>
            </SectionHead>

            <DataTable :value="invoiceLinesFiltered" class="datatable" responsiveLayout="scroll">
              <Column field="shippingLabel" header="Shipping Label" />
              <Column field="description" header="Description" />
              <Column field="qty" header="Qty" />
              <Column field="currency" header="Currency" />
              <Column header="Total Value">
                <template #body="{ data }">
                  <b>{{ money(data.currency, data.totalValue) }}</b>
                </template>
              </Column>
              <Column field="grn" header="GRN" />
            </DataTable>
          </template>
        </Card>

        <!-- Rejected -->
        <Card v-if="activeTab === 'rejected'" class="panel">
          <template #content>
            <SectionHead
              title="Rejected"
              subtitle="Rejected items that need correction before they can proceed."
            >
              <template #actions>
                <Button
                  label="Return to Draft"
                  icon="pi pi-undo"
                  class="p-button-outlined orbis-primary"
                />
              </template>
            </SectionHead>

            <DataTable :value="invoiceLinesFiltered" class="datatable" responsiveLayout="scroll">
              <Column field="shippingLabel" header="Shipping Label" />
              <Column field="description" header="Description" />
              <Column field="qty" header="Qty" />
              <Column field="currency" header="Currency" />
              <Column header="Total Value">
                <template #body="{ data }">
                  <b>{{ money(data.currency, data.totalValue) }}</b>
                </template>
              </Column>
              <Column header="Supplier">
                <template #body="{ data }">
                  <span v-if="data.supplier" class="chip-inline">{{ data.supplier }}</span>
                  <span v-else>—</span>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import SectionHead from "@/app/components/consolidations/SectionHead.vue"
import CurrencyPills from "@/app/components/consolidations/CurrencyPills.vue"

type Currency = "GBP" | "USD" | "EUR"
type ConsolidationStatus = "Open" | "Locked" | "Closed"
type Mode = "Air" | "Sea" | "Road"
type StatusTab = "draft" | "sent" | "approved" | "rejected"

type InvoiceLine = {
  shippingLabel: string
  description: string
  qty: number
  uom: string
  coo: string
  hsCode: string
  unitValue: number
  totalValue: number
  currency: Currency
  supplier?: string
  grn?: string
  fxToGbp?: number
}

const statusOptions: Array<{ label: string; value: ConsolidationStatus }> = [
  { label: "Open", value: "Open" },
  { label: "Locked", value: "Locked" },
  { label: "Closed", value: "Closed" },
]

const modeOptions: Array<{ label: string; value: Mode }> = [
  { label: "Air", value: "Air" },
  { label: "Sea", value: "Sea" },
  { label: "Road", value: "Road" },
]

const consolidation = reactive({
  masterRef: "CON-PE-000245",
  status: "Open" as ConsolidationStatus,
  mode: "Air" as Mode,
  customer: "Far East Trading (HK)",
  route: "LHR → LIS → HKG",
  baseCurrency: "GBP" as Currency,
  origin: "Far East Trading (HK)",
  hub1: "LHR",
  hub2: "LIS",
})

const summary = reactive({
  supplierOrdersLinked: 3,
  totalPieces: 4700,
  totalWeight: 185,
  totalVolume: 0.75,
  revenueBaseGbp: 3476.92,
  costBaseGbp: 2503.38,
  marginBaseGbp: 973.54,
  marginPct: 0.28,
})

const activeTab = ref<StatusTab>("draft")
const selectedTabMode = ref<Mode>("Air")

const invoiceCurrencies = ["GBP", "USD", "EUR"] as const
const invoiceCurrency = ref<Currency>("USD")

const invoiceLines = ref<InvoiceLine[]>([
  {
    shippingLabel: "LBL-USD-0001",
    description: "Integrated Circuits (IC-74HC595)",
    qty: 3000,
    uom: "PCS",
    coo: "CN",
    hsCode: "8542.31",
    unitValue: 0.42,
    totalValue: 1260.0,
    currency: "USD",
    supplier: "Shenzhen ABC Components Co., Ltd.",
    grn: "GRN-8812",
    fxToGbp: 0.79,
  },
  {
    shippingLabel: "LBL-USD-0002",
    description: "Plastic Housings (PL-AB-12)",
    qty: 1200,
    uom: "PCS",
    coo: "CN",
    hsCode: "3926.90",
    unitValue: 0.85,
    totalValue: 1020.0,
    currency: "USD",
    supplier: "Guangzhou DEF Plastics Ltd.",
    grn: "GRN-8831",
    fxToGbp: 0.79,
  },
  {
    shippingLabel: "LBL-USD-0003",
    description: "Aluminium Brackets (AL-BKT-9)",
    qty: 500,
    uom: "PCS",
    coo: "CN",
    hsCode: "7616.99",
    unitValue: 1.6,
    totalValue: 800.0,
    currency: "USD",
    supplier: "Ningbo GHI Metals",
    grn: "GRN-8879",
    fxToGbp: 0.79,
  },
  {
    shippingLabel: "LBL-GBP-SERV",
    description: "Handling & Storage (consolidation period)",
    qty: 1,
    uom: "PCS",
    coo: "GB",
    hsCode: "–",
    unitValue: 180.0,
    totalValue: 180.0,
    currency: "GBP",
    supplier: "",
    grn: "",
    fxToGbp: 1,
  },
  {
    shippingLabel: "LBL-GBP-SERV",
    description: "Export documentation",
    qty: 1,
    uom: "PCS",
    coo: "GB",
    hsCode: "–",
    unitValue: 45.0,
    totalValue: 45.0,
    currency: "GBP",
    supplier: "",
    grn: "",
    fxToGbp: 1,
  },
  {
    shippingLabel: "LBL-EUR-0001",
    description: "EU-sourced Components (assorted)",
    qty: 850,
    uom: "PCS",
    coo: "NL",
    hsCode: "8536.90",
    unitValue: 1.12,
    totalValue: 952.0,
    currency: "EUR",
    supplier: "Rotterdam Parts BV",
    grn: "GRN-8902",
    fxToGbp: 0.86,
  },
])

const invoiceLinesFiltered = computed<InvoiceLine[]>(() =>
  invoiceLines.value.filter(l => l.currency === invoiceCurrency.value),
)

function lineBaseTotalGbp(line: InvoiceLine): number {
  const total = Number(line.totalValue || 0)
  if (line.currency === "GBP") return total
  return total * Number(line.fxToGbp || 0)
}

const activeCurrencyBaseTotalGbp = computed<number>(() =>
  invoiceLinesFiltered.value.reduce((acc, l) => acc + lineBaseTotalGbp(l), 0),
)

const activeCurrencyTotalLabel = computed<string>(() => {
  const total = invoiceLinesFiltered.value.reduce((acc, l) => acc + Number(l.totalValue || 0), 0)
  return money(invoiceCurrency.value, total)
})

const totalsByCurrency = computed<Array<{ currency: Currency; totalLabel: string }>>(() => {
  const map = new Map<Currency, number>()
  invoiceLines.value.forEach(l => {
    map.set(l.currency, (map.get(l.currency) || 0) + Number(l.totalValue || 0))
  })

  return invoiceCurrencies
    .filter(c => map.has(c))
    .map(c => ({ currency: c, totalLabel: money(c, map.get(c) || 0) }))
})

const supplierBreakdown = computed<Array<{ supplier: string; total: number; totalLabel: string }>>(
  () => {
    const group = new Map<string, number>()

    invoiceLinesFiltered.value.forEach(l => {
      const s = (l.supplier || "").trim()
      if (!s) return
      group.set(s, (group.get(s) || 0) + Number(l.totalValue || 0))
    })

    return Array.from(group.entries())
      .map(([supplier, total]) => ({
        supplier,
        total,
        totalLabel: money(invoiceCurrency.value, total),
      }))
      .sort((a, b) => b.total - a.total)
  },
)

function fmt(n: number): string {
  return Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtPct(n: number): string {
  return `${(Number(n || 0) * 100).toFixed(1)}%`
}

function money(ccy: Currency, n: number): string {
  const map: Record<Currency, string> = { USD: "$", EUR: "€", GBP: "£" }
  const v = Number(n || 0)
  return `${map[ccy]}${v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function statusSeverity(s: ConsolidationStatus) {
  if (s === "Open") return "success"
  if (s === "Locked") return "warning"
  if (s === "Closed") return "secondary"
  return "secondary"
}
</script>

<style src="./ConsolidationPage.css" scoped></style>
