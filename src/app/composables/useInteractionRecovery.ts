import { onBeforeUnmount, onMounted } from "vue"
import { useRouter } from "vue-router"

const DIALOG_MASK_SELECTOR = ".p-dialog-mask"
const BODY_DIALOG_MASK_SELECTOR = `body > ${DIALOG_MASK_SELECTOR}`

function hasUsableDialog(mask: Element) {
  const dialog = mask.querySelector<HTMLElement>(".p-dialog")

  if (!dialog) return false

  const style = window.getComputedStyle(dialog)

  return style.display !== "none" && style.visibility !== "hidden"
}

function hasActiveDialogMask() {
  return Array.from(document.querySelectorAll(DIALOG_MASK_SELECTOR)).some(hasUsableDialog)
}

function cleanupStaleDialogMasks() {
  document.querySelectorAll<HTMLElement>(BODY_DIALOG_MASK_SELECTOR).forEach(mask => {
    if (!hasUsableDialog(mask)) {
      mask.remove()
    }
  })

  if (!hasActiveDialogMask()) {
    document.body.classList.remove("p-overflow-hidden")
  }
}

export function useInteractionRecovery() {
  const router = useRouter()
  let cleanupTimer: number | undefined
  let removeRouteHook: (() => void) | undefined

  function scheduleCleanup() {
    window.clearTimeout(cleanupTimer)
    cleanupTimer = window.setTimeout(cleanupStaleDialogMasks, 80)
  }

  function cleanupWhenVisible() {
    if (document.visibilityState === "visible") {
      scheduleCleanup()
    }
  }

  function cleanupWhenMaskReceivesPointer(event: PointerEvent) {
    const target = event.target

    if (!(target instanceof HTMLElement)) return

    const mask = target.closest(DIALOG_MASK_SELECTOR)
    const clickedInsideDialog = target.closest(".p-dialog")

    if (mask && !clickedInsideDialog) {
      scheduleCleanup()
    }
  }

  onMounted(() => {
    scheduleCleanup()

    window.addEventListener("focus", scheduleCleanup)
    window.addEventListener("pageshow", scheduleCleanup)
    document.addEventListener("visibilitychange", cleanupWhenVisible)
    document.addEventListener("pointerdown", cleanupWhenMaskReceivesPointer, true)

    removeRouteHook = router.afterEach(() => {
      scheduleCleanup()
    })
  })

  onBeforeUnmount(() => {
    window.clearTimeout(cleanupTimer)
    window.removeEventListener("focus", scheduleCleanup)
    window.removeEventListener("pageshow", scheduleCleanup)
    document.removeEventListener("visibilitychange", cleanupWhenVisible)
    document.removeEventListener("pointerdown", cleanupWhenMaskReceivesPointer, true)
    removeRouteHook?.()
  })
}
