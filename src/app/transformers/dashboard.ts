import type { DashboardData } from "@/app/types/dashboard";

export function toDashboardData(input: DashboardData): DashboardData {
  // Later: normalize DTO → app model
  // For now: return as-is
  return input;
}
