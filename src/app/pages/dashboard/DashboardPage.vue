  <template>
    <div class="dash">
      <!-- Top bar -->
      <header class="dash-top">
        <div class="dash-left">
          <button class="icon-btn" type="button" aria-label="Close" @click="onClose">
            <i class="pi pi-times"></i>
          </button>

          <div class="brand">
            <i class="pi pi-truck"></i>
            <span class="brand-text">{{ ui.title }}</span>
          </div>

          <span class="crumb">{{ ui.crumb }}</span>
        </div>

        <div class="dash-center">
          <span class="p-input-icon-left search">
            <i class="pi pi-search"></i>
            <InputText
              class="search-input"
              v-model="filters.globalSearch"
              :placeholder="ui.searchPlaceholder"
            />
          </span>

          <Button class="btn btn-eq orbis-primary" outlined type="button" @click="onExportCsv">
            <i class="pi pi-download" style="margin-right: 8px;"></i>
            {{ ui.exportLabel }}
          </Button>
        </div>

        <div class="dash-right">
          <Button class="btn btn-eq orbis-primary" outlined type="button" @click="onNewJob">
            <i class="pi pi-plus" style="margin-right: 8px;"></i>
            {{ ui.newJobLabel }}
          </Button>

          <button class="icon-btn" type="button" aria-label="Notifications" @click="onNotifications">
            <i class="pi pi-bell"></i>
          </button>
        </div>
      </header>

      <!-- Filters row -->
      <section class="dash-row card">
        <div class="filters-left">
          <span class="filters-label">Filters</span>
          <InputText class="filters-input" v-model="filters.quickFilter" placeholder="Customer, lane, ref..." />
        </div>

        <div class="tabs">
          <button
            v-for="t in modeTabs"
            :key="t.key"
            class="tab"
            :class="{ active: filters.mode === t.key }"
            type="button"
            @click="filters.mode = t.key"
          >
            {{ t.label }}
          </button>
        </div>

        <div class="filters-right">
          <Button class="btn orbis-primary" outlined type="button" @click="onAdvanced">
            <i class="pi pi-filter" style="margin-right: 8px;"></i>
            Advanced
          </Button>
        </div>
      </section>

      <!-- ✅ KPIs (component) -->
      <section class="kpis">
        <KpiCard v-for="k in kpis" :key="k.key" :kpi="k" />
      </section>

      <!-- Main grid -->
      <section class="grid">
        <!-- Map card -->
        <div class="card map">
          <div class="card-head">
            <div>
              <div class="card-title">{{ mapCard.title }}</div>
              <div class="card-sub">{{ mapCard.subtitle }}</div>
            </div>

            <div class="card-actions">
              <Button class="btn orbis-primary" outlined type="button" @click="onRoutes">
                <i class="pi pi-map" style="margin-right: 8px;"></i>
                Routes
              </Button>
              <Button class="btn orbis-primary" outlined type="button" @click="onMapFilters">
                <i class="pi pi-filter" style="margin-right: 8px;"></i>
                Filters
              </Button>
            </div>
          </div>

          <div class="map-box">
            <div class="map-text">{{ mapCard.placeholder }}</div>
          </div>
        </div>

        <!-- ✅ Ops board (component used per lane) -->
        <div class="card ops">
          <div class="card-head">
            <div>
              <div class="card-title">{{ opsBoard.title }}</div>
              <div class="card-sub">{{ opsBoard.subtitle }}</div>
            </div>
          </div>

          <div class="kanban">
            <KanbanColumn
              v-for="lane in opsBoard.lanes"
              :key="lane.key"
              :lane="lane"
            />
          </div>
        </div>
      </section>

      <!-- ✅ Bottom row placeholders (component) -->
      <section class="bottom">
        <PlaceholderCard
          v-for="b in bottomCards"
          :key="b.key"
          :title="b.title"
          :subtitle="b.subtitle"
        />
      </section>

      <!-- ✅ Activity + Exceptions row (components) -->
      <section class="activity">
        <TodayTimelineCard :items="timeline" />
        <ExceptionsCard :items="exceptions" />
      </section>

      <!-- ✅ Quick Actions (component) -->
      <QuickActionsCard @action="onQuickAction" />
    </div>
  </template>

  <script setup lang="ts">
  import { reactive, ref } from "vue";
  import InputText from "primevue/inputtext";
  import Button from "primevue/button";
  import "@/app/pages/dashboard/DashboardPage.css";

  // ✅ Components (same markup inside, so CSS stays identical)
  import KpiCard from "@/app/components/dashboard/KpiCard.vue";
  import KanbanColumn from "@/app/components/dashboard/KanbanColumn.vue";
  import PlaceholderCard from "@/app/components/dashboard/PlaceholderCard.vue";
  import TodayTimelineCard from "@/app/components/dashboard/TodayTimelineCard.vue";
  import ExceptionsCard from "@/app/components/dashboard/ExceptionsCard.vue";
  import QuickActionsCard from "@/app/components/dashboard/QuickActionsCard.vue";

  type ModeKey = "all" | "road" | "sea" | "air" | "rail";

  const ui = reactive({
    title: "PC Cargo — Freight Forward Thinking",
    crumb: "Dashboard",
    searchPlaceholder: "Search jobs, quotes, contacts...",
    exportLabel: "Export CSV",
    newJobLabel: "New Job",
  });

  const filters = reactive({
    globalSearch: "",
    quickFilter: "",
    mode: "all" as ModeKey,
  });

  const modeTabs = ref([
    { key: "all" as const, label: "All" },
    { key: "road" as const, label: "Road" },
    { key: "sea" as const, label: "Sea" },
    { key: "air" as const, label: "Air" },
    { key: "rail" as const, label: "Rail" },
  ]);

  /** ✅ Dummy + fillable later */
  type Kpi = {
    key: string;
    label: string;
    value: string | number;
    delta?: { direction: "up" | "down"; text: string };
  };

  const kpis = ref<Kpi[]>([
    { key: "open_jobs", label: "Open Jobs", value: 42, delta: { direction: "up", text: "+6" } },
    { key: "in_transit", label: "In Transit", value: 18, delta: { direction: "down", text: "-2" } },
    { key: "exceptions", label: "Exceptions", value: 3, delta: { direction: "up", text: "+1" } },
    { key: "on_time", label: "On-time %", value: "96%", delta: { direction: "up", text: "+2" } },
  ]);

  const mapCard = reactive({
    title: "Live Shipments Map",
    subtitle: "Placeholder — integrate Mapbox/Leaflet later",
    placeholder: "Map placeholder",
  });

  type OpsLane = { key: string; title: string; tiles: { ref: string; meta: string }[] };

  const opsBoard = reactive({
    title: "Today’s Ops Board",
    subtitle: "Mini Kanban: Planned · In Transit · Delivered",
    lanes: [
      {
        key: "planned",
        title: "Planned",
        tiles: [
          { ref: "REF PL-01", meta: "Client · Lane" },
          { ref: "REF PL-02", meta: "Client · Lane" },
          { ref: "REF PL-03", meta: "Client · Lane" },
        ],
      },
      {
        key: "in_transit",
        title: "In Transit",
        tiles: [
          { ref: "REF IN-01", meta: "Client · Lane" },
          { ref: "REF IN-02", meta: "Client · Lane" },
          { ref: "REF IN-03", meta: "Client · Lane" },
        ],
      },
      {
        key: "delivered",
        title: "Delivered",
        tiles: [
          { ref: "REF DE-01", meta: "Client · Lane" },
          { ref: "REF DE-02", meta: "Client · Lane" },
          { ref: "REF DE-03", meta: "Client · Lane" },
        ],
      },
    ] as OpsLane[],
  });

  const bottomCards = ref([
    { key: "mode_mix", title: "Mode Mix", subtitle: "Donut placeholder" },
    { key: "revenue_trend", title: "Revenue Trend", subtitle: "Last 8 weeks — placeholder" },
    { key: "exception_heatmap", title: "Exception Heatmap", subtitle: "Ports/Lanes recurring issues" },
  ]);

  const timeline = ref([
    { time: "08:30", text: "Booked carrier for PC-240198 (Air)" },
    { time: "10:10", text: "Warehouse GRN completed — WHS-03" },
    { time: "12:45", text: "Invoice INV-1007 exported" },
    { time: "14:15", text: "Exception raised for PC-240201" },
  ]);

  const exceptions = ref([
    { ref: "PC-240201", desc: "Customs hold at Gdynia", timeAgo: "12m ago" },
    { ref: "PC-240178", desc: "Temperature excursion (reefer)", timeAgo: "48m ago" },
    { ref: "PC-240166", desc: "POD missing (Dover)", timeAgo: "2h ago" },
  ]);

  /** handlers */
  function onClose() { console.log("close"); }
  function onExportCsv() { console.log("export csv", { ...filters }); }
  function onNewJob() { console.log("new job"); }
  function onNotifications() { console.log("notifications"); }
  function onAdvanced() { console.log("advanced"); }
  function onRoutes() { console.log("routes"); }
  function onMapFilters() { console.log("map filters"); }

  function onQuickAction(key: string) {
    console.log("quick action:", key);
  }
  </script>
