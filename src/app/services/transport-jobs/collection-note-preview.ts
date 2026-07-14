import http from "@/api/http"
import type { CollectionNotePreviewPayload } from "@/app/types/transport-job-service"

export default async function collectionNotePreview(
  payload: CollectionNotePreviewPayload,
): Promise<Blob> {
  const response = await http.post("/transport-jobs/collection-note-pdf-preview", payload, {
    responseType: "blob",
  })

  return response.data
}
