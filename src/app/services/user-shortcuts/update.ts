import http from "@/api/http"
import userShortcutTransformer from "@/app/transformers/user-shortcut"
import type { UserShortcut, UserShortcutPayload } from "@/app/types/user-shortcut"

export default async function update(shortcuts: UserShortcutPayload[]): Promise<UserShortcut[]> {
  const response = await http.put("/user-shortcuts", {
    shortcuts: shortcuts.map(shortcut => ({
      key: shortcut.key,
      key_binding: shortcut.keyBinding,
      priority: shortcut.priority,
      is_enabled: shortcut.isEnabled,
    })),
  })

  return userShortcutTransformer.fetchCollection(response.data.data)
}
