import { defineStore } from 'pinia'
import type { Client } from '@/app/types/client'
import ClientService from '@/app/services/clients'

export const useClientStore = defineStore('client', {
  /**
   * State
   */
  state: () => ({
    list: [] as Client[],
    loading: false,
  }),

  /**
   * Getters
   */
  getters: {
    getById: (state) => {
      return (id: number): Client | undefined =>
        state.list.find(client => client.id === id)
    },
  },

  /**
   * Actions
   */
  actions: {
    /**
     * Normalize client so UI NEVER sees undefined fields
     */
    normalize(client: Client): Client {
      return {
        ...client,
        email: client.email ?? '',
        phone: client.phone ?? '',
      }
    },

    /**
     * Replace full client list
     */
    setClients(clients: Client[]) {
      this.list = clients.map(c => this.normalize(c))
    },

    /**
     * Insert or update a single client
     */
    upsertClient(client: Client) {
      const normalized = this.normalize(client)
      const index = this.list.findIndex(c => c.id === normalized.id)

      if (index === -1) {
        this.list.push(normalized)
      } else {
        this.list[index] = normalized
      }
    },

    /**
     * Explicit replace (semantic clarity)
     */
    replaceClient(client: Client) {
      this.upsertClient(client)
    },

    /**
     * Clear store (logout, org switch, etc.)
     */
    clear() {
      this.list = []
    },

    /**
     * Remove client locally
     */
    remove(clientId: number) {
      this.list = this.list.filter(c => c.id !== clientId)
    },

    /**
     * ============================
     * CRUD (Store → Service)
     * ============================
     */

    async fetchAll(params: { page?: number; limit?: number } = {}) {
      this.loading = true
      try {
        const clients = await ClientService.all(params)
        this.setClients(clients)
      } finally {
        this.loading = false
      }
    },

    // async fetchOne(id: number): Promise<Client> {
    //   const client = await ClientService.show(id)
    //   this.upsertClient(client)
    //   return client
    // },

    // async create(payload: any): Promise<Client> {
    //   const client = await ClientService.create(payload)
    //   this.upsertClient(client)
    //   return client
    // },

    // async update(id: number, payload: any): Promise<Client> {
    //   const client = await ClientService.update(id, payload)
    //   this.replaceClient(client)
    //   return client
    // },

    // async deleteClient(id: number) {
    //   await ClientService.remove(id)
    //   this.remove(id)
    // },
  },
})
