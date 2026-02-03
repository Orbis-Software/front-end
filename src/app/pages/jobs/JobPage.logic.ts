// src/app/pages/jobs/JobPage.logic.ts
import { computed, reactive, ref, watch } from "vue";
import { useContactStore } from "@/app/stores/contact";
import type { Contact } from "@/app/types/contact";

/* =====================
 * Types
 * ===================== */
export type JobTypeKey =
  | "import"
  | "export"
  | "domestic"
  | "cross_trade"
  | "multi_modal";

export type ModeKey = "air" | "rail" | "road" | "sea";

export type CardItem<K extends string> = {
  key: K;
  title: string;
  subtitle: string;
};

/* =====================
 * Static options
 * ===================== */
export const JOB_TYPES: CardItem<JobTypeKey>[] = [
  { key: "import", title: "Import", subtitle: "Create an Import job" },
  { key: "export", title: "Export", subtitle: "Create an Export job" },
  { key: "domestic", title: "Domestic", subtitle: "Create a Domestic job" },
  { key: "cross_trade", title: "Cross-trade", subtitle: "Create a Cross-trade job" },
  { key: "multi_modal", title: "Multi-Modal", subtitle: "Create a Multi-Modal job" },
];

export const MODES: CardItem<ModeKey>[] = [
  { key: "air", title: "Air", subtitle: "Choose Air" },
  { key: "rail", title: "Rail", subtitle: "Choose Rail" },
  { key: "road", title: "Road", subtitle: "Choose Road" },
  { key: "sea", title: "Sea", subtitle: "Choose Sea" },
];

/* =====================
 * Job type / mode state
 * ===================== */
export const jobType = ref<JobTypeKey | null>(null);
export const mode = ref<ModeKey | null>(null);

export const jobTypeLabel = computed(
  () => JOB_TYPES.find((x) => x.key === jobType.value)?.title ?? ""
);

export const modeLabel = computed(
  () => MODES.find((x) => x.key === mode.value)?.title ?? ""
);

export function selectJobType(next: JobTypeKey) {
  jobType.value = next;
  mode.value = null;
}

export function selectMode(next: ModeKey) {
  mode.value = next;
}

export function resetAll() {
  jobType.value = null;
  mode.value = null;
}

/* =====================
 * Job number generator
 * ===================== */
export function generateJobNumber(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  let rand: number;

  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    rand = (arr[0] ?? 0) % 1_000_000; // ✅ TS-safe
  } else {
    rand = Math.floor(Math.random() * 1_000_000);
  }

  return `JOB${yy}${mm}${dd}-${rand.toString().padStart(6, "0")}`;
}

export function formatDateYYYYMMDD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/* =====================
 * Page form state
 * ===================== */
export const internalNotes = ref("");

export const meta = reactive<{
  customer_id: number | null;
  customer_name: string;
  account_number: string;
  customer_quote_ref: string;
  job_number: string;
  job_date: Date | null;
}>({
  customer_id: null,
  customer_name: "",
  account_number: "",
  customer_quote_ref: "",
  job_number: "",
  job_date: null,
});

/* =====================
 * Customer dropdown logic
 * ===================== */
export const contactStore = useContactStore();

export const customerSuggestions = computed<Contact[]>(() => contactStore.items);

function contactDisplayName(c: any) {
  return (
    c.name ??
    c.full_name ??
    c.company_name ??
    [c.first_name, c.last_name].filter(Boolean).join(" ") ??
    ""
  )
}


export async function searchCustomers(query: string) {
  if (!contactStore.items.length) {
    await contactStore.fetch();
  }

  return contactStore.items.filter((c) =>
    contactDisplayName(c).toLowerCase().includes(query.toLowerCase())
  );
}

export function selectCustomer(customer: Contact) {
  meta.customer_id = customer.id;
  meta.customer_name = customer.company_name ?? "";
  meta.account_number = customer.account_number ?? "";
}

/* =====================
 * Auto-generate job number
 * ===================== */
watch(
  () => [jobType.value, mode.value],
  ([jt, md]) => {
    if (jt && md && !meta.job_number) {
      meta.job_number = generateJobNumber();
    }
  }
);
