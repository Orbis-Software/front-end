<script setup lang="ts">
import { useJobLoadPlannerTab } from "./JobLoadPlannerTab.logic"
import "./JobLoadPlannerTab.css"
const {
  activeView,
  isPreparingPrint,
  layout,
  showPalBases,
  wireframe3d,
  canvasTop,
  canvasSide,
  canvas3d,
  space,
  jobRefLocal,
  vehicleLabel,
  vehicleTypeRequired,
  loadSpaceRequiredMessage,
  goToTransportOrder,
  modeLabel,
  localPackages,
  loadUnitEmptyMessage,
  unplacedIds,
  unplacedSummary,
  stats,
  overweight,
  printDate,
  calculate,
  unplacedCount,
  placedCount,
  hasPartialFit,
  fitStatusText,
  printPlan,
  handle3DMouseDown,
  handle3DMouseMove,
  handle3DWheel,
  reset3D,
  toggleWireframe3D,
} = useJobLoadPlannerTab()
</script>

<template>
  <section class="job-load-planner-tab">
    <Dialog
      v-if="vehicleTypeRequired"
      :visible="vehicleTypeRequired"
      modal
      :closable="false"
      :draggable="false"
      class="job-load-planner-tab__vehicle-dialog"
      header="Load space required"
    >
      <div class="job-load-planner-tab__vehicle-dialog-body">
        <p>
          {{ loadSpaceRequiredMessage }}
        </p>

        <button
          type="button"
          class="job-load-planner-tab__button job-load-planner-tab__button--primary"
          @click="goToTransportOrder"
        >
          Go to Transport Job
        </button>
      </div>
    </Dialog>

    <header class="job-load-planner-tab__toolbar">
      <div>
        <h2>Load Planner</h2>
        <p>{{ vehicleLabel }}</p>
      </div>

      <label class="job-load-planner-tab__job-ref">
        <span>Job Ref</span>
        <input v-model="jobRefLocal" type="text" />
      </label>

      <div class="job-load-planner-tab__toolbar-actions">
        <button
          type="button"
          class="job-load-planner-tab__button"
          :disabled="isPreparingPrint || vehicleTypeRequired"
          @click="printPlan"
        >
          {{ isPreparingPrint ? "Preparing..." : "Print" }}
        </button>
        <button
          type="button"
          class="job-load-planner-tab__button job-load-planner-tab__button--primary"
          :disabled="vehicleTypeRequired"
          @click="calculate"
        >
          Calculate Layout
        </button>
      </div>
    </header>

    <header class="job-load-planner-tab__print-header">
      <div>
        <h1>Load Planner</h1>
        <p>{{ vehicleLabel }}</p>
      </div>
      <div>
        <span>Job Number</span>
        <strong>{{ jobRefLocal || "Load Plan" }}</strong>
      </div>
    </header>

    <div class="job-load-planner-tab__body">
      <aside class="job-load-planner-tab__sidebar">
        <section class="job-load-planner-tab__card">
          <h3>
            Load Space
            <span class="job-load-planner-tab__mode">{{ modeLabel }}</span>
          </h3>

          <div class="job-load-planner-tab__source">
            <span>Transport Order</span>
            <strong>{{ vehicleLabel }}</strong>
          </div>

          <div class="job-load-planner-tab__grid job-load-planner-tab__grid--three">
            <label class="job-load-planner-tab__field">
              <span>Length cm</span>
              <input v-model.number="space.l" type="number" min="1" readonly />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Width cm</span>
              <input v-model.number="space.w" type="number" min="1" readonly />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Height cm</span>
              <input v-model.number="space.h" type="number" min="1" readonly />
            </label>
          </div>

          <div class="job-load-planner-tab__grid">
            <label class="job-load-planner-tab__field">
              <span>Max kg</span>
              <input v-model.number="space.maxWt" type="number" min="0" readonly />
            </label>
            <label class="job-load-planner-tab__field">
              <span>Pallet Base cm</span>
              <input v-model.number="space.palH" type="number" min="0" readonly />
            </label>
          </div>

          <label class="job-load-planner-tab__check-row">
            <input v-model="showPalBases" type="checkbox" />
            <span>Show pallet bases in views</span>
          </label>
        </section>

        <section class="job-load-planner-tab__card">
          <h3>Load Units</h3>

          <div class="job-load-planner-tab__unit-list">
            <div v-if="!localPackages.length" class="job-load-planner-tab__empty">
              {{ loadUnitEmptyMessage }}
            </div>

            <article
              v-for="unit in localPackages"
              :key="unit.id"
              class="job-load-planner-tab__unit"
              :class="{
                'job-load-planner-tab__unit--warn': unplacedIds.has(unit.id),
                'job-load-planner-tab__unit--partial': hasPartialFit(unit),
              }"
            >
              <span class="job-load-planner-tab__dot" :style="{ background: unit.color }"></span>
              <div>
                <strong>
                  {{ unit.desc }} x {{ unit.qty }}
                  <em v-if="unit.adr">ADR</em>
                  <em v-if="hasPartialFit(unit)" class="job-load-planner-tab__placed-badge">
                    Placed x{{ placedCount(unit.id) }}
                  </em>
                  <em v-if="unplacedCount(unit.id)" class="job-load-planner-tab__unfit-badge">
                    No space<span v-if="unplacedCount(unit.id) > 1">
                      x{{ unplacedCount(unit.id) }}</span
                    >
                  </em>
                </strong>
                <small
                  >{{ unit.l }} x {{ unit.w }} x {{ unit.h }} cm / {{ unit.wt }} kg /
                  {{ fitStatusText(unit) }}</small
                >
              </div>
            </article>
          </div>
        </section>
      </aside>

      <main class="job-load-planner-tab__viewer">
        <div
          v-if="layout?.unplacedAll.length"
          class="job-load-planner-tab__banner job-load-planner-tab__banner--danger"
        >
          No more space: {{ layout.unplacedAll.length }} unit(s) cannot fit in the selected
          vehicle/container:
          {{ unplacedSummary }}
        </div>

        <div
          v-if="overweight"
          class="job-load-planner-tab__banner job-load-planner-tab__banner--danger"
        >
          Total weight exceeds the selected load-space maximum.
        </div>

        <section class="job-load-planner-tab__stats">
          <article>
            <strong>{{ stats.units }}</strong>
            <span>Load units</span>
          </article>
          <article>
            <strong>{{ stats.lenUsed }}</strong>
            <span>Length used</span>
          </article>
          <article>
            <strong>{{ stats.weight }}</strong>
            <span>Total weight</span>
          </article>
          <article>
            <strong>{{ stats.util }}</strong>
            <span>Floor util.</span>
          </article>
          <article :class="{ 'job-load-planner-tab__stat--warn': Number(stats.unplaced) > 0 }">
            <strong>{{ stats.unplaced }}</strong>
            <span>Unplaced</span>
          </article>
        </section>

        <div class="job-load-planner-tab__view-tabs">
          <button type="button" :class="{ active: activeView === '2d' }" @click="activeView = '2d'">
            2D Views
          </button>
          <button type="button" :class="{ active: activeView === '3d' }" @click="activeView = '3d'">
            3D View
          </button>
        </div>

        <section v-show="activeView === '2d'" class="job-load-planner-tab__views">
          <div class="job-load-planner-tab__canvas-card">
            <div>Top view <span>Looking down</span></div>
            <canvas ref="canvasTop"></canvas>
          </div>
          <div class="job-load-planner-tab__canvas-card">
            <div>Side view <span>From the side</span></div>
            <canvas ref="canvasSide"></canvas>
          </div>
        </section>

        <section v-show="activeView === '3d'" class="job-load-planner-tab__three">
          <canvas
            ref="canvas3d"
            @mousedown="handle3DMouseDown"
            @mousemove="handle3DMouseMove"
            @wheel="handle3DWheel"
            @contextmenu.prevent
          ></canvas>
          <div class="job-load-planner-tab__three-hint">
            Drag to rotate / scroll to zoom / right-drag to pan
          </div>
          <div class="job-load-planner-tab__three-actions">
            <button type="button" @click="reset3D">Reset</button>
            <button
              type="button"
              :class="{ active: wireframe3d }"
              :aria-pressed="wireframe3d"
              @click="toggleWireframe3D"
            >
              Wireframe
            </button>
          </div>
        </section>

        <section class="job-load-planner-tab__card job-load-planner-tab__legend">
          <h3>Legend</h3>
          <span v-for="unit in localPackages" :key="unit.id">
            <i :style="{ background: unit.color }"></i>{{ unit.desc }} x {{ unit.qty }}
            <em v-if="hasPartialFit(unit)" class="job-load-planner-tab__placed-badge">
              Placed x{{ placedCount(unit.id) }}
            </em>
            <em v-if="unplacedCount(unit.id)" class="job-load-planner-tab__unfit-badge">
              No space<span v-if="unplacedCount(unit.id) > 1"> x{{ unplacedCount(unit.id) }}</span>
            </em>
          </span>
          <span v-if="showPalBases && space.palH > 0">
            <i style="background: #c8a879"></i>Pallet base
          </span>
        </section>

        <section class="job-load-planner-tab__manifest">
          <h3>Load Manifest - {{ vehicleLabel }}</h3>
          <p>{{ jobRefLocal || "Load Plan" }} / {{ printDate }}</p>
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>L</th>
                <th>W</th>
                <th>H</th>
                <th>Kg</th>
                <th>Qty</th>
                <th>ADR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="unit in localPackages"
                :key="unit.id"
                :class="{ 'job-load-planner-tab__manifest-row--warn': unplacedCount(unit.id) }"
              >
                <td>{{ unit.desc }}</td>
                <td>{{ unit.l }}</td>
                <td>{{ unit.w }}</td>
                <td>{{ unit.h }}</td>
                <td>{{ unit.wt }}</td>
                <td>{{ unit.qty }}</td>
                <td>{{ unit.adr ? "Yes" : "No" }}</td>
                <td>{{ fitStatusText(unit) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  </section>
</template>
