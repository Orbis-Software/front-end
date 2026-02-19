import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useTransportJobStore } from "@/app/stores/transport-job"
import type { JobType, TransportMode } from "@/app/types/transport-job"

export type JobTypeKey = "all" | "import" | "export" | "domestic" | "cross_trade"
export type ModeKey = "all" | "air" | "sea" | "road" | "rail"

type Option<T> = { label: string; value: T }

export function useJobsListPage() {
  const router = useRouter()
  const store = useTransportJobStore()

  const jobTypeOptions: Option<JobTypeKey>[] = [
    { label: "All", value: "all" },
    { label: "Import", value: "import" },
    { label: "Export", value: "export" },
    { label: "Domestic", value: "domestic" },
    { label: "Cross-trade", value: "cross_trade" },
  ]

  const modeOptions: Option<ModeKey>[] = [
    { label: "All", value: "all" },
    { label: "Air", value: "air" },
    { label: "Sea", value: "sea" },
    { label: "Road", value: "road" },
    { label: "Rail", value: "rail" },
  ]

  const jobTypeFilter = ref<JobTypeKey>("all")
  const modeFilter = ref<ModeKey>("all")
  const searchText = ref("")

  const items = computed(() => store.items)
  const loading = computed(() => store.loading)

  const page = computed(() => store.page)
  const perPage = computed(() => store.perPage)
  const lastPage = computed(() => store.lastPage)
  const total = computed(() => store.total)

  function prettify(v: any) {
    return String(v ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  function toJobTypeParam(): JobType | undefined {
    if (jobTypeFilter.value === "all") return undefined
    return jobTypeFilter.value as unknown as JobType
  }

  function toModeParam(): TransportMode | undefined {
    if (modeFilter.value === "all") return undefined
    return modeFilter.value as unknown as TransportMode
  }

  async function fetchNow(resetPage = true) {
    if (resetPage) store.page = 1

    await store.fetch({
      page: store.page,
      per_page: store.perPage,
      job_type: toJobTypeParam(),
      mode_of_transport: toModeParam(),
      q: searchText.value || undefined,
    })
  }

  function onNewJob() {
    router.push("/jobs")
  }

  function onEdit(id: number) {
    router.push(`/jobs/${id}`)
  }

  async function onDelete(id: number) {
    await store.remove(id)

    if (store.items.length === 0 && store.page > 1) {
      store.page -= 1
      await fetchNow(false)
    } else {
      await fetchNow(false)
    }
  }

  function onPage(e: any) {
    const rows = Number(e.rows ?? store.perPage)
    const nextPage = Math.floor(Number(e.first ?? 0) / rows) + 1

    store.perPage = rows
    store.page = nextPage

    fetchNow(false)
  }

  let t: any = null
  watch(
    () => searchText.value,
    () => {
      if (t) clearTimeout(t)
      t = setTimeout(() => fetchNow(true), 300)
    }
  )

  watch(
    () => [jobTypeFilter.value, modeFilter.value],
    () => {
      fetchNow(true)
    }
  )

  onMounted(async () => {
    await fetchNow(true)
  })

  return {
    items,
    loading,

    page,
    perPage,
    lastPage,
    total,

    jobTypeFilter,
    modeFilter,
    searchText,

    jobTypeOptions,
    modeOptions,

    onNewJob,
    onEdit,
    onDelete,
    onPage,

    prettify,
  }
}
