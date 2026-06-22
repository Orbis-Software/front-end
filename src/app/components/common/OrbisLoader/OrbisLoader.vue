<script setup lang="ts">
import "./OrbisLoader.css"

import { useOrbisLoader } from "./OrbisLoader"

const { loader, loaderClass } = useOrbisLoader()
</script>

<template>
  <Teleport to="body">
    <main
      v-if="loader.isVisible"
      :class="loaderClass"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="orbis-loader__panel orbis-loader__panel--left" aria-hidden="true"></div>

      <div class="orbis-loader__panel orbis-loader__panel--right" aria-hidden="true"></div>

      <div class="orbis-loader__line" aria-hidden="true"></div>

      <section class="orbis-loader__card" :aria-label="loader.title || 'Orbis is loading'">
        <!-- Orbis branding shown only once -->
        <div class="orbis-loader__brand">
          <span class="orbis-loader__brand-mark">
            <img src="/icon.svg" alt="" class="orbis-loader__brand-logo" />
          </span>

          <span class="orbis-loader__brand-copy">
            <strong>ORBIS</strong>
            <small>Software</small>
          </span>
        </div>

        <!-- Current loader operation, for example invoice generation -->
        <div class="orbis-loader__focus" aria-hidden="true">
          <span class="orbis-loader__orbit">
            <span></span>
          </span>

          <span class="orbis-loader__operation-wrap">
            <i :class="[loader.iconClass, 'orbis-loader__operation-icon']"></i>
          </span>
        </div>

        <h2>{{ loader.title }}</h2>

        <p>{{ loader.message }}</p>

        <div class="orbis-loader__progress" aria-hidden="true">
          <span></span>
        </div>

        <div class="orbis-loader__status">
          <span aria-hidden="true"></span>
          {{ loader.status }}
        </div>
      </section>

      <footer>
        {{ loader.footer }}
      </footer>
    </main>
  </Teleport>
</template>
