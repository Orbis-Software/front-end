import http from "@/api/http"
import userShortcutTransformer from "@/app/transformers/user-shortcut"
import type { UserShortcut } from "@/app/types/user-shortcut"

export default async function list(): Promise<UserShortcut[]> {
  const response = await http.get("/user-shortcuts")

  return userShortcutTransformer.fetchCollection(response.data.data)
}
