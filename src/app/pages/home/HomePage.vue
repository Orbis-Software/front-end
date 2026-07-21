<template>
  <div class="home-page">
    <div class="home-page__announcement">
      <div class="home-container home-page__announcement-inner">
        <p>
          <span class="home-page__announcement-dot" aria-hidden="true"></span>
          One connected platform for freight, transport and warehouse operations
        </p>
        <div class="home-page__announcement-links">
          <a href="#platform">Explore Orbis</a>
          <span aria-hidden="true">/</span>
          <RouterLink to="/customer/login">Customer portal</RouterLink>
        </div>
      </div>
    </div>

    <header class="home-header">
      <div class="home-container home-header__inner">
        <a class="home-header__brand" href="#top" aria-label="Orbis home">
          <img src="/orbis-logo.png" alt="Orbis" />
        </a>

        <button
          class="home-header__menu-button"
          type="button"
          :aria-expanded="mobileMenuOpen"
          aria-controls="home-navigation"
          aria-label="Toggle navigation"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'" aria-hidden="true"></i>
        </button>

        <nav
          id="home-navigation"
          class="home-header__navigation"
          :class="{ 'home-header__navigation--open': mobileMenuOpen }"
          aria-label="Main navigation"
        >
          <a href="#services" @click="closeMobileMenu">Services</a>
          <a href="#platform" @click="closeMobileMenu">Platform</a>
          <a href="#workflow" @click="closeMobileMenu">How it works</a>
          <a href="#contact" @click="closeMobileMenu">Contact</a>
          <div class="home-header__mobile-actions">
            <RouterLink class="home-button home-button--ghost" to="/customer/login">
              Customer portal
            </RouterLink>
            <RouterLink class="home-button home-button--primary" to="/login">
              Staff login
            </RouterLink>
          </div>
        </nav>

        <div class="home-header__actions">
          <RouterLink class="home-header__portal" to="/customer/login">Customer portal</RouterLink>
          <RouterLink class="home-button home-button--primary home-button--small" to="/login">
            Staff login
            <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
          </RouterLink>
        </div>
      </div>
    </header>

    <main id="top">
      <section class="home-hero" aria-labelledby="home-hero-title">
        <div class="home-hero__image" aria-hidden="true"></div>
        <div class="home-hero__overlay" aria-hidden="true"></div>
        <div class="home-hero__grid" aria-hidden="true"></div>

        <div class="home-container home-hero__content">
          <div class="home-hero__copy">
            <p class="home-eyebrow home-eyebrow--light">
              <span></span>
              Freight technology that moves with you
            </p>
            <h1 id="home-hero-title">
              Every shipment.<br />
              <em>One clear view.</em>
            </h1>
            <p class="home-hero__lead">
              Orbis connects quotations, jobs, transport, warehouse activity and documents in one
              practical workspace built for modern logistics teams.
            </p>
            <div class="home-hero__actions">
              <RouterLink class="home-button home-button--primary home-button--large" to="/login">
                Access Orbis
                <i class="pi pi-arrow-right" aria-hidden="true"></i>
              </RouterLink>
              <a class="home-button home-button--light-outline home-button--large" href="#platform">
                Discover the platform
              </a>
            </div>
          </div>

          <div class="operations-card" aria-label="Orbis operations overview preview">
            <div class="operations-card__topbar">
              <div>
                <span class="operations-card__kicker">Operations control</span>
                <strong>Today at a glance</strong>
              </div>
              <span class="operations-card__live"><span></span> Live</span>
            </div>
            <div class="operations-card__metrics">
              <div>
                <span>Active jobs</span>
                <strong>24</strong>
                <small><i class="pi pi-arrow-up" aria-hidden="true"></i> Moving</small>
              </div>
              <div>
                <span>Warehouse</span>
                <strong>08</strong>
                <small>Expected</small>
              </div>
              <div>
                <span>Actions</span>
                <strong>03</strong>
                <small>To review</small>
              </div>
            </div>
            <div class="operations-card__route">
              <div class="operations-card__route-head">
                <div>
                  <span>Current movement</span>
                  <strong>GBL-2048</strong>
                </div>
                <span class="operations-card__status">In transit</span>
              </div>
              <div class="operations-card__locations">
                <div><strong>LHR</strong><span>London</span></div>
                <div class="operations-card__line">
                  <i class="pi pi-send" aria-hidden="true"></i>
                </div>
                <div><strong>AMS</strong><span>Amsterdam</span></div>
              </div>
              <div class="operations-card__progress" aria-hidden="true"><span></span></div>
              <div class="operations-card__route-meta">
                <span><i class="pi pi-box" aria-hidden="true"></i> 12 packages</span>
                <span><i class="pi pi-clock" aria-hidden="true"></i> On schedule</span>
              </div>
            </div>
          </div>
        </div>

        <div class="home-container home-hero__mode-bar" aria-label="Supported transport modes">
          <span>Built for every mode</span>
          <ul>
            <li><i class="pi pi-truck" aria-hidden="true"></i> Road</li>
            <li><i class="pi pi-send" aria-hidden="true"></i> Air</li>
            <li><i class="pi pi-compass" aria-hidden="true"></i> Sea</li>
            <li><i class="pi pi-directions" aria-hidden="true"></i> Rail</li>
          </ul>
        </div>
      </section>

      <section id="services" class="home-services home-section" aria-labelledby="services-title">
        <div class="home-container">
          <div class="home-section-heading home-section-heading--split">
            <div>
              <p class="home-eyebrow"><span></span>Connected freight services</p>
              <h2 id="services-title">Move goods across every channel.</h2>
            </div>
            <p>
              Plan and manage multimodal work without losing sight of the customer, the cargo or the
              commercial detail behind each movement.
            </p>
          </div>

          <div class="service-grid">
            <article v-for="(service, index) in services" :key="service.title" class="service-card">
              <div class="service-card__number">0{{ index + 1 }}</div>
              <div class="service-card__icon"><i :class="service.icon" aria-hidden="true"></i></div>
              <h3>{{ service.title }}</h3>
              <p>{{ service.description }}</p>
              <a href="#platform" :aria-label="`Explore ${service.title}`">
                Explore service <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
              </a>
            </article>
          </div>
        </div>
      </section>

      <section id="platform" class="home-platform home-section" aria-labelledby="platform-title">
        <div class="home-container home-platform__layout">
          <div class="home-platform__visual">
            <div
              class="home-platform__visual-image"
              role="img"
              aria-label="Cargo vessel carrying containers"
            ></div>
            <div class="home-platform__visual-badge">
              <strong>One source</strong>
              <span>of operational truth</span>
            </div>
            <div class="home-platform__visual-mark" aria-hidden="true">OR</div>
          </div>

          <div class="home-platform__copy">
            <p class="home-eyebrow"><span></span>The Orbis advantage</p>
            <h2 id="platform-title">Less chasing. More moving.</h2>
            <p class="home-platform__lead">
              Replace scattered spreadsheets and disconnected updates with a workflow that keeps
              commercial, operational and warehouse teams aligned.
            </p>

            <ul class="home-platform__benefits">
              <li v-for="benefit in benefits" :key="benefit.title">
                <span class="home-platform__benefit-icon"
                  ><i :class="benefit.icon" aria-hidden="true"></i
                ></span>
                <div>
                  <strong>{{ benefit.title }}</strong>
                  <p>{{ benefit.description }}</p>
                </div>
              </li>
            </ul>

            <RouterLink class="home-inline-link" to="/login">
              Enter the operations workspace
              <span><i class="pi pi-arrow-right" aria-hidden="true"></i></span>
            </RouterLink>
          </div>
        </div>
      </section>

      <section id="workflow" class="home-workflow home-section" aria-labelledby="workflow-title">
        <div class="home-container">
          <div class="home-section-heading home-section-heading--center">
            <p class="home-eyebrow"><span></span>One connected journey<span></span></p>
            <h2 id="workflow-title">From first quote to final delivery.</h2>
            <p>Keep the information moving with the freight, across every operational stage.</p>
          </div>

          <ol class="workflow-steps">
            <li v-for="(step, index) in workflow" :key="step.title">
              <div class="workflow-step__top">
                <span>0{{ index + 1 }}</span>
                <i :class="step.icon" aria-hidden="true"></i>
              </div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </li>
          </ol>
        </div>
      </section>

      <section class="home-capabilities home-section" aria-labelledby="capabilities-title">
        <div class="home-container">
          <div class="home-section-heading home-section-heading--split home-section-heading--light">
            <div>
              <p class="home-eyebrow home-eyebrow--light"><span></span>Built around the work</p>
              <h2 id="capabilities-title">Everything your team needs to stay in control.</h2>
            </div>
            <p>
              Orbis turns complex operational detail into a clear, consistent workspace for the
              people managing each shipment.
            </p>
          </div>

          <div class="capability-grid">
            <article v-for="capability in capabilities" :key="capability.title">
              <i :class="capability.icon" aria-hidden="true"></i>
              <div>
                <h3>{{ capability.title }}</h3>
                <p>{{ capability.description }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="home-cta" aria-labelledby="cta-title">
        <div class="home-container home-cta__inner">
          <div class="home-cta__copy">
            <span class="home-cta__label">Ready when you are</span>
            <h2 id="cta-title">Keep your logistics operation moving.</h2>
          </div>
          <div class="home-cta__actions">
            <RouterLink class="home-button home-button--dark home-button--large" to="/login">
              Staff login <i class="pi pi-arrow-right" aria-hidden="true"></i>
            </RouterLink>
            <RouterLink
              class="home-button home-button--orange-outline home-button--large"
              to="/customer/login"
            >
              Customer portal
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <footer id="contact" class="home-footer">
      <div class="home-container home-footer__main">
        <div class="home-footer__brand">
          <img src="/orbis-logo.png" alt="Orbis" />
          <p>A connected freight, transport and warehouse management platform.</p>
        </div>
        <div class="home-footer__column">
          <span>Platform</span>
          <a href="#services">Services</a>
          <a href="#platform">Capabilities</a>
          <a href="#workflow">Workflow</a>
        </div>
        <div class="home-footer__column">
          <span>Access</span>
          <RouterLink to="/login">Staff login</RouterLink>
          <RouterLink to="/customer/login">Customer portal</RouterLink>
        </div>
        <div class="home-footer__status">
          <span><i></i> Secure portal access</span>
          <p>Your operational workspace is available through the secure Orbis login.</p>
        </div>
      </div>
      <div class="home-container home-footer__bottom">
        <span>&copy; {{ currentYear }} Orbis Software Development Ltd.</span>
        <span>Freight operations, connected.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { RouterLink } from "vue-router"
import "./HomePage.css"

const mobileMenuOpen = ref(false)
const currentYear = new Date().getFullYear()

const services = [
  {
    title: "Road freight",
    description:
      "Manage domestic, cross-border and full or part-load movements with clear collection and delivery detail.",
    icon: "pi pi-truck",
  },
  {
    title: "Air freight",
    description:
      "Keep time-critical shipments, routing information and operational documents connected from origin to arrival.",
    icon: "pi pi-send",
  },
  {
    title: "Sea freight",
    description:
      "Coordinate global ocean movements, charges and milestones with one consistent view of the shipment.",
    icon: "pi pi-compass",
  },
  {
    title: "Rail freight",
    description:
      "Support efficient rail and multimodal planning while keeping each handover visible to the wider team.",
    icon: "pi pi-directions",
  },
]

const benefits = [
  {
    title: "A complete operational record",
    description:
      "Customer, address, cargo, cost and document data stays connected to the work it belongs to.",
    icon: "pi pi-sitemap",
  },
  {
    title: "Clear commercial visibility",
    description:
      "Keep buying costs, selling charges, currency and profitability visible from quotation onward.",
    icon: "pi pi-chart-line",
  },
  {
    title: "Designed for real workflows",
    description:
      "Move naturally between TMS and WMS activity without recreating the same operational detail.",
    icon: "pi pi-sync",
  },
]

const workflow = [
  {
    title: "Quote",
    description:
      "Build multimodal quotations with buying costs, selling charges and clear validity.",
    icon: "pi pi-file-edit",
  },
  {
    title: "Plan",
    description: "Convert accepted work and keep routing, cargo and address detail connected.",
    icon: "pi pi-map",
  },
  {
    title: "Move",
    description: "Manage transport activity, milestones and load planning in one workspace.",
    icon: "pi pi-truck",
  },
  {
    title: "Warehouse",
    description: "Receive, store and release goods with traceable stock and warehouse records.",
    icon: "pi pi-box",
  },
  {
    title: "Complete",
    description: "Bring documents, costs, invoices and customer visibility together at completion.",
    icon: "pi pi-check-circle",
  },
]

const capabilities = [
  {
    title: "Global location reference",
    description: "Search transport locations across road, rail, sea and air channels.",
    icon: "pi pi-globe",
  },
  {
    title: "Load planning",
    description: "Plan packages and vehicle capacity with shipment data close at hand.",
    icon: "pi pi-th-large",
  },
  {
    title: "Warehouse management",
    description: "Follow goods from expected arrival through storage and release.",
    icon: "pi pi-warehouse",
  },
  {
    title: "Customer visibility",
    description:
      "Give customers secure access to the quotes, shipments and documents relevant to them.",
    icon: "pi pi-users",
  },
  {
    title: "Document control",
    description: "Keep operational files attached to the right customer, quote and job.",
    icon: "pi pi-folder-open",
  },
  {
    title: "Commercial control",
    description: "See costs, sales, tax and margin in the currency context of the shipment.",
    icon: "pi pi-calculator",
  },
]

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>
