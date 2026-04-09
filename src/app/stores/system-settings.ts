import { defineStore } from "pinia"
import { computed, ref } from "vue"

export const useSystemSettingsStore = defineStore("system-settings", () => {
  const eoriNumber = ref("")

  const hasEoriNumber = computed(() => eoriNumber.value.trim().length > 0)

  function setEoriNumber(value: string | null | undefined) {
    eoriNumber.value = String(value ?? "").trim()
  }

  function clearEoriNumber() {
    eoriNumber.value = ""
  }

  return {
    eoriNumber,
    hasEoriNumber,
    setEoriNumber,
    clearEoriNumber,
  }
})
