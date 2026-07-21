import { defineStore } from "pinia"
import type { AppLoaderOptions } from "@/app/types/app-loader"

type LoaderPhase = "hidden" | "entering" | "visible" | "leaving"

const INTRO_MS = 1320
const OUTRO_MS = 1080
const MESSAGE_MS = 2200

export const useAppLoaderStore = defineStore("app-loader", {
  state: () => ({
    phase: "hidden" as LoaderPhase,
    title: "Preparing your workspace",
    message: "Connecting your transport operations...",
    messages: [
      "Connecting your transport operations...",
      "Loading jobs and customer data...",
      "Preparing accounts and invoicing...",
      "Synchronising shipment information...",
      "Almost ready...",
    ],
    status: "Orbis Transport Management System",
    footer: "Securely loading your logistics workspace",
    iconClass: "pi pi-briefcase",
    messageIndex: 0,
    introTimer: 0,
    outroTimer: 0,
    messageTimer: 0,
    pendingHide: false,
  }),

  getters: {
    isVisible: state => state.phase !== "hidden",
    phaseClass: state => `is-${state.phase}`,
  },

  actions: {
    show(options: AppLoaderOptions = {}) {
      this.clearTimers()
      this.applyOptions(options)
      this.pendingHide = false
      this.phase = "entering"
      this.startMessageRotation()

      this.introTimer = window.setTimeout(() => {
        this.phase = "visible"

        if (this.pendingHide) {
          this.hide()
        }
      }, INTRO_MS)
    },

    hide() {
      if (this.phase === "hidden" || this.phase === "leaving") return

      if (this.phase === "entering") {
        this.pendingHide = true
        return
      }

      window.clearInterval(this.messageTimer)
      this.messageTimer = 0
      this.phase = "leaving"
      this.pendingHide = false

      this.outroTimer = window.setTimeout(() => {
        this.phase = "hidden"
      }, OUTRO_MS)
    },

    async withLoader<T>(options: AppLoaderOptions, action: () => Promise<T>): Promise<T> {
      this.show(options)

      try {
        return await action()
      } finally {
        this.hide()
      }
    },

    applyOptions(options: AppLoaderOptions) {
      this.title = options.title ?? "Preparing your workspace"
      this.messages = options.messages?.length
        ? [...options.messages]
        : [
            options.message ?? "Connecting your transport operations...",
            "Loading jobs and customer data...",
            "Preparing accounts and invoicing...",
            "Synchronising shipment information...",
            "Almost ready...",
          ]
      this.messageIndex = 0
      this.message = options.message ?? this.messages[0] ?? "Working..."
      this.status = options.status ?? "Orbis Transport Management System"
      this.footer = options.footer ?? "Securely loading your logistics workspace"
      this.iconClass = options.iconClass ?? "pi pi-briefcase"
    },

    startMessageRotation() {
      if (this.messageTimer) return

      this.messageTimer = window.setInterval(() => {
        if (!this.messages.length) return
        this.messageIndex = (this.messageIndex + 1) % this.messages.length
        this.message = this.messages[this.messageIndex] ?? "Working..."
      }, MESSAGE_MS)
    },

    clearTimers() {
      window.clearTimeout(this.introTimer)
      window.clearTimeout(this.outroTimer)
      window.clearInterval(this.messageTimer)
      this.introTimer = 0
      this.outroTimer = 0
      this.messageTimer = 0
    },
  },
})
