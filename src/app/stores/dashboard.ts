import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { DashboardData, SidebarState } from "@/app/types/dashboard";
import { toDashboardData } from "@/app/transformers/dashboard";

const SEED: DashboardData = {
  kpis: [
    { k: "Open Jobs", v: 42, delta: +6 },
    { k: "In Transit", v: 18, delta: -2 },
    { k: "Exceptions", v: 3, delta: +1 },
    { k: "On-time %", v: 96, delta: +2 },
  ],
  modes: [
    { mode: "Road", value: 52 },
    { mode: "Sea", value: 23 },
    { mode: "Air", value: 18 },
    { mode: "Rail", value: 7 },
  ],
  alerts: [
    { id: "PC-240201", text: "Customs hold at Gdynia", when: "12m ago" },
    { id: "PC-240178", text: "Temperature excursion (reefer)", when: "48m ago" },
    { id: "PC-240166", text: "POD missing (Dover)", when: "2h ago" },
  ],
  timeline: [
    { time: "08:30", text: "Booked carrier for PC-240198 (Air)" },
    { time: "10:10", text: "Warehouse GRN completed — WHS-03" },
    { time: "12:45", text: "Invoice INV-1007 exported" },
    { time: "14:15", text: "Exception raised for PC-240201" },
  ],
};

export const useDashboardStore = defineStore("dashboard", () => {
  // UI state
  const sidebar = ref<SidebarState>({
    sidebarOpen: true,
    contactsOpen: true,
    tmsOpen: true,
    wmsOpen: true,
    mgmtOpen: true,
  });

  // Data state
  const data = ref<DashboardData>(toDashboardData(SEED));

  // Getters
  const sidebarWidthPx = computed(() => (sidebar.value.sidebarOpen ? 208 : 64));

  // Actions
  function toggleSidebar() {
    sidebar.value.sidebarOpen = !sidebar.value.sidebarOpen;
  }

  function toggleSection(key: keyof SidebarState) {
    // Optional: prevent toggling sidebarOpen here if you want
    sidebar.value[key] = !sidebar.value[key];
  }

  async function fetchDashboard() {
    data.value = toDashboardData(SEED);
  }

  return {
    sidebar,
    data,
    sidebarWidthPx,
    toggleSidebar,
    toggleSection,
    fetchDashboard,
  };
});
