<script setup lang="ts">
import "./SystemSettingsBrandingPage.css"
import { useSystemSettingsBrandingPage } from "./SystemSettingsBrandingPage"

const {
  activeTab,
  tabs,
  company,
  companyName,
  currentLogoSrc,
  errorMessage,
  hasLogoChange,
  activeSignature,
  hasSavedSignature,
  loading,
  saving,
  documentFormatOptions,
  documentSections,
  documentToneOptions,
  pdfLayoutOptions,
  setActiveTab,
  getActiveSignatureFieldStyle,
  toggleDocumentSection,
  updateDocumentBody,
  applyEditorCommand,
  onClearLogoSelection,
  onLogoSelect,
  onSaveLogo,
} = useSystemSettingsBrandingPage()
</script>

<template>
  <section class="system-settings-branding-page">
    <div class="branding-tabs" role="tablist" aria-label="Branding sections">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="branding-tabs__button"
        :class="{ 'branding-tabs__button--active': activeTab === tab.value }"
        role="tab"
        :aria-selected="activeTab === tab.value"
        @click="setActiveTab(tab.value)"
      >
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div v-if="loading" class="branding-panel branding-panel--empty">
      Loading branding settings...
    </div>

    <div v-else-if="activeTab === 'logo-assets'" class="branding-panel">
      <div class="asset-editor">
        <div class="logo-editor">
          <div class="logo-editor__preview">
            <span class="logo-editor__eyebrow">Header logo</span>
            <div class="logo-editor__header-shell">
              <button class="logo-editor__brand" type="button">
                <img :src="currentLogoSrc" :alt="`${companyName} logo`" />
              </button>
              <div class="logo-editor__nav-lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
            <p class="logo-editor__caption">
              This is the logo shown in the main application header.
            </p>
          </div>

          <div class="logo-editor__controls">
            <div>
              <h3 class="logo-editor__title">Company logo</h3>
              <p class="logo-editor__text">
                Upload the image that should appear in the top header and app navigation.
              </p>
            </div>

            <FileUpload
              mode="basic"
              name="logo"
              accept="image/*"
              :maxFileSize="2000000"
              :auto="false"
              :customUpload="true"
              chooseLabel="Choose Logo"
              class="branding-file-upload"
              @select="onLogoSelect"
            />

            <small class="logo-editor__hint">JPG, PNG, or WEBP. Maximum file size is 2MB.</small>

            <p v-if="errorMessage" class="logo-editor__error">{{ errorMessage }}</p>

            <div class="logo-editor__actions">
              <Button
                label="Save Logo"
                icon="pi pi-save"
                class="btn btn--primary"
                :loading="saving"
                :disabled="!company || !hasLogoChange"
                @click="onSaveLogo"
              />
              <Button
                label="Clear"
                icon="pi pi-times"
                outlined
                :disabled="!hasLogoChange || saving"
                @click="onClearLogoSelection"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'colours'" class="branding-panel branding-panel--empty">
      <i class="pi pi-palette" />
      <div>
        <h3>Colours</h3>
        <p>Brand colour controls will live here next.</p>
      </div>
    </div>

    <div v-else class="branding-panel">
      <div class="document-branding">
        <article
          v-for="section in documentSections"
          :key="section.id"
          class="document-branding__section"
        >
          <button
            type="button"
            class="document-branding__toggle"
            :aria-expanded="section.expanded"
            @click="toggleDocumentSection(section.id)"
          >
            <span class="document-branding__toggle-main">
              <span class="document-branding__title">{{ section.title }}</span>
              <span class="document-branding__description">{{ section.description }}</span>
            </span>

            <span class="document-branding__meta">
              <span class="document-branding__badge">{{ section.format }}</span>
              <i class="pi" :class="section.expanded ? 'pi-chevron-up' : 'pi-chevron-down'" />
            </span>
          </button>

          <div v-if="section.expanded" class="document-branding__body">
            <div class="document-branding__editor-shell">
              <div class="document-branding__controls">
                <div class="document-branding__grid">
                  <label class="document-branding__field">
                    <span>Format</span>
                    <Select v-model="section.format" :options="documentFormatOptions" />
                  </label>

                  <label class="document-branding__field">
                    <span>Tone</span>
                    <Select v-model="section.tone" :options="documentToneOptions" />
                  </label>

                  <label v-if="section.format === 'PDF'" class="document-branding__field">
                    <span>PDF layout</span>
                    <Select v-model="section.layout" :options="pdfLayoutOptions" />
                  </label>

                  <label class="document-branding__field document-branding__field--wide">
                    <span>{{
                      section.format === "Email" ? "Opening line" : "Document heading"
                    }}</span>
                    <InputText v-model="section.header" />
                  </label>

                  <label
                    v-if="section.format === 'Email'"
                    class="document-branding__field document-branding__field--wide"
                  >
                    <span>Email subject</span>
                    <InputText v-model="section.subject" />
                  </label>
                </div>

                <div v-if="section.format === 'Email'" class="email-editor">
                  <div class="editor-toolbar" aria-label="Email editor formatting">
                    <button
                      type="button"
                      title="Bold"
                      @mousedown.prevent="applyEditorCommand('bold')"
                    >
                      <i class="pi pi-bold" />
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      @mousedown.prevent="applyEditorCommand('italic')"
                    >
                      <i class="pi pi-italic" />
                    </button>
                    <button
                      type="button"
                      title="Bulleted list"
                      @mousedown.prevent="applyEditorCommand('insertUnorderedList')"
                    >
                      <i class="pi pi-list" />
                    </button>
                  </div>

                  <div
                    class="email-editor__body"
                    contenteditable="true"
                    :aria-label="`${section.title} email body`"
                    v-html="section.body"
                    @input="updateDocumentBody(section.id, $event)"
                  />
                </div>

                <label v-else class="document-branding__field document-branding__field--wide">
                  <span>PDF body notes</span>
                  <Textarea v-model="section.body" autoResize rows="4" />
                </label>

                <label class="document-branding__field document-branding__field--wide">
                  <span>{{ section.format === "Email" ? "Email footer" : "PDF footer" }}</span>
                  <Textarea v-model="section.footer" autoResize rows="3" />
                </label>

                <div class="document-branding__options">
                  <label class="document-branding__check">
                    <Checkbox v-model="section.includeLogo" binary />
                    <span>Include logo</span>
                  </label>

                  <label class="document-branding__check">
                    <Checkbox v-model="section.includeBankDetails" binary />
                    <span>Include bank details</span>
                  </label>

                  <label class="document-branding__check">
                    <Checkbox v-model="section.includeSignature" binary />
                    <span>Include signature</span>
                  </label>
                </div>
              </div>

              <div v-if="section.format === 'Email'" class="email-preview">
                <div class="email-preview__topbar">
                  <span />
                  <span />
                  <span />
                </div>
                <div class="email-preview__header">
                  <img
                    v-if="section.includeLogo"
                    :src="currentLogoSrc"
                    :alt="`${companyName} logo`"
                  />
                  <div>
                    <strong>{{ companyName }}</strong>
                    <small>{{ section.subject || "Email subject" }}</small>
                  </div>
                </div>
                <div class="email-preview__content">
                  <p class="email-preview__opening">{{ section.header }}</p>
                  <div class="email-preview__body-copy" v-html="section.body" />
                  <div v-if="section.includeBankDetails" class="email-preview__bank">
                    Bank details will be inserted here.
                  </div>
                  <p>{{ section.footer }}</p>
                  <p v-if="section.includeSignature" class="email-preview__signature">
                    <img
                      v-if="activeSignature.imagePreview"
                      :src="activeSignature.imagePreview"
                      alt="Signature"
                    />
                    <em :style="getActiveSignatureFieldStyle('body')">{{
                      activeSignature.body
                    }}</em>
                    <strong :style="getActiveSignatureFieldStyle('name')">{{
                      activeSignature.name
                    }}</strong>
                    <span :style="getActiveSignatureFieldStyle('title')">{{
                      activeSignature.title
                    }}</span>
                    <small v-if="activeSignature.phone || activeSignature.email">
                      <span
                        v-if="activeSignature.phone"
                        :style="getActiveSignatureFieldStyle('phone')"
                      >
                        {{ activeSignature.phone }}
                      </span>
                      <span v-if="activeSignature.phone && activeSignature.email"> | </span>
                      <span
                        v-if="activeSignature.email"
                        :style="getActiveSignatureFieldStyle('email')"
                      >
                        {{ activeSignature.email }}
                      </span>
                    </small>
                  </p>
                </div>
              </div>

              <div
                v-else
                class="pdf-editor-preview"
                :class="`pdf-editor-preview--${section.layout.toLowerCase()}`"
              >
                <div class="pdf-page">
                  <header class="pdf-page__header">
                    <img
                      v-if="section.includeLogo"
                      :src="currentLogoSrc"
                      :alt="`${companyName} logo`"
                    />
                    <div>
                      <strong>{{ companyName }}</strong>
                      <span>{{ section.title }}</span>
                    </div>
                  </header>

                  <section class="pdf-page__hero">
                    <h3>{{ section.header }}</h3>
                    <span>{{ section.tone }}</span>
                  </section>

                  <section class="pdf-page__details">
                    <div />
                    <div />
                    <div />
                    <div />
                  </section>

                  <section class="pdf-page__table">
                    <div class="pdf-page__row pdf-page__row--head">
                      <span>Description</span>
                      <span>Qty</span>
                      <span>Total</span>
                    </div>
                    <div class="pdf-page__row">
                      <span>{{ section.body }}</span>
                      <span>1</span>
                      <span>--</span>
                    </div>
                    <div class="pdf-page__row">
                      <span>Service charge</span>
                      <span>1</span>
                      <span>--</span>
                    </div>
                  </section>

                  <section v-if="section.includeBankDetails" class="pdf-page__bank">
                    Payment and bank details
                  </section>

                  <footer class="pdf-page__footer">
                    <span>{{ section.footer }}</span>
                    <span v-if="section.includeSignature" class="pdf-page__signature">
                      <img
                        v-if="activeSignature.imagePreview"
                        :src="activeSignature.imagePreview"
                        alt="Signature"
                      />
                      <strong :style="getActiveSignatureFieldStyle('name')">{{
                        activeSignature.name
                      }}</strong>
                      <small :style="getActiveSignatureFieldStyle('title')">{{
                        activeSignature.title
                      }}</small>
                    </span>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
