export type KpiItem = { k: string; v: number; delta: number };
export type ModeMixItem = { mode: string; value: number };
export type AlertItem = { id: string; text: string; when: string };
export type TimelineItem = { time: string; text: string };

export type DashboardData = {
  kpis: KpiItem[];
  modes: ModeMixItem[];
  alerts: AlertItem[];
  timeline: TimelineItem[];
};

export type SidebarState = {
  sidebarOpen: boolean;
  contactsOpen: boolean;
  tmsOpen: boolean;
  wmsOpen: boolean;
  mgmtOpen: boolean;
};
