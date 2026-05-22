import http from "@/api/http"
import type { TransportMode } from "@/app/types/transport-job"

export type DashboardDateRange = "month" | "week" | "last_month"
export type DashboardUserFocus = "all_users" | "current_user" | number

export interface DashboardTransportParams {
  date?: DashboardDateRange
  mode?: TransportMode | "all"
  user_focus?: DashboardUserFocus
  q?: string
}

export interface DashboardUser {
  id: number
  name: string
  email: string
}

export interface DashboardStats {
  jobs: number
  quotes: number
  open_jobs: number
  delivered_jobs: number
  exceptions: number
  sales: number
  cost: number
  profit: number
  sales_target: number
  profit_target: number
}

export interface DashboardKanbanJob {
  id: number
  ref: string
  customer: string
}

export interface DashboardKanbanLane {
  key: string
  title: string
  jobs: DashboardKanbanJob[]
}

export interface DashboardTodo {
  id: number
  title: string
  owner: string
  when: string
}

export interface DashboardModeMetric {
  mode: string
  label: string
  count?: number
  amount?: number
}

export interface DashboardPerformanceMetric {
  id: number
  name: string
  sales: number
  profit: number
  target: number
}

export interface DashboardTransportSummary {
  users: DashboardUser[]
  stats: DashboardStats
  kanban: DashboardKanbanLane[]
  todos: DashboardTodo[]
  mode_mix: DashboardModeMetric[]
  revenue_by_mode: DashboardModeMetric[]
  performance: DashboardPerformanceMetric[]
}

export default async function getDashboardTransportSummary(
  params: DashboardTransportParams = {},
): Promise<DashboardTransportSummary> {
  const response = await http.get("/dashboard/transport", { params })

  return response.data.data
}
