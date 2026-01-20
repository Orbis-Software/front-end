import { computed, ref } from "vue";

export type JobTypeKey = "import" | "export" | "domestic" | "cross_trade" | "multi_modal";
export type ModeKey = "air" | "rail" | "road" | "sea" | "multi_modal";

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
  // { key: "multi_modal", title: "Multi-Modal", subtitle: "Create a Multi-Modal job" },
];

export const MODES: CardItem<ModeKey>[] = [
  { key: "air", title: "Air", subtitle: "Choose Air" },
  { key: "rail", title: "Rail", subtitle: "Choose Rail" },
  { key: "road", title: "Road", subtitle: "Choose Road" },
  { key: "sea", title: "Sea", subtitle: "Choose Sea" },
  { key: "multi_modal", title: "Multi-Modal", subtitle: "Choose Multi-Modal" },
];

export const jobType = ref<JobTypeKey | null>(null);
export const mode = ref<ModeKey | null>(null);

export const jobTypeLabel = computed(() => JOB_TYPES.find(x => x.key === jobType.value)?.title ?? "");
export const modeLabel = computed(() => MODES.find(x => x.key === mode.value)?.title ?? "");

export function selectJobType(next: JobTypeKey) {
  jobType.value = next;
  mode.value = null;
}

export function selectMode(next: ModeKey) {
  mode.value = next;
}

export function resetMode() {
  mode.value = null;
}

export function resetAll() {
  jobType.value = null;
  mode.value = null;
}
