import { defineStore } from "pinia";
import { ref } from "vue";

import transportJobs from "@/app/services/transport-jobs";
import type {
  TransportJob,
  PaginatedResponse,
  TransportJobCreatePayload,
  TransportJobUpdatePayload,
  TransportMode,
  JobType,
} from "@/app/types/transport-job";

export type TransportJobFetchParams = {
  page?: number;
  per_page?: number;

  customer_id?: number;
  mode_of_transport?: TransportMode;
  job_type?: JobType;
  status?: string;
  q?: string;
};

export const useTransportJobStore = defineStore("transportJob", () => {
  const items = ref<TransportJob[]>([]);
  const loading = ref(false);

  const page = ref(1);
  const perPage = ref(15);
  const total = ref(0);
  const lastPage = ref(1);

  const activeMode = ref<TransportMode | null>(null);
  const activeJobType = ref<JobType | null>(null);
  const activeCustomerId = ref<number | null>(null);
  const status = ref<string | null>(null);
  const q = ref<string>("");

  function buildParams(overrides: TransportJobFetchParams = {}): TransportJobFetchParams {
    return {
      page: overrides.page ?? page.value,
      per_page: overrides.per_page ?? perPage.value,

      customer_id: overrides.customer_id ?? activeCustomerId.value ?? undefined,
      mode_of_transport: overrides.mode_of_transport ?? activeMode.value ?? undefined,
      job_type: overrides.job_type ?? activeJobType.value ?? undefined,
      status: overrides.status ?? status.value ?? undefined,
      q: overrides.q ?? (q.value || undefined),
    };
  }

  async function fetch(overrides: TransportJobFetchParams = {}) {
    loading.value = true;
    try {
      const params = buildParams(overrides);

      const res: PaginatedResponse<TransportJob> = await transportJobs.list(params);

      items.value = res.data;

      if (res.meta) {
        page.value = res.meta.current_page;
        perPage.value = res.meta.per_page;
        total.value = res.meta.total;
        lastPage.value = res.meta.last_page;
      }

      return res;
    } finally {
      loading.value = false;
    }
  }

  async function show(id: number) {
    loading.value = true;
    try {
      const job = await transportJobs.show(id);

      const idx = items.value.findIndex((x) => x.id === job.id);
      if (idx >= 0) items.value[idx] = job;
      else items.value.unshift(job);

      return job;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload: TransportJobCreatePayload) {
    loading.value = true;
    try {
      const job = await transportJobs.create(payload);
      items.value.unshift(job);
      total.value += 1;
      return job;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: number, payload: TransportJobUpdatePayload) {
    loading.value = true;
    try {
      const job = await transportJobs.update(id, payload);

      const idx = items.value.findIndex((x) => x.id === job.id);
      if (idx >= 0) items.value[idx] = job;

      return job;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: number) {
    loading.value = true;
    try {
      await transportJobs.remove(id);
      items.value = items.value.filter((x) => x.id !== id);
      total.value = Math.max(0, total.value - 1);
      return true;
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    loading,

    activeMode,
    activeJobType,
    activeCustomerId,
    status,
    q,

    page,
    perPage,
    total,
    lastPage,

    fetch,
    show,
    create,
    update,
    remove,
  };
});
