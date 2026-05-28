<script setup lang="ts">
import "./UserSettingsSignaturePage.css"
import { useUserSettingsSignaturePage } from "./UserSettingsSignaturePage"

const {
  signature,
  activeFieldPreview,
  activeFieldStyle,
  activeStyleLabel,
  fontFamilyOptions,
  fontSizeOptions,
  hasSignatureImage,
  styleDialogVisible,
  getSignatureFieldStyle,
  openStyleDialog,
  onClearSignatureImage,
  onSaveSignature,
  onSignatureImageSelect,
} = useUserSettingsSignaturePage()
</script>

<template>
  <section class="user-signature-page">
    <div class="user-signature-page__editor">
      <div class="user-signature-page__form">
        <div>
          <h2 class="user-signature-page__title">Signature</h2>
          <p class="user-signature-page__subtitle">
            This signature is used only for your profile and document previews.
          </p>
        </div>

        <div class="user-signature-page__grid">
          <div class="user-signature-page__field">
            <span class="user-signature-page__field-header">
              <span>Name</span>
              <Button
                icon="pi pi-sliders-h"
                text
                rounded
                aria-label="Style name"
                @click="openStyleDialog('name')"
              />
            </span>
            <InputText v-model="signature.name" />
          </div>

          <div class="user-signature-page__field">
            <span class="user-signature-page__field-header">
              <span>Title</span>
              <Button
                icon="pi pi-sliders-h"
                text
                rounded
                aria-label="Style title"
                @click="openStyleDialog('title')"
              />
            </span>
            <InputText v-model="signature.title" />
          </div>

          <div class="user-signature-page__field">
            <span class="user-signature-page__field-header">
              <span>Phone</span>
              <Button
                icon="pi pi-sliders-h"
                text
                rounded
                aria-label="Style phone"
                @click="openStyleDialog('phone')"
              />
            </span>
            <InputText v-model="signature.phone" />
          </div>

          <div class="user-signature-page__field">
            <span class="user-signature-page__field-header">
              <span>Email</span>
              <Button
                icon="pi pi-sliders-h"
                text
                rounded
                aria-label="Style email"
                @click="openStyleDialog('email')"
              />
            </span>
            <InputText v-model="signature.email" />
          </div>

          <div class="user-signature-page__field user-signature-page__field--wide">
            <span class="user-signature-page__field-header">
              <span>Signature message</span>
              <Button
                icon="pi pi-sliders-h"
                text
                rounded
                aria-label="Style signature message"
                @click="openStyleDialog('body')"
              />
            </span>
            <Textarea v-model="signature.body" autoResize rows="3" />
          </div>
        </div>

        <div class="user-signature-page__actions">
          <FileUpload
            mode="basic"
            name="signature"
            accept="image/*"
            :maxFileSize="2000000"
            :auto="false"
            :customUpload="true"
            chooseLabel="Upload Signature Image"
            class="user-signature-page__upload"
            @select="onSignatureImageSelect"
          />

          <Button
            label="Clear Image"
            icon="pi pi-times"
            outlined
            :disabled="!hasSignatureImage"
            @click="onClearSignatureImage"
          />

          <Button
            label="Save Signature"
            icon="pi pi-save"
            class="btn btn--primary"
            @click="onSaveSignature"
          />
        </div>
      </div>

      <div class="user-signature-page__preview">
        <span class="user-signature-page__eyebrow">Preview</span>
        <p :style="getSignatureFieldStyle('body')">{{ signature.body }}</p>
        <img v-if="signature.imagePreview" :src="signature.imagePreview" alt="Signature preview" />
        <strong :style="getSignatureFieldStyle('name')">{{ signature.name }}</strong>
        <span :style="getSignatureFieldStyle('title')">{{ signature.title }}</span>
        <small v-if="signature.phone || signature.email">
          <span v-if="signature.phone" :style="getSignatureFieldStyle('phone')">{{
            signature.phone
          }}</span>
          <span v-if="signature.phone && signature.email"> | </span>
          <span v-if="signature.email" :style="getSignatureFieldStyle('email')">{{
            signature.email
          }}</span>
        </small>
      </div>
    </div>

    <Dialog
      v-model:visible="styleDialogVisible"
      modal
      :header="`${activeStyleLabel} Style`"
      class="user-signature-style-dialog"
      :style="{ width: 'min(94vw, 460px)' }"
    >
      <div class="user-signature-style-dialog__body">
        <label class="user-signature-page__field">
          <span>Font style</span>
          <Select v-model="activeFieldStyle.fontFamily" :options="fontFamilyOptions" />
        </label>

        <label class="user-signature-page__field">
          <span>Font size</span>
          <Select v-model="activeFieldStyle.fontSize" :options="fontSizeOptions" />
        </label>

        <label class="user-signature-page__field">
          <span>Font color</span>
          <span class="user-signature-page__color-control">
            <input
              v-model="activeFieldStyle.color"
              type="color"
              aria-label="Signature font color"
            />
            <InputText v-model="activeFieldStyle.color" />
          </span>
        </label>

        <div class="user-signature-style-dialog__preview" :style="activeFieldStyle">
          <span>{{ activeStyleLabel }}</span>
          <strong>{{ activeFieldPreview }}</strong>
        </div>
      </div>

      <template #footer>
        <Button
          label="Done"
          icon="pi pi-check"
          class="btn btn--primary"
          @click="styleDialogVisible = false"
        />
      </template>
    </Dialog>
  </section>
</template>
