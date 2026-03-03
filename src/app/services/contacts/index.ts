import list from "./list"
import create from "./create"
import update from "./update"
import remove from "./remove"
import show from "./show"

// ✅ branches
import createBranch from "./branches/create"
import updateBranch from "./branches/update"
import removeBranch from "./branches/remove"

// ✅ collection addresses
import createCollectionAddress from "./collection-addresses/create"
import updateCollectionAddress from "./collection-addresses/update"
import removeCollectionAddress from "./collection-addresses/remove"

export default {
  list,
  create,
  update,
  remove,
  show,

  // ✅ Branches
  createBranch,
  updateBranch,
  removeBranch,

  // ✅ Collection addresses
  createCollectionAddress,
  updateCollectionAddress,
  removeCollectionAddress,
}