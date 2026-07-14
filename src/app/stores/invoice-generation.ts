import { defineStore } from "pinia"
import router from "@/router"
import transportJobs from "@/app/services/transport-jobs"
import { useNotificationStore } from "@/app/stores/notification"
import type { InvoiceGenerationTask } from "@/app/types/invoice-generation"

type TaskState = InvoiceGenerationTask & {
  attempts: number
  timeout: boolean
}

const STORAGE_KEY = "orbis:invoice-generation-tasks"
const POLL_MS = 2000
const MAX_AGE_MS = 5 * 60 * 1000

export const useInvoiceGenerationStore = defineStore("invoiceGeneration", {
  state: () => ({
    tasks: [] as TaskState[],
    polling: {} as Record<string, number>,
    startedAt: {} as Record<string, number>,
  }),

  getters: {
    activeTasks: state => state.tasks,
    hasActive: state =>
      state.tasks.some(task => ["queued", "processing"].includes(task.status) && !task.timeout),
  },

  actions: {
    hydrate() {
      try {
        const ids = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]") as string[]
        ids.forEach(id => this.track(id))
      } catch {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    },

    track(id: string, initial?: InvoiceGenerationTask) {
      if (!id) return

      if (!this.tasks.some(task => task.id === id)) {
        this.tasks.push({
          ...(initial ?? {
            id,
            invoice_id: null,
            transport_job_id: 0,
            invoice_type: "customer",
            status: "queued",
            generation_status: "queued",
            stage: "queued",
            stage_message: "Invoice queued",
            progress: 5,
            download_available: false,
          }),
          attempts: 0,
          timeout: false,
        })
      }

      this.startedAt[id] = this.startedAt[id] ?? Date.now()
      this.persist()
      this.poll(id)
    },

    async poll(id: string) {
      if (this.polling[id]) return

      const run = async () => {
        try {
          const elapsed = Date.now() - (this.startedAt[id] ?? Date.now())
          const task = this.tasks.find(item => item.id === id)

          if (elapsed > MAX_AGE_MS && task && ["queued", "processing"].includes(task.status)) {
            task.timeout = true
            this.stop(id, false)
            return
          }

          const latest = await transportJobs.invoiceGenerationTask(id)
          this.upsert(latest)

          if (latest.status === "completed" || latest.status === "failed") {
            this.stop(id, latest.status === "completed")
            await useNotificationStore()
              .fetchNotifications()
              .catch(() => undefined)
            return
          }

          this.polling[id] = window.setTimeout(run, POLL_MS)
        } catch {
          const task = this.tasks.find(item => item.id === id)
          if (task) task.attempts += 1

          this.polling[id] = window.setTimeout(
            run,
            Math.min(10000, POLL_MS * (task?.attempts ?? 1)),
          )
        }
      }

      this.polling[id] = window.setTimeout(run, 0)
    },

    upsert(latest: InvoiceGenerationTask) {
      const index = this.tasks.findIndex(task => task.id === latest.id)
      const next = { ...latest, attempts: 0, timeout: false }

      if (index === -1) {
        this.tasks.push(next)
      } else {
        this.tasks[index] = { ...this.tasks[index], ...next }
      }

      this.persist()
    },

    stop(id: string, keepVisible = true) {
      if (this.polling[id]) {
        window.clearTimeout(this.polling[id])
        delete this.polling[id]
      }

      if (!keepVisible) {
        this.remove(id)
      } else {
        this.persist()
      }
    },

    remove(id: string) {
      if (this.polling[id]) {
        window.clearTimeout(this.polling[id])
        delete this.polling[id]
      }

      this.tasks = this.tasks.filter(task => task.id !== id)
      delete this.startedAt[id]
      this.persist()
    },

    async view(task: TaskState) {
      if (task.transport_job_id && task.invoice_id) {
        const blob = await transportJobs.downloadInvoicePdf(task.transport_job_id, task.invoice_id)
        const url = URL.createObjectURL(blob)
        window.open(url, "_blank", "noopener,noreferrer")
        window.setTimeout(() => URL.revokeObjectURL(url), 60000)
        this.remove(task.id)
      }
    },

    openJob(task: TaskState) {
      if (task.transport_job_id) {
        router.push(`/jobs/${task.transport_job_id}?tab=invoices`)
      }
    },

    persist() {
      const activeIds = this.tasks
        .filter(task => ["queued", "processing"].includes(task.status))
        .map(task => task.id)

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(activeIds))
    },
  },
})
