<script setup lang="ts">
import { onMounted } from "vue"
import "./SystemSettingsAwbManagerPage.css"
import { useSystemSettingsAwbManagerPage } from "./SystemSettingsAwbManagerPage"

const {
  eoriNumber,
  airlines,
  toasts,
  summary,
  currentAwbTab,
  airlineSearch,
  airlineFilter,
  showAirlineModal,
  showAwbModal,
  showAssignModal,
  airlineForm,
  singleAwbForm,
  rangeAwbForm,
  bulkAwbForm,
  assignForm,
  ensureAccess,
  statusLabel,
  formatDate,
  getFilteredAwbs,
  getAirlineCounts,
  openAddAirlineModal,
  closeAirlineModal,
  saveAirline,
  deleteAirline,
  toggleCollapse,
  openAddAwbModal,
  closeAwbModal,
  switchAwbTab,
  saveAwbs,
  openAssignModal,
  closeAssignModal,
  confirmAssign,
  unassignAwb,
  setAwbStatus,
  deleteAwb,
  exportAirlineCsv,
  exportAllCsv,
} = useSystemSettingsAwbManagerPage()

onMounted(() => {
  ensureAccess()
})
</script>

<template>
  <section class="awb-page">
    <div class="awb-page__header">
      <div>
        <h1 class="awb-page__title">AWB Stock Manager</h1>
        <p class="awb-page__subtitle">Manage pre-purchased Air Waybill stock by airline</p>
        <p class="awb-page__eori">
          EORI Number: <strong>{{ eoriNumber || "—" }}</strong>
        </p>
      </div>

      <div class="awb-page__actions">
        <button type="button" class="awb-btn awb-btn--secondary" @click="exportAllCsv">
          Export CSV
        </button>
        <button type="button" class="awb-btn awb-btn--primary" @click="openAddAirlineModal()">
          + Add Airline
        </button>
      </div>
    </div>

    <div class="awb-summary">
      <div class="awb-summary__card">
        <div class="awb-summary__label">Airlines</div>
        <div class="awb-summary__value awb-summary__value--orange">{{ summary.airlines }}</div>
      </div>

      <div class="awb-summary__card">
        <div class="awb-summary__label">Total AWBs</div>
        <div class="awb-summary__value">{{ summary.total }}</div>
      </div>

      <div class="awb-summary__card">
        <div class="awb-summary__label">Available</div>
        <div class="awb-summary__value">{{ summary.available }}</div>
      </div>

      <div class="awb-summary__card">
        <div class="awb-summary__label">Used</div>
        <div class="awb-summary__value">{{ summary.used }}</div>
      </div>

      <div class="awb-summary__card">
        <div class="awb-summary__label">Reserved</div>
        <div class="awb-summary__value">{{ summary.reserved }}</div>
      </div>
    </div>

    <div v-if="!airlines.length" class="awb-empty-card">
      <div class="awb-empty-card__title">No airlines added yet</div>
      <div class="awb-empty-card__text">
        Click <strong>Add Airline</strong> to create your first AWB stock block.
      </div>
    </div>

    <div v-for="airline in airlines" :key="airline.id" class="awb-airline-card">
      <div class="awb-airline-card__header">
        <div class="awb-airline-card__header-left" @click="toggleCollapse(airline.id)">
          <div class="awb-airline-card__badge">
            {{ airline.code || airline.prefix || "—" }}
          </div>

          <div>
            <div class="awb-airline-card__name">{{ airline.name }}</div>
            <div class="awb-airline-card__meta">
              Prefix: {{ airline.prefix }}
              <template v-if="airline.contract"> · {{ airline.contract }}</template>
            </div>
          </div>
        </div>

        <div class="awb-airline-card__stats">
          <span class="awb-pill awb-pill--total">
            {{ getAirlineCounts(airline).total }} Total
          </span>
          <span class="awb-pill awb-pill--available">
            {{ getAirlineCounts(airline).available }} Available
          </span>
          <span class="awb-pill awb-pill--used"> {{ getAirlineCounts(airline).used }} Used </span>
          <span v-if="getAirlineCounts(airline).reserved" class="awb-pill awb-pill--reserved">
            {{ getAirlineCounts(airline).reserved }} Reserved
          </span>
        </div>

        <div class="awb-airline-card__header-actions">
          <button
            type="button"
            class="awb-btn awb-btn--secondary awb-btn--sm"
            @click.stop="openAddAwbModal(airline.id)"
          >
            + Add AWBs
          </button>

          <button
            type="button"
            class="awb-btn awb-btn--secondary awb-btn--sm"
            @click.stop="openAddAirlineModal(airline.id)"
          >
            Edit
          </button>

          <button
            type="button"
            class="awb-btn awb-btn--danger awb-btn--sm"
            @click.stop="deleteAirline(airline.id)"
          >
            Delete
          </button>

          <button
            type="button"
            class="awb-chevron"
            :class="{ 'awb-chevron--open': !airline.collapsed }"
            @click.stop="toggleCollapse(airline.id)"
          >
            ▾
          </button>
        </div>
      </div>

      <div v-if="!airline.collapsed" class="awb-airline-card__body">
        <div class="awb-toolbar">
          <div class="awb-toolbar__left">
            <input
              v-model="airlineSearch[airline.id]"
              type="text"
              class="awb-input awb-search"
              placeholder="Search AWB or Job..."
            />

            <select v-model="airlineFilter[airline.id]" class="awb-input awb-select">
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="used">Used</option>
              <option value="reserved">Reserved</option>
              <option value="voided">Voided</option>
            </select>
          </div>

          <div class="awb-toolbar__right">
            <button
              type="button"
              class="awb-btn awb-btn--secondary awb-btn--sm"
              @click="exportAirlineCsv(airline.id)"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div class="awb-table-wrap">
          <table v-if="getFilteredAwbs(airline).length" class="awb-table">
            <thead>
              <tr>
                <th>AWB Number</th>
                <th>Status</th>
                <th>Job Number</th>
                <th>Date Used</th>
                <th>Notes</th>
                <th class="awb-table__actions-head">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="awb in getFilteredAwbs(airline)" :key="awb.id">
                <td class="awb-number">{{ awb.number }}</td>

                <td>
                  <span class="awb-status" :class="`awb-status--${awb.status}`">
                    {{ statusLabel(awb.status) }}
                  </span>
                </td>

                <td>
                  <span v-if="awb.jobNumber" class="awb-job-link">
                    {{ awb.jobNumber }}
                  </span>
                  <span v-else class="awb-muted">—</span>
                </td>

                <td>
                  <span v-if="awb.dateUsed">{{ formatDate(awb.dateUsed) }}</span>
                  <span v-else class="awb-muted">—</span>
                </td>

                <td class="awb-notes" :title="awb.notes || awb.assignNotes || ''">
                  {{ awb.notes || awb.assignNotes || "—" }}
                </td>

                <td>
                  <div class="awb-action-cell">
                    <button
                      v-if="awb.status === 'available' || awb.status === 'reserved'"
                      type="button"
                      class="awb-btn awb-btn--primary awb-btn--sm"
                      @click="openAssignModal(airline.id, awb.id)"
                    >
                      Assign
                    </button>

                    <button
                      v-if="awb.status === 'used'"
                      type="button"
                      class="awb-btn awb-btn--secondary awb-btn--sm"
                      @click="unassignAwb(airline.id, awb.id)"
                    >
                      Unassign
                    </button>

                    <button
                      v-if="awb.status === 'available'"
                      type="button"
                      class="awb-btn awb-btn--secondary awb-btn--sm"
                      @click="setAwbStatus(airline.id, awb.id, 'reserved')"
                    >
                      Reserve
                    </button>

                    <button
                      v-if="awb.status === 'reserved'"
                      type="button"
                      class="awb-btn awb-btn--secondary awb-btn--sm"
                      @click="setAwbStatus(airline.id, awb.id, 'available')"
                    >
                      Unreserve
                    </button>

                    <button
                      v-if="awb.status !== 'voided'"
                      type="button"
                      class="awb-btn awb-btn--danger awb-btn--sm"
                      @click="setAwbStatus(airline.id, awb.id, 'voided')"
                    >
                      ✕
                    </button>

                    <button
                      type="button"
                      class="awb-btn awb-btn--danger awb-btn--sm"
                      @click="deleteAwb(airline.id, awb.id)"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="awb-empty-table">
            <div class="awb-empty-table__text">
              {{
                airline.awbs.length
                  ? "No AWBs match the current filter."
                  : "No AWBs added yet. Click + Add AWBs above."
              }}
            </div>
          </div>
        </div>

        <div class="awb-row-count">
          {{ getFilteredAwbs(airline).length }} of {{ airline.awbs.length }} AWB(s) shown
        </div>
      </div>
    </div>

    <div v-if="showAirlineModal" class="awb-modal-overlay" @click.self="closeAirlineModal">
      <div class="awb-modal">
        <div class="awb-modal__header">
          <h3>{{ airlineForm.id ? "Edit Airline" : "Add Airline" }}</h3>
          <button type="button" class="awb-modal__close" @click="closeAirlineModal">✕</button>
        </div>

        <div class="awb-modal__body">
          <div class="awb-form-row">
            <div class="awb-form-group">
              <label>Airline Name *</label>
              <input
                v-model="airlineForm.name"
                type="text"
                class="awb-input"
                placeholder="e.g. Lufthansa Cargo"
              />
            </div>

            <div class="awb-form-group">
              <label>IATA Code</label>
              <input
                v-model="airlineForm.code"
                type="text"
                class="awb-input"
                placeholder="e.g. LH"
                maxlength="3"
              />
            </div>
          </div>

          <div class="awb-form-row">
            <div class="awb-form-group">
              <label>AWB Prefix *</label>
              <input
                v-model="airlineForm.prefix"
                type="text"
                class="awb-input"
                placeholder="e.g. 020"
                maxlength="3"
              />
              <div class="awb-form-hint">3-digit airline prefix</div>
            </div>

            <div class="awb-form-group">
              <label>Account / Contract Ref</label>
              <input
                v-model="airlineForm.contract"
                type="text"
                class="awb-input"
                placeholder="e.g. LH-2024-001"
              />
            </div>
          </div>

          <div class="awb-form-group">
            <label>Notes</label>
            <textarea
              v-model="airlineForm.notes"
              class="awb-input awb-textarea"
              placeholder="Optional notes about this stock block..."
            />
          </div>
        </div>

        <div class="awb-modal__footer">
          <button type="button" class="awb-btn awb-btn--secondary" @click="closeAirlineModal">
            Cancel
          </button>
          <button type="button" class="awb-btn awb-btn--primary" @click="saveAirline">
            Save Airline
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAwbModal" class="awb-modal-overlay" @click.self="closeAwbModal">
      <div class="awb-modal awb-modal--wide">
        <div class="awb-modal__header">
          <h3>Add AWB Numbers</h3>
          <button type="button" class="awb-modal__close" @click="closeAwbModal">✕</button>
        </div>

        <div class="awb-modal__body">
          <div class="awb-tabs">
            <button
              type="button"
              class="awb-tab"
              :class="{ 'awb-tab--active': currentAwbTab === 'single' }"
              @click="switchAwbTab('single')"
            >
              Single AWB
            </button>

            <button
              type="button"
              class="awb-tab"
              :class="{ 'awb-tab--active': currentAwbTab === 'range' }"
              @click="switchAwbTab('range')"
            >
              Number Range
            </button>

            <button
              type="button"
              class="awb-tab"
              :class="{ 'awb-tab--active': currentAwbTab === 'bulk' }"
              @click="switchAwbTab('bulk')"
            >
              Bulk Paste
            </button>
          </div>

          <div v-if="currentAwbTab === 'single'">
            <div class="awb-form-row">
              <div class="awb-form-group">
                <label>AWB Number *</label>
                <input
                  v-model="singleAwbForm.number"
                  type="text"
                  class="awb-input"
                  placeholder="e.g. 020-12345678"
                />
                <div class="awb-form-hint">Format: PREFIX-SERIALNUMBER</div>
              </div>

              <div class="awb-form-group">
                <label>Initial Status</label>
                <select v-model="singleAwbForm.status" class="awb-input">
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>

            <div class="awb-form-group">
              <label>Notes</label>
              <input
                v-model="singleAwbForm.notes"
                type="text"
                class="awb-input"
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <div v-if="currentAwbTab === 'range'">
            <div class="awb-form-row">
              <div class="awb-form-group">
                <label>Serial From *</label>
                <input
                  v-model="rangeAwbForm.from"
                  type="text"
                  class="awb-input"
                  placeholder="e.g. 12345678"
                  maxlength="10"
                />
              </div>

              <div class="awb-form-group">
                <label>Serial To *</label>
                <input
                  v-model="rangeAwbForm.to"
                  type="text"
                  class="awb-input"
                  placeholder="e.g. 12345700"
                  maxlength="10"
                />
              </div>
            </div>

            <div class="awb-form-hint">
              AWBs will be created as PREFIX-XXXXXXXX. Max 200 per batch.
            </div>
          </div>

          <div v-if="currentAwbTab === 'bulk'">
            <div class="awb-form-group">
              <label>Paste AWB Numbers *</label>
              <textarea
                v-model="bulkAwbForm.text"
                class="awb-input awb-textarea awb-textarea--lg"
                placeholder="One AWB per line"
              />
              <div class="awb-form-hint">One AWB number per line. Up to 500 numbers.</div>
            </div>
          </div>
        </div>

        <div class="awb-modal__footer">
          <button type="button" class="awb-btn awb-btn--secondary" @click="closeAwbModal">
            Cancel
          </button>
          <button type="button" class="awb-btn awb-btn--primary" @click="saveAwbs">
            Add AWB(s)
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAssignModal" class="awb-modal-overlay" @click.self="closeAssignModal">
      <div class="awb-modal awb-modal--sm">
        <div class="awb-modal__header">
          <h3>Assign to Job</h3>
          <button type="button" class="awb-modal__close" @click="closeAssignModal">✕</button>
        </div>

        <div class="awb-modal__body">
          <div class="awb-form-group">
            <label>AWB Number</label>
            <input
              v-model="assignForm.awbDisplay"
              type="text"
              class="awb-input awb-input--readonly"
              readonly
            />
          </div>

          <div class="awb-form-row">
            <div class="awb-form-group">
              <label>Job Number *</label>
              <input
                v-model="assignForm.jobNumber"
                type="text"
                class="awb-input"
                placeholder="e.g. JOB-2024-0042"
              />
            </div>

            <div class="awb-form-group">
              <label>Date Used *</label>
              <input v-model="assignForm.dateUsed" type="date" class="awb-input" />
            </div>
          </div>

          <div class="awb-form-group">
            <label>Notes</label>
            <input
              v-model="assignForm.notes"
              type="text"
              class="awb-input"
              placeholder="Optional notes..."
            />
          </div>
        </div>

        <div class="awb-modal__footer">
          <button type="button" class="awb-btn awb-btn--secondary" @click="closeAssignModal">
            Cancel
          </button>
          <button type="button" class="awb-btn awb-btn--primary" @click="confirmAssign">
            Assign AWB
          </button>
        </div>
      </div>
    </div>

    <div class="awb-toast-wrap">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="awb-toast"
        :class="`awb-toast--${toast.type}`"
      >
        {{ toast.message }}
      </div>
    </div>
  </section>
</template>
