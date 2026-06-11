import { useConsolidationPage } from "@/app/pages/consolidations/ConsolidationPage.logic"
import { useJobConsolidationContext } from "./JobConsolidationTabs.shared"

export function useJobConsolidationStandaloneContext() {
  const jobContext = useJobConsolidationContext()

  return useConsolidationPage({
    initialDetails: jobContext.form.consolidation_details,
    jobDate: jobContext.form.job_date,
    jobNumber: jobContext.form.job_number,
    mode: jobContext.form.mode_of_transport,
    onDetailsChange(details) {
      Object.assign(jobContext.form.consolidation_details, details)
    },
  })
}
