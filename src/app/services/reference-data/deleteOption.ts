import http from "@/api/http"

export default async function deleteOption(categoryKey: string, optionId: number): Promise<void> {
  await http.delete(`/reference-data/${categoryKey}/options/${optionId}`)
}
