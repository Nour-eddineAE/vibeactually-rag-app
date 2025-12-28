<template>
  <div class="chart-wrapper">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
  import {
    ArcElement,
    Chart,
    Legend,
    Tooltip,
  } from 'chart.js'
  import { computed, watchEffect } from 'vue'
  import { Doughnut } from 'vue-chartjs'

  Chart.register(ArcElement, Tooltip, Legend)

  const props = defineProps({
    labels: { type: Array, default: () => [] },
    values: { type: Array, default: () => [] },
    colors: { type: Array, default: () => [] },
    cutout: { type: [Number, String], default: '70%' },
  })

  const chartData = computed(() => ({
    labels: props.labels,
    datasets: [
      {
        data: props.values,
        backgroundColor: props.colors.length > 0 ? props.colors : ['#4F46E5', '#06B6D4', '#F59E0B', '#22C55E', '#EF4444'],
        borderWidth: 0,
        hoverOffset: 6,
        cutout: props.cutout,
      },
    ],
  }))

  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom', labels: { usePointStyle: true } },
      tooltip: { enabled: true },
    },
  }))

  // Trigger recomputation on prop changes
  watchEffect(() => void chartData.value)
</script>

<style scoped>
.chart-wrapper { position: relative; width: 100%; height: 280px; }
</style>
