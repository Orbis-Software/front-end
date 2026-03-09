import http from "@/api/http"

export default async function removeContactChargeTable(
  contactId: number,
  tableId: number,
): Promise<void> {
  await http.delete(`/contacts/${contactId}/charge-tables/${tableId}`)
}
