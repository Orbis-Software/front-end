import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useContactStore } from "@/app/stores/contact";
import { useTransportJobStore } from "@/app/stores/transport-job";
import type { Contact } from "@/app/types/contact";
import type { JobType, TransportMode, TransportJob } from "@/app/types/transport-job";

export type JobTypeKey = "import" | "export" | "domestic" | "cross_trade";
export type ModeKey = "air" | "rail" | "road" | "sea";

export type CardItem<K extends string> = {
  key: K;
  title: string;
  subtitle: string;
};

export const JOB_TYPES: CardItem<JobTypeKey>[] = [
  { key: "import", title: "Import", subtitle: "Create an Import job" },
  { key: "export", title: "Export", subtitle: "Create an Export job" },
  { key: "domestic", title: "Domestic", subtitle: "Create a Domestic job" },
  { key: "cross_trade", title: "Cross-trade", subtitle: "Create a Cross-trade job" },
];

export const MODES: CardItem<ModeKey>[] = [
  { key: "air", title: "Air", subtitle: "Choose Air" },
  { key: "rail", title: "Rail", subtitle: "Choose Rail" },
  { key: "road", title: "Road", subtitle: "Choose Road" },
  { key: "sea", title: "Sea", subtitle: "Choose Sea" },
];

export function useJobCreatePage() {
  const router = useRouter();
  const toast = useToast();

  const contactStore = useContactStore();
  const store = useTransportJobStore();

  const jobType = ref<JobTypeKey | null>(null);
  const mode = ref<ModeKey | null>(null);

  const jobTypeLabel = computed(
    () => JOB_TYPES.find((x) => x.key === jobType.value)?.title ?? ""
  );

  const modeLabel = computed(() => MODES.find((x) => x.key === mode.value)?.title ?? "");

  const form = reactive<{
    customer_id: number | null;
    customer_quote_ref: string;
    job_number: string;
    job_date: Date | null;
    note: string;
  }>({
    customer_id: null,
    customer_quote_ref: "",
    job_number: "",
    job_date: null,
    note: "",
  });

  const creating = ref(false);
  const createError = ref<string>("");

  const canCreate = computed(() => {
    return !!jobType.value && !!mode.value && !!form.job_number && !creating.value;
  });

  const selectedCustomer = ref<Contact | null>(null);
  const customerSuggestions = computed<Contact[]>(() => contactStore.items);

  const prevTypeId = ref<number | null>(null);
  const prevSearch = ref<string>("");

  const customerTypeId = computed<number | null>(() => {
    const t = (contactStore.types ?? []).find((x: any) => {
      const name = String(x?.name ?? "").toLowerCase();
      return name === "customer";
    });
    return t?.id ?? null;
  });

  function contactDisplayName(c: any) {
    return (
      c.company_name ??
      c.name ??
      [c.first_name, c.last_name].filter(Boolean).join(" ") ??
      ""
    );
  }

  const customerOptionLabel = (c: any) => contactDisplayName(c);

  const accountNumberPreview = computed(() => {
    return (selectedCustomer.value as any)?.account_number ?? "";
  });

  function selectJobType(next: JobTypeKey) {
    jobType.value = next;
    mode.value = null;
  }

  function selectMode(next: ModeKey) {
    mode.value = next;
  }

  function resetAll() {
    jobType.value = null;
    mode.value = null;
    form.job_number = "";
    form.job_date = null;
  }

  function generateJobNumber(): string {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const rand = Math.floor(Math.random() * 1_000_000);
    return `JOB${yy}${mm}${dd}-${rand.toString().padStart(6, "0")}`;
  }

  function formatDateYYYYMMDD(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }

  async function initJobPage() {
    prevTypeId.value = contactStore.activeTypeId;
    prevSearch.value = contactStore.search ?? "";

    await contactStore.fetchTypes();
    await contactStore.setTypeId(customerTypeId.value ?? null);
    await contactStore.setSearch("");
  }

  function cleanupJobPage() {
    contactStore.activeTypeId = prevTypeId.value;
    contactStore.search = prevSearch.value;
  }

  async function onCustomerComplete(e: any) {
    const q = String(e?.query ?? "").trim();
    await contactStore.setSearch(q);
  }

  function onCustomerSelect(e: any) {
    const c: Contact | null = e?.value ?? null;
    if (!c) return;

    selectedCustomer.value = c;
    form.customer_id = c.id;
  }

  function onCustomerClear() {
    selectedCustomer.value = null;
    form.customer_id = null;
  }

  watch(
    () => [jobType.value, mode.value],
    ([jt, md]) => {
      if (jt && md && !form.job_number) {
        form.job_number = generateJobNumber();
      }
    }
  );

  function buildCreateJobPayload() {
    return {
      job_type: jobType.value as JobType,
      mode_of_transport: mode.value as TransportMode,
      customer_id: form.customer_id,
      quote_ref: form.customer_quote_ref,
      job_number: form.job_number,
      job_date: form.job_date ? formatDateYYYYMMDD(form.job_date) : null,
      note: form.note,
    };
  }

  function extractErrorMessage(err: any): string {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create job.";
    return String(msg);
  }

  async function onSave() {
    if (!canCreate.value) return;

    creating.value = true;
    createError.value = "";

    try {
      const payload = buildCreateJobPayload();
      const job: TransportJob = await store.create(payload);

      toast.add({ severity: "success", summary: "Success", detail: "Job created", life: 2500 });

      await router.push("/dashboard");
      return job;
    } catch (e: any) {
      createError.value = extractErrorMessage(e);

      toast.add({
        severity: "error",
        summary: "Failed",
        detail: createError.value || "Unable to create job",
        life: 4000,
      });

      throw e;
    } finally {
      creating.value = false;
    }
  }

  function onCancel() {
    form.note = "";
    form.customer_id = null;
    form.customer_quote_ref = "";
    form.job_number = "";
    form.job_date = null;

    selectedCustomer.value = null;
    createError.value = "";

    resetAll();
  }

  return {
    store,

    JOB_TYPES,
    MODES,

    jobType,
    mode,
    jobTypeLabel,
    modeLabel,
    selectJobType,
    selectMode,

    form,
    selectedCustomer,
    customerSuggestions,
    customerOptionLabel,
    accountNumberPreview,

    creating,
    canCreate,
    createError,

    initJobPage,
    cleanupJobPage,
    onCustomerComplete,
    onCustomerSelect,
    onCustomerClear,

    onSave,
    onCancel,
  };
}
