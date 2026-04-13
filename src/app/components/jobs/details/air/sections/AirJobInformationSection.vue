<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  form: any
  disabled?: boolean
}>()

const awbPrefix = computed(() => {
  const raw = String(props.form.awb_no ?? "")
  const parts = raw.split("-")
  return parts[0] || ""
})

const awbNumber = computed(() => {
  const raw = String(props.form.awb_no ?? "")
  const parts = raw.split("-")
  return parts[1] || raw
})

const routeOrigin = computed(() => props.form.origin_airport || "—")
const routeDestination = computed(() => props.form.destination_airport || "—")
const routeAirline = computed(() => props.form.airline || "Select airline & airports")
</script>

<template>
  <div class="air-details">
    <section class="air-card">
      <div class="air-card__head">
        <h3 class="air-card__title">AWB & Flight Details</h3>
      </div>

      <div class="air-card__body">
        <div class="air-grid air-grid--4" style="align-items: end; margin-bottom: 14px">
          <div class="air-field">
            <label>AWB Prefix</label>
            <input
              class="air-input"
              type="text"
              :value="awbPrefix"
              :disabled="disabled"
              placeholder="123"
            />
          </div>

          <div class="air-field">
            <label>AWB Number</label>
            <input
              class="air-input"
              type="text"
              :value="awbNumber"
              :disabled="disabled"
              placeholder="12345678"
            />
          </div>

          <div class="air-field air-span-2">
            <label>Full AWB</label>
            <div class="air-pill">
              <span>{{ awbPrefix || "—" }}</span>
              <span class="air-pill__sep">-</span>
              <span>{{ awbNumber || "— — — — — — — —" }}</span>
            </div>
          </div>
        </div>

        <div class="air-grid air-grid--4">
          <div class="air-field">
            <label>MAWB Number</label>
            <input class="air-input" type="text" :disabled="disabled" placeholder="Master AWB" />
          </div>

          <div class="air-field">
            <label>HAWB Number</label>
            <input class="air-input" type="text" :disabled="disabled" placeholder="House AWB" />
          </div>

          <div class="air-field">
            <label>Airline Booking Ref</label>
            <input
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="Airline reference"
            />
          </div>

          <div class="air-field">
            <label>Customer Reference</label>
            <input
              v-model="form.customer_reference"
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="PO / Customer ref"
            />
          </div>
        </div>

        <div class="air-divider-label">Flight Information</div>

        <div class="air-grid air-grid--5">
          <div class="air-field">
            <label>Airline / IATA</label>
            <select v-model="form.airline" class="air-select" :disabled="disabled">
              <option value="">Select airline</option>
              <option value="BA">BA – British Airways</option>
              <option value="LH">LH – Lufthansa</option>
              <option value="EK">EK – Emirates</option>
              <option value="QR">QR – Qatar Airways</option>
              <option value="CX">CX – Cathay Pacific</option>
              <option value="AF">AF – Air France</option>
              <option value="AA">AA – American Airlines</option>
              <option value="UA">UA – United Airlines</option>
              <option value="SQ">SQ – Singapore Airlines</option>
              <option value="TK">TK – Turkish Airlines</option>
              <option value="QF">QF – Qantas</option>
            </select>
          </div>

          <div class="air-field">
            <label>Flight Number</label>
            <input
              v-model="form.flight_no"
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="BA0117"
            />
          </div>

          <div class="air-field">
            <label>Origin Airport</label>
            <input
              v-model="form.origin_airport"
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="LHR"
            />
          </div>

          <div class="air-field">
            <label>Via (Transit)</label>
            <input
              v-model="form.route_via"
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="DXB"
            />
          </div>

          <div class="air-field">
            <label>Destination Airport</label>
            <input
              v-model="form.destination_airport"
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="JFK"
            />
          </div>
        </div>

        <div class="air-route">
          <div class="air-route__port">
            <div class="air-route__code">{{ routeOrigin }}</div>
            <div class="air-route__name">Origin</div>
          </div>

          <div class="air-route__mid">
            <div class="air-route__bar">
              <span class="air-route__plane">✈</span>
            </div>
            <div class="air-route__meta">{{ routeAirline }}</div>
            <div class="air-route__via" v-if="form.route_via">via {{ form.route_via }}</div>
          </div>

          <div class="air-route__port" style="text-align: right">
            <div class="air-route__code">{{ routeDestination }}</div>
            <div class="air-route__name">Destination</div>
          </div>
        </div>

        <div class="air-divider-label">Schedule</div>

        <div class="air-grid air-grid--4">
          <div class="air-field">
            <label>ETD</label>
            <input class="air-input" type="datetime-local" :disabled="disabled" />
          </div>

          <div class="air-field">
            <label>ETA</label>
            <input class="air-input" type="datetime-local" :disabled="disabled" />
          </div>

          <div class="air-field">
            <label>ATD (Actual Departure)</label>
            <input class="air-input" type="datetime-local" :disabled="disabled" />
          </div>

          <div class="air-field">
            <label>ATA (Actual Arrival)</label>
            <input class="air-input" type="datetime-local" :disabled="disabled" />
          </div>
        </div>

        <div class="air-divider-label">Service</div>

        <div class="air-grid air-grid--4">
          <div class="air-field">
            <label>Service Type</label>
            <select v-model="form.service_type" class="air-select" :disabled="disabled">
              <option value="">Select service</option>
              <option>Express (Same Day)</option>
              <option>Priority (Next Day)</option>
              <option>Standard (2–3 Days)</option>
              <option>Economy (3–5 Days)</option>
              <option>Deferred (5–7 Days)</option>
              <option>Charter</option>
            </select>
          </div>

          <div class="air-field">
            <label>Incoterms</label>
            <select v-model="form.incoterms" class="air-select" :disabled="disabled">
              <option value="">Select Incoterms</option>
              <option>EXW – Ex Works</option>
              <option>FCA – Free Carrier</option>
              <option>CPT – Carriage Paid To</option>
              <option>DAP – Delivered at Place</option>
              <option>DDP – Delivered Duty Paid</option>
              <option>FOB – Free on Board</option>
              <option>CIF – Cost Insurance Freight</option>
            </select>
          </div>

          <div class="air-field">
            <label>Shipment Type</label>
            <select class="air-select" :disabled="disabled">
              <option value="">Select type</option>
              <option>General Cargo</option>
              <option>Dangerous Goods (DGR)</option>
              <option>Perishables</option>
              <option>Valuables</option>
              <option>Live Animals</option>
              <option>Time-Sensitive</option>
              <option>Out of Gauge</option>
              <option>Human Remains</option>
            </select>
          </div>

          <div class="air-field">
            <label>Priority / SLA</label>
            <select class="air-select" :disabled="disabled">
              <option value="">Select priority</option>
              <option>P1 – Critical</option>
              <option>P2 – High</option>
              <option>P3 – Standard</option>
              <option>P4 – Low</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="air-card">
      <div class="air-card__head">
        <h3 class="air-card__title">Shipper, Consignee & Notify Party</h3>
      </div>

      <div class="air-card__body">
        <div class="air-three-col">
          <div>
            <div class="air-divider-label" style="margin-top: 0">Shipper / Exporter</div>
            <div class="air-grid" style="gap: 8px">
              <div class="air-field">
                <label>Company Name</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Shipper company name"
                />
              </div>
              <div class="air-field">
                <label>Contact Name</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Contact person"
                />
              </div>
              <div class="air-field">
                <label>Address Line 1</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Street / Building"
                />
              </div>
              <div class="air-field">
                <label>Address Line 2</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Area / District"
                />
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>City</label><input class="air-input" type="text" :disabled="disabled" />
                </div>
                <div class="air-field">
                  <label>Post Code</label
                  ><input class="air-input" type="text" :disabled="disabled" />
                </div>
              </div>
              <div class="air-field">
                <label>Country</label
                ><input class="air-input" type="text" :disabled="disabled" placeholder="Country" />
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>Phone</label
                  ><input class="air-input" type="tel" :disabled="disabled" placeholder="+44..." />
                </div>
                <div class="air-field">
                  <label>Email</label
                  ><input
                    class="air-input"
                    type="email"
                    :disabled="disabled"
                    placeholder="email@co.com"
                  />
                </div>
              </div>
              <div class="air-field">
                <label>EORI Number</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="GB123456789000"
                />
              </div>
            </div>
          </div>

          <div>
            <div class="air-divider-label" style="margin-top: 0">Consignee / Importer</div>
            <div class="air-grid" style="gap: 8px">
              <div class="air-field">
                <label>Company Name</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Consignee company name"
                />
              </div>
              <div class="air-field">
                <label>Contact Name</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Contact person"
                />
              </div>
              <div class="air-field">
                <label>Address Line 1</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Street / Building"
                />
              </div>
              <div class="air-field">
                <label>Address Line 2</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Area / District"
                />
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>City</label><input class="air-input" type="text" :disabled="disabled" />
                </div>
                <div class="air-field">
                  <label>Post Code</label
                  ><input class="air-input" type="text" :disabled="disabled" />
                </div>
              </div>
              <div class="air-field">
                <label>Country</label
                ><input class="air-input" type="text" :disabled="disabled" placeholder="Country" />
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>Phone</label
                  ><input class="air-input" type="tel" :disabled="disabled" placeholder="+1..." />
                </div>
                <div class="air-field">
                  <label>Email</label
                  ><input
                    class="air-input"
                    type="email"
                    :disabled="disabled"
                    placeholder="email@co.com"
                  />
                </div>
              </div>
              <div class="air-field">
                <label>EORI / Tax ID</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Tax / EORI number"
                />
              </div>
            </div>
          </div>

          <div>
            <div class="air-divider-label" style="margin-top: 0">Notify Party</div>
            <div class="air-grid" style="gap: 8px">
              <div class="air-field">
                <label>Company Name</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Notify party name"
                />
              </div>
              <div class="air-field">
                <label>Contact Name</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Contact person"
                />
              </div>
              <div class="air-field">
                <label>Address Line 1</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Street / Building"
                />
              </div>
              <div class="air-field">
                <label>Address Line 2</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Area / District"
                />
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>City</label><input class="air-input" type="text" :disabled="disabled" />
                </div>
                <div class="air-field">
                  <label>Post Code</label
                  ><input class="air-input" type="text" :disabled="disabled" />
                </div>
              </div>
              <div class="air-field">
                <label>Country</label
                ><input class="air-input" type="text" :disabled="disabled" placeholder="Country" />
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>Phone</label><input class="air-input" type="tel" :disabled="disabled" />
                </div>
                <div class="air-field">
                  <label>Email</label><input class="air-input" type="email" :disabled="disabled" />
                </div>
              </div>
              <div class="air-field">
                <label>Notes</label
                ><textarea
                  class="air-textarea"
                  :disabled="disabled"
                  placeholder="Notify instructions..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="air-card">
      <div class="air-card__head">
        <h3 class="air-card__title">Collection & Delivery Addresses</h3>
      </div>

      <div class="air-card__body">
        <div class="air-two-col">
          <div>
            <div class="air-divider-label" style="margin-top: 0">Collection Address</div>
            <div class="air-grid" style="gap: 8px">
              <div class="air-field">
                <label>Collection Point Name</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Warehouse / depot name"
                />
              </div>
              <div class="air-field">
                <label>Address Line 1</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Unit / building / street"
                />
              </div>
              <div class="air-field">
                <label>Address Line 2</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Estate / area"
                />
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>City</label><input class="air-input" type="text" :disabled="disabled" />
                </div>
                <div class="air-field">
                  <label>County</label><input class="air-input" type="text" :disabled="disabled" />
                </div>
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>Post Code</label
                  ><input class="air-input" type="text" :disabled="disabled" />
                </div>
                <div class="air-field">
                  <label>Country</label><input class="air-input" type="text" :disabled="disabled" />
                </div>
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>Collection Date</label
                  ><input class="air-input" type="date" :disabled="disabled" />
                </div>
                <div class="air-field">
                  <label>Time Window</label
                  ><input class="air-input" type="time" :disabled="disabled" />
                </div>
              </div>
              <div class="air-field">
                <label>Access / Driver Notes</label
                ><textarea
                  class="air-textarea"
                  :disabled="disabled"
                  placeholder="Access codes, dock info, opening hours..."
                />
              </div>
            </div>
          </div>

          <div>
            <div class="air-divider-label" style="margin-top: 0">Delivery Address</div>
            <div class="air-grid" style="gap: 8px">
              <div class="air-field">
                <label>Delivery Point Name</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Recipient facility name"
                />
              </div>
              <div class="air-field">
                <label>Address Line 1</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Unit / building / street"
                />
              </div>
              <div class="air-field">
                <label>Address Line 2</label
                ><input
                  class="air-input"
                  type="text"
                  :disabled="disabled"
                  placeholder="Estate / area"
                />
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>City</label><input class="air-input" type="text" :disabled="disabled" />
                </div>
                <div class="air-field">
                  <label>County / State</label
                  ><input class="air-input" type="text" :disabled="disabled" />
                </div>
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>Post Code</label
                  ><input class="air-input" type="text" :disabled="disabled" />
                </div>
                <div class="air-field">
                  <label>Country</label><input class="air-input" type="text" :disabled="disabled" />
                </div>
              </div>
              <div class="air-grid air-grid--2" style="gap: 8px">
                <div class="air-field">
                  <label>Delivery Date</label
                  ><input class="air-input" type="date" :disabled="disabled" />
                </div>
                <div class="air-field">
                  <label>Time Window</label
                  ><input class="air-input" type="time" :disabled="disabled" />
                </div>
              </div>
              <div class="air-field">
                <label>Delivery Instructions</label
                ><textarea
                  class="air-textarea"
                  :disabled="disabled"
                  placeholder="Special requirements, signature required..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="air-card">
      <div class="air-card__head">
        <h3 class="air-card__title">Customs & Compliance</h3>
      </div>

      <div class="air-card__body">
        <div class="air-grid air-grid--4">
          <div class="air-field">
            <label>Commodity Description</label>
            <input
              v-model="form.description_of_goods"
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="General description of goods"
            />
          </div>

          <div class="air-field">
            <label>HS / Tariff Code</label>
            <input
              v-model="form.commodity_code"
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="0000.00.00"
            />
          </div>

          <div class="air-field">
            <label>Country of Origin</label>
            <input
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="Country of manufacture"
            />
          </div>

          <div class="air-field">
            <label>Customs Value</label>
            <input
              v-model="form.declared_value"
              class="air-input"
              type="number"
              step="0.01"
              :disabled="disabled"
              placeholder="0.00"
            />
          </div>
        </div>

        <div class="air-grid air-grid--4" style="margin-top: 10px">
          <div class="air-field">
            <label>Export Declaration No.</label>
            <input class="air-input" type="text" :disabled="disabled" placeholder="EAD / MRN" />
          </div>

          <div class="air-field">
            <label>Import Declaration No.</label>
            <input class="air-input" type="text" :disabled="disabled" placeholder="Import entry" />
          </div>

          <div class="air-field">
            <label>DGR Class</label>
            <input
              v-model="form.hazmat_class"
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="Class / N/A"
            />
          </div>

          <div class="air-field">
            <label>UN Number</label>
            <input
              v-model="form.un_number"
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="UN0000"
            />
          </div>
        </div>

        <div class="air-grid air-grid--4" style="margin-top: 10px">
          <div class="air-field">
            <label>Insurance Value</label>
            <input
              class="air-input"
              type="number"
              step="0.01"
              :disabled="disabled"
              placeholder="0.00"
            />
          </div>

          <div class="air-field">
            <label>Freight Value</label>
            <select class="air-select" :disabled="disabled">
              <option value="">Declared</option>
              <option>NVD – No Value Declared</option>
              <option>NCV – No Customs Value</option>
            </select>
          </div>

          <div class="air-field">
            <label>Special Handling Codes</label>
            <input
              class="air-input"
              type="text"
              :disabled="disabled"
              placeholder="e.g. PER, VAL, HUM, AVI"
            />
          </div>

          <div class="air-field">
            <label>IATA Special Cargo</label>
            <select class="air-select" :disabled="disabled">
              <option value="">None</option>
              <option>PER – Perishable</option>
              <option>VAL – Valuables</option>
              <option>HUM – Human Remains</option>
              <option>AVI – Live Animals</option>
              <option>DIP – Diplomatic Mail</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
