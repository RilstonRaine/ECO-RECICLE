<template>
  <div class="chart-wrap"><canvas ref="canvas"></canvas></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title
} from 'chart.js'
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  data:   { type: Array, default: () => [] },
  title:  { type: String, default: '' },
  colors: { type: Array, default: () => ['#10B981','#0EA5E9','#F59E0B','#EF4444','#8B5CF6','#14B8A6'] }
})

const canvas = ref(null)
let chart

function render() {
  if (!canvas.value) return
  if (chart) chart.destroy()

  chart = new Chart(canvas.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [{
        label: 'Peso total (kg)',
        data: props.data,
        backgroundColor: props.colors.slice(0, props.data.length),
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: !!props.title, text: props.title }
      },
      scales: {
        x: { ticks: { color: '#334155' } },
        y: { ticks: { color: '#334155' }, beginAtZero: true }
      }
    }
  })
}

watch(() => [props.labels, props.data], render, { deep: true })
onMounted(render)
onBeforeUnmount(() => chart && chart.destroy())
</script>

<style scoped>
.chart-wrap { height: 320px; }
</style>
