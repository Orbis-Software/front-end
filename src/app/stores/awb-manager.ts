import { defineStore } from "pinia"
import AwbManagerService from "@/app/services/awb-manager"
import type {
  AssignAwbPayload,
  AwbAirline,
  AwbAirlinePayload,
  AwbStatus,
  AwbSummary,
  BulkAwbPayload,
  RangeAwbPayload,
  SingleAwbPayload,
} from "@/app/types/awb-manager"

export const useAwbManagerStore = defineStore("awbManager", {
  state: () => ({
    airlines: [] as AwbAirline[],
    summary: {
      airlines: 0,
      total: 0,
      available: 0,
      used: 0,
      reserved: 0,
      voided: 0,
    } as AwbSummary,

    loading: false,
    saving: false,
  }),

  actions: {
    async fetch() {
      this.loading = true

      try {
        const result = await AwbManagerService.getAll()

        this.airlines = result.airlines
        this.summary = result.summary
      } finally {
        this.loading = false
      }
    },

    async fetchSummary() {
      this.summary = await AwbManagerService.getSummary()
    },

    async createAirline(payload: AwbAirlinePayload) {
      this.saving = true

      try {
        await AwbManagerService.createAirline(payload)
        await this.fetch()
      } finally {
        this.saving = false
      }
    },

    async updateAirline(id: number, payload: AwbAirlinePayload) {
      this.saving = true

      try {
        await AwbManagerService.updateAirline(id, payload)
        await this.fetch()
      } finally {
        this.saving = false
      }
    },

    async deleteAirline(id: number) {
      await AwbManagerService.deleteAirline(id)
      await this.fetch()
    },

    async createSingleAwb(airlineId: number, payload: SingleAwbPayload) {
      await AwbManagerService.createSingleAwb(airlineId, payload)
      await this.fetch()
    },

    async createRangeAwbs(airlineId: number, payload: RangeAwbPayload) {
      await AwbManagerService.createRangeAwbs(airlineId, payload)
      await this.fetch()
    },

    async createBulkAwbs(airlineId: number, payload: BulkAwbPayload) {
      await AwbManagerService.createBulkAwbs(airlineId, payload)
      await this.fetch()
    },

    async assignAwb(awbId: number, payload: AssignAwbPayload) {
      await AwbManagerService.assignAwb(awbId, payload)
      await this.fetch()
    },

    async unassignAwb(awbId: number) {
      await AwbManagerService.unassignAwb(awbId)
      await this.fetch()
    },

    async setAwbStatus(awbId: number, status: AwbStatus) {
      if (status === "reserved") {
        await AwbManagerService.reserveAwb(awbId)
      }

      if (status === "available") {
        await AwbManagerService.unreserveAwb(awbId)
      }

      if (status === "voided") {
        await AwbManagerService.voidAwb(awbId)
      }

      await this.fetch()
    },

    async deleteAwb(awbId: number) {
      await AwbManagerService.deleteAwb(awbId)
      await this.fetch()
    },
  },
})
