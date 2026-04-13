<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <div class="road-details">
    <div class="road-card">
      <div class="road-card__head">
        <div class="road-card__title">Revenue / Sell Charge Lines</div>
      </div>

      <div class="road-card__body">
        <div class="road-table-wrap">
          <table class="road-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Charge Type</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>VAT %</th>
                <th>Net</th>
                <th>VAT</th>
                <th>Gross</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Base Freight Rate</td>
                <td>Road freight</td>
                <td>1</td>
                <td>Flat</td>
                <td>£950.00</td>
                <td>0</td>
                <td>£950.00</td>
                <td>£0.00</td>
                <td>£950.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="road-card">
      <div class="road-card__head">
        <div class="road-card__title">Cost / Buy Lines</div>
      </div>

      <div class="road-card__body">
        <div class="road-table-wrap">
          <table class="road-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cost Type</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Cost</th>
                <th>VAT %</th>
                <th>Net</th>
                <th>VAT</th>
                <th>Gross</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Subcontractor</td>
                <td>Carrier charge</td>
                <td>1</td>
                <td>Flat</td>
                <td>£700.00</td>
                <td>0</td>
                <td>£700.00</td>
                <td>£0.00</td>
                <td>£700.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="road-kpis">
      <div class="road-kpi">
        <div class="road-kpi__label">Revenue Net</div>
        <div class="road-kpi__value">950</div>
      </div>
      <div class="road-kpi">
        <div class="road-kpi__label">Cost Net</div>
        <div class="road-kpi__value">700</div>
      </div>
      <div class="road-kpi">
        <div class="road-kpi__label">Margin £</div>
        <div class="road-kpi__value">250</div>
      </div>
      <div class="road-kpi road-kpi--accent">
        <div class="road-kpi__label">Margin %</div>
        <div class="road-kpi__value">26.3%</div>
      </div>
    </div>
  </div>
</template>
