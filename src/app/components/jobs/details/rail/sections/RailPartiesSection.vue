<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <section class="rail-card">
    <div class="rail-card__body">
      <div class="rail-two-col">
        <div class="rail-addr-block">
          <div class="rail-addr-block__header">
            <div class="rail-addr-block__title">Shipper / Consignor</div>
          </div>

          <div class="rail-addr-block__body">
            <div class="rail-grid rail-grid--2">
              <div class="rail-field rail-span-2">
                <label>Company Name</label>
                <input type="text" :disabled="disabled" placeholder="Company name" />
              </div>
              <div class="rail-field rail-span-2">
                <label>Contact Person</label>
                <input type="text" :disabled="disabled" placeholder="Full name" />
              </div>
              <div class="rail-field rail-span-2">
                <label>Address Line 1</label>
                <input type="text" :disabled="disabled" placeholder="Street / number" />
              </div>
              <div class="rail-field rail-span-2">
                <label>Address Line 2</label>
                <input type="text" :disabled="disabled" placeholder="District / area" />
              </div>
              <div class="rail-field">
                <label>City</label>
                <input type="text" :disabled="disabled" />
              </div>
              <div class="rail-field">
                <label>Postcode</label>
                <input type="text" :disabled="disabled" />
              </div>
              <div class="rail-field rail-span-2">
                <label>Country</label>
                <select :disabled="disabled">
                  <option>China (CN)</option>
                  <option>Germany (DE)</option>
                  <option>Poland (PL)</option>
                  <option>Russia (RU)</option>
                  <option>Kazakhstan (KZ)</option>
                  <option>United Kingdom (GB)</option>
                  <option>Other…</option>
                </select>
              </div>
              <div class="rail-field">
                <label>Phone</label>
                <input type="tel" :disabled="disabled" placeholder="+xx xxx xxx xxxx" />
              </div>
              <div class="rail-field">
                <label>Email</label>
                <input type="email" :disabled="disabled" placeholder="contact@company.com" />
              </div>
            </div>
          </div>
        </div>

        <div class="rail-addr-block">
          <div class="rail-addr-block__header">
            <div class="rail-addr-block__title">Consignee / Receiver</div>
          </div>

          <div class="rail-addr-block__body">
            <div class="rail-grid rail-grid--2">
              <div class="rail-field rail-span-2">
                <label>Company Name</label>
                <input type="text" :disabled="disabled" placeholder="Company name" />
              </div>
              <div class="rail-field rail-span-2">
                <label>Contact Person</label>
                <input type="text" :disabled="disabled" placeholder="Full name" />
              </div>
              <div class="rail-field rail-span-2">
                <label>Address Line 1</label>
                <input type="text" :disabled="disabled" placeholder="Street / number" />
              </div>
              <div class="rail-field rail-span-2">
                <label>Address Line 2</label>
                <input type="text" :disabled="disabled" placeholder="District / area" />
              </div>
              <div class="rail-field">
                <label>City</label>
                <input type="text" :disabled="disabled" />
              </div>
              <div class="rail-field">
                <label>Postcode</label>
                <input type="text" :disabled="disabled" />
              </div>
              <div class="rail-field rail-span-2">
                <label>Country</label>
                <select :disabled="disabled">
                  <option>United Kingdom (GB)</option>
                  <option>Germany (DE)</option>
                  <option>Poland (PL)</option>
                  <option>Netherlands (NL)</option>
                  <option>Belgium (BE)</option>
                  <option>France (FR)</option>
                  <option>Other…</option>
                </select>
              </div>
              <div class="rail-field">
                <label>Phone</label>
                <input type="tel" :disabled="disabled" placeholder="+xx xxx xxx xxxx" />
              </div>
              <div class="rail-field">
                <label>Email</label>
                <input type="email" :disabled="disabled" placeholder="contact@company.com" />
              </div>
            </div>
          </div>
        </div>

        <div class="rail-addr-block">
          <div class="rail-addr-block__header">
            <div class="rail-addr-block__title">Collection / Origin Station</div>
          </div>

          <div class="rail-addr-block__body">
            <div class="rail-grid rail-grid--2">
              <div class="rail-field rail-span-2">
                <label>Station Name</label>
                <input type="text" :disabled="disabled" placeholder="e.g. Yiwu Railway Station" />
              </div>
              <div class="rail-field">
                <label>Station Code (UIC)</label>
                <input type="text" :disabled="disabled" placeholder="e.g. 71000010" />
              </div>
              <div class="rail-field">
                <label>Terminal / Yard</label>
                <input type="text" :disabled="disabled" />
              </div>
              <div class="rail-field rail-span-2">
                <label>Country</label>
                <select :disabled="disabled">
                  <option>China (CN)</option>
                  <option>Germany (DE)</option>
                  <option>Poland (PL)</option>
                  <option>Russia (RU)</option>
                  <option>Kazakhstan (KZ)</option>
                </select>
              </div>
              <div class="rail-field rail-span-2">
                <label>Collection Date & Time</label>
                <input type="datetime-local" :disabled="disabled" />
              </div>
            </div>
          </div>
        </div>

        <div class="rail-addr-block">
          <div class="rail-addr-block__header">
            <div class="rail-addr-block__title">Delivery / Destination Station</div>
          </div>

          <div class="rail-addr-block__body">
            <div class="rail-grid rail-grid--2">
              <div class="rail-field rail-span-2">
                <label>Station Name</label>
                <input type="text" :disabled="disabled" placeholder="e.g. Duisburg DIT Terminal" />
              </div>
              <div class="rail-field">
                <label>Station Code (UIC)</label>
                <input type="text" :disabled="disabled" placeholder="e.g. 80000010" />
              </div>
              <div class="rail-field">
                <label>Terminal / Yard</label>
                <input type="text" :disabled="disabled" />
              </div>
              <div class="rail-field rail-span-2">
                <label>Country</label>
                <select :disabled="disabled">
                  <option>Germany (DE)</option>
                  <option>United Kingdom (GB)</option>
                  <option>Poland (PL)</option>
                  <option>Netherlands (NL)</option>
                  <option>Belgium (BE)</option>
                  <option>France (FR)</option>
                </select>
              </div>
              <div class="rail-field rail-span-2">
                <label>Delivery Date & Time</label>
                <input type="datetime-local" :disabled="disabled" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
