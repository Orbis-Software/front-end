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
        <div class="road-card__title">Package Lines</div>
      </div>

      <div class="road-card__body">
        <div class="road-table-wrap">
          <table class="road-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Pkg Type</th>
                <th>Qty</th>
                <th>L (cm)</th>
                <th>W (cm)</th>
                <th>H (cm)</th>
                <th>Wt/Piece</th>
                <th>Total Gross</th>
                <th>Vol. Weight</th>
                <th>Chargeable</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Palletised goods</td>
                <td>Euro Pallet</td>
                <td>4</td>
                <td>120</td>
                <td>80</td>
                <td>140</td>
                <td>100</td>
                <td>400 kg</td>
                <td>1344 kg</td>
                <td>1344 kg</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="8" style="text-align: right">Totals</td>
                <td>400 kg</td>
                <td>1344 kg</td>
                <td>1344 kg</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <div class="road-kpis">
      <div class="road-kpi">
        <div class="road-kpi__label">Total Pieces</div>
        <div class="road-kpi__value">4</div>
      </div>
      <div class="road-kpi">
        <div class="road-kpi__label">Total Gross Weight</div>
        <div class="road-kpi__value">400</div>
      </div>
      <div class="road-kpi">
        <div class="road-kpi__label">Total Volumetric</div>
        <div class="road-kpi__value">1344</div>
      </div>
      <div class="road-kpi road-kpi--accent">
        <div class="road-kpi__label">Chargeable Weight</div>
        <div class="road-kpi__value">1344</div>
      </div>
    </div>
  </div>
</template>
