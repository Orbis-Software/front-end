export type PackageStackOption = "stackable" | "non_stack" | "top_loadable"

export type PackageStackFields = {
  stackable: boolean
  atTheTop: boolean
}

export function getPackageStackOption(row: PackageStackFields): PackageStackOption {
  if (row.atTheTop) return "top_loadable"

  return row.stackable ? "stackable" : "non_stack"
}

export function setPackageStackOption(row: PackageStackFields, option: PackageStackOption) {
  row.stackable = option === "stackable"
  row.atTheTop = option === "top_loadable"
}
