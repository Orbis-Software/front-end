function csvEscape(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

export function downloadCsv(filename: string, rows: unknown[][]) {
  const blob = new Blob([rows.map(row => row.map(csvEscape).join(",")).join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
