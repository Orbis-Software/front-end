<template>
  <div class="ms-page">
    <div class="ms-wrap">
      <div class="ms-top">
        <div>
          <div class="ms-title">Master Settings</div>
          <div class="ms-subtitle">
            Complete your company profile. This will be the main page for all job numbers and company information.
          </div>

          <button class="ms-pill" type="button">SYSTEM SETTINGS</button>
        </div>
      </div>

      <!-- 2-column cards -->
      <div class="ms-grid">
        <!-- Company Information -->
        <section class="ms-card">
          <div class="ms-card-head">
            <div>
              <div class="ms-card-title">Company Information</div>
              <div class="ms-card-desc">Legal and registration details</div>
            </div>

            <div class="ms-saved" v-if="company">
              <span class="dot" /> Saved
            </div>
          </div>

          <div class="ms-card-body">
            <div class="ms-field">
              <div class="ms-label">Company Name <span class="req">(required)</span></div>
              <input v-model="form.legal_name" class="ms-input" placeholder="Enter full legal company name" />
            </div>

            <div class="ms-field">
              <div class="ms-label">Trading Name <span class="muted">(if different)</span></div>
              <input v-model="form.trading_name" class="ms-input" placeholder="Enter trading name if different" />
            </div>

            <div class="ms-row2">
              <div class="ms-field">
                <div class="ms-label">Registration Number</div>
                <input v-model="form.registration_number" class="ms-input" placeholder="Company registration number" />
              </div>
              <div class="ms-field">
                <div class="ms-label">VAT Number</div>
                <input v-model="form.vat_number" class="ms-input" placeholder="VAT registration number" />
              </div>
            </div>

            <div class="ms-row2">
              <div class="ms-field">
                <div class="ms-label">EORI Number</div>
                <input v-model="form.eori_number" class="ms-input" placeholder="Economic Operators Registration Num" />
              </div>
              <div class="ms-field">
                <div class="ms-label">IATA Code</div>
                <input v-model="form.iata_code" class="ms-input" placeholder="IATA" />
              </div>
            </div>
          </div>
        </section>

        <!-- Trading Address -->
        <section class="ms-card">
          <div class="ms-card-head">
            <div>
              <div class="ms-card-title">Trading Address</div>
              <div class="ms-card-desc">Primary business location</div>
            </div>
          </div>

          <div class="ms-card-body">
            <div class="ms-field">
              <div class="ms-label">Apartment/House Number</div>
              <input v-model="form.trading_building" class="ms-input" placeholder="Suite, Building, Floor" />
            </div>

            <div class="ms-field">
              <div class="ms-label">Address Line 1 <span class="req">(required)</span></div>
              <input v-model="form.trading_address_line_1" class="ms-input" placeholder="Street address" />
            </div>

            <div class="ms-row2">
              <div class="ms-field">
                <div class="ms-label">Address Line 2</div>
                <input
                  v-model="form.trading_address_line_2"
                  class="ms-input"
                  placeholder="Additional address information"
                />
              </div>
              <div class="ms-field">
                <div class="ms-label">Address Line 3</div>
                <input
                  v-model="form.trading_address_line_3"
                  class="ms-input"
                  placeholder="Additional address information"
                />
              </div>
            </div>

            <div class="ms-row2">
              <div class="ms-field">
                <div class="ms-label">Town/City <span class="req">(required)</span></div>
                <input v-model="form.trading_city" class="ms-input" />
              </div>
              <div class="ms-field">
                <div class="ms-label">County/State</div>
                <input v-model="form.trading_state" class="ms-input" />
              </div>
            </div>

            <div class="ms-row2">
              <div class="ms-field">
                <div class="ms-label">Postcode/Zip <span class="req">(required)</span></div>
                <input v-model="form.trading_postcode" class="ms-input" />
              </div>
              <div class="ms-field">
                <div class="ms-label">Country <span class="req">(required)</span></div>
                <select v-model="form.trading_country_code" class="ms-input">
                  <option value="GB">United Kingdom</option>
                  <option value="PH">Philippines</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="US">United States</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- Contact Information -->
        <section class="ms-card">
          <div class="ms-card-head">
            <div>
              <div class="ms-card-title">Contact Information</div>
              <div class="ms-card-desc">Primary business contacts</div>
            </div>
          </div>

          <div class="ms-card-body">
            <div class="ms-field">
              <div class="ms-label">Main Contact Name <span class="req">(required)</span></div>
              <input v-model="form.contact_name" class="ms-input" placeholder="Full name of main contact" />
            </div>

            <div class="ms-row2">
              <div class="ms-field">
                <div class="ms-label">Email <span class="req">(required)</span></div>
                <input v-model="form.contact_email" class="ms-input" placeholder="email@company.com" />
              </div>
              <div class="ms-field">
                <div class="ms-label">Mobile <span class="req">(required)</span></div>
                <input v-model="form.contact_mobile" class="ms-input" placeholder="+44 7123 456789" />
              </div>
            </div>

            <div class="ms-field">
              <div class="ms-label">Telephone Numbers</div>

              <div class="ms-phone-row" v-for="(p, i) in form.contact_telephones" :key="i">
                <input class="ms-input" :value="p" readonly />
                <button class="ms-mini" type="button" @click="removePhone(i)">−</button>
              </div>

              <div class="ms-phone-add">
                <input v-model="form.new_phone" class="ms-input" placeholder="+44 20 7123 4567" />
                <button class="ms-btn" type="button" @click="addPhone">+ Add Phone</button>
              </div>
            </div>
          </div>
        </section>

        <!-- System Settings -->
        <section class="ms-card">
          <div class="ms-card-head">
            <div>
              <div class="ms-card-title">System Settings</div>
              <div class="ms-card-desc">Configuration and preferences</div>
            </div>
          </div>

          <div class="ms-card-body">
            <div class="ms-row2">
              <div class="ms-field">
                <div class="ms-label">Time Zone <span class="req">(required)</span></div>
                <select v-model="form.settings_time_zone" class="ms-input">
                  <option value="" disabled>Select time zone</option>
                  <option v-for="tz in timeZones" :key="tz" :value="tz">{{ tz }}</option>
                </select>
              </div>

              <div class="ms-field">
                <div class="ms-label">Main Currency <span class="req">(required)</span></div>
                <select v-model="form.settings_main_currency_code" class="ms-input">
                  <option value="" disabled>Select main currency</option>
                  <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <div class="ms-field">
              <div class="ms-label">Additional Currencies</div>

              <div class="ms-inline">
                <input v-model="addCurrencyInput" class="ms-input" placeholder="e.g. USD" maxlength="3" />
                <button class="ms-btn" type="button" @click="addCurrency">+ Add Currency</button>
              </div>

              <div class="ms-tags">
                <span class="tag" v-for="c in form.additional_currencies" :key="c">
                  {{ c }}
                  <button type="button" class="x" @click="removeCurrency(c)">×</button>
                </span>
              </div>

              <div class="ms-help">These currencies will be available for invoicing</div>
            </div>

            <div class="ms-row2">
              <div class="ms-field">
                <div class="ms-label">Start Period</div>
                <input v-model="form.settings_start_period" class="ms-input" placeholder="YYYY-MM-DD" />
                <div class="ms-help">System start date</div>
              </div>
              <div class="ms-field">
                <div class="ms-label">Invoicing Period</div>
                <select v-model="form.settings_invoicing_period" class="ms-input">
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
                <div class="ms-help">Software subscription billing</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Reference Numbers -->
      <section class="ms-card ms-wide">
        <div class="ms-card-head ms-wide-head">
          <div>
            <div class="ms-card-title">Reference Numbers</div>
            <div class="ms-card-desc">Configure numbering for all document types</div>
          </div>

          <button class="ms-btn" type="button" @click="copyToAll">Copy to All</button>
        </div>

        <div class="refs-grid">
          <div class="ref-card" v-for="r in form.refs" :key="r.type">
            <div class="ref-title">{{ r.title }}</div>

            <!-- Non-account refs: show Year (display-only) -->
            <div class="ref-cols" v-if="r.type !== 'account'">
              <div class="ref-col">
                <div class="ref-label">Prefix</div>
                <input v-model="r.prefix" class="ms-input ms-input-sm" />
              </div>

              <div class="ref-col">
                <div class="ref-label">Year</div>
                <input :value="year2(r.year_digits)" class="ms-input ms-input-sm ms-disabled" disabled />
              </div>

              <div class="ref-col ref-col-wide">
                <div class="ref-label">Start Number</div>
                <input
                  v-model="r.start_number"
                  class="ms-input ms-input-sm"
                  maxlength="9"
                  @input="onStartNumberInput(r)"
                />
              </div>

              <div class="ref-col ref-col-wide">
                <div class="ref-label">Sample</div>
                <input class="ms-input ms-input-sm ms-readonly" :value="sampleFor(r)" readonly />
              </div>
            </div>

            <!-- Account Numbers: no Year -->
            <div class="ref-cols ref-cols-account" v-else>
              <div class="ref-col">
                <div class="ref-label">Prefix</div>
                <input v-model="r.prefix" class="ms-input ms-input-sm" />
              </div>

              <div class="ref-col ref-col-wide">
                <div class="ref-label">Starting Number</div>
                <input
                  v-model="r.start_number"
                  class="ms-input ms-input-sm"
                  maxlength="9"
                  @input="onStartNumberInput(r)"
                />
              </div>

              <div class="ref-col ref-col-wide">
                <div class="ref-label">Sample</div>
                <input class="ms-input ms-input-sm ms-readonly" :value="sampleFor(r)" readonly />
              </div>
            </div>

            <!-- Checkbox ONLY under Account Numbers -->
            <div class="ref-bottom" v-if="r.type === 'account'">
              <label class="chk">
                <input type="checkbox" v-model="globalUseSystem" />
                Use This Numbering System
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom actions -->
      <div class="ms-actions">
        <button class="ms-back" type="button" @click="router.back()">← Back</button>

        <div class="ms-actions-right">
          <button class="ms-btn ghost" type="button" :disabled="saving" @click="onSave(false)">
            Save Draft
          </button>
          <button class="ms-btn primary" type="button" :disabled="saving" @click="onSave(true)">
            {{ saving ? "Saving..." : "Save Profile" }}
          </button>
        </div>
      </div>

      <div v-if="loading" style="margin-top: 12px; color: #555; font-size: 12px;">
        Loading...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "./MasterSettingsPage.css"
import { useMasterSettingsPage } from "./useMasterSettingsPage"

const {
  router,
  company,
  loading,
  saving,

  timeZones,
  currencies,

  addCurrencyInput,
  form,

  globalUseSystem,

  digitsMax9,
  year2,
  sampleFor,
  onStartNumberInput,
  copyToAll,

  addPhone,
  removePhone,
  addCurrency,
  removeCurrency,

  onRefresh,
  onSave,
} = useMasterSettingsPage()
</script>
