import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";

import { useTransportJobStore } from "@/app/stores/transport-job";
import { useContactStore } from "@/app/stores/contact";

import type {
  TransportJob,
  TransportJobUpdatePayload,
  TransportMode,
} from "@/app/types/transport-job";
import type { Contact } from "@/app/types/contact";

import type {
  JobDetailsTabItem,
  JobDetailsTabKey,
} from "@/app/components/jobs/details";

function toDateOrNull(v: any): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toIsoDate(v: Date | null): string | null {
  if (!v) return null;
  return v.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function useJobDetailsPage() {
  const route = useRoute();
  const toast = useToast();

  const transportJobsStore = useTransportJobStore();
  const contactStore = useContactStore();

  const activeTab = ref<JobDetailsTabKey>("overview");

  const tabs = ref<JobDetailsTabItem[]>([
    { key: "overview", label: "Overview" },
    { key: "transport", label: "Transport" },
    { key: "milestones", label: "Milestones" },
    { key: "docs", label: "Docs" },
    { key: "costs", label: "Costs & Charges" },
    { key: "invoices", label: "Invoices" },
    { key: "packages", label: "Packages" },
    { key: "customs", label: "Customs" },
    { key: "notes", label: "Notes" },
  ]);

  const jobId = computed<number | null>(() => {
    const raw = route.params.id;
    const n = Number(Array.isArray(raw) ? raw[0] : raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  });

  const job = ref<TransportJob | null>(null);
  const loading = computed(() => transportJobsStore.loading);
  const saving = ref(false);

  // ---- CUSTOMER FILTER (copy behavior from create page) ----
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

  const customerOptions = computed(() => {
    const items: Contact[] = (contactStore.items ?? []) as any;
    return items.map((c: any) => ({
      label: contactDisplayName(c),
      value: Number(c.id),
    }));
  });

  async function initCustomerFilter() {
    // keep old filters (so we can restore when leaving)
    prevTypeId.value = (contactStore as any).activeTypeId ?? null;
    prevSearch.value = (contactStore as any).search ?? "";

    await contactStore.fetchTypes();

    // set customer type + blank search
    if (typeof (contactStore as any).setTypeId === "function") {
      await (contactStore as any).setTypeId(customerTypeId.value ?? null);
    } else {
      // fallback if you only have activeTypeId
      (contactStore as any).activeTypeId = customerTypeId.value ?? null;
    }

    if (typeof (contactStore as any).setSearch === "function") {
      await (contactStore as any).setSearch("");
    } else {
      (contactStore as any).search = "";
    }

    // fetch list
    if (typeof (contactStore as any).fetch === "function") {
      await (contactStore as any).fetch();
    }
  }

  function cleanupCustomerFilter() {
    // restore previous list filter for other pages
    (contactStore as any).activeTypeId = prevTypeId.value;
    (contactStore as any).search = prevSearch.value;
  }

  // PrimeVue Dropdown filter event
  async function onCustomerFilter(e: any) {
    const q = String(e?.value ?? e?.query ?? "").trim();

    if (typeof (contactStore as any).setSearch === "function") {
      await (contactStore as any).setSearch(q);
    } else {
      (contactStore as any).search = q;
    }

    if (typeof (contactStore as any).fetch === "function") {
      await (contactStore as any).fetch();
    }
  }

  // ---------------------------------------------------------

  const form = reactive({
    customer_id: null as number | null,
    quote_ref: "" as string,
    job_date: null as Date | null,

    account_number: "" as string,
    job_number: "" as string,

    mode_of_transport: null as TransportMode | null,

    // overview route fields (UI)
    collection_address: "" as string,
    delivery_address: "" as string,
    collection_date: null as Date | null,
    delivery_date: null as Date | null,
    cmr_number: "" as string,
    warehouse_grn: "" as string,
  });

  const modeOptions = computed(() => [
    { label: "Road", value: "road" },
    { label: "Sea", value: "sea" },
    { label: "Air", value: "air" },
    { label: "Rail", value: "rail" },
  ]);

  const headerTitle = computed(() => {
    if (job.value?.job_number) return `Job: ${job.value.job_number}`;
    return "Job";
  });

  function hydrateFromJob(j: TransportJob) {
    form.customer_id = j.customer_id ?? null;
    form.quote_ref = j.quote_ref ?? "";
    form.job_date = toDateOrNull(j.job_date);

    form.job_number = j.job_number ?? "";
    form.mode_of_transport = (j.mode_of_transport ?? null) as any;

    // account number from API (preferred)
    const acc =
      (j as any).account_number ??
      (j.customer_contact as any)?.account_number ??
      "";

    form.account_number = acc || "";

    // optional overview fields if backend supports
    form.collection_address = (j as any).collection_address ?? "";
    form.delivery_address = (j as any).delivery_address ?? "";
    form.collection_date = toDateOrNull((j as any).collection_date);
    form.delivery_date = toDateOrNull((j as any).delivery_date);
    form.cmr_number = (j as any).cmr_number ?? "";
    form.warehouse_grn = (j as any).warehouse_grn ?? "";
  }

  async function load() {
    if (!jobId.value) return;

    const j = await transportJobsStore.show(jobId.value);
    job.value = j;
    hydrateFromJob(j);
  }

  // ✅ When customer changes, update account number (copied concept)
  watch(
    () => form.customer_id,
    (id) => {
      if (!id) {
        form.account_number = "";
        return;
      }

      const c = (contactStore.items ?? []).find((x: any) => Number(x.id) === Number(id)) as any;
      if (c) {
        form.account_number = c.account_number ?? "";
      }
    }
  );

  // ✅ Save (update backend)
  async function onSave() {
    if (!jobId.value) return;

    saving.value = true;
    try {
      const payload: TransportJobUpdatePayload = {
        customer_id: form.customer_id ?? null,
        quote_ref: form.quote_ref || null,
        job_date: toIsoDate(form.job_date),
        mode_of_transport: (form.mode_of_transport ?? "road") as any,
      };

      const updated = await transportJobsStore.update(jobId.value, payload);
      job.value = updated;
      hydrateFromJob(updated);

      toast.add({
        severity: "success",
        summary: "Saved",
        detail: "Job updated",
        life: 2200,
      });

      // Optional: reload to ensure relations/customer_contact refreshed
      await load();
    } catch (e: any) {
      const msg = String(e?.response?.data?.message ?? e?.message ?? "Unable to save job");
      toast.add({
        severity: "error",
        summary: "Failed",
        detail: msg,
        life: 4000,
      });
      throw e;
    } finally {
      saving.value = false;
    }
  }

  // actions placeholders
  function onCreateShipment() {}
  function onCreateInvoice() {}
  function onPreAlert() {}
  function onPrint() {}
  function onExportPdf() {}

  onMounted(async () => {
    await initCustomerFilter();
    await load();
  });

  watch(jobId, async () => {
    await initCustomerFilter();
    await load();
  });

  return {
    job,
    jobId,

    loading,
    saving,

    headerTitle,
    form,
    modeOptions,

    tabs,
    activeTab,

    // customer dropdown
    customerOptions,
    onCustomerFilter,

    onSave,
    onCreateShipment,
    onCreateInvoice,
    onPreAlert,
    onPrint,
    onExportPdf,

    cleanupCustomerFilter,
  };
}
