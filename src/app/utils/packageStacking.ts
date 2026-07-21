import type { PackageStackFields, PackageStackOption } from "@/app/types/package-stacking"

export function getPackageStackOption(row: PackageStackFields): PackageStackOption {
  if (row.atTheTop) return "top_loadable"

  return row.stackable ? "stackable" : "non_stack"
}

export function setPackageStackOption(row: PackageStackFields, option: PackageStackOption) {
  row.stackable = option === "stackable"
  row.atTheTop = option === "top_loadable"
}
