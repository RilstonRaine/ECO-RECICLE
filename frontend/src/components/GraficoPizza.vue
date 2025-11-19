<!-- src/components/GraficoPizza.vue -->
<template>
  <canvas ref="canvasEl"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' }
})

const canvasEl = ref(null)
let chartInstance = null

function render() {
  if (!canvasEl.value) return
  if (chartInstance) {
    chartInstance.destroy()
  }
  chartInstance = new Chart(canvasEl.value, {
    type: 'pie',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.title || 'Distribuição',
          data: props.data
        }
      ]
    },
    options: {
      plugins: {
        title: { display: !!props.title, text: props.title },
        legend: { display: true }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

onMounted(render)
watch(() => [props.labels, props.data], render, { deep: true })
onBeforeUnmount(() => chartInstance && chartInstance.destroy())
</script>

<style scoped>
:host, canvas { display: block; width: 100%; height: 300px; }
</style>
