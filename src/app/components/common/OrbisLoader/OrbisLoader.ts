import { computed } from "vue"

import { useAppLoaderStore } from "@/app/stores/app-loader"

export function useOrbisLoader() {
  const loader = useAppLoaderStore()

  const loaderClass = computed(() => ["orbis-loader", loader.phaseClass])

  return {
    loader,
    loaderClass,
  }
}
