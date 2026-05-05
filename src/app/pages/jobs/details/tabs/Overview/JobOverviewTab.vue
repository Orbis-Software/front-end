<script setup lang="ts">
import "./JobOverviewTab.css"
</script>

<template>
  <section class="job-overview-tab">
    <div class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Job Information</h2>
      </header>

      <div class="job-overview-tab__grid job-overview-tab__grid--4">
        <label class="job-overview-tab__field">
          <span>Service Type</span>
          <select>
            <option>Standard</option>
            <option>Express</option>
            <option>Economy</option>
            <option>Premium</option>
            <option>Time-Critical</option>
            <option>Temperature Controlled</option>
          </select>
        </label>

        <label class="job-overview-tab__field">
          <span>Incoterms</span>
          <select>
            <option value="">— Select —</option>
            <option>EXW – Ex Works</option>
            <option>FCA – Free Carrier</option>
            <option>CPT – Carriage Paid To</option>
            <option>CIP – Carriage & Insurance Paid</option>
            <option>DAP – Delivered At Place</option>
            <option>DPU – Delivered At Place Unloaded</option>
            <option>DDP – Delivered Duty Paid</option>
            <option>FOB – Free On Board</option>
            <option>CFR – Cost and Freight</option>
            <option>CIF – Cost, Insurance & Freight</option>
          </select>
        </label>

        <label class="job-overview-tab__field">
          <span>Currency</span>
          <select>
            <option>GBP – £</option>
            <option>EUR – €</option>
            <option>USD – $</option>
            <option>PLN – zł</option>
            <option>CHF – Fr</option>
          </select>
        </label>

        <label class="job-overview-tab__field">
          <span>Declared Value</span>
          <input type="number" placeholder="0.00" />
        </label>

        <label class="job-overview-tab__field job-overview-tab__field--span-2">
          <span>Description of Goods</span>
          <input type="text" placeholder="General cargo / machinery / palletised goods..." />
        </label>

        <label class="job-overview-tab__field">
          <span>Commodity Code</span>
          <input type="text" placeholder="e.g. 8471.30" />
        </label>

        <label class="job-overview-tab__field">
          <span>Insurance Level</span>
          <select>
            <option>Standard Conditions</option>
            <option>Enhanced Cover</option>
            <option>Full Declared Value</option>
            <option>Customer's Own Insurance</option>
          </select>
        </label>
      </div>
    </div>

    <div class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Customer & References</h2>
      </header>

      <div class="job-overview-tab__grid job-overview-tab__grid--4">
        <label class="job-overview-tab__field">
          <span>Customer PO Number</span>
          <input type="text" placeholder="Purchase order ref" />
        </label>

        <label class="job-overview-tab__field">
          <span>Customer Booking Ref</span>
          <input type="text" placeholder="Booking reference" />
        </label>

        <label class="job-overview-tab__field">
          <span>Our Reference</span>
          <input type="text" placeholder="Internal ref" />
        </label>

        <label class="job-overview-tab__field">
          <span>Supplier Ref</span>
          <input type="text" placeholder="Haulier / carrier ref" />
        </label>

        <label class="job-overview-tab__field">
          <span>Consignee Name</span>
          <input type="text" placeholder="Recipient company" />
        </label>

        <label class="job-overview-tab__field">
          <span>Consignee Contact</span>
          <input type="text" placeholder="Contact name" />
        </label>

        <label class="job-overview-tab__field">
          <span>Consignee Phone</span>
          <input type="tel" placeholder="+44 ..." />
        </label>

        <label class="job-overview-tab__field">
          <span>Consignee Email</span>
          <input type="email" placeholder="email@example.com" />
        </label>
      </div>
    </div>

    <div class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Origin & Destination</h2>
      </header>

      <div class="job-overview-tab__split">
        <div>
          <h3 class="job-overview-tab__subheading">Origin / Collection</h3>

          <div class="job-overview-tab__grid job-overview-tab__grid--2">
            <label class="job-overview-tab__field job-overview-tab__field--span-2">
              <span>Company / Site</span>
              <input type="text" placeholder="Warehouse / depot name" />
            </label>

            <label class="job-overview-tab__field job-overview-tab__field--span-2">
              <span>Address</span>
              <input type="text" placeholder="Street address" />
            </label>

            <label class="job-overview-tab__field">
              <span>City</span>
              <input type="text" placeholder="City" />
            </label>

            <label class="job-overview-tab__field">
              <span>Postcode</span>
              <input type="text" placeholder="Postcode / ZIP" />
            </label>

            <label class="job-overview-tab__field">
              <span>Country</span>
              <input type="text" placeholder="Country" />
            </label>

            <label class="job-overview-tab__field">
              <span>Contact</span>
              <input type="text" placeholder="Name / phone" />
            </label>

            <label class="job-overview-tab__field">
              <span>Collection Date</span>
              <input type="date" />
            </label>

            <label class="job-overview-tab__field">
              <span>Collection Time</span>
              <input type="time" />
            </label>
          </div>
        </div>

        <div>
          <h3 class="job-overview-tab__subheading">Destination / Delivery</h3>

          <div class="job-overview-tab__grid job-overview-tab__grid--2">
            <label class="job-overview-tab__field job-overview-tab__field--span-2">
              <span>Company / Site</span>
              <input type="text" placeholder="Delivery location name" />
            </label>

            <label class="job-overview-tab__field job-overview-tab__field--span-2">
              <span>Address</span>
              <input type="text" placeholder="Street address" />
            </label>

            <label class="job-overview-tab__field">
              <span>City</span>
              <input type="text" placeholder="City" />
            </label>

            <label class="job-overview-tab__field">
              <span>Postcode</span>
              <input type="text" placeholder="Postcode / ZIP" />
            </label>

            <label class="job-overview-tab__field">
              <span>Country</span>
              <input type="text" placeholder="Country" />
            </label>

            <label class="job-overview-tab__field">
              <span>Contact</span>
              <input type="text" placeholder="Name / phone" />
            </label>

            <label class="job-overview-tab__field">
              <span>Delivery Date</span>
              <input type="date" />
            </label>

            <label class="job-overview-tab__field">
              <span>Delivery Time</span>
              <input type="time" />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Special Requirements</h2>
      </header>

      <div class="job-overview-tab__grid job-overview-tab__grid--4">
        <label class="job-overview-tab__field">
          <span>Hazardous?</span>
          <select>
            <option>No</option>
            <option>Yes – ADR/IMDG</option>
          </select>
        </label>

        <label class="job-overview-tab__field">
          <span>ADR / Hazmat Class</span>
          <input type="text" placeholder="e.g. Class 3" />
        </label>

        <label class="job-overview-tab__field">
          <span>UN Number</span>
          <input type="text" placeholder="UN1234" />
        </label>

        <label class="job-overview-tab__field">
          <span>Temperature Controlled?</span>
          <select>
            <option>No</option>
            <option>Chilled (2–8°C)</option>
            <option>Frozen (-18°C)</option>
            <option>Ambient Controlled</option>
          </select>
        </label>

        <label class="job-overview-tab__field job-overview-tab__field--span-4">
          <span>Special Instructions / Notes</span>
          <textarea
            placeholder="Temperature requirements, handling notes, access restrictions..."
          />
        </label>
      </div>
    </div>
  </section>
</template>
